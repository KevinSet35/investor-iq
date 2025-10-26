# Quick Reference Guide

## 📦 File Organization

```
rental-property-analysis/
│
├── 📘 Documentation
│   ├── README.md                    # Full explanation
│   ├── ARCHITECTURE.md              # Visual diagrams
│   ├── INDEX.md                     # File index & stats
│   └── QUICK_REFERENCE.md          # This file
│
├── 🎯 Core Service (Main Entry Point)
│   └── rental-property-analysis.service.ts
│
├── 🔧 Specialized Services
│   ├── expense-calculator.service.ts
│   ├── metrics-calculator.service.ts
│   ├── projection-calculator.service.ts
│   └── strategy-analyzer.service.ts
│
└── 📋 Configuration & Types
    ├── rental-property-analysis.constants.ts
    └── rental-property-analysis.interfaces.ts
```

## 🗺️ Which File Contains What?

| Need to...                           | Go to this file                        |
|--------------------------------------|----------------------------------------|
| Start analysis                       | rental-property-analysis.service.ts    |
| Calculate expenses                   | expense-calculator.service.ts          |
| Calculate Cap Rate, CoC, ROI         | metrics-calculator.service.ts          |
| Project future returns               | projection-calculator.service.ts       |
| Analyze Fix & Flip                   | strategy-analyzer.service.ts           |
| Analyze BRRRR                        | strategy-analyzer.service.ts           |
| Change default values                | rental-property-analysis.constants.ts  |
| Add new interface                    | rental-property-analysis.interfaces.ts |

## 🔍 Finding Specific Calculations

### Expense Calculations
📁 **expense-calculator.service.ts**
- Vacancy
- Property Management
- Maintenance
- CapEx
- Utilities, Landscaping, etc.

### Core Metrics
📁 **metrics-calculator.service.ts**
- Cash Flow (NOI, Monthly/Annual)
- Cap Rate
- Cash-on-Cash Return
- Debt Coverage Ratio (DSCR)
- Operating Expense Ratio
- Gross Rent Multiplier
- Break-even Occupancy

### Advanced Metrics
📁 **metrics-calculator.service.ts**
- Total ROI
- Equity Buildup
- Depreciation & Tax Benefits
- After-tax Cash Flow
- Loan Constant
- Debt Yield

### Projections
📁 **projection-calculator.service.ts**
- Year 1, 5, 10 projections
- Exit analysis
- Break-even analysis
- Sensitivity scenarios:
  - Vacancy changes
  - Rent changes
  - Interest rate changes
  - Expense changes

### Investment Strategies
📁 **strategy-analyzer.service.ts**
- Fix & Flip
- BRRRR
- Wholesale
- Short-term Rental (Airbnb)
- House Hacking
- Commercial/Value-Add
- Syndication
- Hard Money Lending
- Land Development

## 🎨 Class Relationships

```
RentalPropertyAnalysisService
    ├─ uses ─► ExpenseCalculator
    ├─ uses ─► MetricsCalculator
    ├─ uses ─► ProjectionCalculator
    ├─ uses ─► StrategyAnalyzer
    └─ injects ─► MortgageCalculationService
```

## 📊 Complexity Breakdown

| Service                  | Complexity | Purpose                    |
|--------------------------|------------|----------------------------|
| Main Service             | High       | Orchestration              |
| Metrics Calculator       | High       | Complex calculations       |
| Strategy Analyzer        | High       | Multiple strategies        |
| Projection Calculator    | Medium     | Time-based projections     |
| Expense Calculator       | Low        | Simple calculations        |
| Constants                | None       | Configuration              |
| Interfaces               | None       | Type definitions           |

## 🚀 Common Tasks

### Add a New Expense Type
1. Add property to `RentalPropertyExpenses` interface
2. Add field to `OperatingExpenses` interface
3. Implement calculation in `ExpenseCalculator`
4. Update `sumOperatingExpenses()` in main service

### Add a New Metric
1. Add property to `EnhancedMetrics` interface
2. Implement calculation in `MetricsCalculator`
3. Call from `calculateEnhancedMetrics()`

### Add a New Strategy
1. Create input/result interfaces
2. Implement analysis in `StrategyAnalyzer`
3. Add public method in main service

### Modify a Constant
1. Edit value in `rental-property-analysis.constants.ts`
2. No other changes needed!

## 💻 Import Statements

```typescript
// Main service
import { RentalPropertyAnalysisService } from './rental-property-analysis.service';

// If you need types
import { 
  RentalPropertyInput, 
  RentalPropertyResult 
} from './rental-property-analysis.interfaces';

// If you need constants
import { 
  DEFAULT_VACANCY_RATE,
  MONTHS_PER_YEAR 
} from './rental-property-analysis.constants';
```

## 🧪 Testing Guide

### Unit Test Each Service
```typescript
// Test expense calculator independently
const expenseCalc = new ExpenseCalculator();
const expenses = expenseCalc.calculateOperatingExpenses(rent, price, expenseInput);

// Test metrics calculator independently  
const metricsCalc = new MetricsCalculator();
const metrics = metricsCalc.calculateCashFlow(rent, effectiveRent, expenses, mortgage);

// Test projections independently
const projectionCalc = new ProjectionCalculator();
const projections = projectionCalc.calculateProjectedReturns(input, result, analyzeFn);
```

## 📈 Code Metrics

- **Total Lines**: ~2,000
- **Average per Service**: 257 lines
- **Smallest File**: Constants (13 lines)
- **Largest File**: Main Service (416 lines)
- **Type Coverage**: 100% TypeScript

## ⚡ Performance Notes

- No performance changes - same algorithms
- Better for code splitting (tree shaking)
- Easier to lazy load specific strategies
- Better caching opportunities (service-level)

## 🎯 Best Practices Applied

✅ Single Responsibility Principle
✅ Dependency Injection  
✅ Separation of Concerns
✅ DRY (Don't Repeat Yourself)
✅ Clear Naming Conventions
✅ Type Safety (TypeScript)
✅ Comprehensive Documentation

---

**Pro Tip**: Start with INDEX.md for the big picture, then dive into specific services as needed!
