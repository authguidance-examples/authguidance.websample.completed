import {ApiConfiguration} from './apiConfiguration.js';
import {OAuthConfiguration} from './oauthConfiguration.js';

/*
 * A holder for configuration settings
 */
export interface Configuration {
    api: ApiConfiguration;
    oauth: OAuthConfiguration;
}
