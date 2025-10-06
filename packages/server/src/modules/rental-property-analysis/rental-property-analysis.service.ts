import { Injectable } from '@nestjs/common';
import {
    MortgageCalculationService,
    FlexibleMortgageInput,
    MortgageCalculationResult
} from '../mortgage-calculation/mortgage-calculation.service';

// ============================================================================
// INTERFACES
// ============================================================================

export interface RentalPropertyExpenses {
    // Vacancy - Expected % of time property is unrented
    vacancyRate?: number; // e.g., 8 for 8% vacancy

    // Property Management - Typically 8-12% of monthly rent
    propertyManagementPercent?: number; // % of monthly rent
    propertyManagementFlat?: number; // or flat monthly fee

    // Maintenance & Repairs - Typically 1% of property value annually or $1 per sqft
    maintenanceAnnual?: number; // annual amount
    maintenancePercentOfRent?: number; // % of monthly rent (often 10%)
    maintenancePercentOfValue?: number; // % of property value annually (often 1%)

    // Capital Expenditures (CapEx) - Roof, HVAC, appliances, etc.
    capexAnnual?: number; // annual reserve amount
    capexPercentOfRent?: number; // % of monthly rent (often 5-10%)
    capexPercentOfValue?: number; // % of property value annually

    // Utilities (if landlord pays)
    utilitiesMonthly?: number; // water, sewer, trash, gas, electric

    // Landscaping/Snow Removal
    landscapingMonthly?: number;

    // Pest Control
    pestControlMonthly?: number;

    // Legal & Professional Fees
    legalFeesAnnual?: number; // lawyer, accountant

    // Insurance - Landlord/Rental Property Insurance (separate from homeowners)
    landlordInsuranceAnnual?: number; // typically higher than regular homeowners

    // Additional property taxes or special assessments
    specialAssessmentsAnnual?: number;

    // Advertising/Marketing for tenants
    advertisingAnnual?: number;

    // Turnover costs (cleaning, painting between tenants)
    turnoverCostPerYear?: number;
}

export interface RentalPropertyInput extends FlexibleMortgageInput {
    monthlyRent: number; // expected rental income
    expenses: RentalPropertyExpenses;
}

export interface CashFlow {
    grossRent: number;
    effectiveRent: number; // after vacancy
    totalExpenses: number; // mortgage + operating expenses
    netOperatingIncome: number; // NOI (before mortgage)
    cashFlowMonthly: number; // after all expenses including mortgage
    cashFlowAnnual: number;
}

export interface Metrics {
    capRate: number; // Cap Rate (NOI / Property Price)
    cashOnCashReturn: number; // Annual cash flow / Cash invested
    grossRentMultiplier: number; // Property Price / Annual Rent
    debtCoverageRatio: number; // NOI / Annual Debt Service
    operatingExpenseRatio: number; // Operating Expenses / Gross Rent
    breakEvenOccupancy: number; // % occupancy needed to break even
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
    effectiveMonthlyRent: number; // rent minus vacancy
    operatingExpenses: OperatingExpenses; // Operating Expenses Breakdown
    cashFlow: CashFlow; // Cash Flow Analysis
    metrics: Metrics; // Investment Metrics
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
        const mortgageResult = this.mortgageService.calculateMortgageFlexible(input);
        const { monthlyRent, expenses, propertyPrice } = input;

        const effectiveMonthlyRent = this.calculateEffectiveRent(monthlyRent, expenses);
        const operatingExpenses = this.calculateOperatingExpenses(
            monthlyRent,
            propertyPrice,
            expenses,
            mortgageResult
        );
        const cashFlow = this.calculateCashFlow(
            monthlyRent,
            effectiveMonthlyRent,
            operatingExpenses.totalMonthly,
            mortgageResult
        );
        const metrics = this.calculateInvestmentMetrics(
            monthlyRent,
            propertyPrice,
            cashFlow,
            operatingExpenses.totalMonthly,
            mortgageResult
        );

