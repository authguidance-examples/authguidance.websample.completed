import {ClaimsPrincipal} from '../entities/claims/claimsPrincipal.js';

/*
 * Return user info from the business data to the client
 * These values are separate to the core identity data returned from the OAuth user info endpoint
 */
export class UserInfoService {

    private readonly _claims: ClaimsPrincipal;

    public constructor(claims: ClaimsPrincipal) {
        this._claims = claims;
    }

    public getUserInfo(): any {

        return {
            title: this._claims.extra.title,
            regions: this._claims.extra.regions,
        };
    }
}
