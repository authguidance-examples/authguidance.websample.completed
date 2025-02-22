import type {ApiClient} from '../api/client/apiClient';
import {OAuthClient} from '../plumbing/oauth/oauthClient';
import {UserInfoView} from './userInfoView';
import {DomUtils} from './domUtils';

/*
 * The title view
 */
export class TitleView {

    private readonly userInfoView: UserInfoView;

    public constructor() {
        this.userInfoView = new UserInfoView();
    }

    /*
     * Render the title HTML
     */
    public load(): void {

        DomUtils.createDiv('#root', 'title');
        const html =
            `<div class='row'>
                <div class='col-8 my-auto'>
                    <h2>OAuth Demo App</h2>
                </div>
                <div class='col-4 my-auto'>
                    <div class='text-end mx-auto'>
                        <p id='username' class='fw-bold'></p>
                    </div>
                </div>
            </div>`;
        DomUtils.html('#title', html);
    }

    /*
     * Load the child user info view when requested
     */
    public async loadUserInfo(oauthClient: OAuthClient, apiClient: ApiClient): Promise<void> {
        await this.userInfoView.load(oauthClient, apiClient);
    }

    /*
     * Clear the child user info view when requested
     */
    public clearUserInfo(): void {
        this.userInfoView.clear();
    }
}
