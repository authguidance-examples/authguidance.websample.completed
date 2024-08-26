import {JWTPayload, JWTVerifyOptions, jwtVerify} from 'jose';
import {ClientError} from '../../logic/errors/clientError.js';
import {ErrorCodes} from '../../logic/errors/errorCodes.js';
import {ClaimsReader} from '../claims/claimsReader.js';
import {OAuthConfiguration} from '../configuration/oauthConfiguration.js';
import {ErrorFactory} from '../errors/errorFactory.js';
import {JwksRetriever} from './jwksRetriever.js';

/*
 * The entry point for OAuth related operations
 */
export class AccessTokenValidator {

    private readonly _configuration: OAuthConfiguration;
    private readonly _jwksRetriever: JwksRetriever;

    public constructor(configuration: OAuthConfiguration, jwksRetriever: JwksRetriever) {
        this._configuration = configuration;
        this._jwksRetriever = jwksRetriever;
    }

    /*
     * Make a call to the introspection endpoint to read our token
     */
    public async execute(accessToken: string): Promise<JWTPayload> {

        const options = {
            algorithms: ['RS256'],
            issuer: this._configuration.issuer,
        } as JWTVerifyOptions;

        // AWS Cognito does not include an audience claim in access tokens
        if (this._configuration.audience) {
            options.audience = this._configuration.audience;
        }

        // Validate the token and get its claims
        let claims: JWTPayload;
        try {

            const result = await jwtVerify(accessToken, this._jwksRetriever.remoteJWKSet, options);
            claims = result.payload;

        } catch (e: any) {

            // JWKS URI connection failures return a 500
            if (e.code === 'ERR_JOSE_GENERIC' || e.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
                throw ErrorFactory.fromJwksDownloadError(e, this._configuration.jwksEndpoint);
            }

            // Otherwise return a 401 error, such as when a JWT with an invalid 'kid' value is supplied
            let details = 'JWT verification failed';
            if (e.message) {
                details += ` : ${e.message}`;
            }

            throw ClientError.create401(details);
        }

        // The sample API requires the same scope for all endpoints, and it is enforced here
        // In AWS this is a URL value of the form https://api.authsamples.com/investments
        const scopes = ClaimsReader.getStringClaim(claims, 'scope').split(' ');
        if (scopes.indexOf(this._configuration.scope) === -1) {

            throw new ClientError(
                403,
                ErrorCodes.insufficientScope,
                'The token does not contain sufficient scope for this API');
        }

        return claims;
    }
}
