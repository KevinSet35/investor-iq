import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { InvestmentAnalysisModule } from './modules/investment-analysis/investment-analysis.module';

@Module({
    imports: [UsersModule, InvestmentAnalysisModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }
