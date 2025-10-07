import { Injectable } from '@nestjs/common';
import { NumberUtils } from '../../common/utility/number.utils';
import {
    MortgageCalculationService,
    FlexibleMortgageInput,
    MortgageCalculationResult
} from '../mortgage-calculation/mortgage-calculation.service';

// ============================================================================
// CONSTANTS
// ============================================================================

const MONTHS_PER_YEAR = 12;
const PERCENT_TO_DECIMAL = 100;
const DEFAULT_VACANCY_RATE = 8; // 8%
const MINIMUM_LTV_FOR_DSCR = 0.01; // Avoid division by zero

// ============================================================================
// INTERFACES
// ============================================================================

export interface RentalPropertyExpenses {
    vacancyRate?: number;
    propertyManagementPercent?: number;
    propertyManagementFlat?: number;
    maintenanceAnnual?: number;
    maintenancePercentOfRent?: number;
    maintenancePercentOfValue?: number;
    capexAnnual?: number;
    capexPercentOfRent?: number;
    capexPercentOfValue?: number;
    utilitiesMonthly?: number;
    landscapingMonthly?: number;
    pestControlMonthly?: number;
    legalFeesAnnual?: number;
    landlordInsuranceAnnual?: number;
    specialAssessmentsAnnual?: number;
    advertisingAnnual?: number;
    turnoverCostPerYear?: number;
}

export interface RentalPropertyInput extends FlexibleMortgageInput {
    monthlyRent: number;
    expenses: RentalPropertyExpenses;
}

export interface CashFlow {
    grossRent: number;
    effectiveRent: number;
    totalExpenses: number;
    netOperatingIncome: number;
    cashFlowMonthly: number;
    cashFlowAnnual: number;
}

export interface Metrics {
    capRate: number;
    cashOnCashReturn: number;
    grossRentMultiplier: number;
    debtCoverageRatio: number;
    operatingExpenseRatio: number;
    breakEvenOccupancy: number;
}

export interface OperatingExpenses {
    vacancy: number;
    propertyManagement: number;
    maintenance: number;
    capex: number;
    utilities: number;
    landscaping: number;
    pestControl: number;
    legalFees: number;
    landlordInsurance: number;
    specialAssessments: number;
    advertising: number;
    turnover: number;
    totalMonthly: number;
}

export interface RentalPropertyResult extends MortgageCalculationResult {
    monthlyRent: number;
    effectiveMonthlyRent: number;
    operatingExpenses: OperatingExpenses;
    cashFlow: CashFlow;
    metrics: Metrics;
}

// ============================================================================
// SERVICE
// ============================================================================

@Injectable()
export class RentalPropertyAnalysisService {
    constructor(private readonly mortgageService: MortgageCalculationService) { }

    /**
     * Calculate comprehensive rental property analysis including all expenses and metrics
     */
    analyzeRentalProperty(input: RentalPropertyInput): RentalPropertyResult {
        this.validateRentalInput(input);

        const mortgageResult = this.mortgageService.calculateMortgageFlexible(input);
        return this.buildRentalPropertyResult(input, mortgageResult);
    }

    /**
     * Calculate rental property analysis with amortization schedule
     */
    analyzeRentalPropertyWithSchedule(input: RentalPropertyInput): RentalPropertyResult {
        this.validateRentalInput(input);

        const mortgageResult = this.mortgageService.calculateMortgageWithScheduleFlexible(input);
        return this.buildRentalPropertyResult(input, mortgageResult);
    }

    // ============================================================================
    // PRIVATE VALIDATION METHODS
    // ============================================================================

    private validateRentalInput(input: RentalPropertyInput): void {
        if (!input.monthlyRent || input.monthlyRent <= 0) {
            throw new Error('monthlyRent is required and must be greater than 0');
        }

        if (!input.expenses) {
            throw new Error('expenses object is required');
        }

        this.validateExpensePercentages(input.expenses);
    }

    private validateExpensePercentages(expenses: RentalPropertyExpenses): void {
        const percentageFields = [
            { name: 'vacancyRate', value: expenses.vacancyRate },
            { name: 'propertyManagementPercent', value: expenses.propertyManagementPercent },
            { name: 'maintenancePercentOfRent', value: expenses.maintenancePercentOfRent },
            { name: 'maintenancePercentOfValue', value: expenses.maintenancePercentOfValue },
            { name: 'capexPercentOfRent', value: expenses.capexPercentOfRent },
            { name: 'capexPercentOfValue', value: expenses.capexPercentOfValue },
        ];

        const errors = percentageFields
            .filter(field => field.value !== undefined && field.value < 0)
            .map(field => `${field.name} must be non-negative`);

        if (errors.length > 0) {
            throw new Error(`Invalid expense percentages: ${errors.join(', ')}`);
        }
    }

    // ============================================================================
    // PRIVATE BUILD METHODS
    // ============================================================================

