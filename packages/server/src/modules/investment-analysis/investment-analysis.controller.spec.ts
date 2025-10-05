import { Test, TestingModule } from '@nestjs/testing';
import { InvestmentAnalysisController } from './investment-analysis.controller';
import { InvestmentAnalysisService } from './investment-analysis.service';

describe('InvestmentAnalysisController', () => {
  let controller: InvestmentAnalysisController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvestmentAnalysisController],
      providers: [InvestmentAnalysisService],
    }).compile();

    controller = module.get<InvestmentAnalysisController>(InvestmentAnalysisController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
