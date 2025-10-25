import { Injectable } from '@nestjs/common';
import { NumberUtils } from '../../common/utility/number.utils';
import {
    MortgageCalculationService,
    FlexibleMortgageInput,
    MortgageCalculationResult
} from '../mortgage-calculation/mortgage-calculation.service';
import { RentalPropertyAnalysisMetadata, RentalFieldMetadata } from './rental-property-analysis.metadata';


// ============================================================================
// CONSTANTS
// ============================================================================
const MONTHS_PER_YEAR = 12;
const PERCENT_TO_DECIMAL = 100;
const DEFAULT_VACANCY_RATE = 8; // 8%
const MINIMUM_LTV_FOR_DSCR = 0.01; // Avoid division by zero
const DEFAULT_APPRECIATION_RATE = 3; // 3% annually
const DEFAULT_RENT_GROWTH_RATE = 3; // 3% annually
const DEFAULT_EXPENSE_GROWTH_RATE = 2.5; // 2.5% annually
const DEFAULT_CAPITAL_GAINS_TAX_RATE = 15; // 15% long-term capital gains
const DEFAULT_DEPRECIATION_YEARS = 27.5; // Residential property depreciation period
const DEFAULT_COST_SEGREGATION_PERCENTAGE = 20; // 20% of property value can be accelerated

// ============================================================================
// INTERFACES (Rental domain)
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
    // Enhanced optional inputs
    closingCosts?: number;
    rehabCosts?: number;
    appreciationRate?: number;
    rentGrowthRate?: number;
    expenseGrowthRate?: number;
    marginalTaxRate?: number;
    capitalGainsTaxRate?: number;
    depreciationYears?: number;
    landValue?: number;
    holdingPeriodYears?: number;
    targetCashFlow?: number;
    targetCapRate?: number;
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

export interface EnhancedMetrics extends Metrics {
    totalReturnOnInvestment: number;
    internalRateOfReturn?: number;
    modifiedInternalRateOfReturn?: number;
    equityMultiple?: number;

    rentToValueRatio: number;
    expenseToIncomeRatio: number;
    onePercentRule: boolean;
    twoPercentRule: boolean;
    fiftyPercentRule: number;

    cashFlowPerUnit: number;
    cashFlowPerDoor: number;
    annualizedReturn: number;

    loanConstant: number;
    debtYieldRatio: number;
    breakEvenRatio: number;

    annualDepreciation?: number;
    taxShelterValue?: number;
    effectiveTaxRate?: number;
    afterTaxCashFlow?: number;

    equityBuildupYear1?: number;
    totalEquityYear1?: number;
    returnOnEquity?: number;
    appreciationYear1?: number;

    vacancySensitivity?: number;
    interestRateSensitivity?: number;
    maintenanceReserveRatio?: number;
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
    metrics: EnhancedMetrics;

    investmentSummary?: InvestmentSummary;
    projectedReturns?: ProjectedReturns;
    breakEvenAnalysis?: BreakEvenAnalysis;
    sensitivityAnalysis?: SensitivityAnalysis;
}

export interface InvestmentSummary {
    totalCashNeeded: number;
    allInCost: number;
    monthlyGrossIncome: number;
    monthlyNetIncome: number;
    annualNetIncome: number;
    totalROI: number;
    paybackPeriod: number;
}

export interface ProjectedReturns {
    year1: YearlyProjection;
    year5?: YearlyProjection;
    year10?: YearlyProjection;
    exitAnalysis?: ExitAnalysis;
}

export interface YearlyProjection {
    year: number;
    monthlyRent: number;
    annualCashFlow: number;
    propertyValue: number;
    loanBalance: number;
    equity: number;
    cumulativeCashFlow: number;
    totalReturn: number;
}

export interface ExitAnalysis {
    salePrice: number;
    sellingCosts: number;
    loanPayoff: number;
    netProceeds: number;
    totalCashFlow: number;
    totalReturn: number;
    annualizedReturn: number;
}

export interface BreakEvenAnalysis {
    breakEvenOccupancyRate: number;
    breakEvenRent: number;
    monthsToPositiveCashFlow: number;
    cashFlowBreakEvenPoint: number;
}

export interface SensitivityAnalysis {
    vacancyImpact: SensitivityResult[];
    rentChangeImpact: SensitivityResult[];
    interestRateImpact: SensitivityResult[];
    expenseChangeImpact: SensitivityResult[];
}

export interface SensitivityResult {
    change: number;
    cashFlow: number;
    capRate: number;
    cashOnCash: number;
}

// Metadata interface used with your metadata helper service
export interface RentalPropertyMetadata {
    income: RentalFieldMetadata[];
    cashFlow: RentalFieldMetadata[];
    metrics: RentalFieldMetadata[];
    operatingExpenses: RentalFieldMetadata[];
}

export interface RentalPropertyResultWithMetadata {
    data: RentalPropertyResult;
    metadata: RentalPropertyMetadata;
}

