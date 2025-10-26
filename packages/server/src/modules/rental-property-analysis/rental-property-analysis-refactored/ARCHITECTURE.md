# Architecture Overview

## Class Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                                                               │
│           RentalPropertyAnalysisService                       │
│           (Main Orchestrator)                                 │
│                                                               │
│   Public API:                                                 │
│   - analyzeRentalProperty()                                   │
│   - analyzeRentalPropertyWithSchedule()                       │
│   - calculateFixAndFlipAnalysis()                             │
│   - calculateBRRRRAnalysis()                                  │
│   - calculateAirbnbMetrics()                                  │
│   - compareScenarios()                                        │
│   - ... and more                                              │
│                                                               │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    │ orchestrates
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
┌──────────────┐        ┌─────────────────────┐
│  Mortgage    │        │  Internal Services  │
│  Calculation │        │                     │
│  Service     │        │  (created by main)  │
│              │        │                     │
│  (injected)  │        └──────────┬──────────┘
└──────────────┘                   │
                                   │
                 ┌─────────────────┼─────────────────┐
                 │                 │                 │
                 ▼                 ▼                 ▼
        ┌─────────────────┐ ┌──────────────┐ ┌──────────────┐
        │   Expense       │ │   Metrics    │ │  Projection  │
        │   Calculator    │ │  Calculator  │ │  Calculator  │
        │                 │ │              │ │              │
        │ • Vacancy       │ │ • Cap Rate   │ │ • Year 1-10  │
        │ • Management    │ │ • CoC Return │ │ • Break-even │
        │ • Maintenance   │ │ • DSCR       │ │ • Scenarios  │
        │ • CapEx         │ │ • NOI        │ │ • Exit       │
        │ • Utilities     │ │ • Equity     │ │              │
        └─────────────────┘ └──────────────┘ └──────────────┘
                 │
                 │
                 ▼
        ┌─────────────────┐
        │   Strategy      │
        │   Analyzer      │
        │                 │
        │ • Fix & Flip    │
        │ • BRRRR         │
        │ • Wholesale     │
        │ • STR/Airbnb    │
        │ • Syndication   │
        │ • House Hack    │
        │ • Commercial    │
        └─────────────────┘
```

## Data Flow

```
Input
  │
  │ validates
  ▼
RentalPropertyAnalysisService
  │
  ├─► MortgageCalculationService ──► Mortgage Details
  │
  ├─► ExpenseCalculator ──┐
  │                       │
  ├─► MetricsCalculator ──┼─► Combine Results
  │                       │
  ├─► ProjectionCalculator┤
  │                       │
  └─► StrategyAnalyzer ───┘
                          │
                          ▼
                    RentalPropertyResult
                          │
                          ▼
                       Output
```

## File Dependencies

```
rental-property-analysis.service.ts
    │
    ├─► imports: rental-property-analysis.interfaces.ts
    ├─► imports: rental-property-analysis.constants.ts
    ├─► imports: expense-calculator.service.ts
    ├─► imports: metrics-calculator.service.ts
    ├─► imports: projection-calculator.service.ts
    ├─► imports: strategy-analyzer.service.ts
    └─► injects: MortgageCalculationService

expense-calculator.service.ts
    ├─► imports: rental-property-analysis.interfaces.ts
    └─► imports: rental-property-analysis.constants.ts

metrics-calculator.service.ts
    ├─► imports: rental-property-analysis.interfaces.ts
    └─► imports: rental-property-analysis.constants.ts

projection-calculator.service.ts
    ├─► imports: rental-property-analysis.interfaces.ts
    └─► imports: rental-property-analysis.constants.ts

strategy-analyzer.service.ts
    ├─► imports: rental-property-analysis.interfaces.ts
    └─► imports: rental-property-analysis.constants.ts

rental-property-analysis.interfaces.ts
    └─► imports: MortgageCalculationResult (external)

rental-property-analysis.constants.ts
    └─► (no dependencies - pure constants)
```

## Responsibility Matrix

| Class                          | Responsibility                                    | Key Methods                                              |
|--------------------------------|--------------------------------------------------|----------------------------------------------------------|
| **RentalPropertyAnalysisService** | Orchestrate analysis, validate input, aggregate results | analyzeRentalProperty(), buildEnhancedResult()          |
| **ExpenseCalculator**          | Calculate all operating expenses                 | calculateOperatingExpenses(), calculateVacancy()        |
| **MetricsCalculator**          | Calculate financial metrics                      | calculateCashFlow(), calculateCapRate(), calculateROI() |
| **ProjectionCalculator**       | Project future performance                       | projectReturns(), performSensitivityAnalysis()          |
| **StrategyAnalyzer**           | Analyze investment strategies                    | calculateBRRRR(), calculateFixAndFlip(), etc.           |

## Benefits Summary

### Before (Single 1426-line file):
- ❌ Hard to navigate
- ❌ Difficult to test specific functionality
- ❌ High cognitive load
- ❌ Changes affect entire file
- ❌ Merge conflicts more likely

### After (7 focused files):
- ✅ Easy to find specific functionality
- ✅ Independent unit testing
- ✅ Lower cognitive load per file
- ✅ Changes isolated to relevant class
- ✅ Parallel development possible
- ✅ Clear separation of concerns
