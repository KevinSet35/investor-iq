import { Injectable } from '@nestjs/common';
import { RentalPropertyExpenses, OperatingExpenses } from '../rental-property-analysis.interfaces';
import { MONTHS_PER_YEAR, PERCENT_TO_DECIMAL, DEFAULT_VACANCY_RATE } from '../rental-property-analysis.constants';

@Injectable()
export class ExpenseCalculator {
    calculateOperatingExpenses(
        monthlyRent: number,
        propertyPrice: number,
        expenses: RentalPropertyExpenses
    ): OperatingExpenses {
        const vacancy = this.calculateVacancy(monthlyRent, expenses);
        const propertyManagement = this.calculatePropertyManagement(monthlyRent, expenses);
        const maintenance = this.calculateMaintenance(monthlyRent, propertyPrice, expenses);
        const capex = this.calculateCapex(monthlyRent, propertyPrice, expenses);
        const utilities = expenses.utilitiesMonthly ?? 0;
        const landscaping = expenses.landscapingMonthly ?? 0;
        const pestControl = expenses.pestControlMonthly ?? 0;
        const legalFees = this.annualToMonthly(expenses.legalFeesAnnual);
        const landlordInsurance = this.annualToMonthly(expenses.landlordInsuranceAnnual);
        const specialAssessments = this.annualToMonthly(expenses.specialAssessmentsAnnual);
        const advertising = this.annualToMonthly(expenses.advertisingAnnual);
        const turnover = this.annualToMonthly(expenses.turnoverCostPerYear);

        const totalMonthly =
            vacancy +
            propertyManagement +
            maintenance +
            capex +
            utilities +
            landscaping +
            pestControl +
            legalFees +
            landlordInsurance +
            specialAssessments +
            advertising +
            turnover;

        return {
            vacancy,
            propertyManagement,
            maintenance,
            capex,
            utilities,
            landscaping,
            pestControl,
            legalFees,
            landlordInsurance,
            specialAssessments,
            advertising,
            turnover,
            totalMonthly
        };
    }

    private calculateVacancy(monthlyRent: number, expenses: RentalPropertyExpenses): number {
        const rate = expenses.vacancyRate ?? DEFAULT_VACANCY_RATE;
        return (monthlyRent * rate) / PERCENT_TO_DECIMAL;
    }

    private calculatePropertyManagement(monthlyRent: number, expenses: RentalPropertyExpenses): number {
        if (expenses.propertyManagementPercent !== undefined) {
            return (monthlyRent * expenses.propertyManagementPercent) / PERCENT_TO_DECIMAL;
        }
        if (expenses.propertyManagementFlat !== undefined) {
            return expenses.propertyManagementFlat;
        }
        return 0;
    }

    private calculateMaintenance(monthlyRent: number, propertyPrice: number, expenses: RentalPropertyExpenses): number {
        if (expenses.maintenanceAnnual !== undefined) {
            return this.annualToMonthly(expenses.maintenanceAnnual);
        }
        if (expenses.maintenancePercentOfRent !== undefined) {
            return (monthlyRent * expenses.maintenancePercentOfRent) / PERCENT_TO_DECIMAL;
        }
        if (expenses.maintenancePercentOfValue !== undefined && propertyPrice) {
            return (propertyPrice * expenses.maintenancePercentOfValue) / PERCENT_TO_DECIMAL / MONTHS_PER_YEAR;
        }
        return 0;
    }

    private calculateCapex(monthlyRent: number, propertyPrice: number, expenses: RentalPropertyExpenses): number {
        if (expenses.capexAnnual !== undefined) {
            return this.annualToMonthly(expenses.capexAnnual);
        }
        if (expenses.capexPercentOfRent !== undefined) {
            return (monthlyRent * expenses.capexPercentOfRent) / PERCENT_TO_DECIMAL;
        }
        if (expenses.capexPercentOfValue !== undefined && propertyPrice) {
            return (propertyPrice * expenses.capexPercentOfValue) / PERCENT_TO_DECIMAL / MONTHS_PER_YEAR;
        }
        return 0;
    }

    private annualToMonthly(annualAmount: number | undefined): number {
        return (annualAmount ?? 0) / MONTHS_PER_YEAR;
    }
}
