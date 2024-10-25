import mustache from 'mustache';
import {ErrorCodes} from '../plumbing/errors/errorCodes';
import {ErrorFactory} from '../plumbing/errors/errorFactory';
import {ErrorFormatter} from '../plumbing/errors/errorFormatter';
import {ErrorLine} from '../plumbing/errors/errorLine';
import {UIError} from '../plumbing/errors/uiError';
import {DomUtils} from './domUtils';

/*
 * The error view renders error details
 */
export class ErrorView {

    public constructor() {
        this.setupCallbacks();
    }

    /*
     * Do the initial render to create the HTML, which remains hidden until there is an error
     */
    public load(): void {

        DomUtils.createDiv('#root', 'errorcontainer');
        const html =
            `<div class='card border-0'>
                <div class='row'>
                    <div id='errortitle' class='col-10 errorcolor largetext fw-bold text-center'>
                    </div>
                    <div class='col-2 text-end'>
                        <button id='btnClearError' type='button'>x</button>
                    </div>
                </div>
                <div class='row card-body'>
                    <div id='errorform' class='col-12'>
                    </div>
                </div>
            </div>`;

        DomUtils.html('#errorcontainer', html);
        DomUtils.hide('#errorcontainer');
        DomUtils.onClick('#btnClearError', this.clear);
    }

    /*
     * Do the error rendering given an exception
     */
    public report(exception: any): void {

        // Get the error into an object
        const error = ErrorFactory.getFromException(exception);

        // Do not render if we are just short circuiting page execution to start a login redirect
        if (error.getErrorCode() !== ErrorCodes.loginRequired) {

            // Otherwise render the error fields
            this.renderError(error);
        }
    }

    /*
     * Clear content and hide error details
     */
    public clear(): void {
        DomUtils.text('#errortitle', '');
        DomUtils.text('#errorform', '');
        DomUtils.hide('#errorcontainer');
    }

    /*
     * Render the error to the UI
     */
    private renderError(error: UIError): void {

        // Clear content and make the form visible
        DomUtils.text('#errortitle', '');
        DomUtils.text('#errorform', '');
        DomUtils.show('#errorcontainer');

        // Render the title
        DomUtils.text('#errortitle', 'Problem Encountered');

        // Render the error fields
        const errorHtml =
            this.getLinesHtml(ErrorFormatter.getErrorLines(error)) +
            this.getStackHtml(ErrorFormatter.getErrorStack(error));
        DomUtils.html('#errorform', errorHtml);
    }

    /*
     * Get the HTML for the error lines
     */
    private getLinesHtml(errorLines: ErrorLine[]): string {

        const htmlTemplate =
            `{{#lines}}
                <div class='row'>
                    <div class='col-4'>
                        {{label}}
                    </div>
                    <div class='col-8 valuecolor fw-bold'>
                        {{value}}
                    </div>
                </div>
            {{/lines}}`;

        return mustache.render(htmlTemplate, {lines: errorLines});
    }

    /*
     * Get the HTML for the error stack trace
     */
    private getStackHtml(stackLine: ErrorLine | null): string {

        if (!stackLine) {
            return '';
        }

        const htmlTemplate =
            `<div class='row' />
                <div class='col-4'>
                    &nbsp;
                </div>
                <div class='col-8'>
                    &nbsp;
                </div>
            </div>
            <div class='row' />
                 <div class='col-4'>
                     {{label}}
                 </div>
                 <div class='col-8 small'>
                     {{value}}
                 </div>
             </div>`;

        return mustache.render(htmlTemplate, stackLine);
    }

    /*
     * Plumbing to make the this parameter available in callbacks
     */
    private setupCallbacks(): void {
        this.clear = this.clear.bind(this);
    }
}
