import { Controller, Post, Body } from '@nestjs/common';
import {
    MortgageCalculationService,
} from './mortgage-calculation.service';
import { AffordabilityInput, AffordabilityResult, FlexibleMortgageInput, MortgageCalculationResult } from './mortgage-calculation.interfaces';

@Controller('mortgage-calculation')
export class MortgageCalculationController {
    constructor(
        private readonly mortgageCalculationService: MortgageCalculationService,
    ) { }

    /**
     * Calculate mortgage payment with flexible input options
     * POST /mortgage-calculation
     */
    @Post()
    calculateMortgage(@Body() input: FlexibleMortgageInput): MortgageCalculationResult {
        return this.mortgageCalculationService.calculateMortgageFlexible(input);
    }

    /**
     * Calculate mortgage with full amortization schedule
     * POST /mortgage-calculation/with-schedule
     */
    @Post('with-schedule')
    calculateMortgageWithSchedule(@Body() input: FlexibleMortgageInput): MortgageCalculationResult {
        return this.mortgageCalculationService.calculateMortgageWithScheduleFlexible(input);
    }

    /**
     * Calculate affordable property price based on maximum monthly payment
     * POST /mortgage-calculation/affordability
     */
    @Post('affordability')
    calculateAffordableProperty(@Body() input: AffordabilityInput): AffordabilityResult {
        return this.mortgageCalculationService.calculateAffordableProperty(
            input.maxMonthlyPayment,
            input.annualInterestRate,
            input.loanTermYears,
            input.downPaymentPercentage,
            input.propertyTaxRate,
            input.homeInsuranceAnnual,
            input.hoaMonthly
        );
    }
}