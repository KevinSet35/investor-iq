import { Injectable } from '@nestjs/common';
import { NumberUtils } from '../../../common/utility/number.utils';
import {
    RentalPropertyInput,
    CashFlow,
    Metrics,
    EnhancedMetrics,
    OperatingExpenses,
    InvestmentSummary,
} from '../rental-property-analysis.interfaces';
import {
    MONTHS_PER_YEAR,
    PERCENT_TO_DECIMAL,
    MINIMUM_LTV_FOR_DSCR,
    DEFAULT_VACANCY_RATE,
    DEFAULT_APPRECIATION_RATE,
    DEFAULT_DEPRECIATION_YEARS,
} from '../rental-property-analysis.constants';
import { MortgageCalculationResult } from '@/modules/mortgage-calculation/mortgage-calculation.interfaces';

@Injectable()
export class MetricsCalculator {
    calculateCashFlow(
        monthlyRent: number,
        effectiveMonthlyRent: number,
        totalExpenses: number,
        mortgageResult: MortgageCalculationResult,
    ): CashFlow {
        const grossRent = monthlyRent;
        const effectiveRent = effectiveMonthlyRent;

        const netOperatingIncome = effectiveRent - totalExpenses;
        const monthlyDebtService = this.calculateMonthlyDebtService(mortgageResult);
        const cashFlowMonthly = netOperatingIncome - monthlyDebtService;
        const cashFlowAnnual = cashFlowMonthly * MONTHS_PER_YEAR;

        return {
            grossRent: NumberUtils.roundToTwo(grossRent),
            effectiveRent: NumberUtils.roundToTwo(effectiveRent),
            totalExpenses: NumberUtils.roundToTwo(totalExpenses),
            netOperatingIncome: NumberUtils.roundToTwo(netOperatingIncome),
            cashFlowMonthly: NumberUtils.roundToTwo(cashFlowMonthly),
            cashFlowAnnual: NumberUtils.roundToTwo(cashFlowAnnual),
        };
    }

    calculateInvestmentMetrics(
        monthlyRent: number,
        propertyPrice: number,
        cashFlow: CashFlow,
        monthlyOperatingExpenses: number,
        mortgageResult: MortgageCalculationResult,
    ): Metrics {
        const annualRent = monthlyRent * MONTHS_PER_YEAR;
        const annualNOI = cashFlow.netOperatingIncome * MONTHS_PER_YEAR;
        const monthlyDebtService = this.calculateMonthlyDebtService(mortgageResult);
        const annualDebtService = monthlyDebtService * MONTHS_PER_YEAR;
        const cashInvested = mortgageResult.downPaymentAmount;

        const capRate = this.calculateCapRate(annualNOI, propertyPrice);
        const cashOnCashReturn = this.calculateCashOnCashReturn(cashFlow.cashFlowAnnual, cashInvested);
        const grossRentMultiplier = this.calculateGrossRentMultiplier(propertyPrice, annualRent);
        const debtCoverageRatio = this.calculateDebtCoverageRatio(annualNOI, annualDebtService);
        const operatingExpenseRatio = this.calculateOperatingExpenseRatio(monthlyOperatingExpenses, annualRent);
        const breakEvenOccupancy = this.calculateBreakEvenOccupancy(
            monthlyOperatingExpenses,
            mortgageResult,
            annualRent,
        );

        return {
            capRate: NumberUtils.roundToTwo(capRate),
            cashOnCashReturn: NumberUtils.roundToTwo(cashOnCashReturn),
            grossRentMultiplier: NumberUtils.roundToTwo(grossRentMultiplier),
            debtCoverageRatio: NumberUtils.roundToTwo(debtCoverageRatio),
            operatingExpenseRatio: NumberUtils.roundToTwo(operatingExpenseRatio),
            breakEvenOccupancy: NumberUtils.roundToTwo(breakEvenOccupancy),
        };
    }

