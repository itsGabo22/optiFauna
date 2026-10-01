import { IsString, IsNotEmpty, IsDateString, IsOptional } from 'class-validator';

export class VaccineDto {
  @IsString()
  @IsNotEmpty()
  vaccineName: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsOptional()
  animalId?: string; // If individual

  @IsString()
  @IsOptional()
  batchId?: string; // If batch-based
}
