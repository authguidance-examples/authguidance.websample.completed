import fs from 'fs-extra';
import {ServerError} from '../errors/serverError.js';
import {ErrorCodes} from '../errors/errorCodes.js';

/*
 * A simple utility to deal with the infrastructure of reading JSON files
 */
export class JsonFileReader {

    /*
     * Do the file reading and return a promise
     */
    public async readData<T>(filePath: string): Promise<T> {

        try {

            // Try the read
            const buffer = await fs.readFile(filePath);
            return JSON.parse(buffer.toString()) as T;

        } catch (e: any) {

            // Do error translation of file read errors
            throw new ServerError(ErrorCodes.fileReadError, 'Problem encountered accessing data', e.stack);
        }
    }
}
