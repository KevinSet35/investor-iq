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
    /** Optional string formula showing how this value is derived */
    formula?: string;
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
                formula: 'P * (r * (1 + r)^n) / ((1 + r)^n - 1)', // standard loan payment formula
            },
            {
                key: 'propertyTax',
                description: 'Monthly property tax payment',
                unit: 'dollars',
                format: 'currency',
                formula: '(propertyTaxAnnual || propertyTaxPercent * propertyPrice) / 12',
            },
            {
                key: 'homeInsurance',
                description: 'Monthly home insurance premium',
                unit: 'dollars',
                format: 'currency',
                formula: '(homeInsuranceAnnual || homeInsurancePercent * propertyPrice) / 12',
            },
            {
                key: 'pmi',
                description: 'Monthly Private Mortgage Insurance (PMI) payment. Required when down payment is less than 20% of property price',
                unit: 'dollars',
                format: 'currency',
                formula: '(loanAmount * pmiRate) / 12',
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
                formula: 'principalAndInterest + propertyTax + homeInsurance + pmi + hoa',
            },
            {
                key: 'totalPayment',
                description: 'Total amount paid over the entire loan term for principal and interest only',
                unit: 'dollars',
                format: 'currency',
                formula: 'principalAndInterest * totalMonths',
            },
            {
                key: 'totalInterest',
                description: 'Total interest paid over the life of the loan',
                unit: 'dollars',
                format: 'currency',
                formula: 'totalPayment - loanAmount',
            },
            {
                key: 'loanAmount',
                description: 'The actual loan amount borrowed from the lender',
                unit: 'dollars',
                format: 'currency',
                formula: 'propertyPrice - downPaymentAmount',
            },
            {
                key: 'downPaymentAmount',
                description: 'The down payment amount in dollars',
                unit: 'dollars',
                format: 'currency',
                formula: 'propertyPrice * (downPaymentPercentage / 100)',
            },
            {
                key: 'downPaymentPercentage',
                description: 'The down payment as a percentage of the property price. PMI is required if less than 20%',
                unit: 'percent',
                format: 'percentage',
                formula: '(downPaymentAmount / propertyPrice) * 100',
            },
            {
                key: 'loanToValue',
                description: 'Loan-to-Value ratio representing the loan amount as a percentage of the property value',
                unit: 'percent',
                format: 'percentage',
                formula: '(loanAmount / propertyPrice) * 100',
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
                formula: 'P * (r * (1 + r)^n) / ((1 + r)^n - 1)',
            },
            {
                key: 'principal',
                description: 'Portion of this month\'s payment applied to the loan principal',
                unit: 'dollars',
                format: 'currency',
                formula: 'principalAndInterest - interest',
            },
            {
                key: 'interest',
                description: 'Portion of this month\'s payment applied to interest',
                unit: 'dollars',
                format: 'currency',
                formula: 'remainingBalance * monthlyInterestRate',
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
                formula: 'principalAndInterest + propertyTax + homeInsurance + pmi + hoa',
            },
            {
                key: 'remainingBalance',
                description: 'Remaining loan balance after this payment is applied',
                unit: 'dollars',
                format: 'currency',
                formula: 'previousBalance - principal',
            },
            {
                key: 'totalPrincipalPaid',
                description: 'Cumulative principal paid from the start of the loan through this payment',
                unit: 'dollars',
                format: 'currency',
                formula: 'Σ(principal up to current month)',
            },
            {
                key: 'totalInterestPaid',
                description: 'Cumulative interest paid from the start of the loan through this payment',
                unit: 'dollars',
                format: 'currency',
                formula: 'Σ(interest up to current month)',
            },
        ];
    }
}
