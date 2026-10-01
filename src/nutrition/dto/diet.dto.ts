import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class DietDto {
  @IsString()
  @IsNotEmpty()
  animalGroupId: string;

  @IsString()
  @IsNotEmpty()
  dietName: string;

  @IsNumber()
  @IsNotEmpty()
  dailyAmountKg: number;
}
