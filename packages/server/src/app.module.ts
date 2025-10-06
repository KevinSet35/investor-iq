import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { MortgageCalculationModule } from './modules/mortgage-calculation/mortgage-calculation.module';
import { RentalPropertyAnalysisModule } from './modules/rental-property-analysis/rental-property-analysis.module';
import { PropertyInformationModule } from './modules/property-information/property-information.module';

@Module({
    imports: [
        UsersModule,
        MortgageCalculationModule,
        RentalPropertyAnalysisModule,
        PropertyInformationModule
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }
