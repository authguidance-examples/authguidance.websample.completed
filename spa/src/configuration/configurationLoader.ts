import axios from 'axios';
import {Configuration} from '../configuration/configuration';
import {AxiosUtils} from '../plumbing/utilities/axiosUtils';
import {ErrorFactory} from '../plumbing/errors/errorFactory';

/*
 * Logic related to making HTTP calls
 */
export class ConfigurationLoader {

    /*
     * Download JSON data from the app config file
     * For development purposes we use a timestamp to force this on every page reload
     */
    public static async download(fileName: string): Promise<Configuration> {

        try {

            const url = `${fileName}?t=${new Date().getTime()}`;
            const response = await axios.get<Configuration>(url);
            AxiosUtils.checkJson(response.data);
            return response.data;

        } catch (xhr) {

            throw ErrorFactory.getFromHttpError(xhr, fileName, 'web host');
        }
    }
}