    private buildRentalPropertyResult(
        input: RentalPropertyInput,
        mortgageResult: MortgageCalculationResult,
    ): RentalPropertyResult {
        const { monthlyRent, expenses, propertyPrice } = input;

        const effectiveMonthlyRent = this.calculateEffectiveRent(monthlyRent, expenses);
        const operatingExpenses = this.calculateOperatingExpenses(
            monthlyRent,
            propertyPrice,
            expenses,
            mortgageResult,
        );
        const cashFlow = this.calculateCashFlow(
            monthlyRent,
            effectiveMonthlyRent,
            operatingExpenses.totalMonthly,
            mortgageResult,
        );
        const metrics = this.calculateInvestmentMetrics(
            monthlyRent,
            propertyPrice,
            cashFlow,
            operatingExpenses.totalMonthly,
            mortgageResult,
        );

        return {
            ...mortgageResult,
            monthlyRent,
            effectiveMonthlyRent: NumberUtils.roundToTwo(effectiveMonthlyRent),
            operatingExpenses,
            cashFlow,
            metrics,
        };
    }

    // ============================================================================
    // EFFECTIVE RENT CALCULATION
    // ============================================================================

    private calculateEffectiveRent(
        monthlyRent: number,
        expenses: RentalPropertyExpenses,
    ): number {
        const vacancyRate = expenses.vacancyRate ?? DEFAULT_VACANCY_RATE;
        const vacancyLoss = this.calculateVacancyLoss(monthlyRent, vacancyRate);
        return monthlyRent - vacancyLoss;
    }

    private calculateVacancyLoss(monthlyRent: number, vacancyRate: number): number {
        return (monthlyRent * vacancyRate) / PERCENT_TO_DECIMAL;
    }

    // ============================================================================
    // OPERATING EXPENSES CALCULATION
    // ============================================================================

    private calculateOperatingExpenses(
        monthlyRent: number,
        propertyPrice: number,
        expenses: RentalPropertyExpenses,
        mortgageResult: MortgageCalculationResult,
    ): OperatingExpenses {
        const vacancyRate = expenses.vacancyRate ?? DEFAULT_VACANCY_RATE;
        const vacancyLoss = this.calculateVacancyLoss(monthlyRent, vacancyRate);

        const propertyManagement = this.calculatePropertyManagement(monthlyRent, expenses);
        const maintenance = this.calculateMaintenance(monthlyRent, propertyPrice, expenses);
        const capex = this.calculateCapex(monthlyRent, propertyPrice, expenses);

        const monthlyUtilities = expenses.utilitiesMonthly ?? 0;
        const monthlyLandscaping = expenses.landscapingMonthly ?? 0;
        const monthlyPestControl = expenses.pestControlMonthly ?? 0;
        const monthlyLegalFees = this.annualToMonthly(expenses.legalFeesAnnual);
        const monthlyLandlordInsurance = this.annualToMonthly(expenses.landlordInsuranceAnnual);
        const monthlySpecialAssessments = this.annualToMonthly(expenses.specialAssessmentsAnnual);
        const monthlyAdvertising = this.annualToMonthly(expenses.advertisingAnnual);
        const monthlyTurnover = this.annualToMonthly(expenses.turnoverCostPerYear);

        const totalOperatingExpenses = this.sumOperatingExpenses(
            propertyManagement,
            maintenance,
            capex,
            monthlyUtilities,
            monthlyLandscaping,
            monthlyPestControl,
            monthlyLegalFees,
            monthlyLandlordInsurance,
            monthlySpecialAssessments,
            monthlyAdvertising,
            monthlyTurnover,
            mortgageResult.propertyTax,
            mortgageResult.homeInsurance,
        );

        return {
            vacancy: NumberUtils.roundToTwo(vacancyLoss),
            propertyManagement: NumberUtils.roundToTwo(propertyManagement),
            maintenance: NumberUtils.roundToTwo(maintenance),
            capex: NumberUtils.roundToTwo(capex),
            utilities: NumberUtils.roundToTwo(monthlyUtilities),
            landscaping: NumberUtils.roundToTwo(monthlyLandscaping),
            pestControl: NumberUtils.roundToTwo(monthlyPestControl),
            legalFees: NumberUtils.roundToTwo(monthlyLegalFees),
            landlordInsurance: NumberUtils.roundToTwo(monthlyLandlordInsurance),
            specialAssessments: NumberUtils.roundToTwo(monthlySpecialAssessments),
            advertising: NumberUtils.roundToTwo(monthlyAdvertising),
            turnover: NumberUtils.roundToTwo(monthlyTurnover),
            totalMonthly: NumberUtils.roundToTwo(totalOperatingExpenses),
        };
    }

    private sumOperatingExpenses(...expenses: number[]): number {
        return expenses.reduce((sum, expense) => sum + expense, 0);
    }

