import {ErrorCodes} from './errorCodes.js';

/*
 * Manage errors due to invalid client usage
 */
export class ClientError extends Error {

    /*
     * A helper method to return a 401 error
     */
    public static create401(reason: string): ClientError {

        const error = new ClientError(
            401,
            ErrorCodes.invalidToken,
            'Missing, invalid or expired access token');

        error.logContext = reason;
        return error;
    }

    private readonly statusCode: number;
    private readonly errorCode: string;
    private logContext: any;
    private area: string;
    private id: number;
    private utcTime: string;

    /*
     * Construct from mandatory fields
     */
    public constructor(statusCode: number, errorCode: string, message: string) {

        // Set common fields
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.logContext = null;

        // Initialise 5xx fields
        this.area = '';
        this.id = 0;
        this.utcTime = '';

        // Ensure that instanceof works
        Object.setPrototypeOf(this, new.target.prototype);
    }

    public getStatusCode(): number {
        return this.statusCode;
    }

    /*
     * The error code is written to response headers
     */
    public getErrorCode(): string {
        return this.errorCode;
    }

    /*
     * Set extra fields to return to the caller for 500 errors
     */
    public setExceptionDetails(area: string, id: number, utcTime: string): void {
        this.area = area;
        this.id = id;
        this.utcTime = utcTime;
    }

    /*
     * A 4xx error can be thrown with additional data that is logged for support purposes
     */
    public setLogContext(value: any): void {
        this.logContext = value;
    }

    /*
     * Return an object that can be serialized by calling JSON.stringify
     */
    public toResponseFormat(): any {

        const body: any = {
            code: this.errorCode,
            message: this.message,
        };

        if (this.id > 0 && this.area.length > 0 && this.utcTime.length > 0) {
            body.id = this.id;
            body.area = this.area;
            body.utcTime = this.utcTime;
        }

        return body;
    }

    /*
     * Similar to the above but includes details outside the response body
     */
    public toLogFormat(): any {

        const data: any = {
            statusCode: this.statusCode,
            clientError: this.toResponseFormat(),
        };

        if (this.logContext) {
            data.context = this.logContext;
        }

        return data;
    }
}
