import {JWTPayload} from 'jose';
import {ExtraClaims} from './extraClaims.js';

/*
 * Our claims principal contains claims from the token and other sources
 */
export class ClaimsPrincipal {

    private jwtClaims: JWTPayload;
    private extraClaims: ExtraClaims;

    public constructor(jwtClaims: JWTPayload, extraClaims: ExtraClaims) {
        this.jwtClaims = jwtClaims;
        this.extraClaims = extraClaims;
    }

    public getJwt(): JWTPayload {
        return this.jwtClaims;
    }

    public getExtra(): ExtraClaims {
        return this.extraClaims;
    }
}