// ============================================================================
// ADDITIONAL STRATEGY INTERFACES (Rental domain)
// ============================================================================
export interface FixAndFlipInput {
    purchasePrice: number;
    rehabCosts: number;
    holdingCosts: number;
    sellingCosts: number;
    afterRepairValue: number;
    holdingPeriodMonths: number;
    hardMoneyCost?: number;
}

export interface FixAndFlipResult {
    totalInvestment: number;
    netProfit: number;
    roi: number;
    annualizedROI: number;
    profitMargin: number;
    maximumAllowableOffer: number;
}

export interface BRRRRInput {
    purchasePrice: number;
    rehabCosts: number;
    afterRepairValue: number;
    monthlyRent: number;
    refinanceLTV: number;
    refinanceRate: number;
    refinanceTermYears: number;
    monthlyExpenses: number;
    initialCashInvested: number;
}

export interface BRRRRResult {
    totalInvestment: number;
    refinanceAmount: number;
    cashOut: number;
    cashLeftInDeal: number;
    newMortgagePayment: number;
    monthlyCashFlow: number;
    annualCashFlow: number;
    cashOnCashReturn: number;
    roiOnInitialInvestment: number;
    infiniteReturn: boolean;
}

export interface AirbnbInput {
    averageDailyRate: number;
    occupancyRate: number;
    cleaningFeePerStay: number;
    averageStayLength: number;
    monthlyExpenses: number;
    managementFeePercent?: number;
    propertyPrice: number;
    downPayment: number;
}

export interface ShortTermRentalResult {
    grossMonthlyRevenue: number;
    netMonthlyIncome: number;
    annualNetIncome: number;
    cashOnCashReturn: number;
    capRate: number;
    grossYield: number;
    revPAR: number;
    averageOccupiedDays: number;
    monthlyStays: number;
}

export interface ValueAddInput {
    currentNOI: number;
    projectedNOI: number;
    currentCapRate: number;
    exitCapRate: number;
    renovationCosts: number;
    currentValue: number;
}

export interface ValueAddResult {
    currentValueByCap: number;
    projectedValue: number;
    valueCreated: number;
    roi: number;
    equityMultiple: number;
}

export interface SyndicationInput {
    totalEquityRaised: number;
    gpInvestment: number;
    lpInvestment: number;
    preferredReturn: number;
    lpSplit: number;
    gpSplit: number;
    annualCashFlow: number;
    saleProceeds: number;
    holdPeriod: number;
}

export interface SyndicationResult {
    lpTotalReturn: number;
    gpTotalReturn: number;
    lpMultiple: number;
    gpMultiple: number;
    lpIRR: number;
    gpIRR: number;
    lpAnnualCashFlow: number;
    gpAnnualCashFlow: number;
}

export interface HardMoneyInput {
    loanAmount: number;
    interestRate: number;
    points: number;
    termMonths: number;
    interestOnly: boolean;
    exitStrategy: 'refinance' | 'sale';
}

export interface HardMoneyResult {
    monthlyPayment: number;
    pointsCost: number;
    totalInterest: number;
    totalCost: number;
    effectiveRate: number;
    balloonPayment: number;
}

// ============================================================================
// SERVICE (rental analysis depends on mortgage service)
// ============================================================================
@Injectable()
export class RentalPropertyAnalysisService {
    constructor(private readonly mortgageService: MortgageCalculationService) { }

    // ---------------- Main entry points ----------------

    analyzeRentalProperty(input: RentalPropertyInput): RentalPropertyResult {
        this.validateRentalInput(input);
        const mortgageResult = this.mortgageService.calculateMortgageFlexible(input);
        return this.buildEnhancedRentalPropertyResult(input, mortgageResult);
    }

    analyzeRentalPropertyWithSchedule(input: RentalPropertyInput): RentalPropertyResult {
        this.validateRentalInput(input);
        const mortgageResult = this.mortgageService.calculateMortgageWithScheduleFlexible(input);
        return this.buildEnhancedRentalPropertyResult(input, mortgageResult);
    }

    analyzeRentalPropertyWithMetadata(input: RentalPropertyInput): RentalPropertyResultWithMetadata {
        const data = this.analyzeRentalProperty(input);
        const metadata = this.getRentalPropertyMetadata();
        return { data, metadata };
    }

    analyzeRentalPropertyWithScheduleAndMetadata(input: RentalPropertyInput): RentalPropertyResultWithMetadata {
        const data = this.analyzeRentalPropertyWithSchedule(input);
        const metadata = this.getRentalPropertyMetadata();
        return { data, metadata };
    }

    // ---------------- Fix & Flip ----------------

    calculateMaximumAllowableOffer(
        afterRepairValue: number,
        repairCosts: number,
        wholesaleFee: number = 0,
        profitMargin: number = 70
    ): { mao: number; potentialProfit: number; roi: number } {
        const mao = afterRepairValue * (profitMargin / 100) - repairCosts - wholesaleFee;
        const totalInvestment = mao + repairCosts + wholesaleFee;
        const potentialProfit = afterRepairValue - totalInvestment;
        const roi = (potentialProfit / totalInvestment) * 100;

        return {
            mao: NumberUtils.roundToTwo(mao),
            potentialProfit: NumberUtils.roundToTwo(potentialProfit),
            roi: NumberUtils.roundToTwo(roi),
        };
    }