        return {
            ...mortgageResult,
            monthlyRent,
            effectiveMonthlyRent: Math.round(effectiveMonthlyRent * 100) / 100,
            operatingExpenses,
            cashFlow,
            metrics,
        };
    }

    /**
     * Calculate rental property analysis with amortization schedule
     */
    analyzeRentalPropertyWithSchedule(input: RentalPropertyInput): RentalPropertyResult {
        const mortgageResult = this.mortgageService.calculateMortgageWithScheduleFlexible(input);
        const { monthlyRent, expenses, propertyPrice } = input;

        const effectiveMonthlyRent = this.calculateEffectiveRent(monthlyRent, expenses);
        const operatingExpenses = this.calculateOperatingExpenses(
            monthlyRent,
            propertyPrice,
            expenses,
            mortgageResult
        );
        const cashFlow = this.calculateCashFlow(
            monthlyRent,
            effectiveMonthlyRent,
            operatingExpenses.totalMonthly,
            mortgageResult
        );
        const metrics = this.calculateInvestmentMetrics(
            monthlyRent,
            propertyPrice,
            cashFlow,
            operatingExpenses.totalMonthly,
            mortgageResult
        );

        return {
            ...mortgageResult,
            monthlyRent,
            effectiveMonthlyRent: Math.round(effectiveMonthlyRent * 100) / 100,
            operatingExpenses,
            cashFlow,
            metrics,
        };
    }

    /**
     * Calculate effective rent after vacancy
     */
    private calculateEffectiveRent(
        monthlyRent: number,
        expenses: RentalPropertyExpenses
    ): number {
        const vacancyRate = expenses.vacancyRate || 8; // default 8%
        const vacancyLoss = (monthlyRent * vacancyRate) / 100;
        return monthlyRent - vacancyLoss;
    }

    /**
     * Calculate all operating expenses
     */
    private calculateOperatingExpenses(
        monthlyRent: number,
        propertyPrice: number,
        expenses: RentalPropertyExpenses,
        mortgageResult: MortgageCalculationResult
    ): OperatingExpenses {
        const vacancyRate = expenses.vacancyRate || 8;
        const vacancyLoss = (monthlyRent * vacancyRate) / 100;

        const propertyManagement = this.calculatePropertyManagement(monthlyRent, expenses);
        const maintenance = this.calculateMaintenance(monthlyRent, propertyPrice, expenses);
        const capex = this.calculateCapex(monthlyRent, propertyPrice, expenses);

        const utilities = expenses.utilitiesMonthly || 0;
        const landscaping = expenses.landscapingMonthly || 0;
        const pestControl = expenses.pestControlMonthly || 0;
        const legalFees = (expenses.legalFeesAnnual || 0) / 12;
        const landlordInsurance = (expenses.landlordInsuranceAnnual || 0) / 12;
        const specialAssessments = (expenses.specialAssessmentsAnnual || 0) / 12;
        const advertising = (expenses.advertisingAnnual || 0) / 12;
        const turnover = (expenses.turnoverCostPerYear || 0) / 12;

        const totalOperatingExpenses =
            propertyManagement +
            maintenance +
            capex +
            utilities +
            landscaping +
            pestControl +
            legalFees +
            landlordInsurance +
            specialAssessments +
            advertising +
            turnover +
            mortgageResult.propertyTax +
            mortgageResult.homeInsurance;

        return {
            vacancy: Math.round(vacancyLoss * 100) / 100,
            propertyManagement: Math.round(propertyManagement * 100) / 100,
            maintenance: Math.round(maintenance * 100) / 100,
            capex: Math.round(capex * 100) / 100,
            utilities: Math.round(utilities * 100) / 100,
            landscaping: Math.round(landscaping * 100) / 100,
            pestControl: Math.round(pestControl * 100) / 100,
            legalFees: Math.round(legalFees * 100) / 100,
            landlordInsurance: Math.round(landlordInsurance * 100) / 100,
            specialAssessments: Math.round(specialAssessments * 100) / 100,
            advertising: Math.round(advertising * 100) / 100,
            turnover: Math.round(turnover * 100) / 100,
            totalMonthly: Math.round(totalOperatingExpenses * 100) / 100,
        };
    }

    /**
     * Calculate property management fees
     */
    private calculatePropertyManagement(
        monthlyRent: number,
        expenses: RentalPropertyExpenses
    ): number {
        if (expenses.propertyManagementPercent) {
            return (monthlyRent * expenses.propertyManagementPercent) / 100;
        } else if (expenses.propertyManagementFlat) {
            return expenses.propertyManagementFlat;
        }
        return 0;
    }

    /**
     * Calculate maintenance and repairs costs
     */
    private calculateMaintenance(
        monthlyRent: number,
        propertyPrice: number,
        expenses: RentalPropertyExpenses
    ): number {
        if (expenses.maintenanceAnnual) {
            return expenses.maintenanceAnnual / 12;
        } else if (expenses.maintenancePercentOfRent) {
            return (monthlyRent * expenses.maintenancePercentOfRent) / 100;
        } else if (expenses.maintenancePercentOfValue && propertyPrice) {
            return (propertyPrice * expenses.maintenancePercentOfValue) / 100 / 12;
        }
        return 0;
    }

    /**
     * Calculate capital expenditure reserves
     */
    private calculateCapex(
        monthlyRent: number,
        propertyPrice: number,
        expenses: RentalPropertyExpenses
    ): number {
        if (expenses.capexAnnual) {
            return expenses.capexAnnual / 12;
        } else if (expenses.capexPercentOfRent) {
            return (monthlyRent * expenses.capexPercentOfRent) / 100;
        } else if (expenses.capexPercentOfValue && propertyPrice) {
            return (propertyPrice * expenses.capexPercentOfValue) / 100 / 12;
        }
        return 0;
    }

    /**
     * Calculate cash flow analysis
     */
    private calculateCashFlow(
        grossRent: number,
        effectiveMonthlyRent: number,
        totalOperatingExpenses: number,
        mortgageResult: MortgageCalculationResult
    ): CashFlow {
        const noi = effectiveMonthlyRent - totalOperatingExpenses;
        const cashFlowMonthly = effectiveMonthlyRent -
            totalOperatingExpenses -
            mortgageResult.principalAndInterest -
            mortgageResult.pmi -
            mortgageResult.hoa;
        const cashFlowAnnual = cashFlowMonthly * 12;

        return {
            grossRent: Math.round(grossRent * 100) / 100,
            effectiveRent: Math.round(effectiveMonthlyRent * 100) / 100,
            totalExpenses: Math.round((totalOperatingExpenses + mortgageResult.principalAndInterest + mortgageResult.pmi + mortgageResult.hoa) * 100) / 100,
            netOperatingIncome: Math.round(noi * 100) / 100,
            cashFlowMonthly: Math.round(cashFlowMonthly * 100) / 100,
            cashFlowAnnual: Math.round(cashFlowAnnual * 100) / 100,
        };
    }

    /**
     * Calculate investment performance metrics
     */
    private calculateInvestmentMetrics(
        monthlyRent: number,
        propertyPrice: number,
        cashFlow: CashFlow,
        totalOperatingExpenses: number,
        mortgageResult: MortgageCalculationResult
    ): Metrics {
        const annualRent = monthlyRent * 12;
        const annualNOI = cashFlow.netOperatingIncome * 12;
        const annualDebtService = mortgageResult.principalAndInterest * 12;
        const cashInvested = mortgageResult.downPaymentAmount || 0;

        const capRate = (annualNOI / propertyPrice) * 100;
        const cashOnCashReturn = cashInvested > 0 ? (cashFlow.cashFlowAnnual / cashInvested) * 100 : 0;
        const grossRentMultiplier = propertyPrice / annualRent;
        const debtCoverageRatio = annualDebtService > 0 ? annualNOI / annualDebtService : 0;
        const operatingExpenseRatio = (totalOperatingExpenses * 12) / annualRent * 100;

        const totalAnnualExpenses = (totalOperatingExpenses + mortgageResult.principalAndInterest + mortgageResult.pmi + mortgageResult.hoa) * 12;
        const breakEvenOccupancy = (totalAnnualExpenses / annualRent) * 100;

        return {
            capRate: Math.round(capRate * 100) / 100,
            cashOnCashReturn: Math.round(cashOnCashReturn * 100) / 100,
            grossRentMultiplier: Math.round(grossRentMultiplier * 100) / 100,
            debtCoverageRatio: Math.round(debtCoverageRatio * 100) / 100,
            operatingExpenseRatio: Math.round(operatingExpenseRatio * 100) / 100,
            breakEvenOccupancy: Math.round(breakEvenOccupancy * 100) / 100,
        };
    }
}