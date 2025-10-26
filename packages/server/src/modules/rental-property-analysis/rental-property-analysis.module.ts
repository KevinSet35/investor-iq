import { Module } from '@nestjs/common';
import { RentalPropertyAnalysisService } from './services/rental-property-analysis.service';
import { RentalPropertyAnalysisController } from './rental-property-analysis.controller';
import { MortgageCalculationModule } from '../mortgage-calculation/mortgage-calculation.module';

@Module({
    imports: [MortgageCalculationModule],
    controllers: [RentalPropertyAnalysisController],
    providers: [RentalPropertyAnalysisService],
})
export class RentalPropertyAnalysisModule { }
