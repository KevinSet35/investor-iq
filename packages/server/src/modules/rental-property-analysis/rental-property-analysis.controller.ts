import { Controller, Post, Body } from '@nestjs/common';
import { RentalPropertyAnalysisService, RentalPropertyInput, RentalPropertyResult } from './rental-property-analysis.service';

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
}