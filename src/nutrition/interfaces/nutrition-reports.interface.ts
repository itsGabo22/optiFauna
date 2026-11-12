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
  /** null when the diet was registered without costPerKg. */
  costPerKg: number | null;
  /** dailyAmountKg × costPerKg (0 when costPerKg is unknown). */
  dailyCost: number;
  startDate: string;
  endDate: string | null;
  /** Days of this diet that fall inside the requested period. */
  daysInPeriod: number;
  periodCost: number;
  activeToday: boolean;
}

/**
 * Feed cost of one animal. Consumed by FinanceModule to compute
 * cost per liter of milk: `NutritionService.getFeedCostForAnimal`.
 */
export interface FeedCostReport {
  animalId: string;
  period: { from: string; to: string };
  periodDays: number;
  /** Sum of dailyCost of the diets active today. */
  dailyFeedCost: number;
  /** Sum of periodCost of every diet overlapping the period. */
  periodFeedCost: number;
  /** Diets ignored in the totals because they have no costPerKg. */
  dietsWithoutCost: number;
  diets: FeedCostDietLine[];
}
