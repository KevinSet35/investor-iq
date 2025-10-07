import { Controller, Post, Body } from '@nestjs/common';
import { FlexibleMortgageInput, MortgageCalculationResult, MortgageCalculationResultWithMetadata, MortgageCalculationService } from './mortgage-calculation.service';

@Controller('mortgage-calculation')
export class MortgageCalculationController {
    constructor(
        private readonly mortgageCalculationService: MortgageCalculationService,
    ) { }

    @Post()
    calculateMortgage(@Body() dto: FlexibleMortgageInput): MortgageCalculationResultWithMetadata {
        return this.mortgageCalculationService.calculateMortgageWithMetadata(dto);
    }

    @Post('with-schedule')
    calculateMortgageWithSchedule(@Body() dto: FlexibleMortgageInput): MortgageCalculationResultWithMetadata {
        return this.mortgageCalculationService.calculateMortgageWithScheduleAndMetadata(dto);
    }
}