    calculateFixAndFlipAnalysis(input: FixAndFlipInput): FixAndFlipResult {
        const totalInvestment =
            input.purchasePrice +
            input.rehabCosts +
            input.holdingCosts +
            input.sellingCosts +
            (input.hardMoneyCost ?? 0);

        const netProfit = input.afterRepairValue - totalInvestment;
        const roi = (netProfit / totalInvestment) * 100;
        const annualizedROI = (roi / input.holdingPeriodMonths) * 12;

        const maoResult = this.calculateMaximumAllowableOffer(
            input.afterRepairValue,
            input.rehabCosts + input.holdingCosts + input.sellingCosts
        );

        return {
            totalInvestment: NumberUtils.roundToTwo(totalInvestment),
            netProfit: NumberUtils.roundToTwo(netProfit),
            roi: NumberUtils.roundToTwo(roi),
            annualizedROI: NumberUtils.roundToTwo(annualizedROI),
            profitMargin: NumberUtils.roundToTwo((netProfit / input.afterRepairValue) * 100),
            maximumAllowableOffer: maoResult.mao,
        };
    }

    // ---------------- BRRRR ----------------

    calculateBRRRRAnalysis(input: BRRRRInput): BRRRRResult {
        const totalInvestment = input.purchasePrice + input.rehabCosts;
        const refinanceAmount = input.afterRepairValue * input.refinanceLTV;
        const cashOut = refinanceAmount - totalInvestment;
        const cashLeftInDeal = Math.max(0, totalInvestment - refinanceAmount);

        const monthlyRate = input.refinanceRate / 100 / 12;
        const numPayments = input.refinanceTermYears * 12;
        const newPayment = this.calculateMonthlyPayment(refinanceAmount, monthlyRate, numPayments);

        const monthlyCashFlow = input.monthlyRent - input.monthlyExpenses - newPayment;
        const annualCashFlow = monthlyCashFlow * 12;

        const cashOnCashReturn = cashLeftInDeal > 0 ? (annualCashFlow / cashLeftInDeal) * 100 : Infinity;
        const roiOnInitial = (annualCashFlow / input.initialCashInvested) * 100;

        return {
            totalInvestment: NumberUtils.roundToTwo(totalInvestment),
            refinanceAmount: NumberUtils.roundToTwo(refinanceAmount),
            cashOut: NumberUtils.roundToTwo(cashOut),
            cashLeftInDeal: NumberUtils.roundToTwo(cashLeftInDeal),
            newMortgagePayment: NumberUtils.roundToTwo(newPayment),
            monthlyCashFlow: NumberUtils.roundToTwo(monthlyCashFlow),
            annualCashFlow: NumberUtils.roundToTwo(annualCashFlow),
            cashOnCashReturn: NumberUtils.roundToTwo(cashOnCashReturn),
            roiOnInitialInvestment: NumberUtils.roundToTwo(roiOnInitial),
            infiniteReturn: cashLeftInDeal === 0,
        };
    }

    // ---------------- Wholesale ----------------

    calculateWholesaleProfit(
        contractPrice: number,
        assignmentFee: number,
        marketingCosts: number = 0,
        otherCosts: number = 0
    ): { grossProfit: number; netProfit: number; roi: number; endBuyerPrice: number } {
        const totalCosts = marketingCosts + otherCosts;
        const grossProfit = assignmentFee;
        const netProfit = grossProfit - totalCosts;
        const roi = totalCosts > 0 ? (netProfit / totalCosts) * 100 : Infinity;
        const endBuyerPrice = contractPrice + assignmentFee;

        return {
            grossProfit: NumberUtils.roundToTwo(grossProfit),
            netProfit: NumberUtils.roundToTwo(netProfit),
            roi: NumberUtils.roundToTwo(roi),
            endBuyerPrice: NumberUtils.roundToTwo(endBuyerPrice),
        };
    }

    // ---------------- Short-term rental ----------------

    calculateAirbnbMetrics(input: AirbnbInput): ShortTermRentalResult {
        const daysPerMonth = 30;
        const occupiedDays = daysPerMonth * (input.occupancyRate / 100);
        const numberOfStays = occupiedDays / input.averageStayLength;

        const roomRevenue = input.averageDailyRate * occupiedDays;
        const cleaningRevenue = input.cleaningFeePerStay * numberOfStays;
        const grossMonthlyRevenue = roomRevenue + cleaningRevenue;

        const managementFees = input.managementFeePercent
            ? (grossMonthlyRevenue * input.managementFeePercent) / 100
            : 0;

        const netMonthlyIncome = grossMonthlyRevenue - input.monthlyExpenses - managementFees;
        const annualNetIncome = netMonthlyIncome * 12;
        const annualGrossRevenue = grossMonthlyRevenue * 12;

        const cashOnCash = (annualNetIncome / input.downPayment) * 100;
        const capRate = (annualNetIncome / input.propertyPrice) * 100;
        const grossYield = (annualGrossRevenue / input.propertyPrice) * 100;
        const revPAR = input.averageDailyRate * (input.occupancyRate / 100);

        return {
            grossMonthlyRevenue: NumberUtils.roundToTwo(grossMonthlyRevenue),
            netMonthlyIncome: NumberUtils.roundToTwo(netMonthlyIncome),
            annualNetIncome: NumberUtils.roundToTwo(annualNetIncome),
            cashOnCashReturn: NumberUtils.roundToTwo(cashOnCash),
            capRate: NumberUtils.roundToTwo(capRate),
            grossYield: NumberUtils.roundToTwo(grossYield),
            revPAR: NumberUtils.roundToTwo(revPAR),
            averageOccupiedDays: NumberUtils.roundToTwo(occupiedDays),
            monthlyStays: NumberUtils.roundToTwo(numberOfStays),
        };
    }

