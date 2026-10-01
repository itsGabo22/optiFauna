import { IsString, IsOptional, IsDateString } from 'class-validator';

export class UpdateAnimalDto {
  @IsString()
  @IsOptional()
  species?: string;

  @IsString()
  @IsOptional()
  breed?: string;

  @IsDateString()
  @IsOptional()
  birthDate?: string;
}
