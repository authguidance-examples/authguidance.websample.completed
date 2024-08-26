import {UserManager} from 'oidc-client-ts';
import {ConfigurationLoader} from '../configuration/configurationLoader';
import {ErrorConsoleReporter} from '../plumbing/errors/errorConsoleReporter';
import {ErrorCodes} from '../plumbing/errors/errorCodes';
import {ErrorFactory} from '../plumbing/errors/errorFactory';

/*
 * A mini application for the hidden iframe that does silent token renewal
 * The iframe redirect is triggered from the main window, and the below code receives the response
 */
export class IFrameApp {

    public async execute(): Promise<void> {

        try {

            // If the frame loads with a state query parameter we classify it as an OAuth response
            const args = new URLSearchParams(location.search);
            const state = args.get('state');
            if (state) {

                // Configure user manager settings
                const configuration = await ConfigurationLoader.download('spa.config.json');
                const settings = {
                    authority: configuration.oauth.authority,
                    client_id: configuration.oauth.clientId,
                    redirect_uri: configuration.oauth.redirectUri,
                };

                // The libary posts the authorization response URL to the main window
                // The main window then extract the authorization code and swaps it for tokens
                const userManager = new UserManager(settings);
                await userManager.signinSilentCallback();
            }

        } catch (e: any) {

            // In the event of errors calling the main window, output the error to the console
            const uiError = ErrorFactory.getFromTokenError(e, ErrorCodes.tokenRenewalError);
            ErrorConsoleReporter.output(uiError);
        }
    }
}
