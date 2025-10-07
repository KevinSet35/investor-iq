import { FieldMetadata } from "../mortgage-calculation/mortgage-calculation.metadata";
import { RentalPropertyMetadata } from "./rental-property-analysis.service";

/**
 * Metadata describing a rental property result field
 * Extends the base FieldMetadata with rental-specific categories
 */
export interface RentalFieldMetadata extends FieldMetadata {
    /** Category for grouping related fields */
    category?: 'cash_flow' | 'metrics' | 'expenses' | 'income';
}

/**
 * Metadata service for rental property analysis fields
 */
export class RentalPropertyAnalysisMetadata {
    /**
     * Get metadata for cash flow fields
     */
    static getCashFlowMetadata(): RentalFieldMetadata[] {
        return [
            {
                key: 'grossRent',
                description: 'Total gross monthly rent before any deductions',
                unit: 'dollars',
                format: 'currency',
                category: 'cash_flow',
            },
            {
                key: 'effectiveRent',
                description: 'Effective monthly rent after accounting for vacancy rate',
                unit: 'dollars',
                format: 'currency',
                category: 'cash_flow',
            },
            {
                key: 'totalExpenses',
                description: 'Total monthly expenses including operating expenses and debt service',
                unit: 'dollars',
                format: 'currency',
                category: 'cash_flow',
            },
            {
                key: 'netOperatingIncome',
                description: 'Net Operating Income (NOI) - income before debt service. Key metric for property valuation',
                unit: 'dollars',
                format: 'currency',
                category: 'cash_flow',
            },
            {
                key: 'cashFlowMonthly',
                description: 'Monthly cash flow after all expenses and debt service. Positive value indicates profit',
                unit: 'dollars',
                format: 'currency',
                category: 'cash_flow',
            },
            {
                key: 'cashFlowAnnual',
                description: 'Annual cash flow (monthly cash flow × 12)',
                unit: 'dollars',
                format: 'currency',
                category: 'cash_flow',
            },
        ];
    }

    /**
     * Get metadata for investment metrics
     */
    static getMetricsMetadata(): RentalFieldMetadata[] {
        return [
            {
                key: 'capRate',
                description: 'Capitalization Rate - return on investment based on NOI. Higher values indicate better returns (typically 4-10%)',
                unit: 'percent',
                format: 'percentage',
                category: 'metrics',
            },
            {
                key: 'cashOnCashReturn',
                description: 'Cash-on-Cash Return - return based on actual cash invested (down payment). Measures ROI on cash invested',
                unit: 'percent',
                format: 'percentage',
                category: 'metrics',
            },
            {
                key: 'grossRentMultiplier',
                description: 'Gross Rent Multiplier - property price relative to gross rent. Lower values indicate better value (typically 4-7)',
                unit: 'ratio',
                format: 'ratio',
                category: 'metrics',
            },
            {
                key: 'debtCoverageRatio',
                description: 'Debt Service Coverage Ratio - ability to cover debt payments. Lenders typically require 1.25 or higher',
                unit: 'ratio',
                format: 'ratio',
                category: 'metrics',
            },
            {
                key: 'operatingExpenseRatio',
                description: 'Operating Expense Ratio - percentage of income spent on operations. Lower is better (typically 35-45%)',
                unit: 'percent',
                format: 'percentage',
                category: 'metrics',
            },
            {
                key: 'breakEvenOccupancy',
                description: 'Break-Even Occupancy - minimum occupancy rate to cover all expenses. Lower is better',
                unit: 'percent',
                format: 'percentage',
                category: 'metrics',
            },
        ];
    }

    /**
     * Get metadata for operating expenses
     */
    static getOperatingExpensesMetadata(): RentalFieldMetadata[] {
        return [
            {
                key: 'vacancy',
                description: 'Monthly vacancy loss based on vacancy rate. Represents expected lost income when unit is unoccupied',
                unit: 'dollars',
                format: 'currency',
                category: 'expenses',
            },
            {
                key: 'propertyManagement',
                description: 'Monthly property management fee. Can be percentage of rent or flat monthly fee',
                unit: 'dollars',
                format: 'currency',
                category: 'expenses',
            },
            {
                key: 'maintenance',
                description: 'Monthly maintenance and repair costs. Can be based on annual amount, percentage of rent, or percentage of property value',
                unit: 'dollars',
                format: 'currency',
                category: 'expenses',
            },
            {
                key: 'capex',
                description: 'Monthly capital expenditure (CapEx) reserve for major repairs and replacements (roof, HVAC, appliances)',
                unit: 'dollars',
                format: 'currency',
                category: 'expenses',
            },
            {
                key: 'utilities',
                description: 'Monthly utilities cost if paid by landlord',
                unit: 'dollars',
                format: 'currency',
                category: 'expenses',
            },
            {
                key: 'landscaping',
                description: 'Monthly landscaping and lawn care costs',
                unit: 'dollars',
                format: 'currency',
                category: 'expenses',
            },
            {
                key: 'pestControl',
                description: 'Monthly pest control service costs',
                unit: 'dollars',
                format: 'currency',
                category: 'expenses',
            },
            {
                key: 'legalFees',
                description: 'Monthly legal fees for lease preparation, evictions, and legal consultations',
                unit: 'dollars',
                format: 'currency',
                category: 'expenses',
            },
            {
                key: 'landlordInsurance',
                description: 'Monthly landlord insurance premium. Separate from homeowner\'s insurance, covers rental-specific risks',
                unit: 'dollars',
                format: 'currency',
                category: 'expenses',
            },
            {
                key: 'specialAssessments',
                description: 'Monthly special assessments for major building improvements',
                unit: 'dollars',
                format: 'currency',
                category: 'expenses',
            },
            {
                key: 'advertising',
                description: 'Monthly advertising and marketing costs to find and screen new tenants',
                unit: 'dollars',
                format: 'currency',
                category: 'expenses',
            },
            {
                key: 'turnover',
                description: 'Monthly turnover costs for tenant turnover (cleaning, painting, repairs)',
                unit: 'dollars',
                format: 'currency',
                category: 'expenses',
            },
            {
                key: 'totalMonthly',
                description: 'Total monthly operating expenses (sum of all expense categories). Does NOT include debt service',
                unit: 'dollars',
                format: 'currency',
                category: 'expenses',
            },
        ];
    }

    /**
     * Get metadata for rental-specific income fields
     */
    static getIncomeMetadata(): RentalFieldMetadata[] {
        return [
            {
                key: 'monthlyRent',
                description: 'Monthly gross rent (before vacancy deduction)',
                unit: 'dollars',
                format: 'currency',
                category: 'income',
            },
            {
                key: 'effectiveMonthlyRent',
                description: 'Effective monthly rent after accounting for vacancy',
                unit: 'dollars',
                format: 'currency',
                category: 'income',
            },
        ];
    }

    /**
     * Get all rental property metadata organized by category
     */
    static getAllMetadata(): RentalPropertyMetadata {
        return {
            income: this.getIncomeMetadata(),
            cashFlow: this.getCashFlowMetadata(),
            metrics: this.getMetricsMetadata(),
            operatingExpenses: this.getOperatingExpensesMetadata(),
        };
    }

}