    private calculatePropertyManagement(
        monthlyRent: number,
        expenses: RentalPropertyExpenses,
    ): number {
        if (expenses.propertyManagementPercent !== undefined) {
            return (monthlyRent * expenses.propertyManagementPercent) / PERCENT_TO_DECIMAL;
        }
        if (expenses.propertyManagementFlat !== undefined) {
            return expenses.propertyManagementFlat;
        }
        return 0;
    }

    private calculateMaintenance(
        monthlyRent: number,
        propertyPrice: number,
        expenses: RentalPropertyExpenses,
    ): number {
        if (expenses.maintenanceAnnual !== undefined) {
            return this.annualToMonthly(expenses.maintenanceAnnual);
        }
        if (expenses.maintenancePercentOfRent !== undefined) {
            return (monthlyRent * expenses.maintenancePercentOfRent) / PERCENT_TO_DECIMAL;
        }
        if (expenses.maintenancePercentOfValue !== undefined && propertyPrice) {
            return (propertyPrice * expenses.maintenancePercentOfValue) / PERCENT_TO_DECIMAL / MONTHS_PER_YEAR;
        }
        return 0;
    }

    private calculateCapex(
        monthlyRent: number,
        propertyPrice: number,
        expenses: RentalPropertyExpenses,
    ): number {
        if (expenses.capexAnnual !== undefined) {
            return this.annualToMonthly(expenses.capexAnnual);
        }
        if (expenses.capexPercentOfRent !== undefined) {
            return (monthlyRent * expenses.capexPercentOfRent) / PERCENT_TO_DECIMAL;
        }
        if (expenses.capexPercentOfValue !== undefined && propertyPrice) {
            return (propertyPrice * expenses.capexPercentOfValue) / PERCENT_TO_DECIMAL / MONTHS_PER_YEAR;
        }
        return 0;
    }

    // ============================================================================
    // CASH FLOW CALCULATION
    // ============================================================================

    private calculateCashFlow(
        grossRent: number,
        effectiveMonthlyRent: number,
        totalOperatingExpenses: number,
        mortgageResult: MortgageCalculationResult,
    ): CashFlow {
        const monthlyNOI = effectiveMonthlyRent - totalOperatingExpenses;

        const totalMonthlyDebtService = this.calculateMonthlyDebtService(mortgageResult);
        const cashFlowMonthly = effectiveMonthlyRent - totalOperatingExpenses - totalMonthlyDebtService;
        const cashFlowAnnual = cashFlowMonthly * MONTHS_PER_YEAR;

        const totalMonthlyExpenses = totalOperatingExpenses + totalMonthlyDebtService;

        return {
            grossRent: NumberUtils.roundToTwo(grossRent),
            effectiveRent: NumberUtils.roundToTwo(effectiveMonthlyRent),
            totalExpenses: NumberUtils.roundToTwo(totalMonthlyExpenses),
            netOperatingIncome: NumberUtils.roundToTwo(monthlyNOI),
            cashFlowMonthly: NumberUtils.roundToTwo(cashFlowMonthly),
            cashFlowAnnual: NumberUtils.roundToTwo(cashFlowAnnual),
        };
    }

    private calculateMonthlyDebtService(mortgageResult: MortgageCalculationResult): number {
        return mortgageResult.principalAndInterest + mortgageResult.pmi + mortgageResult.hoa;
    }

    // ============================================================================
    // INVESTMENT METRICS CALCULATION
    // ============================================================================

    private calculateInvestmentMetrics(
        monthlyRent: number,
        propertyPrice: number,
        cashFlow: CashFlow,
        totalOperatingExpenses: number,
        mortgageResult: MortgageCalculationResult,
    ): Metrics {
        const annualRent = monthlyRent * MONTHS_PER_YEAR;
        const annualNOI = cashFlow.netOperatingIncome * MONTHS_PER_YEAR;
        const annualDebtService = mortgageResult.principalAndInterest * MONTHS_PER_YEAR;
        const cashInvested = mortgageResult.downPaymentAmount;

        const capRate = this.calculateCapRate(annualNOI, propertyPrice);
        const cashOnCashReturn = this.calculateCashOnCashReturn(cashFlow.cashFlowAnnual, cashInvested);
        const grossRentMultiplier = this.calculateGrossRentMultiplier(propertyPrice, annualRent);
        const debtCoverageRatio = this.calculateDebtCoverageRatio(annualNOI, annualDebtService);
        const operatingExpenseRatio = this.calculateOperatingExpenseRatio(totalOperatingExpenses, annualRent);
        const breakEvenOccupancy = this.calculateBreakEvenOccupancy(
            totalOperatingExpenses,
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

    private calculateOperatingExpenseRatio(
        monthlyOperatingExpenses: number,
        annualRent: number,
    ): number {
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

    // ============================================================================
    // UTILITY METHODS
    // ============================================================================

    private annualToMonthly(annualAmount: number | undefined): number {
        return (annualAmount ?? 0) / MONTHS_PER_YEAR;
    }
}