    // ---------------- Commercial / Value-Add ----------------

    calculateCommercialNOI(input: {
        grossScheduledIncome: number;
        vacancyLoss: number;
        otherIncome: number;
        operatingExpenses: number;
        managementFees: number;
        reserves: number;
    }): number {
        const effectiveGrossIncome = input.grossScheduledIncome - input.vacancyLoss + input.otherIncome;
        const totalExpenses = input.operatingExpenses + input.managementFees + input.reserves;
        return NumberUtils.roundToTwo(effectiveGrossIncome - totalExpenses);
    }

    calculateValueAddPotential(input: ValueAddInput): ValueAddResult {
        const currentValueByCap = input.currentNOI / (input.currentCapRate / 100);
        const projectedValue = input.projectedNOI / (input.exitCapRate / 100);
        const valueCreated = projectedValue - input.currentValue - input.renovationCosts;
        const roi = (valueCreated / (input.currentValue + input.renovationCosts)) * 100;
        const equityMultiple = projectedValue / (input.currentValue + input.renovationCosts);

        return {
            currentValueByCap: NumberUtils.roundToTwo(currentValueByCap),
            projectedValue: NumberUtils.roundToTwo(projectedValue),
            valueCreated: NumberUtils.roundToTwo(valueCreated),
            roi: NumberUtils.roundToTwo(roi),
            equityMultiple: NumberUtils.roundToTwo(equityMultiple),
        };
    }

    // ---------------- Syndication ----------------

    calculateSyndicationReturns(input: SyndicationInput): SyndicationResult {
        const annualPrefPayment = input.lpInvestment * (input.preferredReturn / 100);
        const totalPrefPayments = annualPrefPayment * input.holdPeriod;

        const cashFlowAfterPref = Math.max(0, input.annualCashFlow - annualPrefPayment);
        const lpCashFlowShare = cashFlowAfterPref * (input.lpSplit / 100);
        const gpCashFlowShare = cashFlowAfterPref * (input.gpSplit / 100);

        const returnOfCapital = input.lpInvestment + input.gpInvestment;
        const profitFromSale = Math.max(0, input.saleProceeds - returnOfCapital);
        const lpProfitShare = profitFromSale * (input.lpSplit / 100);
        const gpProfitShare = profitFromSale * (input.gpSplit / 100);

        const lpTotalReturn = totalPrefPayments + lpCashFlowShare * input.holdPeriod + input.lpInvestment + lpProfitShare;
        const gpTotalReturn = gpCashFlowShare * input.holdPeriod + input.gpInvestment + gpProfitShare;

        const lpMultiple = lpTotalReturn / input.lpInvestment;
        const gpMultiple = gpTotalReturn / input.gpInvestment;

        const lpIRR = this.approximateIRR(input.lpInvestment, lpTotalReturn, input.holdPeriod);
        const gpIRR = this.approximateIRR(input.gpInvestment, gpTotalReturn, input.holdPeriod);

        return {
            lpTotalReturn: NumberUtils.roundToTwo(lpTotalReturn),
            gpTotalReturn: NumberUtils.roundToTwo(gpTotalReturn),
            lpMultiple: NumberUtils.roundToTwo(lpMultiple),
            gpMultiple: NumberUtils.roundToTwo(gpMultiple),
            lpIRR: NumberUtils.roundToTwo(lpIRR),
            gpIRR: NumberUtils.roundToTwo(gpIRR),
            lpAnnualCashFlow: NumberUtils.roundToTwo(annualPrefPayment + lpCashFlowShare),
            gpAnnualCashFlow: NumberUtils.roundToTwo(gpCashFlowShare),
        };
    }

    // ---------------- Hard money & lending ----------------

