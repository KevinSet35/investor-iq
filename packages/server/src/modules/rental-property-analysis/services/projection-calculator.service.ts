import { Injectable } from '@nestjs/common';
import { NumberUtils } from '../../../common/utility/number.utils';
import { RentalPropertyInput, ProjectedReturns, YearlyProjection, ExitAnalysis, BreakEvenAnalysis, SensitivityAnalysis, SensitivityResult, RentalPropertyResult } from '../rental-property-analysis.interfaces';
import {
    MONTHS_PER_YEAR,
    PERCENT_TO_DECIMAL,
    DEFAULT_VACANCY_RATE,
    DEFAULT_APPRECIATION_RATE,
    DEFAULT_RENT_GROWTH_RATE,
    DEFAULT_EXPENSE_GROWTH_RATE
} from '../rental-property-analysis.constants';
import { MortgageCalculationResult } from '@/modules/mortgage-calculation/mortgage-calculation.interfaces';

@Injectable()
export class ProjectionCalculator {
    calculateProjectedReturns(
        input: RentalPropertyInput,
        initialResult: RentalPropertyResult,
        analyzeRentalPropertyFn: (input: RentalPropertyInput) => RentalPropertyResult
    ): ProjectedReturns {
        const year1 = this.projectReturns(input, initialResult, 1);
        const year5 = this.projectReturns(input, initialResult, 5);
        const year10 = this.projectReturns(input, initialResult, 10);

        let exitAnalysis: ExitAnalysis | undefined;
        if (input.holdingPeriodYears) {
            const projection = this.projectReturns(input, initialResult, input.holdingPeriodYears);
            const sellingCosts = projection.propertyValue * 0.08;
            const netProceeds = projection.propertyValue - sellingCosts - projection.loanBalance;
            const totalCashFlow = projection.cumulativeCashFlow;
            const totalReturn = netProceeds + totalCashFlow - initialResult.downPaymentAmount;
            const annualizedReturn =
                Math.pow((totalReturn + initialResult.downPaymentAmount) / initialResult.downPaymentAmount, 1 / input.holdingPeriodYears) - 1;

            exitAnalysis = {
                salePrice: NumberUtils.roundToTwo(projection.propertyValue),
                sellingCosts: NumberUtils.roundToTwo(sellingCosts),
                loanPayoff: NumberUtils.roundToTwo(projection.loanBalance),
                netProceeds: NumberUtils.roundToTwo(netProceeds),
                totalCashFlow: NumberUtils.roundToTwo(totalCashFlow),
                totalReturn: NumberUtils.roundToTwo(totalReturn),
                annualizedReturn: NumberUtils.roundToTwo(annualizedReturn * PERCENT_TO_DECIMAL),
            };
        }

        const base: ProjectedReturns = {
            year1
        };

        if (year5 !== undefined) {
            base.year5 = year5;
        }
        if (year10 !== undefined) {
            base.year10 = year10;
        }
        if (exitAnalysis !== undefined) {
            base.exitAnalysis = exitAnalysis;
        }

        return base;
    }

    calculateBreakEvenAnalysis(
        input: RentalPropertyInput,
        baseResult: RentalPropertyResult,
        mortgageResult: MortgageCalculationResult
    ): BreakEvenAnalysis {
        const monthlyDebtService = mortgageResult.principalAndInterest + mortgageResult.pmi + mortgageResult.hoa;
        const totalMonthlyExpenses = baseResult.operatingExpenses.totalMonthly + monthlyDebtService;
        const breakEvenOccupancyRate = (totalMonthlyExpenses / input.monthlyRent) * PERCENT_TO_DECIMAL;
        const breakEvenRent =
            totalMonthlyExpenses / (1 - (input.expenses.vacancyRate ?? DEFAULT_VACANCY_RATE) / PERCENT_TO_DECIMAL);

        let monthsToPositiveCashFlow = 0;
        if (baseResult.cashFlow.cashFlowMonthly < 0) {
            const initialInvestment = mortgageResult.downPaymentAmount + (input.closingCosts ?? 0) + (input.rehabCosts ?? 0);
            monthsToPositiveCashFlow = Math.ceil(initialInvestment / Math.abs(baseResult.cashFlow.cashFlowMonthly));
        }

        return {
            breakEvenOccupancyRate: NumberUtils.roundToTwo(breakEvenOccupancyRate),
            breakEvenRent: NumberUtils.roundToTwo(breakEvenRent),
            monthsToPositiveCashFlow,
            cashFlowBreakEvenPoint: NumberUtils.roundToTwo(totalMonthlyExpenses),
        };
    }

    performSensitivityAnalysis(
        input: RentalPropertyInput,
        baseResult: RentalPropertyResult,
        analyzeRentalPropertyFn: (input: RentalPropertyInput) => RentalPropertyResult
    ): SensitivityAnalysis {
        const scenarios = [-10, -5, 0, 5, 10];
        const vacancyImpact = this.calculateVacancyScenarios(input, scenarios, analyzeRentalPropertyFn);
        const rentChangeImpact = this.calculateRentScenarios(input, scenarios, analyzeRentalPropertyFn);
        const interestRateImpact = this.calculateInterestRateScenarios(input, scenarios, analyzeRentalPropertyFn);
        const expenseChangeImpact = this.calculateExpenseScenarios(input, scenarios, analyzeRentalPropertyFn);
        return { vacancyImpact, rentChangeImpact, interestRateImpact, expenseChangeImpact };
    }

