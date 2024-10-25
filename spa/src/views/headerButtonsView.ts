import {DomUtils} from './domUtils';

/*
 * A simple view for the header buttons
 */
export class HeaderButtonsView {

    private readonly onHome: () => void;
    private readonly onExpireToken: () => void;
    private readonly onReloadData: () => void;
    private readonly onLogout: () => void;

    public constructor(
        onHome: ()          => void,
        onReloadData: ()   => void,
        onExpireToken: ()   => void,
        onLogout: ()        => void) {

        this.onHome = onHome;
        this.onReloadData = onReloadData;
        this.onExpireToken = onExpireToken;
        this.onLogout = onLogout;
    }

    /*
     * Render the view
     */
    /* eslint-disable max-len */
    public load(): void {

        DomUtils.createDiv('#root', 'headerbuttons');
        const html =
            `<div class='row'>
                <div class='col-3 my-2 d-flex'>
                    <button id='btnHome' type='button' class='btn btn-primary w-100 p-1'>Home</button>
                </div>
                <div class='col-3 my-2 d-flex'>
                    <button id='btnReloadData' type='button' disabled class='btn btn-primary w-100 p-1 sessionbutton'>Reload Data</button>
                </div>
                <div class='col-3 my-2 d-flex'>
                    <button id='btnExpireAccessToken' type='button' disabled class='btn btn-primary w-100 p-1 sessionbutton'>Expire Token</button>
                </div>
                <div class='col-3 my-2 d-flex'>
                    <button id='btnLogout' type='button' disabled class='btn btn-primary w-100 p-1 sessionbutton'>Sign Out</button>
                </div>
            </div>`;
        DomUtils.html('#headerbuttons', html);

        // Button clicks are handled by the parent class
        DomUtils.onClick('#btnHome', this.onHome);
        DomUtils.onClick('#btnExpireAccessToken', this.onExpireToken);
        DomUtils.onClick('#btnReloadData', this.onReloadData);
        DomUtils.onClick('#btnLogout', this.onLogout);
    }

    /*
     * Update the home button to display Sign In when not authenticated yet
     */
    public setIsAuthenticated(isAuthenticated: boolean): void {
        DomUtils.text('#btnHome', isAuthenticated ? 'Home' : 'Sign In');
    }

    /*
     * Buttons are disabled before data is loaded
     */
    public disableSessionButtons(): void {
        document.querySelectorAll('.sessionbutton').forEach((b) => b.setAttribute('disabled', 'disabled'));
    }

    /*
     * Buttons are enabled when all data loads successfully
     */
    public enableSessionButtons(): void {
        document.querySelectorAll('.sessionbutton').forEach((b) => b.removeAttribute('disabled'));
    }
}