    calculateHardMoneyLoan(input: HardMoneyInput): HardMoneyResult {
        const pointsCost = input.loanAmount * (input.points / 100);
        const monthlyRate = input.interestRate / 100 / 12;

        let monthlyPayment: number;
        let totalInterest: number;

        if (input.interestOnly) {
            monthlyPayment = input.loanAmount * monthlyRate;
            totalInterest = monthlyPayment * input.termMonths;
        } else {
            monthlyPayment = this.calculateMonthlyPayment(input.loanAmount, monthlyRate, input.termMonths);
            totalInterest = monthlyPayment * input.termMonths - input.loanAmount;
        }

        const totalCost = pointsCost + totalInterest;
        const effectiveRate = ((totalCost / input.loanAmount) / (input.termMonths / 12)) * 100;

        return {
            monthlyPayment: NumberUtils.roundToTwo(monthlyPayment),
            pointsCost: NumberUtils.roundToTwo(pointsCost),
            totalInterest: NumberUtils.roundToTwo(totalInterest),
            totalCost: NumberUtils.roundToTwo(totalCost),
            effectiveRate: NumberUtils.roundToTwo(effectiveRate),
            balloonPayment: input.interestOnly ? input.loanAmount : 0,
        };
    }

    calculatePrivateLendingReturns(input: {
        loanAmount: number;
        interestRate: number;
        termMonths: number;
        points: number;
        servicingFeeMonthly?: number;
    }): { monthlyIncome: number; totalReturn: number; annualizedYield: number; totalPoints: number } {
        const totalPoints = input.loanAmount * (input.points / 100);
        const monthlyInterest = input.loanAmount * (input.interestRate / 100 / 12);
        const monthlyIncome = monthlyInterest + (input.servicingFeeMonthly ?? 0);

        const totalReturn = totalPoints + monthlyIncome * input.termMonths + input.loanAmount;
        const annualizedYield = ((totalReturn - input.loanAmount) / input.loanAmount) / (input.termMonths / 12) * 100;

        return {
            monthlyIncome: NumberUtils.roundToTwo(monthlyIncome),
            totalReturn: NumberUtils.roundToTwo(totalReturn),
            annualizedYield: NumberUtils.roundToTwo(annualizedYield),
            totalPoints: NumberUtils.roundToTwo(totalPoints),
        };
    }

    // ---------------- Development ----------------

    calculateLandDevelopment(input: {
        landCost: number;
        developmentCosts: number;
        softCosts: number;
        carryingCosts: number;
        numberOfLots: number;
        averageLotPrice: number;
        developmentTimeMonths: number;
    }): {
        totalCosts: number;
        grossRevenue: number;
        netProfit: number;
        profitMargin: number;
        profitPerLot: number;
        roi: number;
        annualizedROI: number;
    } {
        const totalCosts = input.landCost + input.developmentCosts + input.softCosts + input.carryingCosts;
        const grossRevenue = input.numberOfLots * input.averageLotPrice;
        const netProfit = grossRevenue - totalCosts;
        const profitMargin = (netProfit / grossRevenue) * 100;
        const profitPerLot = netProfit / input.numberOfLots;
        const roi = (netProfit / totalCosts) * 100;
        const annualizedROI = (roi / input.developmentTimeMonths) * 12;

        return {
            totalCosts: NumberUtils.roundToTwo(totalCosts),
            grossRevenue: NumberUtils.roundToTwo(grossRevenue),
            netProfit: NumberUtils.roundToTwo(netProfit),
            profitMargin: NumberUtils.roundToTwo(profitMargin),
            profitPerLot: NumberUtils.roundToTwo(profitPerLot),
            roi: NumberUtils.roundToTwo(roi),
            annualizedROI: NumberUtils.roundToTwo(annualizedROI),
        };
    }

    // ---------------- Enhanced metrics & builders ----------------

    private buildEnhancedRentalPropertyResult(
        input: RentalPropertyInput,
        mortgageResult: MortgageCalculationResult
    ): RentalPropertyResult {
        const baseResult = this.buildRentalPropertyResult(input, mortgageResult);
        const enhancedMetrics = this.calculateEnhancedMetrics(input, baseResult, mortgageResult);
        const investmentSummary = this.calculateInvestmentSummary(input, baseResult, mortgageResult);

        const projectedReturns = input.holdingPeriodYears
            ? this.calculateProjectedReturns(input, baseResult)
            : undefined;

        const breakEvenAnalysis = this.calculateBreakEvenAnalysis(input, baseResult, mortgageResult);
        const sensitivityAnalysis = this.performSensitivityAnalysis(input, baseResult);

        const base: RentalPropertyResult = {
            ...baseResult,
            metrics: enhancedMetrics,
        };
        if (investmentSummary !== undefined) {
            base.investmentSummary = investmentSummary;
        }
        if (projectedReturns !== undefined) {
            base.projectedReturns = projectedReturns;
        }
        if (breakEvenAnalysis !== undefined) {
            base.breakEvenAnalysis = breakEvenAnalysis;
        }
        if (sensitivityAnalysis !== undefined) {
            base.sensitivityAnalysis = sensitivityAnalysis;
        }
        return base;
    }

