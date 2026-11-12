import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

/** Body for POST /nutrition/inventory/:id/restock and /consume. */
export class StockMovementDto {
  @IsNumber()
  @IsPositive()
  quantityKg: number;

  /** Only used on restock: new cost per kg of the purchased batch. */
  @IsNumber()
  @Min(0)
  @IsOptional()
  unitCost?: number;

  /** Date of the movement. Defaults to today. */
  @IsDateString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
