import { IsString, IsOptional, IsDateString, IsEnum, IsNumber } from 'class-validator';
import { AnimalSex, AnimalStatus } from '../entities/animal.entity';

export class UpdateAnimalDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  species?: string;

  @IsString()
  @IsOptional()
  breed?: string;

  @IsEnum(AnimalSex)
  @IsOptional()
  sex?: AnimalSex;

  @IsDateString()
  @IsOptional()
  birthDate?: string;

  @IsNumber()
  @IsOptional()
  weightKg?: number;

  @IsEnum(AnimalStatus)
  @IsOptional()
  status?: AnimalStatus;

  @IsString()
  @IsOptional()
  farmId?: string;

  @IsString()
  @IsOptional()
  motherId?: string;

  @IsString()
  @IsOptional()
  fatherId?: string;
}
