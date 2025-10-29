import { NumberUtils } from '@/common/utility/number.utils';
import { Injectable } from '@nestjs/common';
import {
    AffordabilityInput,
    AffordabilityResult,
    AmortizationEntry,
    FlexibleMortgageInput,
    MortgageCalculationInput,
    MortgageCalculationResult,
    PaymentBreakdown,
    ValidationResult,
} from './mortgage-calculation.interfaces';

// ============================================================================
// SERVICE
// ============================================================================
@Injectable()
export class MortgageCalculationService {
    // -------- Flexible calculators (used by rental analysis) --------
    calculateMortgageFlexible(input: FlexibleMortgageInput): MortgageCalculationResult {
        this.validateFlexibleInput(input);
        const normalized = this.normalizeInput(input);
        return this.calculateMortgage(normalized);
    }

    calculateMortgageWithScheduleFlexible(input: FlexibleMortgageInput): MortgageCalculationResult {
        this.validateFlexibleInput(input);
        const normalized = this.normalizeInput(input);
        return this.calculateMortgageWithSchedule(normalized);
    }

    // -------- Affordability --------
    calculateAffordableProperty(
        input: AffordabilityInput,
    ): AffordabilityResult {
        const maxMonthlyPayment = input.maxMonthlyPayment;
        const annualInterestRate = input.annualInterestRate;
        const loanTermYears = input.loanTermYears;
        const downPaymentPercentage = input.downPaymentPercentage;
        const propertyTaxRate = input.propertyTaxRate ?? DEFAULT_PROPERTY_TAX_RATE;
        const homeInsuranceAnnual = input.homeInsuranceAnnual ?? DEFAULT_HOME_INSURANCE_ANNUAL;
        const hoaMonthly = input.hoaMonthly ?? 0;
        this.validateAffordabilityInput(maxMonthlyPayment, annualInterestRate, loanTermYears, downPaymentPercentage);

        const monthlyRate = this.calculateMonthlyRate(annualInterestRate);
        const n = this.calculateTotalPayments(loanTermYears);
        const downPct = downPaymentPercentage / PERCENT_TO_DECIMAL;

        const pmiRateMonthly =
            downPaymentPercentage < MINIMUM_DOWN_PAYMENT_FOR_NO_PMI ? DEFAULT_PMI_RATE / MONTHS_PER_YEAR : 0;

        const monthlyInsurance = homeInsuranceAnnual / MONTHS_PER_YEAR;
        const availableForPIAndTax = maxMonthlyPayment - monthlyInsurance - hoaMonthly;

        const taxFactor = propertyTaxRate / PERCENT_TO_DECIMAL / MONTHS_PER_YEAR;
        const loanFactor = 1 - downPct;
        const mortgagePaymentRate = this.calculateMortgagePaymentRate(monthlyRate, n);

        const propertyPriceFactor = taxFactor + loanFactor * (mortgagePaymentRate + pmiRateMonthly);
        const maxPropertyPrice = availableForPIAndTax / propertyPriceFactor;

        const downPayment = maxPropertyPrice * downPct;
        const maxLoanAmount = maxPropertyPrice - downPayment;

        const monthlyPI = maxLoanAmount * mortgagePaymentRate;
        const monthlyTax = maxPropertyPrice * taxFactor * MONTHS_PER_YEAR;
        const monthlyPMI = downPaymentPercentage < MINIMUM_DOWN_PAYMENT_FOR_NO_PMI ? maxLoanAmount * pmiRateMonthly : 0;
        const estimatedMonthlyPayment = monthlyPI + monthlyTax + monthlyInsurance + monthlyPMI + hoaMonthly;

        return {
            maxPropertyPrice: NumberUtils.roundToTwo(maxPropertyPrice),
            maxLoanAmount: NumberUtils.roundToTwo(maxLoanAmount),
            downPayment: NumberUtils.roundToTwo(downPayment),
            estimatedMonthlyPayment: NumberUtils.roundToTwo(estimatedMonthlyPayment),
        };
    }

    // ============================================================================
    // VALIDATION
    // ============================================================================
    private validateFlexibleInput(input: FlexibleMortgageInput): void {
        const { valid, errors } = this.validateInput(input);
        if (!valid) throw new Error(`Invalid mortgage input: ${errors.join(', ')}`);
    }

