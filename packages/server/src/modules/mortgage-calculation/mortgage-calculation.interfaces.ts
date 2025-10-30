// ============================================================================
// INTERFACES
// ============================================================================
export interface MortgageCalculationInput {
    loanAmount: number;
    annualInterestRate: number;
    loanTermYears: number;
    downPayment?: number;
    propertyPrice?: number;
    propertyTaxAnnual?: number;
    homeInsuranceAnnual?: number;
    hoaMonthly?: number;
    pmiMonthly?: number;
    autoCalculatePMI?: boolean;
}

export interface FlexibleMortgageInput {
    propertyPrice: number;

    // specify loan by absolute or percent (choose one)
    loanAmount?: number;
    loanAmountPercent?: number;

    // specify down payment by absolute or percent (choose one)
    downPayment?: number;
    downPaymentPercent?: number;

    annualInterestRate: number;
    loanTermYears: number;

    // taxes/insurance either absolute annual or percent of price (choose one in each pair)
    propertyTaxAnnual?: number;
    propertyTaxPercent?: number;

    homeInsuranceAnnual?: number;
    homeInsurancePercent?: number;

    hoaMonthly?: number;
    pmiMonthly?: number; // override calculated PMI if provided
    autoCalculatePMI?: boolean; // default true
}

export interface PaymentBreakdown {
    principalAndInterest: number;
    propertyTax: number;
    homeInsurance: number;
    pmi: number;
    hoa: number;
    total: number;
}

export interface AmortizationEntry {
    month: number;
    principalAndInterest: number;
    principal: number;
    interest: number;
    propertyTax: number;
    homeInsurance: number;
    pmi: number;
    hoa: number;
    totalPayment: number;
    remainingBalance: number;
    totalPrincipalPaid: number;
    totalInterestPaid: number;
    principalPaidPercent: number;    // Percentage of total loan amount paid in principal
    interestPaidPercent: number;     // Percentage of total loan amount paid in interest
}

export interface MortgageCalculationResult {
    principalAndInterest: number; // monthly P&I
    propertyTax: number; // monthly tax
    homeInsurance: number; // monthly insurance
    pmi: number; // monthly PMI (may be 0)
    hoa: number; // monthly HOA
    totalMonthlyPayment: number; // full monthly payment (P&I + tax + ins + pmi + hoa)

    totalPayment: number; // total P&I over life of loan
    totalInterest: number; // total interest over life of loan

    loanAmount: number;
    downPaymentAmount: number;
    downPaymentPercentage: number;
    loanToValue: number; // initial LTV (%)

    breakdown: PaymentBreakdown;
    amortizationSchedule?: AmortizationEntry[];
}

export interface ValidationResult {
    valid: boolean;
    errors: string[];
}

export interface AffordabilityInput {
    maxMonthlyPayment: number;
    annualInterestRate: number;
    loanTermYears: number;
    downPaymentPercentage: number;

    // NEW (optional but common in prequal flows)
    grossMonthlyIncome?: number;
    targetFrontEndDTI?: number; // e.g., 0.28
    targetBackEndDTI?: number;  // e.g., 0.36
    otherMonthlyDebts?: number; // car, cards, student loans
    estimatedClosingCostsPercent?: number; // quick calc, e.g., 3%
    propertyTaxRate?: number;
    homeInsuranceAnnual?: number;
    hoaMonthly?: number;
    pmiAssume?: boolean;
}

export interface AffordabilityResult {
    maxPropertyPrice: number;
    maxLoanAmount: number;
    downPayment: number;
    estimatedMonthlyPayment: number;

    // NEW
    estimatedClosingCosts?: number;
    estimatedCashToClose?: number; // DP + costs - credits
    impliedFrontEndDTI?: number;
    impliedBackEndDTI?: number;
}
