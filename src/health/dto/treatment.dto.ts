import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';

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

  @IsString()
  @IsOptional()
  farmId?: string;

  @IsString()
  @IsOptional()
  medication?: string;

  @IsString()
  @IsOptional()
  dosage?: string;

  @IsString()
  @IsOptional()
  veterinarian?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  cost?: number;

  @IsDateString()
  @IsOptional()
  nextDueDate?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
