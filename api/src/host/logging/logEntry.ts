import {Request, Response} from 'express';
import {ClientError} from '../../logic/errors/clientError.js';
import {ServerError} from '../../logic/errors/serverError.js';

/*
 * The log entry for an individual API request
 */
export class LogEntry {

    public readonly _utcTime: Date;
    public _path: string;
    public _method: string;
    public _statusCode: number;
    public _error: ClientError | ServerError | null;

    public constructor() {
        this._utcTime = new Date();
        this._path = '';
        this._method = '';
        this._statusCode = 0;
        this._error = null;
    }

    /*
     * Include some basic request information
     */
    public start(request: Request): void {
        this._path = request.originalUrl;
        this._method = request.method;
    }

    /*
     * Include some basic response information
     */
    public end(response: Response): void {
        this._statusCode = response.statusCode;
    }

    /*
     * Record errors
     */
    public setError(error: ClientError | ServerError): void {
        this._error = error;
    }

    /*
     * Indicate whether there is error information
     */
    public hasError(): boolean {
        return !!this._error;
    }

    /*
     * Output private class members
     */
    public toOutputFormat(): any {

        const data = {
            utcTime: this._utcTime,
        } as any;

        if (this._path && this._method) {
            data.path = this._path;
            data.method = this._method;
        }

        if (this._statusCode) {
            data.statusCode = this._statusCode;
        }

        if (this._error) {
            data.error = this._error.toLogFormat();
        }

        return data;
    }
}
