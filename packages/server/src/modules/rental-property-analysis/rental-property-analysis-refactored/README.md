# Rental Property Analysis - Refactored Code Organization

This codebase has been reorganized into logical, maintainable classes following best practices for separation of concerns.

## File Structure

### 1. **rental-property-analysis.constants.ts**
Contains all constants and configuration values used throughout the application:
- Monthly/yearly conversion constants
- Default rates (vacancy, appreciation, rent growth, etc.)
- Depreciation and tax-related constants

### 2. **rental-property-analysis.interfaces.ts**
Defines all TypeScript interfaces and types:
- Core rental property interfaces (Input, Result, Expenses, etc.)
- Cash flow and metrics interfaces
- Strategy-specific interfaces (BRRRR, Fix & Flip, Wholesale, etc.)
- Projection and analysis interfaces

### 3. **expense-calculator.service.ts**
Handles all operating expense calculations:
- `calculateOperatingExpenses()` - Main method to compute all expenses
- Individual expense calculators:
  - `calculateVacancy()`
  - `calculatePropertyManagement()`
  - `calculateMaintenance()`
  - `calculateCapex()`
- Helper methods for annual-to-monthly conversions

### 4. **metrics-calculator.service.ts**
Handles all financial metrics calculations:
- `calculateCashFlow()` - Computes gross rent, NOI, and cash flow
- `calculateInvestmentMetrics()` - Calculates core metrics (Cap Rate, CoC, DSCR, etc.)
- `calculateEnhancedMetrics()` - Computes advanced metrics (ROI, equity buildup, tax benefits)
- `calculateInvestmentSummary()` - Creates investment summary report
- Individual metric calculators:
  - Cap rate, Cash-on-Cash return
  - Debt coverage ratio, Operating expense ratio
  - Loan constant, Debt yield
  - Tax calculations (depreciation, tax shelter value)
  - Equity calculations

### 5. **projection-calculator.service.ts**
Handles future projections and sensitivity analysis:
- `calculateProjectedReturns()` - Projects property performance over time
- `calculateBreakEvenAnalysis()` - Determines break-even points
- `performSensitivityAnalysis()` - Tests various scenarios:
  - Vacancy rate changes
  - Rent changes
  - Interest rate changes
  - Expense changes
- `projectReturns()` - Projects specific year performance
- Exit analysis calculations

### 6. **strategy-analyzer.service.ts**
Handles different real estate investment strategies:
- **Fix & Flip**: `calculateFixAndFlipAnalysis()`, `calculateMaximumAllowableOffer()`
- **BRRRR**: `calculateBRRRRAnalysis()`
- **Wholesale**: `calculateWholesaleProfit()`
- **Short-term Rentals**: `calculateAirbnbMetrics()`
- **Commercial**: `calculateCommercialNOI()`, `calculateValueAddPotential()`
- **Syndication**: `calculateSyndicationReturns()`
- **Hard Money**: `calculateHardMoneyLoan()`, `calculatePrivateLendingReturns()`
- **Development**: `calculateLandDevelopment()`
- **House Hacking**: `calculateHouseHackingMetrics()`
- **Comparative Analysis**: `compareScenarios()`

### 7. **rental-property-analysis.service.ts**
Main orchestrator service that coordinates all components:
- Initializes and manages all calculator services
- Provides main entry points:
  - `analyzeRentalProperty()`
  - `analyzeRentalPropertyWithSchedule()`
  - `analyzeRentalPropertyWithMetadata()`
- Delegates to specialized services:
  - Expense calculations → `ExpenseCalculator`
  - Metrics calculations → `MetricsCalculator`
  - Projections → `ProjectionCalculator`
  - Strategy analysis → `StrategyAnalyzer`
- Input validation
- Result aggregation

## Design Principles Applied

### Single Responsibility Principle
Each class has a single, well-defined responsibility:
- **ExpenseCalculator**: Only calculates expenses
- **MetricsCalculator**: Only calculates financial metrics
- **ProjectionCalculator**: Only handles projections and scenarios
- **StrategyAnalyzer**: Only analyzes investment strategies

### Separation of Concerns
- **Data**: Interfaces and types separated into their own file
- **Configuration**: Constants separated for easy maintenance
- **Business Logic**: Divided into focused, specialized services
- **Orchestration**: Main service coordinates but doesn't implement logic

### Dependencies
```
RentalPropertyAnalysisService (main orchestrator)
    ├── MortgageCalculationService (injected)
    ├── ExpenseCalculator (created internally)
    ├── MetricsCalculator (created internally)
    ├── ProjectionCalculator (created internally)
    └── StrategyAnalyzer (created internally)
```

## Usage

All public methods and interfaces remain unchanged. The refactoring is purely internal organization:

```typescript
// Example usage remains the same
const service = new RentalPropertyAnalysisService(mortgageService);
const result = service.analyzeRentalProperty(input);
```

## Benefits of This Organization

1. **Maintainability**: Each file focuses on one aspect of the domain
2. **Testability**: Each service can be unit tested independently
3. **Readability**: Easier to find and understand specific functionality
4. **Scalability**: New features can be added to the appropriate service
5. **Reusability**: Services can be reused in different contexts
6. **Debugging**: Easier to locate and fix issues

## Notes

- All original function names, variable names, and logic remain unchanged
- All calculations produce identical results to the original code
- The only changes are organizational structure and code location
