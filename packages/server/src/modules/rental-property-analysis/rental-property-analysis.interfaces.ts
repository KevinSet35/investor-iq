// ============================================================================
// INTERFACES (Rental domain)

import {
    FlexibleMortgageInput,
    MortgageCalculationResult,
} from '../mortgage-calculation/mortgage-calculation.interfaces';

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

// ============================================================================
// ADDITIONAL STRATEGY INTERFACES (Rental domain)
// ============================================================================
export interface FixAndFlipInput {
    purchasePrice: number;
    rehabCosts: number;
    holdingCosts: number;
    holdingMonths: number;
    arv: number;
    sellingCosts?: number;
    closingCosts?: number;
    financingCosts?: number;
}

export interface FixAndFlipResult {
    totalInvestment: number;
    projectedProfit: number;
    roi: number;
    annualizedReturn: number;
    breakEvenARV: number;
    breakEvenSellingCosts: number;
}

export interface BRRRRInput {
    purchasePrice: number;
    rehabCosts: number;
    arv: number;
    refinanceLTV: number;
    monthlyRent: number;
    holdingMonthsBeforeRefinance: number;
    closingCosts?: number;
    refinanceClosingCosts?: number;
    expenses: RentalPropertyExpenses;
    interestRateDuringRehab?: number;
    refinanceInterestRate: number;
    refinanceLoanTermYears: number;
}

export interface BRRRRResult {
    totalInvestment: number;
    arvEstimate: number;
    refinanceLoanAmount: number;
    cashRecovered: number;
    cashLeftIn: number;
    monthlyRentIncome: number;
    monthlyExpenses: number;
    monthlyCashFlow: number;
    infiniteReturn: boolean;
    cashOnCashReturn: number;
    capRate: number;
    equity: number;
}

export interface WholesaleInput {
    purchasePrice: number;
    repairEstimate: number;
    arv: number;
    assignmentFee: number;
    marketingCosts?: number;
    earnestMoney?: number;
}

export interface WholesaleResult {
    totalInvestment: number;
    netProfit: number;
    roi: number;
    buyerMaxPurchasePrice: number;
    wholesalePriceToSell: number;
}

export interface HouseHackingInput extends RentalPropertyInput {
    ownerOccupiedUnits: number;
    totalUnits: number;
}

export interface HouseHackingResult extends RentalPropertyResult {
    effectiveLivingCost: number;
    percentOfMortgageCovered: number;
    netHousingCost: number;
}

export interface ComparativeAnalysisInput {
    scenarios: RentalPropertyInput[];
    scenarioNames?: string[];
}

export interface ComparativeAnalysisResult {
    scenarios: RentalPropertyResult[];
    scenarioNames: string[];
    comparison: {
        bestCashFlow: number;
        bestCapRate: number;
        bestCashOnCash: number;
        bestTotalROI: number;
    };
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
// CONTROLLER-SPECIFIC INPUT/OUTPUT INTERFACES
// ============================================================================

export interface MaximumAllowableOfferInput {
    afterRepairValue: number;
    repairCosts: number;
    wholesaleFee?: number;
    profitMargin?: number;
}

export interface MaximumAllowableOfferResult {
    mao: number;
    potentialProfit: number;
    roi: number;
}

export interface WholesaleProfitInput {
    contractPrice: number;
    assignmentFee: number;
    marketingCosts?: number;
    otherCosts?: number;
}

export interface WholesaleProfitResult {
    grossProfit: number;
    netProfit: number;
    roi: number;
    endBuyerPrice: number;
}

export interface CommercialNOIInput {
    grossScheduledIncome: number;
    vacancyLoss: number;
    otherIncome: number;
    operatingExpenses: number;
    managementFees: number;
    reserves: number;
}

export interface CommercialNOIResult {
    noi: number;
}

export interface PrivateLendingInput {
    loanAmount: number;
    interestRate: number;
    termMonths: number;
    points: number;
    servicingFeeMonthly?: number;
}

export interface PrivateLendingResult {
    monthlyIncome: number;
    totalReturn: number;
    annualizedYield: number;
    totalPoints: number;
}

export interface LandDevelopmentInput {
    landCost: number;
    developmentCosts: number;
    softCosts: number;
    carryingCosts: number;
    numberOfLots: number;
    averageLotPrice: number;
    developmentTimeMonths: number;
}

export interface LandDevelopmentResult {
    totalCosts: number;
    grossRevenue: number;
    netProfit: number;
    profitMargin: number;
    profitPerLot: number;
    roi: number;
    annualizedROI: number;
}
