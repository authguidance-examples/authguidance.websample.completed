import axios, {Method} from 'axios';
import {ErrorCodes} from '../../plumbing/errors/errorCodes';
import {ErrorFactory} from '../../plumbing/errors/errorFactory';
import {UIError} from '../../plumbing/errors/uiError';
import {OAuthClient} from '../../plumbing/oauth/oauthClient';
import {AxiosUtils} from '../../plumbing/utilities/axiosUtils';
import {ApiUserInfo} from '../entities/apiUserInfo';
import {Company} from '../entities/company';
import {CompanyTransactions} from '../entities/companyTransactions';

/*
 * Logic related to making API calls
 */
export class ApiClient {

    private readonly apiBaseUrl: string;
    private readonly oauthClient: OAuthClient;

    public constructor(apiBaseUrl: string, oauthClient: OAuthClient) {

        this.apiBaseUrl = apiBaseUrl;
        if (!this.apiBaseUrl.endsWith('/')) {
            this.apiBaseUrl += '/';
        }

        this.oauthClient = oauthClient;
    }

    /*
     * Get a list of companies
     */
    public async getCompanyList(): Promise<Company[]> {

        return await this.callApi('companies', 'GET') as Company[];
    }

    /*
     * Get a list of transactions for a single company
     */
    public async getCompanyTransactions(id: string): Promise<CompanyTransactions> {

        return await this.callApi(`companies/${id}/transactions`, 'GET') as CompanyTransactions;
    }

    /*
     * The front end gets domain specific user info from its API
     */
    public async getUserInfo(): Promise<ApiUserInfo> {

        return await this.callApi('userinfo', 'GET') as ApiUserInfo;
    }

    /*
     * A central method to get data from an API and handle 401 retries
     * This basic implementation only works if a single API request is in flight at a time
     */
    private async callApi(path: string, method: Method, dataToSend?: any): Promise<any> {

        // Get the full path
        const url = `${this.apiBaseUrl}${path}`;

        // Get the access token
        let token = await this.oauthClient.getAccessToken();
        if (!token) {

            // Trigger a login redirect if we cannot get an access token
            // Also end the API request in a controlled way, by throwing an error that is not rendered
            await this.oauthClient.startLogin(null);
            throw ErrorFactory.getFromLoginRequired();
        }

        try {

            // Call the API
            return await this.callApiWithToken(url, method, dataToSend, token);

        } catch (e1: any) {

            // Report Ajax errors if this is not a 401
            const error = e1 as UIError;
            if (error.getStatusCode() !== 401) {
                throw error;
            }

            // If we received a 401 then try to refresh the access token
            token = await this.oauthClient.refreshAccessToken();
            if (!token) {

                // Trigger a login redirect if we cannot refresh the access token
                // Also end the API request in a controlled way, by throwing an error that is not rendered
                await this.oauthClient.startLogin(error);
                throw ErrorFactory.getFromLoginRequired();
            }

            try {

                // Call the API again
                return await this.callApiWithToken(url, method, dataToSend, token);

            } catch (e2: any) {

                // If there is a permanent token error then the token configuration is wrong
                // Present an error and ensure that the retry does a new top level login
                // This enables recovery once the token configuration is fixed at the authorization server
                const error = e2 as UIError;
                if ((error.getStatusCode() === 401 && error.getErrorCode() === ErrorCodes.invalidToken) ||
                    (error.getStatusCode() === 403 && error.getErrorCode() === ErrorCodes.insufficientScope)) {

                    await this.oauthClient.clearLoginState();
                }

                throw error;
            }
        }
    }

    /*
     * Do the work of calling the API
     */
    private async callApiWithToken(
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
