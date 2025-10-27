import { Injectable } from '@nestjs/common';
import { NumberUtils } from '../../../common/utility/number.utils';
import {
    FixAndFlipInput,
    FixAndFlipResult,
    BRRRRInput,
    BRRRRResult,
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
    WholesaleInput,
    WholesaleResult,
    ComparativeAnalysisInput,
    ComparativeAnalysisResult,
    RentalPropertyResult,
} from '../rental-property-analysis.interfaces';
import { MONTHS_PER_YEAR } from '../rental-property-analysis.constants';

@Injectable()
export class StrategyAnalyzer {
    calculateMaximumAllowableOffer(
        afterRepairValue: number,
        repairCosts: number,
        wholesaleFee: number = 0,
        profitMargin: number = 70,
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
            (input.sellingCosts ?? 0) +
            (input.closingCosts ?? 0) +
            (input.financingCosts ?? 0);

        const netProfit = input.arv - totalInvestment;
        const roi = (netProfit / totalInvestment) * 100;
        const annualizedReturn = (roi / input.holdingMonths) * 12;

        const breakEvenARV = totalInvestment;
        const breakEvenSellingCosts = totalInvestment - (input.purchasePrice + input.rehabCosts + input.holdingCosts);

        return {
            totalInvestment: NumberUtils.roundToTwo(totalInvestment),
            projectedProfit: NumberUtils.roundToTwo(netProfit),
            roi: NumberUtils.roundToTwo(roi),
            annualizedReturn: NumberUtils.roundToTwo(annualizedReturn),
            breakEvenARV: NumberUtils.roundToTwo(breakEvenARV),
            breakEvenSellingCosts: NumberUtils.roundToTwo(breakEvenSellingCosts),
        };
    }

    calculateBRRRRAnalysis(input: BRRRRInput): BRRRRResult {
        const totalInvestment = input.purchasePrice + input.rehabCosts + (input.closingCosts ?? 0);

        const refinanceLoanAmount = input.arv * (input.refinanceLTV / 100);
        const refinanceClosingCosts = input.refinanceClosingCosts ?? 0;
        const cashRecovered = refinanceLoanAmount - totalInvestment - refinanceClosingCosts;
        const cashLeftIn = Math.max(0, -cashRecovered);

        const monthlyRate = input.refinanceInterestRate / 100 / MONTHS_PER_YEAR;
        const numPayments = input.refinanceLoanTermYears * MONTHS_PER_YEAR;
        const monthlyPayment = this.calculateMonthlyPayment(refinanceLoanAmount, monthlyRate, numPayments);

        const effectiveMonthlyRent = input.monthlyRent * (1 - (input.expenses.vacancyRate ?? 8) / 100);

        // Calculate expenses (simplified)
        let monthlyExpenses = 0;
        if (input.expenses.maintenancePercentOfRent) {
            monthlyExpenses += input.monthlyRent * (input.expenses.maintenancePercentOfRent / 100);
        }
        if (input.expenses.propertyManagementPercent) {
            monthlyExpenses += input.monthlyRent * (input.expenses.propertyManagementPercent / 100);
        }
        monthlyExpenses += input.expenses.utilitiesMonthly ?? 0;

        const monthlyCashFlow = effectiveMonthlyRent - monthlyExpenses - monthlyPayment;
        const infiniteReturn = cashLeftIn === 0 && monthlyCashFlow > 0;
        const cashOnCashReturn = cashLeftIn > 0 ? ((monthlyCashFlow * MONTHS_PER_YEAR) / cashLeftIn) * 100 : Infinity;

        const annualNOI = (effectiveMonthlyRent - monthlyExpenses) * MONTHS_PER_YEAR;
        const capRate = (annualNOI / input.arv) * 100;
        const equity = input.arv - refinanceLoanAmount;

        return {
            totalInvestment: NumberUtils.roundToTwo(totalInvestment),
            arvEstimate: NumberUtils.roundToTwo(input.arv),
            refinanceLoanAmount: NumberUtils.roundToTwo(refinanceLoanAmount),
            cashRecovered: NumberUtils.roundToTwo(cashRecovered),
            cashLeftIn: NumberUtils.roundToTwo(cashLeftIn),
            monthlyRentIncome: NumberUtils.roundToTwo(input.monthlyRent),
            monthlyExpenses: NumberUtils.roundToTwo(monthlyExpenses),
            monthlyCashFlow: NumberUtils.roundToTwo(monthlyCashFlow),
            infiniteReturn,
            cashOnCashReturn: NumberUtils.roundToTwo(cashOnCashReturn),
            capRate: NumberUtils.roundToTwo(capRate),
            equity: NumberUtils.roundToTwo(equity),
        };
    }

