import {ErrorLine} from './errorLine';
import {UIError} from './uiError';

/*
 * A class to manage error formatting
 */
export class ErrorFormatter {

    /*
     * Get errors ready for display
     */
    public static getErrorLines(error: UIError): ErrorLine[] {

        const lines: ErrorLine[] = [];

        // Display technical details that are OK to show to users
        if (error.message.length > 0) {
            lines.push(ErrorFormatter._createErrorLine('User Message', error.message));
        }

        if (error.area.length > 0) {
            lines.push(ErrorFormatter._createErrorLine('Area', error.area));
        }

        if (error.errorCode.length > 0) {
            lines.push(ErrorFormatter._createErrorLine('Error Code', error.errorCode));
        }

        if (error.statusCode > 0) {
            lines.push(ErrorFormatter._createErrorLine('Status Code', error.statusCode.toString()));
        }

        if (error.instanceId > 0) {
            lines.push(ErrorFormatter._createErrorLine('Id', error.instanceId.toString()));
        }

        if (error.utcTime.length > 0) {

            const errorTime = Date.parse(error.utcTime);
            const displayTime = new Date(errorTime).toLocaleString('en', {
                timeZone: 'utc',
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
            }).replace(/,/g, '');
            lines.push(ErrorFormatter._createErrorLine('UTC Time', displayTime));
        }

        if (error.details.length > 0) {
            lines.push(ErrorFormatter._createErrorLine('Details', error.details));
        }

        if (error.url.length > 0) {
            lines.push(ErrorFormatter._createErrorLine('URL', error.url));
        }

        return lines;
    }

    /*
     * Return the stack separately, since it is rendered in smaller text
     */
    public static getErrorStack(error: UIError): ErrorLine | null {

        // In debug builds render the stack trace as a long string
        // We can then look up results at https://sourcemaps.info
        if (SHOW_STACK_TRACE) {
            if (error.stack) {
                return ErrorFormatter._createErrorLine('Stack', error.stack);
            }
        }

        return null;
    }

    /*
     * Return an error line as an object
     */
    private static _createErrorLine(label: string, value: string): ErrorLine {

        return {
            label,
            value,
        };
    }
}