    calculateEnhancedMetrics(
        input: RentalPropertyInput,
        baseMetrics: Metrics,
        cashFlow: CashFlow,
        operatingExpenses: OperatingExpenses,
        mortgageResult: MortgageCalculationResult,
    ): EnhancedMetrics {
        const annualRent = input.monthlyRent * MONTHS_PER_YEAR;
        const annualNOI = cashFlow.netOperatingIncome * MONTHS_PER_YEAR;
        const annualDebtService = mortgageResult.principalAndInterest * MONTHS_PER_YEAR;
        const totalCashInvested =
            mortgageResult.downPaymentAmount + (input.closingCosts ?? 0) + (input.rehabCosts ?? 0);

        const landValue = input.landValue ?? input.propertyPrice * 0.2;
        const annualDepreciation = this.calculateAnnualDepreciation(
            input.propertyPrice,
            landValue,
            input.depreciationYears,
        );

        const taxShelterValue = input.marginalTaxRate
            ? this.calculateTaxShelterValue(annualDepreciation, input.marginalTaxRate)
            : undefined;

        const equityBuildupYear1 = this.calculateEquityBuildupYear1(
            mortgageResult.principalAndInterest,
            input.annualInterestRate,
            mortgageResult.loanAmount,
        );

        const appreciationRate = (input.appreciationRate ?? DEFAULT_APPRECIATION_RATE) / PERCENT_TO_DECIMAL;
        const appreciationYear1 = input.propertyPrice * appreciationRate;

        const totalEquityYear1 = mortgageResult.downPaymentAmount + equityBuildupYear1 + appreciationYear1;

        const returnOnEquity = this.calculateReturnOnEquity(
            cashFlow.cashFlowAnnual,
            appreciationYear1,
            equityBuildupYear1,
            totalEquityYear1,
        );

        const totalROI = this.calculateTotalROI(
            cashFlow.cashFlowAnnual,
            appreciationYear1,
            equityBuildupYear1,
            taxShelterValue ?? 0,
            totalCashInvested,
        );

        let afterTaxCashFlow: number | undefined;
        if (input.marginalTaxRate) {
            const taxableIncome = annualNOI - annualDebtService - annualDepreciation;
            afterTaxCashFlow = this.calculateAfterTaxCashFlow(
                cashFlow.cashFlowAnnual,
                taxableIncome,
                input.marginalTaxRate,
            );
        }

        const base: EnhancedMetrics = {
            ...baseMetrics,
            totalReturnOnInvestment: NumberUtils.roundToTwo(totalROI),
            rentToValueRatio: NumberUtils.roundToTwo(
                this.calculateRentToValueRatio(input.monthlyRent, input.propertyPrice),
            ),
            expenseToIncomeRatio: NumberUtils.roundToTwo(
                this.calculateExpenseToIncomeRatio(operatingExpenses.totalMonthly, input.monthlyRent),
            ),
            onePercentRule: this.calculateOnePercentRule(input.monthlyRent, input.propertyPrice),
            twoPercentRule: this.calculateTwoPercentRule(input.monthlyRent, input.propertyPrice),
            fiftyPercentRule: NumberUtils.roundToTwo(this.calculateFiftyPercentRule(input.monthlyRent)),
            cashFlowPerUnit: NumberUtils.roundToTwo(cashFlow.cashFlowMonthly),
            cashFlowPerDoor: NumberUtils.roundToTwo(cashFlow.cashFlowMonthly),
            annualizedReturn: NumberUtils.roundToTwo(
                (cashFlow.cashFlowAnnual / Math.max(totalCashInvested, 1e-9)) * PERCENT_TO_DECIMAL,
            ),
            loanConstant: NumberUtils.roundToTwo(
                this.calculateLoanConstant(annualDebtService, Math.max(mortgageResult.loanAmount, 1e-9)),
            ),
            debtYieldRatio: NumberUtils.roundToTwo(
                this.calculateDebtYield(annualNOI, Math.max(mortgageResult.loanAmount, 1e-9)),
            ),
            breakEvenRatio: NumberUtils.roundToTwo(
                this.calculateBreakEvenRatio(
                    operatingExpenses.totalMonthly * MONTHS_PER_YEAR,
                    annualDebtService,
                    annualRent,
                ),
            ),
        };

        if (annualDepreciation !== undefined) {
            base.annualDepreciation = NumberUtils.roundToTwo(annualDepreciation);
        }
        if (taxShelterValue !== undefined) {
            base.taxShelterValue = NumberUtils.roundToTwo(taxShelterValue);
        }
        if (afterTaxCashFlow !== undefined) {
            base.afterTaxCashFlow = NumberUtils.roundToTwo(afterTaxCashFlow);
        }
        if (equityBuildupYear1 !== undefined) {
            base.equityBuildupYear1 = NumberUtils.roundToTwo(equityBuildupYear1);
        }
        if (totalEquityYear1 !== undefined) {
            base.totalEquityYear1 = NumberUtils.roundToTwo(totalEquityYear1);
        }
        if (returnOnEquity !== undefined) {
            base.returnOnEquity = NumberUtils.roundToTwo(returnOnEquity);
        }
        if (appreciationYear1 !== undefined) {
            base.appreciationYear1 = NumberUtils.roundToTwo(appreciationYear1);
        }
        const vacancySensativity = NumberUtils.roundToTwo(
            this.calculateVacancySensitivity(input.monthlyRent, input.expenses.vacancyRate ?? DEFAULT_VACANCY_RATE),
        );
        if (vacancySensativity !== undefined) {
            base.vacancySensitivity = vacancySensativity;
        }
        const maintenanceReserveRatio = NumberUtils.roundToTwo(
            this.calculateMaintenanceReserveRatio(
                operatingExpenses.maintenance,
                operatingExpenses.capex,
                input.monthlyRent,
            ),
        );
        if (maintenanceReserveRatio !== undefined) {
            base.maintenanceReserveRatio = maintenanceReserveRatio;
        }

        return base;
    }

