import { IsString, IsNotEmpty, IsNumber, IsDateString } from 'class-validator';

export class YieldDto {
  @IsString()
  @IsNotEmpty()
  animalId: string;

  @IsNumber()
  @IsNotEmpty()
  productionAmount: number;

  @IsDateString()
  @IsNotEmpty()
  date: string;
}
