import {InMemoryWebStorage, UserManager, WebStorageStateStore} from 'oidc-client-ts';
import {OAuthConfiguration} from '../../configuration/oauthConfiguration';
import {ErrorCodes} from '../errors/errorCodes';
import {ErrorFactory} from '../errors/errorFactory';
import {UIError} from '../errors/uiError';
import {HtmlStorageHelper} from '../utilities/htmlStorageHelper';
import {OAuthUserInfo} from './oauthUserInfo';

/*
 * The entry point for initiating login and token requests
 */
export class OAuthClient {

    private readonly configuration: OAuthConfiguration;
    private readonly userManager: UserManager;
    private loginTime: number | null;

    public constructor(configuration: OAuthConfiguration) {

        // Create OIDC settings from our application configuration
        this.configuration = configuration;
        const settings = {

            // The OpenID Connect base URL
            authority: configuration.authority,

            // Core OAuth settings for our app
            client_id: configuration.clientId,
            redirect_uri: configuration.redirectUri,
            scope: configuration.scope,

            // Use the Authorization Code Flow (PKCE)
            response_type: 'code',

            // Tokens are stored only in memory, which is better from a security viewpoint
            userStore: new WebStorageStateStore({ store: new InMemoryWebStorage() }),

            // Store redirect state such as PKCE verifiers in session storage, for more reliable cleanup
            stateStore: new WebStorageStateStore({ store: sessionStorage }),

            // The SPA handles 401 errors and does not do silent token renewal in the background
            silent_redirect_uri: configuration.redirectUri,
            automaticSilentRenew: false,

            // The UI loads user info from the OpenID Connect user info endpoint
            loadUserInfo: true,

            // Indicate the logout return path and listen for logout events from other browser tabs
            post_logout_redirect_uri: configuration.postLogoutRedirectUri,
        };

        // Create the user manager
        this.userManager = new UserManager(settings);
        this.loginTime = null;
    }

    /*
     * Get an access token and login if required
     */
    public async getAccessToken(): Promise<string | null> {

        // On most calls we just return the existing token from memory
        const user = await this.userManager.getUser();
        if (user && user.access_token) {
            return user.access_token;
        }

        // If the page has been reloaded, try a silent refresh to get an access token
        return await this.refreshAccessToken();
    }

    /*
     * Try to refresh an access token
     */
    public async refreshAccessToken(): Promise<string | null> {

        // This flag avoids an unnecessary silent refresh when the app first loads
        if (HtmlStorageHelper.isLoggedIn) {

            if (this.configuration.provider === 'cognito') {

                // For Cognito, the traditional iframe renewal flow is not supported
                // This is due to issuing a SameSite=lax SSO cookie instead of SameSite=none
                // Also the OpenID Connect prompt=none parameter is unsupported
                // This can lead to hangs where the login window is rendered on the invisible iframe
                // Therefore refresh the access token using a refresh token stored in JavaScript memory
                const user = await this.userManager.getUser();
                if (user && user.refresh_token) {
                    await this.performAccessTokenRenewalViaRefreshToken();
                }

            } else {

                // For other providers, assume that SSO cookies with SameSite=none are issued
                // Also assume that prompt=none works and returns a login_required error when the SSO cookie expires
                await this.performAccessTokenRenewalViaIframeRedirect();

                // Ensure that the iframe flow is used, by removing any refresh tokens received
                const user = await this.userManager.getUser();
                if (user && user.refresh_token) {
                    user.refresh_token = '';
                    this.userManager.storeUser(user);
                }
            }

            const updatedUser = await this.userManager.getUser();
            if (updatedUser && updatedUser.access_token) {
                return updatedUser.access_token;
            }
        }

        return null;
    }

    /*
     * Do the interactive login redirect on the main window
     */
    public async startLogin(api401Error: UIError | null): Promise<void> {

        try {
            // Start a login redirect, by first storing the SPA's client side location
            // Some apps might also want to store form fields being edited in the state parameter
            const data = {
                hash: location.hash.length > 0 ? location.hash : '#',
            };

            // Handle a special case
            await this.preventRedirectLoop(api401Error);

            // Start a login redirect
            await this.userManager.signinRedirect({
                state: data,
            });

        } catch (e: any) {

            // Handle OAuth specific errors, such as those calling the metadata endpoint
            throw ErrorFactory.getFromLoginOperation(e, ErrorCodes.loginRequestFailed);
        }
    }

    /*
     * Handle the response from the authorization server
     */
    public async handleLoginResponse(): Promise<void> {

        // If the page loads with a state query parameter we classify it as an OAuth response
        const args = new URLSearchParams(location.search);
        const state = args.get('state');
        if (state) {

            // Only try to process a login response if the state exists
            const storedState = await this.userManager.settings.stateStore?.get(state);
            if (storedState) {

                let redirectLocation = '#';
                try {

                    // Handle the login response
                    const user = await this.userManager.signinRedirectCallback();

                    // Remove the refresh token if using iframe based renewal
                    // It remains unsatisfactory that the SPA receives a refresh token
                    if (this.configuration.provider !== 'cognito') {
                        user.refresh_token = '';
                    }

                    // Store tokens in memory
                    this.userManager.storeUser(user);

                    // We will return to the app location from before the login redirect
                    redirectLocation = (user.state as any).hash;

                    // Update login state
                    HtmlStorageHelper.isLoggedIn = true;

                    // The login time enables a check that avoids redirect loops when configuration is invalid
                    this.loginTime = new Date().getTime();

                } catch (e: any) {

                    // Handle and rethrow OAuth response errors
                    throw ErrorFactory.getFromLoginOperation(e, ErrorCodes.loginResponseFailed);

                } finally {

                    // Always replace the browser location, to remove OAuth details from back navigation
                    history.replaceState({}, document.title, redirectLocation);
                }
            }
        }
    }

