import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

/**
 * A diet is assigned to ONE animal (animalId) or to a group/lot
 * (animalGroupId). At least one of the two is required; the service
 * enforces it.
 */
export class DietDto {
  @IsString()
  @IsOptional()
  animalId?: string;

  @IsString()
  @IsOptional()
  animalGroupId?: string;

  @IsString()
  @IsOptional()
  farmId?: string;

  @IsString()
  @IsNotEmpty()
  dietName: string;

  @IsNumber()
  @IsPositive()
  dailyAmountKg: number;

  /** Cost per kg in COP. Needed for feed-cost and cost-per-liter reports. */
  @IsNumber()
  @Min(0)
  @IsOptional()
  costPerKg?: number;

  /** Defaults to today. */
  @IsDateString()
  @IsOptional()
  startDate?: string;

  /** Leave empty for an open-ended diet. */
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
