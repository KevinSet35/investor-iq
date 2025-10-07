/**
 * Metadata describing a calculation result field
 */
// In mortgage-calculation.metadata.ts
export interface FieldMetadata {
    /** The key name of the field */
    key: string;
    /** Human-readable description of what this field represents */
    description: string;
    /** Unit of measurement (e.g., 'dollars', 'percent', 'months') */
    unit?: string;
    /** Format hint for display (e.g., 'currency', 'percentage', 'number') */
    format?: 'currency' | 'percentage' | 'number' | 'integer' | 'ratio';
}

/**
 * Metadata service for mortgage calculation fields
 */
export class MortgageCalculationMetadata {
    /**
     * Get metadata descriptions for all mortgage calculation result fields
     */
    static getResultMetadata(): FieldMetadata[] {
        return [
            {
                key: 'principalAndInterest',
                description: 'Monthly payment amount for principal and interest only (excludes taxes, insurance, PMI, and HOA)',
                unit: 'dollars',
                format: 'currency',
            },
            {
                key: 'propertyTax',
                description: 'Monthly property tax payment',
                unit: 'dollars',
                format: 'currency',
            },
            {
                key: 'homeInsurance',
                description: 'Monthly home insurance premium',
                unit: 'dollars',
                format: 'currency',
            },
            {
                key: 'pmi',
                description: 'Monthly Private Mortgage Insurance (PMI) payment. Required when down payment is less than 20% of property price',
                unit: 'dollars',
                format: 'currency',
            },
            {
                key: 'hoa',
                description: 'Monthly Homeowners Association (HOA) fee',
                unit: 'dollars',
                format: 'currency',
            },
            {
                key: 'totalMonthlyPayment',
                description: 'Total monthly payment including all costs (principal & interest + taxes + insurance + PMI + HOA)',
                unit: 'dollars',
                format: 'currency',
            },
            {
                key: 'totalPayment',
                description: 'Total amount paid over the entire loan term for principal and interest only',
                unit: 'dollars',
                format: 'currency',
            },
            {
                key: 'totalInterest',
                description: 'Total interest paid over the life of the loan',
                unit: 'dollars',
                format: 'currency',
            },
            {
                key: 'loanAmount',
                description: 'The actual loan amount borrowed from the lender',
                unit: 'dollars',
                format: 'currency',
            },
            {
                key: 'downPaymentAmount',
                description: 'The down payment amount in dollars',
                unit: 'dollars',
                format: 'currency',
            },
            {
                key: 'downPaymentPercentage',
                description: 'The down payment as a percentage of the property price. PMI is required if less than 20%',
                unit: 'percent',
                format: 'percentage',
            },
            {
                key: 'loanToValue',
                description: 'Loan-to-Value ratio representing the loan amount as a percentage of the property value',
                unit: 'percent',
                format: 'percentage',
            },
        ];
    }

    /**
     * Get metadata for amortization schedule fields
     */
    static getAmortizationMetadata(): FieldMetadata[] {
        return [
            {
                key: 'month',
                description: 'Payment number from 1 to total number of payments',
                unit: 'months',
                format: 'integer',
            },
            {
                key: 'principalAndInterest',
                description: 'Fixed monthly principal and interest payment amount',
                unit: 'dollars',
                format: 'currency',
            },
            {
                key: 'principal',
                description: 'Portion of this month\'s payment applied to the loan principal',
                unit: 'dollars',
                format: 'currency',
            },
            {
                key: 'interest',
                description: 'Portion of this month\'s payment applied to interest',
                unit: 'dollars',
                format: 'currency',
            },
            {
                key: 'propertyTax',
                description: 'Monthly property tax for this payment',
                unit: 'dollars',
                format: 'currency',
            },
            {
                key: 'homeInsurance',
                description: 'Monthly home insurance for this payment',
                unit: 'dollars',
                format: 'currency',
            },
            {
                key: 'pmi',
                description: 'PMI payment for this month. May drop to 0 once loan-to-value ratio reaches 80% or less',
                unit: 'dollars',
                format: 'currency',
            },
            {
                key: 'hoa',
                description: 'Monthly HOA fee for this payment',
                unit: 'dollars',
                format: 'currency',
            },
            {
                key: 'totalPayment',
                description: 'Total payment for this month including all components',
                unit: 'dollars',
                format: 'currency',
            },
            {
                key: 'remainingBalance',
                description: 'Remaining loan balance after this payment is applied',
                unit: 'dollars',
                format: 'currency',
            },
            {
                key: 'totalPrincipalPaid',
                description: 'Cumulative principal paid from the start of the loan through this payment',
                unit: 'dollars',
                format: 'currency',
            },
            {
                key: 'totalInterestPaid',
                description: 'Cumulative interest paid from the start of the loan through this payment',
                unit: 'dollars',
                format: 'currency',
            },
        ];
    }
}