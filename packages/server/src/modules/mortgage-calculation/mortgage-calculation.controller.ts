import { Controller, Post, Body } from '@nestjs/common';
import { FlexibleMortgageInput, MortgageCalculationResult, MortgageCalculationService } from './mortgage-calculation.service';

@Controller('mortgage-calculation')
export class MortgageCalculationController {
    constructor(
        private readonly mortgageCalculationService: MortgageCalculationService,
    ) { }

    @Post()
    calculateMortgage(@Body() dto: FlexibleMortgageInput): MortgageCalculationResult {
        return this.mortgageCalculationService.calculateMortgageFlexible(dto);
    }

    @Post('with-schedule')
    calculateMortgageWithSchedule(@Body() dto: FlexibleMortgageInput): MortgageCalculationResult {
        return this.mortgageCalculationService.calculateMortgageWithScheduleFlexible(dto);
    }
}