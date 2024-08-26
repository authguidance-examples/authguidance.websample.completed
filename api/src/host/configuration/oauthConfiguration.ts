/*
 * A holder for OAuth settings
 */
export interface OAuthConfiguration {
    jwksEndpoint: string;
    userInfoEndpoint: string;
    issuer: string;
    audience: string;
    scope: string;
    claimsCacheTimeToLiveMinutes: number;
}