    calculateInvestmentSummary(
        input: RentalPropertyInput,
        cashFlow: CashFlow,
        totalROI: number,
        mortgageResult: MortgageCalculationResult,
    ): InvestmentSummary {
        const totalCashNeeded = mortgageResult.downPaymentAmount + (input.closingCosts ?? 0) + (input.rehabCosts ?? 0);
        const allInCost = input.propertyPrice + (input.closingCosts ?? 0) + (input.rehabCosts ?? 0);
        const paybackPeriod = this.calculatePaybackPeriod(totalCashNeeded, cashFlow.cashFlowAnnual);

        return {
            totalCashNeeded: NumberUtils.roundToTwo(totalCashNeeded),
            allInCost: NumberUtils.roundToTwo(allInCost),
            monthlyGrossIncome: NumberUtils.roundToTwo(input.monthlyRent),
            monthlyNetIncome: NumberUtils.roundToTwo(cashFlow.cashFlowMonthly),
            annualNetIncome: NumberUtils.roundToTwo(cashFlow.cashFlowAnnual),
            totalROI: totalROI,
            paybackPeriod: NumberUtils.roundToTwo(paybackPeriod),
        };
    }

    private calculateMonthlyDebtService(mortgageResult: MortgageCalculationResult): number {
        return mortgageResult.principalAndInterest + mortgageResult.pmi + mortgageResult.hoa;
    }

    private calculateCapRate(annualNOI: number, propertyPrice: number): number {
        if (propertyPrice === 0) return 0;
        return (annualNOI / propertyPrice) * PERCENT_TO_DECIMAL;
    }

    private calculateCashOnCashReturn(annualCashFlow: number, cashInvested: number): number {
        if (cashInvested <= 0) return 0;
        return (annualCashFlow / cashInvested) * PERCENT_TO_DECIMAL;
    }

    private calculateGrossRentMultiplier(propertyPrice: number, annualRent: number): number {
        if (annualRent === 0) return 0;
        return propertyPrice / annualRent;
    }

    private calculateDebtCoverageRatio(annualNOI: number, annualDebtService: number): number {
        if (annualDebtService < MINIMUM_LTV_FOR_DSCR) return 0;
        return annualNOI / annualDebtService;
    }

    private calculateOperatingExpenseRatio(monthlyOperatingExpenses: number, annualRent: number): number {
        if (annualRent === 0) return 0;
        return ((monthlyOperatingExpenses * MONTHS_PER_YEAR) / annualRent) * PERCENT_TO_DECIMAL;
    }

    private calculateBreakEvenOccupancy(
        monthlyOperatingExpenses: number,
        mortgageResult: MortgageCalculationResult,
        annualRent: number,
    ): number {
        if (annualRent === 0) return 0;
        const monthlyDebtService = this.calculateMonthlyDebtService(mortgageResult);
        const totalAnnualExpenses = (monthlyOperatingExpenses + monthlyDebtService) * MONTHS_PER_YEAR;
        return (totalAnnualExpenses / annualRent) * PERCENT_TO_DECIMAL;
    }

    private calculateOnePercentRule(monthlyRent: number, propertyPrice: number): boolean {
        return monthlyRent >= propertyPrice * 0.01;
    }

    private calculateTwoPercentRule(monthlyRent: number, propertyPrice: number): boolean {
        return monthlyRent >= propertyPrice * 0.02;
    }

    private calculateFiftyPercentRule(monthlyRent: number): number {
        return monthlyRent * 0.5;
    }

