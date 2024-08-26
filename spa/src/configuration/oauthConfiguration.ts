/*
 * A holder for OAuth settings
 */
export interface OAuthConfiguration {
    provider: string;
    authority: string;
    clientId: string;
    redirectUri: string;
    postLogoutRedirectUri: string;
    scope: string;
    customLogoutEndpoint: string;
}
