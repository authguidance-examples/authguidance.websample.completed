import axios, {Method} from 'axios';
import {ErrorCodes} from '../../plumbing/errors/errorCodes';
import {ErrorFactory} from '../../plumbing/errors/errorFactory';
import {UIError} from '../../plumbing/errors/uiError';
import {Authenticator} from '../../plumbing/oauth/authenticator';
import {AxiosUtils} from '../../plumbing/utilities/axiosUtils';
import {ApiUserInfo} from '../entities/apiUserInfo';
import {Company} from '../entities/company';
import {CompanyTransactions} from '../entities/companyTransactions';

/*
 * Logic related to making API calls
 */
export class ApiClient {

    private readonly _apiBaseUrl: string;
    private readonly _authenticator: Authenticator;

    public constructor(apiBaseUrl: string, authenticator: Authenticator) {

        this._apiBaseUrl = apiBaseUrl;
        if (!this._apiBaseUrl.endsWith('/')) {
            this._apiBaseUrl += '/';
        }

        this._authenticator = authenticator;
    }

    /*
     * Get a list of companies
     */
    public async getCompanyList(): Promise<Company[]> {

        return await this._callApi('companies', 'GET') as Company[];
    }

    /*
     * Get a list of transactions for a single company
     */
    public async getCompanyTransactions(id: string): Promise<CompanyTransactions> {

        return await this._callApi(`companies/${id}/transactions`, 'GET') as CompanyTransactions;
    }

    /*
     * The front end gets domain specific user info from its API
     */
    public async getUserInfo(): Promise<ApiUserInfo> {

        return await this._callApi('userinfo', 'GET') as ApiUserInfo;
    }

    /*
     * A central method to get data from an API and handle 401 retries
     * This basic implementation only works if a single API request is in flight at a time
     */
    private async _callApi(path: string, method: Method, dataToSend?: any): Promise<any> {

        // Get the full path
        const url = `${this._apiBaseUrl}${path}`;

        // Get the access token
        let token = await this._authenticator.getAccessToken();
        if (!token) {

            // Trigger a login redirect if we cannot get an access token
            // Also end the API request in a controlled way, by throwing an error that is not rendered
            await this._authenticator.startLogin(null);
            throw ErrorFactory.getFromLoginRequired();
        }

        try {

            // Call the API
            return await this._callApiWithToken(url, method, dataToSend, token);

        } catch (e1: any) {

            // Report Ajax errors if this is not a 401
            const error = e1 as UIError;
            if (error.statusCode !== 401) {
                throw error;
            }

            // If we received a 401 then try to refresh the access token
            token = await this._authenticator.refreshAccessToken();
            if (!token) {

                // Trigger a login redirect if we cannot refresh the access token
                // Also end the API request in a controlled way, by throwing an error that is not rendered
                await this._authenticator.startLogin(error);
                throw ErrorFactory.getFromLoginRequired();
            }

            try {

                // Call the API again
                return await this._callApiWithToken(url, method, dataToSend, token);

            } catch (e2: any) {

                // If there is a permanent token error then the token configuration is wrong
                // Present an error and ensure that the retry does a new top level login
                // This enables recovery once the token configuration is fixed at the authorization server
                const error = e2 as UIError;
                if ((error.statusCode === 401 && error.errorCode === ErrorCodes.invalidToken) ||
                    (error.statusCode === 403 && error.errorCode === ErrorCodes.insufficientScope)) {

                    await this._authenticator.clearLoginState();
                }

                throw error;
            }
        }
    }

    /*
     * Do the work of calling the API
     */
    private async _callApiWithToken(
        url: string,
        method: Method,
        dataToSend: any,
        accessToken: string): Promise<any> {

        try {

            const response = await axios.request({
                url,
                method,
                data: dataToSend,
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            AxiosUtils.checkJson(response.data);
            return response.data;

        } catch (e: any) {
            throw ErrorFactory.getFromHttpError(e, url, 'web API');
        }
    }
}
