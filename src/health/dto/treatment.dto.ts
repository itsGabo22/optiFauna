import { IsString, IsNotEmpty, IsDateString } from 'class-validator';

export class TreatmentDto {
  @IsString()
  @IsNotEmpty()
  animalId: string;

  @IsString()
  @IsNotEmpty()
  treatmentName: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;
}
