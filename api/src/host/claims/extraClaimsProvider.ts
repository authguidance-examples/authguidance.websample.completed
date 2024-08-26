import {JWTPayload} from 'jose';
import {ExtraClaims} from '../../logic/entities/claims/extraClaims.js';
import {ClaimsReader} from './claimsReader.js';

/*
 * Add extra claims that you cannot, or do not want to, manage in the authorization server
 */
export class ExtraClaimsProvider {

    /*
     * Get claims from the API's own database based on the subkect claim in an AWS Cognito access token
     */
    public async lookupExtraClaims(jwtClaims: JWTPayload): Promise<ExtraClaims> {

        // A real API would use a database, but this API uses a mock implementation
        const managerId = ClaimsReader.getStringClaim(jwtClaims, 'manager_id');
        if (managerId === '20116') {

            // These claims are used for the guestadmin@example.com user account
            return new ExtraClaims('Global Manager', ['Europe', 'USA', 'Asia']);

        } else if (managerId == '10345') {

            // These claims are used for the guestuser@example.com user account
            return new ExtraClaims('Regional Manager', ['USA']);

        } else {

            // Use empty claims for unrecognized users
            return new ExtraClaims('', []);
        }
    }
}
