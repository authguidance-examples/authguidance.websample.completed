import {ClientError} from './clientError.js';

/*
 * A range for random error ids
 */
const MIN_ERROR_ID = 10000;
const MAX_ERROR_ID = 99999;

/*
 * An error entity that the API will log
 */
export class ServerError extends Error {

    private readonly statusCode: number;
    private readonly apiName: string;
    private readonly errorCode: string;
    private readonly instanceId: number;
    private readonly utcTime: string;
    private details: any;

    /*
     * Errors are categorized by error code
     */
    public constructor(errorCode: string, userMessage: string, stack?: string | undefined) {

        super(userMessage);

        // Give fields their default values
        this.statusCode = 500;
        this.apiName = 'BasicApi';
        this.errorCode = errorCode;
        this.instanceId = Math.floor(Math.random() * (MAX_ERROR_ID - MIN_ERROR_ID + 1) + MIN_ERROR_ID);
        this.utcTime = new Date().toISOString();
        this.details = '';

        // Record the stack trace of the original error
        if (stack) {
            this.stack = stack;
        }

        // Ensure that instanceof works
        Object.setPrototypeOf(this, new.target.prototype);
    }

    public getDetails(): any {
        return this.details;
    }

    public setDetails(details: any): void {
        this.details = details;
    }

    /*
     * Return an object ready to log, including the stack trace
     */
    public toLogFormat(): any {

        const serviceError: any = {
        };

        if (this.details) {
            serviceError.details = this.details;
        }

        // Include the stack trace as an array within the JSON object
        if (this.stack) {

            const frames: string[] = [];
            const items = this.stack.split('\n').map((x: string) => x.trim());
            items.forEach((i) => {
                frames.push(i);
            });

            serviceError.stack = frames;
        }

        return {
            statusCode: this.statusCode,
            clientError: this.toClientError().toResponseFormat(),
            serviceError,
        };
    }

    /*
     * Translate to a confidential and supportable error response to return to the API caller
     */
    public toClientError(): ClientError {

        // Return the error code to the client
        const error = new ClientError(this.statusCode, this.errorCode, this.message);

        // Also indicate which part of the system, where in logs and when the error occurred
        error.setExceptionDetails(this.apiName, this.instanceId, this.utcTime);
        return error;
    }
}
