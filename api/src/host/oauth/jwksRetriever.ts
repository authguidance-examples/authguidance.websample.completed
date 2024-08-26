import {createRemoteJWKSet, JWTVerifyGetKey, RemoteJWKSetOptions} from 'jose';
import {OAuthConfiguration} from '../configuration/oauthConfiguration.js';
import {HttpProxy} from '../utilities/httpProxy.js';

/*
 * A singleton that caches the result of createRemoteJWKSet, to ensure efficient lookup
 */
export class JwksRetriever {

    private readonly _remoteJWKSet: JWTVerifyGetKey;

    public constructor(configuration: OAuthConfiguration, httpProxy: HttpProxy) {

        // View requests via an HTTP proxy if required
        const jwksOptions = {
            agent: httpProxy.agent,
        } as RemoteJWKSetOptions;

        // Create this object only once
        this._remoteJWKSet = createRemoteJWKSet(new URL(configuration.jwksEndpoint), jwksOptions);
    }

    public get remoteJWKSet(): JWTVerifyGetKey {
        return this._remoteJWKSet;
    }
}
