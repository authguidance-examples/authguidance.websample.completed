import {ClaimsPrincipal} from '../entities/claims/claimsPrincipal.js';

/*
 * Return user info from the business data to the client
 * These values are separate to the core identity data returned from the OAuth user info endpoint
 */
export class UserInfoService {

    private readonly claims: ClaimsPrincipal;

    public constructor(claims: ClaimsPrincipal) {
        this.claims = claims;
    }

    public getUserInfo(): any {

        return {
            title: this.claims.getExtra().getTitle(),
            regions: this.claims.getExtra().getRegions(),
        };
    }
}
