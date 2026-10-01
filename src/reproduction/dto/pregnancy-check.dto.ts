import { IsString, IsNotEmpty, IsDateString, IsBoolean } from 'class-validator';

export class PregnancyCheckDto {
  @IsString()
  @IsNotEmpty()
  animalId: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsBoolean()
  @IsNotEmpty()
  isPregnant: boolean;
}
