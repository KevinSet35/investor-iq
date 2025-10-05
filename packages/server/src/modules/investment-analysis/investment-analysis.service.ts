import { Injectable } from '@nestjs/common';

export interface MortgageCalculationInput {
    loanAmount: number;
    annualInterestRate: number; // in percentage (e.g., 5.5 for 5.5%)
    loanTermYears: number;
    downPayment?: number;
    propertyPrice?: number;
    propertyTaxAnnual?: number; // annual property tax
    homeInsuranceAnnual?: number; // annual homeowners insurance
    hoaMonthly?: number; // monthly HOA fees
    pmiMonthly?: number; // monthly PMI (or calculate automatically)
    autoCalculatePMI?: boolean; // auto-calculate PMI if down payment < 20%
};

export interface MortgageCalculationResult {
    principalAndInterest: number; // P&I only
    propertyTax: number; // monthly
    homeInsurance: number; // monthly
    pmi: number; // monthly
    hoa: number; // monthly
    totalMonthlyPayment: number; // PITI + HOA + PMI
    totalPayment: number;
    totalInterest: number;
    loanAmount: number;
    downPaymentAmount: number;
    downPaymentPercentage: number;
    loanToValue: number; // LTV ratio
    breakdown: PaymentBreakdown;
    amortizationSchedule?: AmortizationEntry[];
};

interface PaymentBreakdown {
    principalAndInterest: number;
    propertyTax: number;
    homeInsurance: number;
    pmi: number;
    hoa: number;
    total: number;
};

interface AmortizationEntry {
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
};

