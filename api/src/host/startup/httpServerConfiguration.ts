import cors from 'cors';
import express from 'express';
import {Application} from 'express';
import fs from 'fs-extra';
import https from 'https';
import {Configuration} from '../configuration/configuration.js';
import {ApiController} from '../controller/apiController.js';
import {ApiLogger} from '../logging/apiLogger.js';

/*
 * Configure HTTP behaviour at application startup
 */
export class HttpServerConfiguration {

    private readonly express: Application;
    private readonly configuration: Configuration;
    private readonly apiLogger: ApiLogger;
    private readonly apiController: ApiController;

    public constructor(expressApp: Application, configuration: Configuration, logger: ApiLogger) {

        this.express = expressApp;
        this.configuration = configuration;
        this.apiLogger = logger;
        this.apiController = new ApiController(this.configuration);
    }

    /*
     * Set up Web API routes and initialize the API
     */
    public async initializeApi(): Promise<void> {

        // Grant API access to the web origin
        const corsOptions = {
            origin: this.configuration.api.trustedOrigins,
            maxAge: 86400,
        };
        this.express.use('/api/*_', cors(corsOptions));
        this.express.use('/api/*_', this.apiController.onWriteHeaders);

        // Add cross cutting concerns
        this.express.use('/api/*_', this.apiLogger.logRequest);
        this.express.use('/api/*_', this.apiController.authorizationHandler);

        // API routes containing business logic
        this.express.get('/api/userinfo', this.apiController.getUserInfo);
        this.express.get('/api/companies', this.apiController.getCompanyList);
        this.express.get('/api/companies/:id/transactions', this.apiController.getCompanyTransactions);

        // Handle errors after routes are defined
        this.express.use('/api/*_', this.apiController.onRequestNotFound);
        this.express.use('/api/*_', this.apiController.onException);
    }

    /*
     * For code sample simplicity, the API serves web content, though a real API would not do this
     */
    public initializeWebStaticContentHosting(): void {

        this.express.use('/spa', express.static('../spa'));
        this.express.use('/favicon.ico', express.static('../spa/favicon.ico'));
    }

    /*
     * Start serving requests
     */
    public async startListening(): Promise<void> {

        const port = this.configuration.api.port;
        if (this.configuration.api.sslCertificateFileName && this.configuration.api.sslCertificatePassword) {

            // Load the certificate file from disk
            const pfxFile = await fs.readFile(this.configuration.api.sslCertificateFileName);
            const sslOptions = {
                pfx: pfxFile,
                passphrase: this.configuration.api.sslCertificatePassword,
            };

            // Start listening on HTTPS
            const httpsServer = https.createServer(sslOptions, this.express);
            httpsServer.listen(port, () => {
                console.log(`API is listening on HTTPS port ${port}`);
            });

        } else {

            // Otherwise listen over HTTP
            this.express.listen(port, () => {
                console.log(`API is listening on HTTP port ${port}`);
            });
        }
    }
}
