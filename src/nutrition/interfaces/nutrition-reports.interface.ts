import { NutritionRecord } from '../entities/nutrition-record.entity';

export interface ConsumptionReport {
  farmId: string | undefined;
  activeDietPlansCount: number;
  calculatedTotalDailyKg: number;
  diets: NutritionRecord[];
}

export interface FeedCostDietLine {
  dietId: string;
  dietName: string;
  dailyAmountKg: number;
  costPerKg: number | null;
  dailyCost: number;
  startDate: string;
  endDate: string | null;
  daysInPeriod: number;
  periodCost: number;
  activeToday: boolean;
}

export interface FeedCostReport {
  animalId: string;
  period: { from: string; to: string };
  periodDays: number;
  dailyFeedCost: number;
  periodFeedCost: number;
  dietsWithoutCost: number;
  diets: FeedCostDietLine[];
}
