import { Injectable } from '@nestjs/common';
import { NumberUtils } from '../../../common/utility/number.utils';
import { MortgageCalculationService } from '../../mortgage-calculation/mortgage-calculation.service';
import {
    RentalPropertyInput,
    RentalPropertyResult,
    RentalPropertyExpenses,
    OperatingExpenses,
    EnhancedMetrics,
    FixAndFlipInput,
    FixAndFlipResult,
    BRRRRInput,
    BRRRRResult,
    WholesaleInput,
    AirbnbInput,
    ShortTermRentalResult,
    ValueAddInput,
    ValueAddResult,
    SyndicationInput,
    SyndicationResult,
    HardMoneyInput,
    HardMoneyResult,
    HouseHackingInput,
    HouseHackingResult,
    ComparativeAnalysisInput,
    ComparativeAnalysisResult,
    MaximumAllowableOfferInput,
    WholesaleProfitInput,
    WholesaleProfitResult,
    MaximumAllowableOfferResult,
    CommercialNOIInput,
    PrivateLendingResult,
    LandDevelopmentResult,
} from '../rental-property-analysis.interfaces';
import { PERCENT_TO_DECIMAL, DEFAULT_VACANCY_RATE, DEFAULT_PROFIT_MARGIN } from '../rental-property-analysis.constants';
import { ExpenseCalculator } from './expense-calculator.service';
import { MetricsCalculator } from './metrics-calculator.service';
import { ProjectionCalculator } from './projection-calculator.service';
import { StrategyAnalyzer } from './strategy-analyzer.service';
import { MortgageCalculationResult } from '@/modules/mortgage-calculation/mortgage-calculation.interfaces';

// ============================================================================
// SERVICE (rental analysis depends on mortgage service)
// ============================================================================
@Injectable()
export class RentalPropertyAnalysisService {
    private readonly expenseCalculator: ExpenseCalculator;
    private readonly metricsCalculator: MetricsCalculator;
    private readonly projectionCalculator: ProjectionCalculator;
    private readonly strategyAnalyzer: StrategyAnalyzer;

    constructor(private readonly mortgageService: MortgageCalculationService) {
        this.expenseCalculator = new ExpenseCalculator();
        this.metricsCalculator = new MetricsCalculator();
        this.projectionCalculator = new ProjectionCalculator();
        this.strategyAnalyzer = new StrategyAnalyzer();
    }

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

    // ---------------- Fix & Flip ----------------

    calculateMaximumAllowableOffer(
        input: MaximumAllowableOfferInput
    ): MaximumAllowableOfferResult {
        return this.strategyAnalyzer.calculateMaximumAllowableOffer(
            input.afterRepairValue,
            input.repairCosts,
            input.wholesaleFee ?? 0,
            input.profitMargin ?? DEFAULT_PROFIT_MARGIN,
        );
    }

    calculateFixAndFlipAnalysis(input: FixAndFlipInput): FixAndFlipResult {
        return this.strategyAnalyzer.calculateFixAndFlipAnalysis(input);
    }

    // ---------------- BRRRR ----------------

    calculateBRRRRAnalysis(input: BRRRRInput): BRRRRResult {
        return this.strategyAnalyzer.calculateBRRRRAnalysis(input);
    }

    // ---------------- Wholesale ----------------

    calculateWholesaleProfit(
        input: WholesaleProfitInput
    ): WholesaleProfitResult {

        const contractPrice = input.contractPrice;
        const assignmentFee = input.assignmentFee;
        const marketingCosts = input.marketingCosts ?? 0;
        const otherCosts = input.otherCosts ?? 0;

        const wholesaleInput: WholesaleInput = {
            purchasePrice: contractPrice,
            repairEstimate: 0,
            arv: 0,
            assignmentFee,
            marketingCosts,
            earnestMoney: otherCosts,
        };
        const result = this.strategyAnalyzer.calculateWholesaleProfit(wholesaleInput);
        return {
            grossProfit: assignmentFee,
            netProfit: result.netProfit,
            roi: result.roi,
            endBuyerPrice: result.wholesalePriceToSell,
        };
    }

    // ---------------- Short-term rental ----------------

    calculateAirbnbMetrics(input: AirbnbInput): ShortTermRentalResult {
        return this.strategyAnalyzer.calculateAirbnbMetrics(input);
    }

    // ---------------- Commercial / Value-Add ----------------

    calculateCommercialNOI(input: CommercialNOIInput): number {
        return this.strategyAnalyzer.calculateCommercialNOI(input);
    }

    calculateValueAddPotential(input: ValueAddInput): ValueAddResult {
        return this.strategyAnalyzer.calculateValueAddPotential(input);
    }

    // ---------------- Syndication ----------------

    calculateSyndicationReturns(input: SyndicationInput): SyndicationResult {
        return this.strategyAnalyzer.calculateSyndicationReturns(input);
    }

    // ---------------- Hard money & lending ----------------

    calculateHardMoneyLoan(input: HardMoneyInput): HardMoneyResult {
        return this.strategyAnalyzer.calculateHardMoneyLoan(input);
    }

