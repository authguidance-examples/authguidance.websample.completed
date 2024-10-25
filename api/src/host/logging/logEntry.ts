import {Request, Response} from 'express';
import {ClientError} from '../../logic/errors/clientError.js';
import {ServerError} from '../../logic/errors/serverError.js';

/*
 * The log entry for an individual API request
 */
export class LogEntry {

    public readonly utcTime: Date;
    public path: string;
    public method: string;
    public statusCode: number;
    public error: ClientError | ServerError | null;

    public constructor() {
        this.utcTime = new Date();
        this.path = '';
        this.method = '';
        this.statusCode = 0;
        this.error = null;
    }

    /*
     * Include some basic request information
     */
    public start(request: Request): void {
        this.path = request.originalUrl;
        this.method = request.method;
    }

    /*
     * Include some basic response information
     */
    public end(response: Response): void {
        this.statusCode = response.statusCode;
    }

    /*
     * Record errors
     */
    public setError(error: ClientError | ServerError): void {
        this.error = error;
    }

    /*
     * Indicate whether there is error information
     */
    public hasError(): boolean {
        return !!this.error;
    }

    /*
     * Output private class members
     */
    public toOutputFormat(): any {

        const data = {
            utcTime: this.utcTime,
        } as any;

        if (this.path && this.method) {
            data.path = this.path;
            data.method = this.method;
        }

        if (this.statusCode) {
            data.statusCode = this.statusCode;
        }

        if (this.error) {
            data.error = this.error.toLogFormat();
        }

        return data;
    }
}