    private calculateRentToValueRatio(monthlyRent: number, propertyPrice: number): number {
        if (propertyPrice === 0) return 0;
        return (monthlyRent / propertyPrice) * PERCENT_TO_DECIMAL;
    }

    private calculateExpenseToIncomeRatio(totalExpenses: number, grossRent: number): number {
        if (grossRent === 0) return 0;
        return (totalExpenses / grossRent) * PERCENT_TO_DECIMAL;
    }

    private calculateLoanConstant(annualDebtService: number, loanAmount: number): number {
        if (loanAmount === 0) return 0;
        return (annualDebtService / loanAmount) * PERCENT_TO_DECIMAL;
    }

    private calculateDebtYield(annualNOI: number, loanAmount: number): number {
        if (loanAmount === 0) return 0;
        return (annualNOI / loanAmount) * PERCENT_TO_DECIMAL;
    }

    private calculateBreakEvenRatio(operatingExpenses: number, debtService: number, grossIncome: number): number {
        if (grossIncome === 0) return 0;
        return ((operatingExpenses + debtService) / grossIncome) * PERCENT_TO_DECIMAL;
    }

    private calculateAnnualDepreciation(
        propertyPrice: number,
        landValue: number = 0,
        depreciationYears: number = DEFAULT_DEPRECIATION_YEARS,
    ): number {
        const depreciableBasis = propertyPrice - landValue;
        if (depreciableBasis <= 0 || depreciationYears === 0) return 0;
        return depreciableBasis / depreciationYears;
    }

    private calculateTaxShelterValue(annualDepreciation: number, marginalTaxRate: number): number {
        return annualDepreciation * (marginalTaxRate / PERCENT_TO_DECIMAL);
    }

    private calculateAfterTaxCashFlow(preTaxCashFlow: number, taxableIncome: number, marginalTaxRate: number): number {
        const taxesDue = taxableIncome * (marginalTaxRate / PERCENT_TO_DECIMAL);
        return preTaxCashFlow - taxesDue;
    }

    private calculateEquityBuildupYear1(
        monthlyPrincipalAndInterest: number,
        annualInterestRate: number,
        loanAmount: number,
    ): number {
        let totalPrincipalPaid = 0;
        let remainingBalance = loanAmount;
        const monthlyRate = annualInterestRate / PERCENT_TO_DECIMAL / MONTHS_PER_YEAR;

        for (let month = 1; month <= MONTHS_PER_YEAR; month++) {
            const interestPayment = remainingBalance * monthlyRate;
            const principalPayment = monthlyPrincipalAndInterest - interestPayment;
            totalPrincipalPaid += principalPayment;
            remainingBalance -= principalPayment;
        }
        return totalPrincipalPaid;
    }

    private calculateReturnOnEquity(
        annualCashFlow: number,
        appreciation: number,
        equityBuilddup: number,
        currentEquity: number,
    ): number {
        if (currentEquity <= 0) return 0;
        const totalReturn = annualCashFlow + appreciation + equityBuilddup;
        return (totalReturn / currentEquity) * PERCENT_TO_DECIMAL;
    }

    private calculateTotalROI(
        annualCashFlow: number,
        appreciation: number,
        equityBuilddup: number,
        taxBenefits: number,
        totalCashInvested: number,
    ): number {
        if (totalCashInvested <= 0) return 0;
        const totalReturn = annualCashFlow + appreciation + equityBuilddup + taxBenefits;
        return (totalReturn / totalCashInvested) * PERCENT_TO_DECIMAL;
    }

    private calculatePaybackPeriod(totalCashInvested: number, annualCashFlow: number): number {
        if (annualCashFlow <= 0) return Infinity;
        return totalCashInvested / annualCashFlow;
    }

    private calculateVacancySensitivity(monthlyRent: number, _currentVacancyRate: number): number {
        // Approx: cash flow change per 1% vacancy change (annualized)
        const annualRent = monthlyRent * MONTHS_PER_YEAR;
        return annualRent * 0.01;
    }

    private calculateMaintenanceReserveRatio(
        maintenanceExpense: number,
        capexExpense: number,
        grossRent: number,
    ): number {
        if (grossRent === 0) return 0;
        const totalReserves = (maintenanceExpense + capexExpense) * MONTHS_PER_YEAR;
        const annualRent = grossRent * MONTHS_PER_YEAR;
        return (totalReserves / annualRent) * PERCENT_TO_DECIMAL;
    }
}
