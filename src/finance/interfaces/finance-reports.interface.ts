import { FinanceCategory } from '../entities/finance-record.entity';

export interface DatePeriod {
  from: string;
  to: string;
}

export interface CostPerLiterReport {
  animalId: string;
  period: DatePeriod;
  litersProduced: number;
  milkIncome: number;
  directExpenses: number;
  feedCost: number;
  totalCost: number;
  costPerLiter: number | null;
  averagePricePerLiter: number | null;
  marginPerLiter: number | null;
}

export interface CategoryTotal {
  category: FinanceCategory;
  total: number;
  count: number;
}

export interface FinanceSummary {
  farmId: string;
  period: DatePeriod;
  totalIncome: number;
  totalExpenses: number;
  netResult: number;
  incomeByCategory: CategoryTotal[];
  expensesByCategory: CategoryTotal[];
  litersProduced: number;
}

export interface AnimalProfitabilityReport {
  animalId: string;
  period: DatePeriod;
  totalYield: number;
  directExpenses: number;
  feedCost: number;
  totalExpense: number;
  netProfit: number;
  roiPercentage: string;
  recordsCount: number;
}

