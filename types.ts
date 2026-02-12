
export enum CategoryType {
  FIXED_EXPENSE = 'Kebutuhan Pokok',
  DEBT = 'Cicilan / Hutang',
  SAVINGS = 'Tabungan / Investasi',
  UNEXPECTED = 'Kebutuhan Lain-lain'
}

export const DEFAULT_CATEGORIES = [
  CategoryType.FIXED_EXPENSE,
  CategoryType.DEBT,
  CategoryType.SAVINGS,
  CategoryType.UNEXPECTED
];

export interface FinanceItem {
  id: string;
  name: string;
  category: string;
  budget: number;
  actual: number;
}

export interface InvestmentDetails {
  educationFund: number;
  retirementFund: number;
  generalSavings: number;
  educationTarget: number;
  retirementTarget: number;
  savingsTarget: number;
}

export interface SalaryDetails {
  basicSalary: number;
  shiftAllowance: number;
  housingAllowance: number;
  otHoursStr: string;
  taxRateStr: string;
  otherDeductions: number;
  bonusMultiplierStr: string;
}

export interface MonthlyBudget {
  income: number;
  items: FinanceItem[];
  categories: string[];
  year: string;
  salarySlip?: SalaryDetails;
  investments?: InvestmentDetails;
}