    private validateInput(input: FlexibleMortgageInput): ValidationResult {
        const errors: string[] = [];

        if (!input.propertyPrice || input.propertyPrice <= 0)
            errors.push('propertyPrice is required and must be greater than 0');
        if (input.loanAmount !== undefined && input.loanAmountPercent !== undefined)
            errors.push('Cannot specify both loanAmount and loanAmountPercent');
        if (input.downPayment !== undefined && input.downPaymentPercent !== undefined)
            errors.push('Cannot specify both downPayment and downPaymentPercent');
        if (input.propertyTaxAnnual !== undefined && input.propertyTaxPercent !== undefined)
            errors.push('Cannot specify both propertyTaxAnnual and propertyTaxPercent');
        if (input.homeInsuranceAnnual !== undefined && input.homeInsurancePercent !== undefined)
            errors.push('Cannot specify both homeInsuranceAnnual and homeInsurancePercent');

        this.validatePercentageRanges(input, errors);

        return { valid: errors.length === 0, errors };
    }

    private validatePercentageRanges(input: FlexibleMortgageInput, errors: string[]): void {
        if (input.loanAmountPercent !== undefined && !NumberUtils.isValidPercentage(input.loanAmountPercent)) {
            errors.push('loanAmountPercent must be between 0 and 100');
        }
        if (input.downPaymentPercent !== undefined && !NumberUtils.isValidPercentage(input.downPaymentPercent)) {
            errors.push('downPaymentPercent must be between 0 and 100');
        }
        if (input.propertyTaxPercent !== undefined && input.propertyTaxPercent < 0) {
            errors.push('propertyTaxPercent must be non-negative');
        }
        if (input.homeInsurancePercent !== undefined && input.homeInsurancePercent < 0) {
            errors.push('homeInsurancePercent must be non-negative');
        }
    }

    private validateAffordabilityInput(
        maxMonthlyPayment: number,
        annualInterestRate: number,
        loanTermYears: number,
        downPaymentPercentage: number,
    ): void {
        if (maxMonthlyPayment <= 0) throw new Error('maxMonthlyPayment must be greater than 0');
        if (annualInterestRate < 0) throw new Error('annualInterestRate must be non-negative');
        if (loanTermYears <= 0) throw new Error('loanTermYears must be greater than 0');
        if (!NumberUtils.isValidPercentage(downPaymentPercentage))
            throw new Error('downPaymentPercentage must be between 0 and 100');
    }

    // ============================================================================
    // CORE CALCULATIONS
    // ============================================================================
    private calculateMortgage(input: MortgageCalculationInput): MortgageCalculationResult {
        const loanDetails = this.calculateLoanDetails(input);
        const monthlyRate = this.calculateMonthlyRate(input.annualInterestRate);
        const n = this.calculateTotalPayments(input.loanTermYears);

        const principalAndInterest = this.calculatePrincipalAndInterest(loanDetails.loanAmount, monthlyRate, n);

        const monthlyPropertyTax = (input.propertyTaxAnnual || 0) / MONTHS_PER_YEAR;
        const monthlyHomeInsurance = (input.homeInsuranceAnnual || 0) / MONTHS_PER_YEAR;
        const monthlyPMI = this.calculateMonthlyPMI(input, loanDetails.loanAmount, loanDetails.downPaymentPercentage);
        const monthlyHOA = input.hoaMonthly || 0;

        const totalMonthlyPayment = this.calculateTotalMonthlyPayment(
            principalAndInterest,
            monthlyPropertyTax,
            monthlyHomeInsurance,
            monthlyPMI,
            monthlyHOA,
        );

        const totalPayment = principalAndInterest * n;
        const totalInterest = totalPayment - loanDetails.loanAmount;

        return {
            principalAndInterest: NumberUtils.roundToTwo(principalAndInterest),
            propertyTax: NumberUtils.roundToTwo(monthlyPropertyTax),
            homeInsurance: NumberUtils.roundToTwo(monthlyHomeInsurance),
            pmi: NumberUtils.roundToTwo(monthlyPMI),
            hoa: NumberUtils.roundToTwo(monthlyHOA),
            totalMonthlyPayment: NumberUtils.roundToTwo(totalMonthlyPayment),
            totalPayment: NumberUtils.roundToTwo(totalPayment),
            totalInterest: NumberUtils.roundToTwo(totalInterest),

            loanAmount: loanDetails.loanAmount,
            downPaymentAmount: loanDetails.downPaymentAmount,
            downPaymentPercentage: NumberUtils.roundToTwo(loanDetails.downPaymentPercentage),
            loanToValue: NumberUtils.roundToTwo(loanDetails.loanToValue),

            breakdown: this.createPaymentBreakdown(
                principalAndInterest,
                monthlyPropertyTax,
                monthlyHomeInsurance,
                monthlyPMI,
                monthlyHOA,
                totalMonthlyPayment,
            ),
        };
    }