    /*
     * Redirect in order to log out at the authorization server and remove the session cookie
     */
    public async startLogout(): Promise<void> {

        try {

            // Clear data and instruct other tabs to logout
            await this.clearLoginState();
            HtmlStorageHelper.raiseLoggedOutEvent();

            if (this.configuration.provider === 'cognito') {

                // Cognito requires a vendor specific logout request URL
                location.replace(this.getCognitoEndSessionRequestUrl());

            } else {

                // Otherwise use a standard end session request message
                await this.userManager.signoutRedirect();
            }

        } catch (e: any) {

            // Handle failures
            throw ErrorFactory.getFromLogoutOperation(e, ErrorCodes.logoutRequestFailed);
        }
    }

    /*
     * Handle logout notifications from other browser tabs
     */
    public async onExternalLogout(): Promise<void> {
        await this.clearLoginState();
    }

    /*
     * Get user info, which is available once authentication has completed
     */
    public async getUserInfo(): Promise<OAuthUserInfo | null> {

        const user = await this.userManager.getUser();
        if (user && user.profile) {
            if (user.profile.given_name && user.profile.family_name) {

                return {
                    givenName: user.profile.given_name,
                    familyName: user.profile.family_name,
                };
            }
        }

        return null;
    }

    /*
     * Clear data when the session expires or the user logs out
     */
    public async clearLoginState(): Promise<void> {

        await this.userManager.removeUser();
        this.loginTime = null;
        HtmlStorageHelper.isLoggedIn = false;
    }

    /*
     * This method is for testing only, to make the access token in storage act like it has expired
     */
    public async expireAccessToken(): Promise<void> {

        const user = await this.userManager.getUser();
        if (user) {

            // Add a character to the signature to make it fail validation
            user.access_token = `${user.access_token}x`;
            this.userManager.storeUser(user);
        }
    }

    /*
     * Try to refresh the access token by manually triggering a silent token renewal on an iframe
     * This will fail if there is no authorization server SSO cookie or if it does not use SameSite=none
     * It will always fail in the Safari browser, which will refuse to send the cookie from an iframe
     */
    private async performAccessTokenRenewalViaIframeRedirect(): Promise<void> {

        try {

            // Redirect on an iframe using the authorization server session cookie and prompt=none
            // This instructs the authorization server to not render the login page on the iframe
            // If the request fails there should be a login_required error returned from the authorization server
            await this.userManager.signinSilent();

        } catch (e: any) {

            if (e.error === ErrorCodes.loginRequired) {

                // Clear data and our code will then trigger a new login redirect
                await this.clearLoginState();

            } else {

                // Rethrow any technical errors
                throw ErrorFactory.getFromTokenError(e, ErrorCodes.tokenRenewalError);
            }
        }
    }

    /*
     * It is not recommended to use a refresh token in the browser, even when stored only in memory, as in this sample
     * The browser cannot store a long lived token securely and malicious code could potentially access it
     * When using memory storage and a new browser tab is opened, there is an unwelcome browser redirect
     */
    private async performAccessTokenRenewalViaRefreshToken(): Promise<void> {

        try {

            // The library will use the refresh token grant to get a new access token
            await this.userManager.signinSilent();

        } catch (e: any) {

            // When the session expires this will fail with an 'invalid_grant' response
            if (e.error === ErrorCodes.sessionExpired) {

                // Clear token data and our code will then trigger a new login redirect
                await this.clearLoginState();

            } else {

                // Rethrow any technical errors
                throw ErrorFactory.getFromTokenError(e, ErrorCodes.tokenRenewalError);
            }
        }
    }

    /*
     * Cognito uses a vendor specific logout solution do we must build the request URL manually
     */
    private getCognitoEndSessionRequestUrl(): string {

        let url = `${this.configuration.customLogoutEndpoint}`;
        url += `?client_id=${this.configuration.clientId}&logout_uri=${this.configuration.postLogoutRedirectUri}`;
        return url;
    }

    /*
     * Iframe token refresh can fail due to SSO cookies being dropped during iframe token renewal
     * This can create a cycle so this check prevents a redirect loop if a successful login has just completed
     */
    private async preventRedirectLoop(api401Error: UIError | null): Promise<void> {

        if (api401Error && this.loginTime) {

            const currentTime = new Date().getTime();
            const millisecondsSinceLogin = currentTime - this.loginTime;
            if (millisecondsSinceLogin < 1000) {

                // This causes an error to be presented after which a retry does a new top level redirect
                await this.clearLoginState();
                throw api401Error;
            }
        }
    }
}
