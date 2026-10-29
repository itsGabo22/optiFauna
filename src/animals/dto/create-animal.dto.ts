import { IsString, IsNotEmpty, IsDateString, IsOptional, IsEnum, IsNumber } from 'class-validator';
import { AnimalSex, AnimalStatus } from '../entities/animal.entity';

export class CreateAnimalDto {
  @IsString()
  @IsNotEmpty()
  tagId: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsNotEmpty()
  species: string;

  @IsString()
  @IsNotEmpty()
  breed: string;

  @IsEnum(AnimalSex)
  @IsOptional()
  sex?: AnimalSex;

  @IsDateString()
  @IsNotEmpty()
  birthDate: string;

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
