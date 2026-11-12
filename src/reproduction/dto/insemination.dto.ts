import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { InseminationType } from '../entities/reproduction-record.entity';

export class InseminationDto {
  @IsString()
  @IsNotEmpty()
  animalId: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  bullIdOrSemen: string;

  @IsEnum(InseminationType)
  @IsNotEmpty()
  inseminationType: InseminationType;

  @IsString()
  @IsOptional()
  technician?: string;
}
