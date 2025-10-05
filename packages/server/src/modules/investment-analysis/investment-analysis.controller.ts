import { Controller, Post, Body } from '@nestjs/common';
import { InvestmentAnalysisService, MortgageCalculationInput, MortgageCalculationResult } from './investment-analysis.service';

@Controller('investment-analysis')
export class InvestmentAnalysisController {
    constructor(
        private readonly investmentAnalysisService: InvestmentAnalysisService,
    ) { }

    @Post('mortgage/calculate')
    calculateMortgage(@Body() dto: MortgageCalculationInput): MortgageCalculationResult {
        return this.investmentAnalysisService.calculateMortgage(dto);
    }
}