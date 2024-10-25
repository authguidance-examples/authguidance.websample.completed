
import {HttpsProxyAgent} from 'https-proxy-agent';
import {Configuration} from '../configuration/configuration.js';

/*
 * Manage routing outbound calls from the API via an HTTP proxy
 */
export class HttpProxy {

    private readonly agent: any = null;

    /*
     * Create an HTTP agent to route requests to
     */
    public constructor(configuration: Configuration) {

        if (configuration.api.useProxy) {
            this.agent = new HttpsProxyAgent(configuration.api.proxyUrl);
        }
    }

    /*
     * Return the agent to other parts of the app
     */
    public getAgent(): HttpsProxyAgent<string> {
        return this.agent;
    }
}
