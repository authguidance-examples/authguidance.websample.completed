import {ApiClient} from '../api/client/apiClient';
import {Configuration} from '../configuration/configuration';
import {ConfigurationLoader} from '../configuration/configurationLoader';
import {ErrorConsoleReporter} from '../plumbing/errors/errorConsoleReporter';
import {OAuthClient} from '../plumbing/oauth/oauthClient';
import {HtmlStorageHelper} from '../plumbing/utilities/htmlStorageHelper';
import {OidcLogger} from '../plumbing/utilities/oidcLogger';
import {ErrorView} from '../views/errorView';
import {HeaderButtonsView} from '../views/headerButtonsView';
import {Router} from '../views/router';
import {TitleView} from '../views/titleView';

/*
 * The application class
 */
export class App {

    private configuration!: Configuration;
    private oauthClient!: OAuthClient;
    private apiClient!: ApiClient;
    private oidcLogger: OidcLogger;
    private router!: Router;
    private titleView!: TitleView;
    private headerButtonsView!: HeaderButtonsView;
    private errorView!: ErrorView;
    private isInitialised: boolean;

    public constructor() {
        this.isInitialised = false;
        this.oidcLogger = new OidcLogger();
        this.setupCallbacks();
    }

    /*
     * The entry point for the SPA
     */
    public async execute(): Promise<void> {

        try {

            // Start listening for hash changes
            window.onhashchange = this.onHashChange;
            window.onstorage = this.onStorageChange;

            // Do the initial render
            this.initialRender();

            // Do one time app initialisation
            await this.initialiseApp();

            // We must be prepared for page invocation to be an OAuth response
            await this.oauthClient.handleLoginResponse();

            // Load the main view, which may trigger a login redirect
            await this.loadMainView();

            // Get user info from the API unless we are in the logged out view
            if (!this.router.isInLoggedOutView()) {
                await this.loadUserInfo();
            }

        } catch (e: any) {

            // Report failures
            this.errorView?.report(e);
        }
    }

    /*
     * Render views in their initial state
     */
    private initialRender() {

        this.titleView = new TitleView();
        this.titleView.load();

        this.headerButtonsView = new HeaderButtonsView(
            this.onHome,
            this.onReloadData,
            this.onExpireToken,
            this.onLogout);
        this.headerButtonsView.load();

        this.errorView = new ErrorView();
        this.errorView.load();
    }

    /*
     * Initialise the app
     */
    private async initialiseApp(): Promise<void> {

        // Download application configuration
        this.configuration = await ConfigurationLoader.download('spa.config.json');

        // Initialise our OIDC Client wrapper
        this.oauthClient = new OAuthClient(this.configuration.oauth);

        // Create a client to reliably call the API
        this.apiClient = new ApiClient(this.configuration.app.apiBaseUrl, this.oauthClient);

        // Our simple router passes the API Client instance between views
        this.router = new Router(this.apiClient, this.errorView);

        // Update state to indicate that global objects are loaded
        this.isInitialised = true;
    }

    /*
     * Load API data for the main view and update UI controls
     */
    private async loadMainView(): Promise<void> {

        // Indicate busy
        this.headerButtonsView.disableSessionButtons();

        // Load the view
        await this.router.loadView();

        if (this.router.isInLoggedOutView()) {

            // If we are logged out then clear user info
            this.headerButtonsView.setIsAuthenticated(false);
            this.clearUserInfo();

        } else {

            // Otherwise re-enable buttons
            this.headerButtonsView.setIsAuthenticated(true);
            this.headerButtonsView.enableSessionButtons();
        }
    }

    /*
     * Load API data for the user info fragment
     */
    private async loadUserInfo(): Promise<void> {
        await this.titleView.loadUserInfo(this.oauthClient, this.apiClient);
    }

    /*
     * Load API data for the user info fragment
     */
    private clearUserInfo(): void {
        this.titleView.clearUserInfo();
    }

    /*
     * Change the view based on the hash URL and catch errors
     */
    private async onHashChange(): Promise<void> {

        // Handle updates to log levels when the URL log setting is changed
        this.oidcLogger.updateLogLevelIfRequired();

        try {

            // Run main view navigation
            if (this.isInitialised) {
                await this.loadMainView();
            }

        } catch (e: any) {

            // Report failures
            this.errorView.report(e);
        }
    }

    /*
     * The home button moves to the home view but also deals with error recovery
     */
    private async onHome(): Promise<void> {

        try {

            // Retry if the app failed to initialise
            if (!this.isInitialised) {
                await this.initialiseApp();
            }

            if (this.isInitialised) {

                if (this.router.isInHomeView()) {

                    // Force a reload if we are already in the home view
                    await this.loadMainView();

                } else {

                    // Otherwise move to the home view
                    location.hash = '#';
                }
            }

        } catch (e: any) {

            // Report failures
            this.errorView.report(e);
        }
    }

    /*
     * Force both API calls when reload is clicked
     */
    private async onReloadData(): Promise<void> {

        try {
            await this.loadMainView();
            await this.loadUserInfo();

        } catch (e: any) {

            this.errorView.report(e);
        }
    }

    /*
     * Perform a logout request
     */
    private async onLogout(): Promise<void> {

        try {
            // Start the logout redirect
            await this.oauthClient.startLogout();

        } catch (e: any) {

            // On error, only output logout errors to the console, then move to the logged out view
            ErrorConsoleReporter.output(e);
            location.hash = '#loggedout';
        }
    }

    /*
     * Handle logout notifications from other browser tabs
     */
    private onStorageChange(event: StorageEvent): void {

        if (HtmlStorageHelper.isLoggedOutEvent(event)) {

            this.oauthClient.onExternalLogout();
            location.hash = '#loggedout';
        }
    }

    /*
     * Force a new access token to be retrieved
     */
    private async onExpireToken(): Promise<void> {
        await this.oauthClient.expireAccessToken();
    }

    /*
     * Plumbing to ensure that the this parameter is available in async callbacks
     */
    private setupCallbacks(): void {
        this.onHashChange = this.onHashChange.bind(this);
        this.onHome = this.onHome.bind(this);
        this.onReloadData = this.onReloadData.bind(this);
        this.onLogout = this.onLogout.bind(this);
        this.onStorageChange = this.onStorageChange.bind(this);
        this.onExpireToken = this.onExpireToken.bind(this);
    }
}
