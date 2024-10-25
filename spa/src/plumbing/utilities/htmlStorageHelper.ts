/*
 * A utility class to keep our HTML storage organised
 */
export class HtmlStorageHelper {

    private static prefix = 'basicspa.';
    private static loggedInKey = 'loggedin';
    private static loggedOutEventKeyName = 'loggedoutEvent';
    private static oidcLogLevelKeyName = 'oidc-log-level';

    /*
     * Return true if the user is logged in
     */
    public static get isLoggedIn(): boolean {

        const key = `${HtmlStorageHelper.prefix}${HtmlStorageHelper.loggedInKey}`;
        const value = localStorage.getItem(key);
        return value === 'true';
    }

    /*
     * Set whether logged in
     */
    public static set isLoggedIn(value: boolean) {

        const key = `${HtmlStorageHelper.prefix}${HtmlStorageHelper.loggedInKey}`;
        localStorage.setItem(key, String(value));
    }

    /*
     * Raise the logged out value to local storage, to enable multi tab logout
     */
    public static raiseLoggedOutEvent(): void {

        const key = `${HtmlStorageHelper.prefix}${HtmlStorageHelper.loggedOutEventKeyName}`;
        localStorage.setItem(key, 'raised');
    }

    /*
     * This determines if a local storage update to logged out occurred on another browser tab
     */
    public static isLoggedOutEvent(event: StorageEvent): boolean {

        if (event.storageArea === localStorage) {

            const key = `${HtmlStorageHelper.prefix}${HtmlStorageHelper.loggedOutEventKeyName}`;
            return event.key === key && event.newValue === 'raised';
        }

        return false;
    }

    /*
     * Clear the event data from local storage
     */
    public static clearLoggedOutEvent(): void {

        const key = `${HtmlStorageHelper.prefix}${HtmlStorageHelper.loggedOutEventKeyName}`;
        localStorage.removeItem(key);
    }

    /*
     * Get the log level for viewing OIDC client library details
     */
    public static get oidcLogLevel(): string {

        const key = `${HtmlStorageHelper.prefix}${HtmlStorageHelper.oidcLogLevelKeyName}`;
        return sessionStorage.getItem(key) || '';
    }

    /*
     * Record the log level for viewing OIDC client library details
     */
    public static set oidcLogLevel(value: string) {

        const key = `${HtmlStorageHelper.prefix}${HtmlStorageHelper.oidcLogLevelKeyName}`;
        sessionStorage.setItem(key, value);
    }
}
