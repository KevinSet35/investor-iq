import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { MortgageCalculationModule } from './modules/mortgage-calculation/mortgage-calculation.module';
import { RentalPropertyAnalysisModule } from './modules/rental-property-analysis/rental-property-analysis.module';

@Module({
    imports: [UsersModule, MortgageCalculationModule, RentalPropertyAnalysisModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }
