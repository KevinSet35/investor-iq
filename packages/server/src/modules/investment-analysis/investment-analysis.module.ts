import { Module } from '@nestjs/common';
import { InvestmentAnalysisService } from './investment-analysis.service';
import { InvestmentAnalysisController } from './investment-analysis.controller';

@Module({
  controllers: [InvestmentAnalysisController],
  providers: [InvestmentAnalysisService],
})
export class InvestmentAnalysisModule {}
