import {Response} from 'express';
import {ClientError} from '../../logic/errors/clientError.js';
import {ServerError} from '../../logic/errors/serverError.js';
import {LogEntry} from '../logging/logEntry.js';
import {ErrorFactory} from './errorFactory.js';

/*
 * A class to handle composing and reporting errors
 */
export class ExceptionHandler {

    /*
     * Handle the server error and get client details
     */
    public static handleError(exception: any, response: Response): ClientError {

        // Ensure that the exception has a known type
        const handledError = ErrorFactory.fromException(exception);
        if (exception instanceof ClientError) {

            // Log the error and return the error to the caller
            const clientError = handledError as ClientError;
            const logEntry = response.locals.logEntry as LogEntry;
            logEntry.setError(clientError);
            return clientError;

        } else {

            // Log the error and returning the error to the caller
            const serverError = handledError as ServerError;
            const logEntry = response.locals.logEntry as LogEntry;
            logEntry.setError(serverError);
            return serverError.toClientError();
        }
    }
}
