import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class StockMovementDto {
  @IsNumber()
  @IsPositive()
  quantityKg: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  unitCost?: number;

  @IsDateString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