    private calculateMortgageWithSchedule(input: MortgageCalculationInput): MortgageCalculationResult {
        const result = this.calculateMortgage(input);
        const monthlyRate = this.calculateMonthlyRate(input.annualInterestRate);
        const n = this.calculateTotalPayments(input.loanTermYears);

        const amortizationSchedule = this.buildAmortizationSchedule(result.loanAmount, monthlyRate, n, result);

        return { ...result, amortizationSchedule };
    }

    // Loan detail derivation from price + down payment or direct loan amount
    private calculateLoanDetails(input: MortgageCalculationInput) {
        const { loanAmount: inputLoanAmount, downPayment = 0, propertyPrice } = input;

        const loanAmount = propertyPrice ? propertyPrice - downPayment : inputLoanAmount;
        const downPaymentAmount = propertyPrice ? downPayment : 0;
        const actualPropertyPrice = propertyPrice || loanAmount;

        const downPaymentPercentage = propertyPrice ? (downPayment / propertyPrice) * PERCENT_TO_DECIMAL : 0;
        const loanToValue = (loanAmount / actualPropertyPrice) * PERCENT_TO_DECIMAL;

        return { loanAmount, downPaymentAmount, downPaymentPercentage, loanToValue };
    }

    private calculatePrincipalAndInterest(loanAmount: number, monthlyRate: number, n: number): number {
        if (monthlyRate === 0) return loanAmount / n;
        const factor = Math.pow(1 + monthlyRate, n);
        return (loanAmount * monthlyRate * factor) / (factor - 1);
    }

    private calculateMonthlyPMI(
        input: MortgageCalculationInput,
        loanAmount: number,
        downPaymentPercentage: number,
    ): number {
        if (input.pmiMonthly) return input.pmiMonthly;

        const shouldAutoCalculate = input.autoCalculatePMI ?? true;
        if (shouldAutoCalculate && this.shouldCalculatePMI(downPaymentPercentage)) {
            return (loanAmount * DEFAULT_PMI_RATE) / MONTHS_PER_YEAR;
        }
        return 0;
    }

    private calculateTotalMonthlyPayment(pi: number, tax: number, ins: number, pmi: number, hoa: number): number {
        return pi + tax + ins + pmi + hoa;
    }

    private buildAmortizationSchedule(
        loanAmount: number,
        monthlyRate: number,
        n: number,
        base: MortgageCalculationResult,
    ): AmortizationEntry[] {
        const schedule: AmortizationEntry[] = [];
        let remainingBalance = loanAmount;
        let totalPrincipalPaid = 0;
        let totalInterestPaid = 0;

        for (let month = 1; month <= n; month++) {
            const interestPayment = remainingBalance * monthlyRate;
            const principalPayment = base.principalAndInterest - interestPayment;
            remainingBalance = Math.max(0, remainingBalance - principalPayment);

            totalPrincipalPaid += principalPayment;
            totalInterestPaid += interestPayment;

            // Month-by-month PMI drop when current LTV dips below threshold and initial down payment was < 20%
            const currentLTV = (remainingBalance / loanAmount) * PERCENT_TO_DECIMAL;
            const pmiThisMonth = this.calculatePMIForMonth(currentLTV, base.downPaymentPercentage, base.pmi);

            const totalPaymentThisMonth = this.calculateTotalMonthlyPayment(
                base.principalAndInterest,
                base.propertyTax,
                base.homeInsurance,
                pmiThisMonth,
                base.hoa,
            );

            // Calculate percentages of monthly principal and interest payment
            const principalPaidPercent = (principalPayment / base.principalAndInterest) * PERCENT_TO_DECIMAL;
            const interestPaidPercent = (interestPayment / base.principalAndInterest) * PERCENT_TO_DECIMAL;

            schedule.push({
                month,
                principalAndInterest: NumberUtils.roundToTwo(base.principalAndInterest),
                principal: NumberUtils.roundToTwo(principalPayment),
                interest: NumberUtils.roundToTwo(interestPayment),
                propertyTax: base.propertyTax,
                homeInsurance: base.homeInsurance,
                pmi: NumberUtils.roundToTwo(pmiThisMonth),
                hoa: base.hoa,
                totalPayment: NumberUtils.roundToTwo(totalPaymentThisMonth),
                remainingBalance: NumberUtils.roundToTwo(remainingBalance),
                totalPrincipalPaid: NumberUtils.roundToTwo(totalPrincipalPaid),
                totalInterestPaid: NumberUtils.roundToTwo(totalInterestPaid),
                principalPaidPercent: NumberUtils.roundToTwo(principalPaidPercent),
                interestPaidPercent: NumberUtils.roundToTwo(interestPaidPercent)
            });
        }
        return schedule;
    }

