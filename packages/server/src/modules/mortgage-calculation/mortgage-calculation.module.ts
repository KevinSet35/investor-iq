import { Module } from '@nestjs/common';
import { MortgageCalculationController } from './mortgage-calculation.controller';
import { MortgageCalculationService } from './mortgage-calculation.service';

@Module({
    controllers: [MortgageCalculationController],
    providers: [MortgageCalculationService],
    exports: [MortgageCalculationService],
})
export class MortgageCalculationModule {}
