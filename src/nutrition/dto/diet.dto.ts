import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

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

  @IsNumber()
  @Min(0)
  @IsOptional()
  costPerKg?: number;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