@Injectable()
export class InvestmentAnalysisService {
    /**
     * Calculate complete mortgage payment including PITI + HOA + PMI
     */
    calculateMortgage(input: MortgageCalculationInput): MortgageCalculationResult {
        const {
            loanAmount: inputLoanAmount,
            annualInterestRate,
            loanTermYears,
            downPayment = 0,
            propertyPrice,
            propertyTaxAnnual = 0,
            homeInsuranceAnnual = 0,
            hoaMonthly = 0,
            pmiMonthly = 0,
            autoCalculatePMI = true,
        } = input;

        // Calculate actual loan amount if property price is provided
        const loanAmount = propertyPrice
            ? propertyPrice - downPayment
            : inputLoanAmount;

        const downPaymentAmount = propertyPrice ? downPayment : 0;
        const downPaymentPercentage = propertyPrice
            ? (downPayment / propertyPrice) * 100
            : 0;

        const actualPropertyPrice = propertyPrice || loanAmount;
        const loanToValue = (loanAmount / actualPropertyPrice) * 100;

        // Convert annual rate to monthly and decimal
        const monthlyRate = annualInterestRate / 100 / 12;
        const numberOfPayments = loanTermYears * 12;

        // Calculate monthly P&I payment using amortization formula
        const principalAndInterest =
            monthlyRate === 0
                ? loanAmount / numberOfPayments
                : (loanAmount *
                    (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
                (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

        // Monthly property tax and insurance
        const monthlyPropertyTax = propertyTaxAnnual / 12;
        const monthlyHomeInsurance = homeInsuranceAnnual / 12;

        // Calculate PMI if down payment is less than 20% and auto-calculate is enabled
        let monthlyPMI = pmiMonthly;
        if (autoCalculatePMI && downPaymentPercentage < 20 && downPaymentPercentage > 0) {
            // Typical PMI is 0.5% to 1% of loan amount annually
            // Using 0.75% as average
            monthlyPMI = (loanAmount * 0.0075) / 12;
        }

        const totalMonthlyPayment =
            principalAndInterest +
            monthlyPropertyTax +
            monthlyHomeInsurance +
            monthlyPMI +
            hoaMonthly;

        const totalPayment = principalAndInterest * numberOfPayments;
        const totalInterest = totalPayment - loanAmount;

        return {
            principalAndInterest: Math.round(principalAndInterest * 100) / 100,
            propertyTax: Math.round(monthlyPropertyTax * 100) / 100,
            homeInsurance: Math.round(monthlyHomeInsurance * 100) / 100,
            pmi: Math.round(monthlyPMI * 100) / 100,
            hoa: Math.round(hoaMonthly * 100) / 100,
            totalMonthlyPayment: Math.round(totalMonthlyPayment * 100) / 100,
            totalPayment: Math.round(totalPayment * 100) / 100,
            totalInterest: Math.round(totalInterest * 100) / 100,
            loanAmount,
            downPaymentAmount,
            downPaymentPercentage: Math.round(downPaymentPercentage * 100) / 100,
            loanToValue: Math.round(loanToValue * 100) / 100,
            breakdown: {
                principalAndInterest: Math.round(principalAndInterest * 100) / 100,
                propertyTax: Math.round(monthlyPropertyTax * 100) / 100,
                homeInsurance: Math.round(monthlyHomeInsurance * 100) / 100,
                pmi: Math.round(monthlyPMI * 100) / 100,
                hoa: Math.round(hoaMonthly * 100) / 100,
                total: Math.round(totalMonthlyPayment * 100) / 100,
            },
        };
    }

    /**
     * Calculate mortgage with full amortization schedule including all costs
     */
    calculateMortgageWithSchedule(
        input: MortgageCalculationInput,
    ): MortgageCalculationResult {
        const result = this.calculateMortgage(input);
        const { loanAmount, annualInterestRate, loanTermYears } = input;

        const monthlyRate = annualInterestRate / 100 / 12;
        const numberOfPayments = loanTermYears * 12;
        const amortizationSchedule: AmortizationEntry[] = [];

        let remainingBalance = loanAmount;
        const downPaymentPercentage = result.downPaymentPercentage;

        for (let month = 1; month <= numberOfPayments; month++) {
            const interestPayment = remainingBalance * monthlyRate;
            const principalPayment = result.principalAndInterest - interestPayment;
            remainingBalance -= principalPayment;

            // PMI stops when LTV reaches 80% (or loan balance is 80% of original)
            const currentLTV = (remainingBalance / loanAmount) * 100;
            const pmiThisMonth =
                currentLTV > 80 && downPaymentPercentage < 20 ? result.pmi : 0;

            const totalPaymentThisMonth =
                result.principalAndInterest +
                result.propertyTax +
                result.homeInsurance +
                pmiThisMonth +
                result.hoa;

            amortizationSchedule.push({
                month,
                principalAndInterest: Math.round(result.principalAndInterest * 100) / 100,
                principal: Math.round(principalPayment * 100) / 100,
                interest: Math.round(interestPayment * 100) / 100,
                propertyTax: result.propertyTax,
                homeInsurance: result.homeInsurance,
                pmi: Math.round(pmiThisMonth * 100) / 100,
                hoa: result.hoa,
                totalPayment: Math.round(totalPaymentThisMonth * 100) / 100,
                remainingBalance: Math.max(0, Math.round(remainingBalance * 100) / 100),
            });
        }

        return {
            ...result,
            amortizationSchedule,
        };
    }

    /**
     * Calculate maximum affordable property price based on monthly budget
     */
    calculateAffordableProperty(
        maxMonthlyPayment: number,
        annualInterestRate: number,
        loanTermYears: number,
        downPaymentPercentage: number,
        propertyTaxRate: number = 1.2, // annual % of property value
        homeInsuranceAnnual: number = 1200,
        hoaMonthly: number = 0,
    ): {
        maxPropertyPrice: number;
        maxLoanAmount: number;
        downPayment: number;
        estimatedMonthlyPayment: number;
    } {
        const monthlyRate = annualInterestRate / 100 / 12;
        const numberOfPayments = loanTermYears * 12;
        const downPaymentDecimal = downPaymentPercentage / 100;

        // Account for PMI if down payment is less than 20%
        const pmiRate = downPaymentPercentage < 20 ? 0.0075 / 12 : 0;

        // Subtract fixed costs from max payment
        const monthlyInsurance = homeInsuranceAnnual / 12;
        const availableForPIAndTax = maxMonthlyPayment - monthlyInsurance - hoaMonthly;

        // This requires iterative calculation, using approximation
        // propertyPrice * (taxRate/12 + (1-downPayment%) * (mortgagePayment% + PMI%)) = available

        const taxFactor = propertyTaxRate / 100 / 12;
        const loanFactor = 1 - downPaymentDecimal;

        const mortgagePaymentRate =
            monthlyRate === 0
                ? 1 / numberOfPayments
                : (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
                (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

        const propertyPriceFactor =
            taxFactor + loanFactor * (mortgagePaymentRate + pmiRate);

        const maxPropertyPrice = availableForPIAndTax / propertyPriceFactor;
        const downPayment = maxPropertyPrice * downPaymentDecimal;
        const maxLoanAmount = maxPropertyPrice - downPayment;

        // Calculate actual monthly payment for verification
        const monthlyPI = maxLoanAmount * mortgagePaymentRate;
        const monthlyTax = (maxPropertyPrice * propertyTaxRate) / 100 / 12;
        const monthlyPMI = downPaymentPercentage < 20 ? maxLoanAmount * pmiRate : 0;
        const estimatedMonthlyPayment =
            monthlyPI + monthlyTax + monthlyInsurance + monthlyPMI + hoaMonthly;

        return {
            maxPropertyPrice: Math.round(maxPropertyPrice * 100) / 100,
            maxLoanAmount: Math.round(maxLoanAmount * 100) / 100,
            downPayment: Math.round(downPayment * 100) / 100,
            estimatedMonthlyPayment: Math.round(estimatedMonthlyPayment * 100) / 100,
        };
    }
}