    private buildRentalPropertyResult(
        input: RentalPropertyInput,
        mortgageResult: MortgageCalculationResult
    ): RentalPropertyResult {
        const vacancyRate = input.expenses.vacancyRate ?? DEFAULT_VACANCY_RATE;
        const vacancyLoss = (input.monthlyRent * vacancyRate) / PERCENT_TO_DECIMAL;
        const effectiveMonthlyRent = input.monthlyRent - vacancyLoss;

        const operatingExpenses = this.calculateOperatingExpenses(
            input.monthlyRent,
            effectiveMonthlyRent,
            input.propertyPrice,
            input.expenses,
            mortgageResult
        );

        const cashFlow = this.calculateCashFlow(
            input.monthlyRent,
            effectiveMonthlyRent,
            operatingExpenses.totalMonthly,
            mortgageResult
        );

        const metrics = this.calculateInvestmentMetrics(
            input.monthlyRent,
            input.propertyPrice,
            cashFlow,
            operatingExpenses.totalMonthly,
            mortgageResult
        ) as EnhancedMetrics;

        return {
            ...mortgageResult,
            monthlyRent: NumberUtils.roundToTwo(input.monthlyRent),
            effectiveMonthlyRent: NumberUtils.roundToTwo(effectiveMonthlyRent),
            operatingExpenses,
            cashFlow,
            metrics,
        };
    }

