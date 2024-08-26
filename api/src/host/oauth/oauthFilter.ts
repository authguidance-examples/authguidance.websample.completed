import {createHash} from 'crypto';
import {Request} from 'express';
import {ClaimsPrincipal} from '../../logic/entities/claims/claimsPrincipal.js';
import {ClientError} from '../../logic/errors/clientError.js';
import {ClaimsCache} from '../claims/claimsCache.js';
import {ExtraClaimsProvider} from '../claims/extraClaimsProvider.js';
import {AccessTokenValidator} from './accessTokenValidator.js';

/*
 * The entry point for the processing to validate tokens and look up claims
 * Our approach provides extensible claims to our API and enables good performance
 */
export class OAuthFilter {

    private readonly _cache: ClaimsCache;
    private readonly _accessTokenValidator: AccessTokenValidator;
    private readonly _extraClaimsProvider: ExtraClaimsProvider;

    public constructor(
        cache: ClaimsCache,
        accessTokenValidator: AccessTokenValidator,
        extraClaimsProvider: ExtraClaimsProvider) {

        this._cache = cache;
        this._accessTokenValidator = accessTokenValidator;
        this._extraClaimsProvider = extraClaimsProvider;
    }

    /*
     * Authorize a request and set up the claims principal, including domain specific claims
     */
    public async authorizeRequestAndGetClaims(request: Request): Promise<ClaimsPrincipal> {

        // First read the access token
        const accessToken = this._readAccessToken(request);
        if (!accessToken) {
            throw ClientError.create401('No access token was supplied in the bearer header');
        }

        // On every API request we validate the JWT, in a zero trust manner
        const tokenClaims = await this._accessTokenValidator.execute(accessToken);

        // Return cached claims immediately if found
        const accessTokenHash = createHash('sha256').update(accessToken).digest('hex');
        let extraClaims = this._cache.getExtraUserClaims(accessTokenHash);
        if (extraClaims) {
            return new ClaimsPrincipal(tokenClaims, extraClaims);
        }

        // Look up extra claims not in the JWT access token when the token is first received
        extraClaims = await this._extraClaimsProvider.lookupExtraClaims(tokenClaims);

        // Cache the extra claims for subsequent requests with the same access token
        this._cache.setExtraUserClaims(accessTokenHash, extraClaims, tokenClaims.exp || 0);

        // Return the final claims used by the API's authorization logic
        return new ClaimsPrincipal(tokenClaims, extraClaims);
    }

    /*
     * Try to read the token from the authorization header
     */
    private _readAccessToken(request: Request): string | null {

        const authorizationHeader = request.header('authorization');
        if (authorizationHeader) {
            const parts = authorizationHeader.split(' ');
            if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
                return parts[1];
            }
        }

        return null;
    }
}
