import {Response} from 'express';
import {ClientError} from '../../logic/errors/clientError.js';

/*
 * Helper methods to write the response
 */
export class ResponseWriter {

    /*
     * Return data to the caller
     */
    public static writeSuccessResponse(response: Response, statusCode: number, data: any): void {

        response.setHeader('content-type', 'application/json');
        response.status(statusCode).send(JSON.stringify(data));
    }

    /*
     * This blog's examples use a JSON response to provide client friendly OAuth errors
     * When required, such as to inform clients how to integrate, a www-authenticate header can be added here
     * - https://datatracker.ietf.org/doc/html/rfc6750#section-3
     */
    public static writeErrorResponse(response: Response, error: ClientError): void {

        response.setHeader('content-type', 'application/json');
        response.status(error.getStatusCode()).send(JSON.stringify(error.toResponseFormat()));
    }
}