    private calculateEnhancedMetrics(
        input: RentalPropertyInput,
        baseResult: RentalPropertyResult,
        mortgageResult: MortgageCalculationResult
    ): EnhancedMetrics {
        const annualRent = input.monthlyRent * MONTHS_PER_YEAR;
        const annualNOI = baseResult.cashFlow.netOperatingIncome * MONTHS_PER_YEAR;
        const annualDebtService = mortgageResult.principalAndInterest * MONTHS_PER_YEAR;
        const totalCashInvested = mortgageResult.downPaymentAmount + (input.closingCosts ?? 0) + (input.rehabCosts ?? 0);

        const landValue = input.landValue ?? input.propertyPrice * 0.2;
        const annualDepreciation = this.calculateAnnualDepreciation(
            input.propertyPrice,
            landValue,
            input.depreciationYears
        );

        const taxShelterValue = input.marginalTaxRate
            ? this.calculateTaxShelterValue(annualDepreciation, input.marginalTaxRate)
            : undefined;

        const equityBuildupYear1 = this.calculateEquityBuildupYear1(
            mortgageResult.principalAndInterest,
            input.annualInterestRate,
            mortgageResult.loanAmount
        );

        const appreciationRate = (input.appreciationRate ?? DEFAULT_APPRECIATION_RATE) / PERCENT_TO_DECIMAL;
        const appreciationYear1 = input.propertyPrice * appreciationRate;

        const totalEquityYear1 = mortgageResult.downPaymentAmount + equityBuildupYear1 + appreciationYear1;

        const returnOnEquity = this.calculateReturnOnEquity(
            baseResult.cashFlow.cashFlowAnnual,
            appreciationYear1,
            equityBuildupYear1,
            totalEquityYear1
        );

        const totalROI = this.calculateTotalROI(
            baseResult.cashFlow.cashFlowAnnual,
            appreciationYear1,
            equityBuildupYear1,
            taxShelterValue ?? 0,
            totalCashInvested
        );

        let afterTaxCashFlow: number | undefined;
        if (input.marginalTaxRate) {
            const taxableIncome = annualNOI - annualDebtService - annualDepreciation;
            afterTaxCashFlow = this.calculateAfterTaxCashFlow(
                baseResult.cashFlow.cashFlowAnnual,
                taxableIncome,
                input.marginalTaxRate
            );
        }

        const base: EnhancedMetrics = {
            ...baseResult.metrics,
            totalReturnOnInvestment: NumberUtils.roundToTwo(totalROI),
            rentToValueRatio: NumberUtils.roundToTwo(this.calculateRentToValueRatio(input.monthlyRent, input.propertyPrice)),
            expenseToIncomeRatio: NumberUtils.roundToTwo(
                this.calculateExpenseToIncomeRatio(baseResult.operatingExpenses.totalMonthly, input.monthlyRent)
            ),
            onePercentRule: this.calculateOnePercentRule(input.monthlyRent, input.propertyPrice),
            twoPercentRule: this.calculateTwoPercentRule(input.monthlyRent, input.propertyPrice),
            fiftyPercentRule: NumberUtils.roundToTwo(this.calculateFiftyPercentRule(input.monthlyRent)),
            cashFlowPerUnit: NumberUtils.roundToTwo(baseResult.cashFlow.cashFlowMonthly),
            cashFlowPerDoor: NumberUtils.roundToTwo(baseResult.cashFlow.cashFlowMonthly),
            annualizedReturn: NumberUtils.roundToTwo(
                (baseResult.cashFlow.cashFlowAnnual / Math.max(totalCashInvested, 1e-9)) * PERCENT_TO_DECIMAL
            ),
            loanConstant: NumberUtils.roundToTwo(
                this.calculateLoanConstant(annualDebtService, Math.max(mortgageResult.loanAmount, 1e-9))
            ),
            debtYieldRatio: NumberUtils.roundToTwo(
                this.calculateDebtYield(annualNOI, Math.max(mortgageResult.loanAmount, 1e-9))
            ),
            breakEvenRatio: NumberUtils.roundToTwo(
                this.calculateBreakEvenRatio(
                    baseResult.operatingExpenses.totalMonthly * MONTHS_PER_YEAR,
                    annualDebtService,
                    annualRent
                )
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
            this.calculateVacancySensitivity(input.monthlyRent, input.expenses.vacancyRate ?? DEFAULT_VACANCY_RATE)
        );
        if (vacancySensativity !== undefined) {
            base.vacancySensitivity = vacancySensativity;
        }
        const maintenanceReserveRatio = NumberUtils.roundToTwo(
            this.calculateMaintenanceReserveRatio(
                baseResult.operatingExpenses.maintenance,
                baseResult.operatingExpenses.capex,
                input.monthlyRent
            )
        );
        if (maintenanceReserveRatio !== undefined) {
            base.maintenanceReserveRatio = maintenanceReserveRatio;
        }

        return base;
    }

    private calculateInvestmentSummary(
        input: RentalPropertyInput,
        baseResult: RentalPropertyResult,
        mortgageResult: MortgageCalculationResult
    ): InvestmentSummary {
        const totalCashNeeded = mortgageResult.downPaymentAmount + (input.closingCosts ?? 0) + (input.rehabCosts ?? 0);
        const allInCost = input.propertyPrice + (input.closingCosts ?? 0) + (input.rehabCosts ?? 0);
        const paybackPeriod = this.calculatePaybackPeriod(totalCashNeeded, baseResult.cashFlow.cashFlowAnnual);

        return {
            totalCashNeeded: NumberUtils.roundToTwo(totalCashNeeded),
            allInCost: NumberUtils.roundToTwo(allInCost),
            monthlyGrossIncome: NumberUtils.roundToTwo(input.monthlyRent),
            monthlyNetIncome: NumberUtils.roundToTwo(baseResult.cashFlow.cashFlowMonthly),
            annualNetIncome: NumberUtils.roundToTwo(baseResult.cashFlow.cashFlowAnnual),
            totalROI: baseResult.metrics.totalReturnOnInvestment,
            paybackPeriod: NumberUtils.roundToTwo(paybackPeriod),
        };
    }

    private calculateProjectedReturns(input: RentalPropertyInput, initialResult: RentalPropertyResult): ProjectedReturns {
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

    private calculateBreakEvenAnalysis(
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

    // ---------------- Projections & sensitivity ----------------

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

    private performSensitivityAnalysis(input: RentalPropertyInput, baseResult: RentalPropertyResult): SensitivityAnalysis {
        const scenarios = [-10, -5, 0, 5, 10];
        const vacancyImpact = this.calculateVacancyScenarios(input, scenarios);
        const rentChangeImpact = this.calculateRentScenarios(input, scenarios);
        const interestRateImpact = this.calculateInterestRateScenarios(input, scenarios);
        const expenseChangeImpact = this.calculateExpenseScenarios(input, scenarios);
        return { vacancyImpact, rentChangeImpact, interestRateImpact, expenseChangeImpact };
    }

    private calculateVacancyScenarios(input: RentalPropertyInput, scenarios: number[]): SensitivityResult[] {
        return scenarios.map(change => {
            const adjustedInput: RentalPropertyInput = {
                ...input,
                expenses: {
                    ...input.expenses,
                    vacancyRate: (input.expenses.vacancyRate ?? DEFAULT_VACANCY_RATE) + change,
                },
            };
            const result = this.analyzeRentalProperty(adjustedInput);
            return { change, cashFlow: result.cashFlow.cashFlowMonthly, capRate: result.metrics.capRate, cashOnCash: result.metrics.cashOnCashReturn };
        });
    }

    private calculateRentScenarios(input: RentalPropertyInput, scenarios: number[]): SensitivityResult[] {
        return scenarios.map(change => {
            const adjustedInput: RentalPropertyInput = { ...input, monthlyRent: input.monthlyRent * (1 + change / PERCENT_TO_DECIMAL) };
            const result = this.analyzeRentalProperty(adjustedInput);
            return { change, cashFlow: result.cashFlow.cashFlowMonthly, capRate: result.metrics.capRate, cashOnCash: result.metrics.cashOnCashReturn };
        });
    }

    private calculateInterestRateScenarios(input: RentalPropertyInput, scenarios: number[]): SensitivityResult[] {
        return scenarios.map(change => {
            const baseRate = input.annualInterestRate;
            const adjustedInput: RentalPropertyInput = { ...input, annualInterestRate: baseRate * (1 + change / PERCENT_TO_DECIMAL) };
            const result = this.analyzeRentalProperty(adjustedInput);
            return { change, cashFlow: result.cashFlow.cashFlowMonthly, capRate: result.metrics.capRate, cashOnCash: result.metrics.cashOnCashReturn };
        });
    }

    private calculateExpenseScenarios(input: RentalPropertyInput, scenarios: number[]): SensitivityResult[] {
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
            const result = this.analyzeRentalProperty(adjustedInput);
            return { change, cashFlow: result.cashFlow.cashFlowMonthly, capRate: result.metrics.capRate, cashOnCash: result.metrics.cashOnCashReturn };
        });
    }

    // ---------------- Validation & core calcs ----------------

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
        percentageFields.forEach(({ name, value }) => {
            if (value !== undefined && (value < 0 || value > 100)) {
                throw new Error(`${name} must be between 0 and 100`);
            }
        });
    }

