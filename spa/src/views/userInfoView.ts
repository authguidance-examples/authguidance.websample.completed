import mustache from 'mustache';
import {ApiClient} from '../api/client/apiClient';
import {ApiUserInfo} from '../api/entities/apiUserInfo';
import {OAuthClient} from '../plumbing/oauth/oauthClient';
import {OAuthUserInfo} from '../plumbing/oauth/oauthUserInfo';
import {DomUtils} from './domUtils';

/*
 * The user info view renders details of the logged in user
 */
export class UserInfoView {

    public async load(oauthClient: OAuthClient, apiClient: ApiClient): Promise<void> {

        // Make the requests to get user info
        const oauthUserInfo = await oauthClient.getUserInfo();
        const apiUserInfo = await apiClient.getUserInfo();

        if (oauthUserInfo && apiUserInfo) {

            // Build a view model from the data
            const viewModel = {
                userName: this.getUserNameForDisplay(oauthUserInfo),
                title: this.getUserTitle(apiUserInfo),
                regions: this.getUserRegions(apiUserInfo),
            };

            // Form the template
            const htmlTemplate =
                `<div class='text-end mx-auto'>
                    <div class='fw-bold basictooltip'>{{userName}}
                        <div class='basictooltiptext'>
                            <small>{{title}}</small>
                            <br />
                            <small>{{regions}}</small>
                        </div>
                    </div>
                </div>`;

            // Render results
            const html = mustache.render(htmlTemplate, viewModel);
            DomUtils.html('#username', html);
        }
    }

    /*
     * Clear the view when we are logged out
     */
    public clear(): void {
        DomUtils.text('#username', '');
    }

    /*
     * Get a name string using OAuth user info
     */
    private getUserNameForDisplay(oauthUserInfo: OAuthUserInfo): string {

        if (!oauthUserInfo.givenName || !oauthUserInfo.familyName) {
            return '';
        }

        return `${oauthUserInfo.givenName} ${oauthUserInfo.familyName}`;
    }

    /*
     * Show the user's title when the name is clicked
     */
    private getUserTitle(apiUserInfo: ApiUserInfo): string {
        return apiUserInfo.title || '';
    }

    /*
     * Show the user's regions when the name is clicked
     */
    private getUserRegions(apiUserInfo: ApiUserInfo): string {

        const regions = apiUserInfo.regions.join(', ');
        return `[${regions}]`;
    }
}