    calculateWholesaleProfit(input: WholesaleInput): WholesaleResult {
        const totalInvestment = (input.marketingCosts ?? 0) + (input.earnestMoney ?? 0);
        const netProfit = input.assignmentFee - totalInvestment;
        const roi = totalInvestment > 0 ? (netProfit / totalInvestment) * 100 : Infinity;

        const buyerMaxPurchasePrice = input.arv * 0.7 - input.repairEstimate;
        const wholesalePriceToSell = input.purchasePrice + input.assignmentFee;

        return {
            totalInvestment: NumberUtils.roundToTwo(totalInvestment),
            netProfit: NumberUtils.roundToTwo(netProfit),
            roi: NumberUtils.roundToTwo(roi),
            buyerMaxPurchasePrice: NumberUtils.roundToTwo(buyerMaxPurchasePrice),
            wholesalePriceToSell: NumberUtils.roundToTwo(wholesalePriceToSell),
        };
    }

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
        const annualNetIncome = netMonthlyIncome * MONTHS_PER_YEAR;
        const annualGrossRevenue = grossMonthlyRevenue * MONTHS_PER_YEAR;

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

        const lpTotalReturn =
            totalPrefPayments + lpCashFlowShare * input.holdPeriod + input.lpInvestment + lpProfitShare;
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

    calculateHardMoneyLoan(input: HardMoneyInput): HardMoneyResult {
        const pointsCost = input.loanAmount * (input.points / 100);
        const monthlyRate = input.interestRate / 100 / MONTHS_PER_YEAR;

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
        const effectiveRate = (totalCost / input.loanAmount / (input.termMonths / MONTHS_PER_YEAR)) * 100;

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
        const monthlyInterest = input.loanAmount * (input.interestRate / 100 / MONTHS_PER_YEAR);
        const monthlyIncome = monthlyInterest + (input.servicingFeeMonthly ?? 0);

        const totalReturn = totalPoints + monthlyIncome * input.termMonths + input.loanAmount;
        const annualizedYield =
            ((totalReturn - input.loanAmount) / input.loanAmount / (input.termMonths / MONTHS_PER_YEAR)) * 100;

        return {
            monthlyIncome: NumberUtils.roundToTwo(monthlyIncome),
            totalReturn: NumberUtils.roundToTwo(totalReturn),
            annualizedYield: NumberUtils.roundToTwo(annualizedYield),
            totalPoints: NumberUtils.roundToTwo(totalPoints),
        };
    }

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

    calculateHouseHackingMetrics(baseResult: RentalPropertyResult, input: HouseHackingInput): HouseHackingResult {
        const occupiedUnitValue = (input.monthlyRent / input.totalUnits) * input.ownerOccupiedUnits;
        const totalMonthlyPayment =
            baseResult.principalAndInterest +
            baseResult.propertyTax +
            baseResult.homeInsurance +
            baseResult.pmi +
            baseResult.hoa;
        const effectiveLivingCost = totalMonthlyPayment - baseResult.cashFlow.cashFlowMonthly;
        const percentOfMortgageCovered = (baseResult.cashFlow.effectiveRent / totalMonthlyPayment) * 100;
        const netHousingCost = effectiveLivingCost - occupiedUnitValue;

        return {
            ...baseResult,
            effectiveLivingCost: NumberUtils.roundToTwo(effectiveLivingCost),
            percentOfMortgageCovered: NumberUtils.roundToTwo(percentOfMortgageCovered),
            netHousingCost: NumberUtils.roundToTwo(netHousingCost),
        };
    }

    compareScenarios(
        input: ComparativeAnalysisInput,
        analyzeRentalPropertyFn: (input: any) => RentalPropertyResult,
    ): ComparativeAnalysisResult {
        const scenarios = input.scenarios.map((scenario) => analyzeRentalPropertyFn(scenario));
        const scenarioNames = input.scenarioNames ?? input.scenarios.map((_, i) => `Scenario ${i + 1}`);

        const cashFlows = scenarios.map((s) => s.cashFlow.cashFlowMonthly);
        const capRates = scenarios.map((s) => s.metrics.capRate);
        const cashOnCashReturns = scenarios.map((s) => s.metrics.cashOnCashReturn);
        const totalROIs = scenarios.map((s) => s.metrics.totalReturnOnInvestment);

        return {
            scenarios,
            scenarioNames,
            comparison: {
                bestCashFlow: Math.max(...cashFlows),
                bestCapRate: Math.max(...capRates),
                bestCashOnCash: Math.max(...cashOnCashReturns),
                bestTotalROI: Math.max(...totalROIs),
            },
        };
    }

    private calculateMonthlyPayment(principal: number, monthlyRate: number, numPayments: number): number {
        if (monthlyRate === 0) return principal / Math.max(numPayments, 1);
        const factor = Math.pow(1 + monthlyRate, numPayments);
        return (principal * monthlyRate * factor) / (factor - 1);
    }

    private approximateIRR(initialInvestment: number, finalValue: number, years: number): number {
        return (Math.pow(finalValue / Math.max(initialInvestment, 1e-9), 1 / Math.max(years, 1e-9)) - 1) * 100;
    }
}