    calculatePrivateLendingReturns(input: {
        loanAmount: number;
        interestRate: number;
        termMonths: number;
        points: number;
        servicingFeeMonthly?: number;
    }): PrivateLendingResult {
        return this.strategyAnalyzer.calculatePrivateLendingReturns(input);
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
    }): LandDevelopmentResult{
        return this.strategyAnalyzer.calculateLandDevelopment(input);
    }

    // ---------------- House Hacking ----------------

    calculateHouseHacking(input: HouseHackingInput): HouseHackingResult {
        const baseResult = this.analyzeRentalProperty(input);
        return this.strategyAnalyzer.calculateHouseHackingMetrics(baseResult, input);
    }

    // ---------------- Comparative Analysis ----------------

    compareScenarios(input: ComparativeAnalysisInput): ComparativeAnalysisResult {
        return this.strategyAnalyzer.compareScenarios(input, (scenario) => this.analyzeRentalProperty(scenario));
    }

    // ---------------- Enhanced metrics & builders ----------------

    private buildEnhancedRentalPropertyResult(
        input: RentalPropertyInput,
        mortgageResult: MortgageCalculationResult,
    ): RentalPropertyResult {
        const baseResult = this.buildRentalPropertyResult(input, mortgageResult);
        const enhancedMetrics = this.metricsCalculator.calculateEnhancedMetrics(
            input,
            baseResult.metrics,
            baseResult.cashFlow,
            baseResult.operatingExpenses,
            mortgageResult,
        );

        const investmentSummary = this.metricsCalculator.calculateInvestmentSummary(
            input,
            baseResult.cashFlow,
            enhancedMetrics.totalReturnOnInvestment,
            mortgageResult,
        );

        const projectedReturns = input.holdingPeriodYears
            ? this.projectionCalculator.calculateProjectedReturns(input, baseResult, (inp) =>
                this.analyzeRentalProperty(inp),
            )
            : undefined;

        const breakEvenAnalysis = this.projectionCalculator.calculateBreakEvenAnalysis(
            input,
            baseResult,
            mortgageResult,
        );

        const sensitivityAnalysis = this.projectionCalculator.performSensitivityAnalysis(input, baseResult, (inp) =>
            this.analyzeRentalProperty(inp),
        );

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
        mortgageResult: MortgageCalculationResult,
    ): RentalPropertyResult {
        const vacancyRate = input.expenses.vacancyRate ?? DEFAULT_VACANCY_RATE;
        const vacancyLoss = (input.monthlyRent * vacancyRate) / PERCENT_TO_DECIMAL;
        const effectiveMonthlyRent = input.monthlyRent - vacancyLoss;

        const operatingExpenses = this.calculateOperatingExpenses(
            input.monthlyRent,
            effectiveMonthlyRent,
            input.propertyPrice,
            input.expenses,
            mortgageResult,
        );

        const cashFlow = this.metricsCalculator.calculateCashFlow(
            input.monthlyRent,
            effectiveMonthlyRent,
            operatingExpenses.totalMonthly,
            mortgageResult,
        );

        const metrics = this.metricsCalculator.calculateInvestmentMetrics(
            input.monthlyRent,
            input.propertyPrice,
            cashFlow,
            operatingExpenses.totalMonthly,
            mortgageResult,
        );

        return {
            ...mortgageResult,
            monthlyRent: NumberUtils.roundToTwo(input.monthlyRent),
            effectiveMonthlyRent: NumberUtils.roundToTwo(effectiveMonthlyRent),
            operatingExpenses,
            cashFlow,
            metrics: metrics as EnhancedMetrics,
        };
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
        mortgageResult: MortgageCalculationResult,
    ): OperatingExpenses {
        const vacancyLoss = monthlyRent - effectiveMonthlyRent;

        const baseExpenses = this.expenseCalculator.calculateOperatingExpenses(monthlyRent, propertyPrice, expenses);

        const totalOperatingExpenses = this.sumOperatingExpenses(
            baseExpenses.propertyManagement,
            baseExpenses.maintenance,
            baseExpenses.capex,
            baseExpenses.utilities,
            baseExpenses.landscaping,
            baseExpenses.pestControl,
            baseExpenses.legalFees,
            baseExpenses.landlordInsurance,
            baseExpenses.specialAssessments,
            baseExpenses.advertising,
            baseExpenses.turnover,
            mortgageResult.propertyTax,
            mortgageResult.homeInsurance,
        );

        return {
            vacancy: NumberUtils.roundToTwo(vacancyLoss),
            propertyManagement: baseExpenses.propertyManagement,
            maintenance: baseExpenses.maintenance,
            capex: baseExpenses.capex,
            utilities: baseExpenses.utilities,
            landscaping: baseExpenses.landscaping,
            pestControl: baseExpenses.pestControl,
            legalFees: baseExpenses.legalFees,
            landlordInsurance: baseExpenses.landlordInsurance,
            specialAssessments: baseExpenses.specialAssessments,
            advertising: baseExpenses.advertising,
            turnover: baseExpenses.turnover,
            totalMonthly: NumberUtils.roundToTwo(totalOperatingExpenses),
        };
    }

    private sumOperatingExpenses(
        propertyManagement: number,
        maintenance: number,
        capex: number,
        utilities: number,
        landscaping: number,
        pestControl: number,
        legalFees: number,
        landlordInsurance: number,
        specialAssessments: number,
        advertising: number,
        turnover: number,
        propertyTax: number,
        homeInsurance: number,
    ): number {
        return (
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
            propertyTax +
            homeInsurance
        );
    }
}
