import {Company} from './company.js';
import {Transaction} from './transaction.js';

/*
 * A composite entity of a company and its transactions
 */
export interface CompanyTransactions {
    id: number;
    company: Company;
    transactions: Transaction[];
}
