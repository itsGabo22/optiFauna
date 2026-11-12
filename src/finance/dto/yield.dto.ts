import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class YieldDto {
  @IsString()
  @IsNotEmpty()
  animalId: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsNumber()
  @Min(0)
  liters: number;

  @IsNumber()
  @Min(0)
  pricePerLiter: number;

  @IsString()
  @IsOptional()
  farmId?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
