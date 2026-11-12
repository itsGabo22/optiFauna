import { IsString, IsNotEmpty, IsDateString, IsOptional } from 'class-validator';

export class HeatDto {
  @IsString()
  @IsNotEmpty()
  animalId: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsOptional()
  observedBy?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