    private calculatePMIForMonth(currentLTV: number, downPaymentPercentage: number, basePMI: number): number {
        const requiresPMI = currentLTV > PMI_THRESHOLD_LTV && downPaymentPercentage < MINIMUM_DOWN_PAYMENT_FOR_NO_PMI;
        return requiresPMI ? basePMI : 0;
    }

    // ============================================================================
    // NORMALIZATION
    // ============================================================================
    private normalizeInput(input: FlexibleMortgageInput): MortgageCalculationInput {
        const { propertyPrice } = input;
        return {
            loanAmount: this.calculateNormalizedLoanAmount(input, propertyPrice),
            annualInterestRate: input.annualInterestRate,
            loanTermYears: input.loanTermYears,
            downPayment: this.calculateNormalizedDownPayment(input, propertyPrice),
            propertyPrice,
            propertyTaxAnnual: this.calculateNormalizedPropertyTax(input, propertyPrice),
            homeInsuranceAnnual: this.calculateNormalizedHomeInsurance(input, propertyPrice),
            hoaMonthly: input.hoaMonthly || 0,
            pmiMonthly: input.pmiMonthly || 0,
            autoCalculatePMI: input.autoCalculatePMI ?? true,
        };
    }

    private calculateNormalizedLoanAmount(input: FlexibleMortgageInput, propertyPrice: number): number {
        if (input.loanAmount !== undefined) return input.loanAmount;
        if (input.loanAmountPercent !== undefined)
            return (propertyPrice * input.loanAmountPercent) / PERCENT_TO_DECIMAL;
        return 0;
    }

    private calculateNormalizedDownPayment(input: FlexibleMortgageInput, propertyPrice: number): number {
        if (input.downPayment !== undefined) return input.downPayment;
        if (input.downPaymentPercent !== undefined)
            return (propertyPrice * input.downPaymentPercent) / PERCENT_TO_DECIMAL;
        return 0;
    }

    private calculateNormalizedPropertyTax(input: FlexibleMortgageInput, propertyPrice: number): number {
        if (input.propertyTaxAnnual !== undefined) return input.propertyTaxAnnual;
        if (input.propertyTaxPercent !== undefined)
            return (propertyPrice * input.propertyTaxPercent) / PERCENT_TO_DECIMAL;
        return 0;
    }

    private calculateNormalizedHomeInsurance(input: FlexibleMortgageInput, propertyPrice: number): number {
        if (input.homeInsuranceAnnual !== undefined) return input.homeInsuranceAnnual;
        if (input.homeInsurancePercent !== undefined)
            return (propertyPrice * input.homeInsurancePercent) / PERCENT_TO_DECIMAL;
        return 0;
    }

    // ============================================================================
    // UTILS
    // ============================================================================
    private createPaymentBreakdown(
        principalAndInterest: number,
        propertyTax: number,
        homeInsurance: number,
        pmi: number,
        hoa: number,
        total: number,
    ): PaymentBreakdown {
        return {
            principalAndInterest: NumberUtils.roundToTwo(principalAndInterest),
            propertyTax: NumberUtils.roundToTwo(propertyTax),
            homeInsurance: NumberUtils.roundToTwo(homeInsurance),
            pmi: NumberUtils.roundToTwo(pmi),
            hoa: NumberUtils.roundToTwo(hoa),
            total: NumberUtils.roundToTwo(total),
        };
    }

    private calculateMonthlyRate(annualRate: number): number {
        return annualRate / PERCENT_TO_DECIMAL / MONTHS_PER_YEAR;
    }

    private calculateTotalPayments(loanTermYears: number): number {
        return loanTermYears * MONTHS_PER_YEAR;
    }

    private calculateMortgagePaymentRate(monthlyRate: number, n: number): number {
        if (monthlyRate === 0) return 1 / n;
        const factor = Math.pow(1 + monthlyRate, n);
        return (monthlyRate * factor) / (factor - 1);
    }

    private shouldCalculatePMI(downPaymentPercentage: number): boolean {
        return downPaymentPercentage < MINIMUM_DOWN_PAYMENT_FOR_NO_PMI && downPaymentPercentage > 0;
    }
}
