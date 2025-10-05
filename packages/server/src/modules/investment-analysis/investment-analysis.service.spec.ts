import { Test, TestingModule } from '@nestjs/testing';
import { InvestmentAnalysisService } from './investment-analysis.service';

describe('InvestmentAnalysisService', () => {
  let service: InvestmentAnalysisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InvestmentAnalysisService],
    }).compile();

    service = module.get<InvestmentAnalysisService>(InvestmentAnalysisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
