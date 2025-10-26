import { Controller, Post, Body } from '@nestjs/common';
import { RentalPropertyAnalysisService } from './services/rental-property-analysis.service';
import {
    RentalPropertyInput,
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
    ComparativeAnalysisInput,
    ComparativeAnalysisResult,
    MaximumAllowableOfferInput,
    MaximumAllowableOfferResult,
    WholesaleProfitInput,
    WholesaleProfitResult,
    CommercialNOIInput,
    CommercialNOIResult,
    PrivateLendingInput,
    PrivateLendingResult,
    LandDevelopmentInput,
    LandDevelopmentResult,
    RentalPropertyResult
} from './rental-property-analysis.interfaces';

@Controller('rental-property-analysis')
export class RentalPropertyAnalysisController {
    constructor(
        private readonly rentalPropertyAnalysisService: RentalPropertyAnalysisService,
    ) { }

    /**
     * Analyze rental property with basic calculation (no amortization schedule)
     * POST /rental-property-analysis
     */
    @Post()
    analyzeRentalProperty(
        @Body() input: RentalPropertyInput
    ): RentalPropertyResult {
        return this.rentalPropertyAnalysisService.analyzeRentalProperty(input);
    }

    /**
     * Analyze rental property with full amortization schedule
     * POST /rental-property-analysis/with-schedule
     */
    @Post('with-schedule')
    analyzeRentalPropertyWithSchedule(
        @Body() input: RentalPropertyInput
    ): RentalPropertyResult {
        return this.rentalPropertyAnalysisService.analyzeRentalPropertyWithSchedule(input);
    }

    /**
     * Calculate Maximum Allowable Offer (MAO) for fix and flip
     * POST /rental-property-analysis/mao
     */
    @Post('mao')
    calculateMaximumAllowableOffer(
        @Body() input: MaximumAllowableOfferInput
    ): MaximumAllowableOfferResult {
        return this.rentalPropertyAnalysisService.calculateMaximumAllowableOffer(
            input.afterRepairValue,
            input.repairCosts,
            input.wholesaleFee ?? 0,
            input.profitMargin ?? 70
        );
    }

    /**
     * Analyze Fix and Flip investment strategy
     * POST /rental-property-analysis/fix-and-flip
     */
    @Post('fix-and-flip')
    calculateFixAndFlipAnalysis(
        @Body() input: FixAndFlipInput
    ): FixAndFlipResult {
        return this.rentalPropertyAnalysisService.calculateFixAndFlipAnalysis(input);
    }

    /**
     * Analyze BRRRR (Buy, Rehab, Rent, Refinance, Repeat) strategy
     * POST /rental-property-analysis/brrrr
     */
    @Post('brrrr')
    calculateBRRRRAnalysis(
        @Body() input: BRRRRInput
    ): BRRRRResult {
        return this.rentalPropertyAnalysisService.calculateBRRRRAnalysis(input);
    }

    /**
     * Calculate wholesale profit analysis
     * POST /rental-property-analysis/wholesale
     */
    @Post('wholesale')
    calculateWholesaleProfit(
        @Body() input: WholesaleProfitInput
    ): WholesaleProfitResult {
        return this.rentalPropertyAnalysisService.calculateWholesaleProfit(
            input.contractPrice,
            input.assignmentFee,
            input.marketingCosts ?? 0,
            input.otherCosts ?? 0
        );
    }

    /**
     * Analyze Airbnb / Short-term rental metrics
     * POST /rental-property-analysis/airbnb
     */
    @Post('airbnb')
    calculateAirbnbMetrics(
        @Body() input: AirbnbInput
    ): ShortTermRentalResult {
        return this.rentalPropertyAnalysisService.calculateAirbnbMetrics(input);
    }

    /**
     * Calculate commercial property Net Operating Income
     * POST /rental-property-analysis/commercial-noi
     */
    @Post('commercial-noi')
    calculateCommercialNOI(
        @Body() input: CommercialNOIInput
    ): CommercialNOIResult {
        const noi = this.rentalPropertyAnalysisService.calculateCommercialNOI(input);
        return { noi };
    }

    /**
     * Analyze value-add investment potential
     * POST /rental-property-analysis/value-add
     */
    @Post('value-add')
    calculateValueAddPotential(
        @Body() input: ValueAddInput
    ): ValueAddResult {
        return this.rentalPropertyAnalysisService.calculateValueAddPotential(input);
    }

    /**
     * Calculate syndication returns for LP and GP
     * POST /rental-property-analysis/syndication
     */
    @Post('syndication')
    calculateSyndicationReturns(
        @Body() input: SyndicationInput
    ): SyndicationResult {
        return this.rentalPropertyAnalysisService.calculateSyndicationReturns(input);
    }

    /**
     * Calculate hard money loan costs and payments
     * POST /rental-property-analysis/hard-money
     */
    @Post('hard-money')
    calculateHardMoneyLoan(
        @Body() input: HardMoneyInput
    ): HardMoneyResult {
        return this.rentalPropertyAnalysisService.calculateHardMoneyLoan(input);
    }

    /**
     * Calculate private lending returns
     * POST /rental-property-analysis/private-lending
     */
    @Post('private-lending')
    calculatePrivateLendingReturns(
        @Body() input: PrivateLendingInput
    ): PrivateLendingResult {
        return this.rentalPropertyAnalysisService.calculatePrivateLendingReturns(input);
    }

    /**
     * Calculate land development profitability
     * POST /rental-property-analysis/land-development
     */
    @Post('land-development')
    calculateLandDevelopment(
        @Body() input: LandDevelopmentInput
    ): LandDevelopmentResult {
        return this.rentalPropertyAnalysisService.calculateLandDevelopment(input);
    }

    /**
     * Analyze house hacking strategy
     * POST /rental-property-analysis/house-hacking
     */
    @Post('house-hacking')
    calculateHouseHacking(
        @Body() input: HouseHackingInput
    ): HouseHackingResult {
        return this.rentalPropertyAnalysisService.calculateHouseHacking(input);
    }

    /**
     * Compare multiple rental property scenarios
     * POST /rental-property-analysis/compare
     */
    @Post('compare')
    compareScenarios(
        @Body() input: ComparativeAnalysisInput
    ): ComparativeAnalysisResult {
        return this.rentalPropertyAnalysisService.compareScenarios(input);
    }
}