    private projectReturns(input: RentalPropertyInput, initialResult: RentalPropertyResult, years: number): YearlyProjection {
        const appreciationRate = (input.appreciationRate ?? DEFAULT_APPRECIATION_RATE) / PERCENT_TO_DECIMAL;
        const rentGrowthRate = (input.rentGrowthRate ?? DEFAULT_RENT_GROWTH_RATE) / PERCENT_TO_DECIMAL;
        const expenseGrowthRate = (input.expenseGrowthRate ?? DEFAULT_EXPENSE_GROWTH_RATE) / PERCENT_TO_DECIMAL;

        const propertyValue = input.propertyPrice * Math.pow(1 + appreciationRate, years);
        const monthlyRent = input.monthlyRent * Math.pow(1 + rentGrowthRate, years);
        const monthlyExpenses = initialResult.operatingExpenses.totalMonthly * Math.pow(1 + expenseGrowthRate, years);

        const monthsElapsed = years * MONTHS_PER_YEAR;
        const monthlyRate = input.annualInterestRate / PERCENT_TO_DECIMAL / MONTHS_PER_YEAR;
        const totalPayments = input.loanTermYears * MONTHS_PER_YEAR;

        let remainingBalance = initialResult.loanAmount;
        for (let i = 0; i < monthsElapsed && i < totalPayments; i++) {
            const interestPayment = remainingBalance * monthlyRate;
            const principalPayment = initialResult.principalAndInterest - interestPayment;
            remainingBalance = Math.max(0, remainingBalance - principalPayment);
        }

        const equity = propertyValue - remainingBalance;
        const annualCashFlow = (monthlyRent - monthlyExpenses - initialResult.principalAndInterest) * MONTHS_PER_YEAR;
        const cumulativeCashFlow = annualCashFlow * years;
        const totalReturn = equity + cumulativeCashFlow - initialResult.downPaymentAmount;

        return {
            year: years,
            monthlyRent: NumberUtils.roundToTwo(monthlyRent),
            annualCashFlow: NumberUtils.roundToTwo(annualCashFlow),
            propertyValue: NumberUtils.roundToTwo(propertyValue),
            loanBalance: NumberUtils.roundToTwo(remainingBalance),
            equity: NumberUtils.roundToTwo(equity),
            cumulativeCashFlow: NumberUtils.roundToTwo(cumulativeCashFlow),
            totalReturn: NumberUtils.roundToTwo(totalReturn),
        };
    }

    private calculateVacancyScenarios(
        input: RentalPropertyInput,
        scenarios: number[],
        analyzeRentalPropertyFn: (input: RentalPropertyInput) => RentalPropertyResult
    ): SensitivityResult[] {
        return scenarios.map(change => {
            const adjustedInput: RentalPropertyInput = {
                ...input,
                expenses: {
                    ...input.expenses,
                    vacancyRate: (input.expenses.vacancyRate ?? DEFAULT_VACANCY_RATE) + change,
                },
            };
            const result = analyzeRentalPropertyFn(adjustedInput);
            return { change, cashFlow: result.cashFlow.cashFlowMonthly, capRate: result.metrics.capRate, cashOnCash: result.metrics.cashOnCashReturn };
        });
    }

    private calculateRentScenarios(
        input: RentalPropertyInput,
        scenarios: number[],
        analyzeRentalPropertyFn: (input: RentalPropertyInput) => RentalPropertyResult
    ): SensitivityResult[] {
        return scenarios.map(change => {
            const adjustedInput: RentalPropertyInput = { ...input, monthlyRent: input.monthlyRent * (1 + change / PERCENT_TO_DECIMAL) };
            const result = analyzeRentalPropertyFn(adjustedInput);
            return { change, cashFlow: result.cashFlow.cashFlowMonthly, capRate: result.metrics.capRate, cashOnCash: result.metrics.cashOnCashReturn };
        });
    }

    private calculateInterestRateScenarios(
        input: RentalPropertyInput,
        scenarios: number[],
        analyzeRentalPropertyFn: (input: RentalPropertyInput) => RentalPropertyResult
    ): SensitivityResult[] {
        return scenarios.map(change => {
            const baseRate = input.annualInterestRate;
            const adjustedInput: RentalPropertyInput = { ...input, annualInterestRate: baseRate * (1 + change / PERCENT_TO_DECIMAL) };
            const result = analyzeRentalPropertyFn(adjustedInput);
            return { change, cashFlow: result.cashFlow.cashFlowMonthly, capRate: result.metrics.capRate, cashOnCash: result.metrics.cashOnCashReturn };
        });
    }

    private calculateExpenseScenarios(
        input: RentalPropertyInput,
        scenarios: number[],
        analyzeRentalPropertyFn: (input: RentalPropertyInput) => RentalPropertyResult
    ): SensitivityResult[] {
        return scenarios.map(change => {
            const multiplier = 1 + change / PERCENT_TO_DECIMAL;
            const adjustedInput: RentalPropertyInput = {
                ...input,
                expenses: {
                    ...input.expenses,
                    maintenancePercentOfRent: (input.expenses.maintenancePercentOfRent ?? 5) * multiplier,
                    capexPercentOfRent: (input.expenses.capexPercentOfRent ?? 5) * multiplier,
                },
            };
            const result = analyzeRentalPropertyFn(adjustedInput);
            return { change, cashFlow: result.cashFlow.cashFlowMonthly, capRate: result.metrics.capRate, cashOnCash: result.metrics.cashOnCashReturn };
        });
    }
}