    private calculateOperatingExpenses(
        monthlyRent: number,
        effectiveMonthlyRent: number,
        propertyPrice: number,
        expenses: RentalPropertyExpenses,
        mortgageResult: MortgageCalculationResult
    ): OperatingExpenses {
        const vacancyLoss = monthlyRent - effectiveMonthlyRent;
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
            mortgageResult.homeInsurance
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

    private calculateCashFlow(
        grossRent: number,
        effectiveMonthlyRent: number,
        totalOperatingExpenses: number,
        mortgageResult: MortgageCalculationResult
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

    private calculateInvestmentMetrics(
        monthlyRent: number,
        propertyPrice: number,
        cashFlow: CashFlow,
        totalOperatingExpenses: number,
        mortgageResult: MortgageCalculationResult
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
        const breakEvenOccupancy = this.calculateBreakEvenOccupancy(totalOperatingExpenses, mortgageResult, annualRent);

        return {
            capRate: NumberUtils.roundToTwo(capRate),
            cashOnCashReturn: NumberUtils.roundToTwo(cashOnCashReturn),
            grossRentMultiplier: NumberUtils.roundToTwo(grossRentMultiplier),
            debtCoverageRatio: NumberUtils.roundToTwo(debtCoverageRatio),
            operatingExpenseRatio: NumberUtils.roundToTwo(operatingExpenseRatio),
            breakEvenOccupancy: NumberUtils.roundToTwo(breakEvenOccupancy),
        };
    }

    // ---------------- Utility calcs ----------------

    private sumOperatingExpenses(...expenses: number[]): number {
        return expenses.reduce((sum, expense) => sum + expense, 0);
    }

    private calculatePropertyManagement(monthlyRent: number, expenses: RentalPropertyExpenses): number {
        if (expenses.propertyManagementPercent !== undefined) {
            return (monthlyRent * expenses.propertyManagementPercent) / PERCENT_TO_DECIMAL;
        }
        if (expenses.propertyManagementFlat !== undefined) {
            return expenses.propertyManagementFlat;
        }
        return 0;
    }

    private calculateMaintenance(monthlyRent: number, propertyPrice: number, expenses: RentalPropertyExpenses): number {
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

    private calculateCapex(monthlyRent: number, propertyPrice: number, expenses: RentalPropertyExpenses): number {
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
        annualRent: number
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
        depreciationYears: number = DEFAULT_DEPRECIATION_YEARS
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
        loanAmount: number
    ): number {
        let totalPrincipalPaid = 0;
        let remainingBalance = loanAmount;
        const monthlyRate = annualInterestRate / PERCENT_TO_DECIMAL / MONTHS_PER_YEAR;

        for (let month = 1; month <= 12; month++) {
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
        currentEquity: number
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
        totalCashInvested: number
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

    private calculateMaintenanceReserveRatio(maintenanceExpense: number, capexExpense: number, grossRent: number): number {
        if (grossRent === 0) return 0;
        const totalReserves = (maintenanceExpense + capexExpense) * MONTHS_PER_YEAR;
        const annualRent = grossRent * MONTHS_PER_YEAR;
        return (totalReserves / annualRent) * PERCENT_TO_DECIMAL;
    }

    private annualToMonthly(annualAmount: number | undefined): number {
        return (annualAmount ?? 0) / MONTHS_PER_YEAR;
    }

    private calculateMonthlyPayment(principal: number, monthlyRate: number, numPayments: number): number {
        if (monthlyRate === 0) return principal / Math.max(numPayments, 1);
        const factor = Math.pow(1 + monthlyRate, numPayments);
        return (principal * monthlyRate * factor) / (factor - 1);
    }

    private approximateIRR(initialInvestment: number, finalValue: number, years: number): number {
        return (Math.pow(finalValue / Math.max(initialInvestment, 1e-9), 1 / Math.max(years, 1e-9)) - 1) * 100;
    }

    // ---------------- Metadata passthrough ----------------

    getRentalPropertyMetadata() {
        return RentalPropertyAnalysisMetadata.getAllMetadata();
    }
    getCashFlowMetadata(): RentalFieldMetadata[] {
        return RentalPropertyAnalysisMetadata.getCashFlowMetadata();
    }
    getMetricsMetadata(): RentalFieldMetadata[] {
        return RentalPropertyAnalysisMetadata.getMetricsMetadata();
    }
    getOperatingExpensesMetadata(): RentalFieldMetadata[] {
        return RentalPropertyAnalysisMetadata.getOperatingExpensesMetadata();
    }
    getIncomeMetadata(): RentalFieldMetadata[] {
        return RentalPropertyAnalysisMetadata.getIncomeMetadata();
    }
}
