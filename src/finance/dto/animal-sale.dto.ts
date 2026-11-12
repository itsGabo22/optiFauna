import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class AnimalSaleDto {
  @IsString()
  @IsNotEmpty()
  animalId: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  @IsOptional()
  farmId?: string;

  @IsString()
  @IsOptional()
  buyer?: string;

  @IsString()
  @IsOptional()
  receiptNumber?: string;
}

