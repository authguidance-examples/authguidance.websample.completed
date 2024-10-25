import mustache from 'mustache';
import {ApiClient} from '../api/client/apiClient';
import {CompanyTransactions} from '../api/entities/companyTransactions';
import {ErrorCodes} from '../plumbing/errors/errorCodes';
import {UIError} from '../plumbing/errors/uiError';
import {DomUtils} from './domUtils';

/*
 * The transactions view takes up the entire screen except for the header
 */
export class TransactionsView {

    private readonly apiClient: ApiClient;
    private readonly companyId: string;

    public constructor(apiClient: ApiClient, companyId: string) {
        this.apiClient = apiClient;
        this.companyId = companyId;
    }

    /*
    * Wait for data then render it
    */
    public async load(): Promise<void> {

        try {

            // Try to get data
            const data = await this.apiClient.getCompanyTransactions(this.companyId);

            // Render new content
            this.renderData(data);

        } catch (e: any) {

            const uiError = e as UIError;

            // Handle invalid input due to typing an id into the browser address bar
            if (uiError.getStatusCode() === 404 && uiError.getErrorCode() === ErrorCodes.companyNotFound) {

                // User typed an id value outside of valid company ids
                location.hash = '#';

            } else if (uiError.getStatusCode() === 400 && uiError.getErrorCode() === ErrorCodes.invalidCompanyId) {

                // User typed an invalid id such as 'abc'
                location.hash = '#';

            } else {

                // Clear previous content on error
                DomUtils.text('#main', '');
                throw uiError;
            }
        }
    }

    /*
     * Render data after receiving it from the API
     */
    private renderData(data: CompanyTransactions): void {

        // Build a view model from the data
        const viewModel = {
            title: `Today's Transactions for ${data.company.name}`,
            transactions: data.transactions.map((transaction) => {
                return {
                    id: transaction.id,
                    investorId: transaction.investorId,
                    formattedAmountUsd: Number(transaction.amountUsd).toLocaleString(),
                };
            }),
        };

        const htmlTemplate =
            `<div class='card border-0'>
                <div class='card-header row fw-bold'>
                    <div class='col-12 text-center mx-auto fw-bold'>
                        {{title}}
                    </div>
                </div>
                <div class='row'>
                    {{#transactions}}
                        <div class='col-lg-4 col-md-6 col-xs-12'>
                            <div class='card'>
                                <div class='card-body'>
                                    <div class='row'>
                                        <div class='col-6'>Transaction ID</div>
                                        <div class='col-6 text-end valuecolor fw-bold'>{{id}}</div>
                                    </div>
                                    <div class='row'>
                                        <div class='col-6'>Investor ID</div>
                                        <div class='col-6 text-end valuecolor fw-bold'>{{investorId}}</div>
                                    </div>
                                    <div class='row'>
                                        <div class='col-6'>Amount USD</div>
                                        <div class='col-6 text-end moneycolor fw-bold'>{{formattedAmountUsd}}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    {{/transactions}}
                </div>
            </div>`;

        // Update the main elemnent's content in a manner that handles dangerous characters correctly
        const html = mustache.render(htmlTemplate, viewModel);
        DomUtils.html('#main', html);
    }
}
