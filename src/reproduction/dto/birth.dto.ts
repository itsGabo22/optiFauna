import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { OffspringSex } from '../entities/reproduction-record.entity';

export class BirthDto {
  @IsString()
  @IsNotEmpty()
  motherId: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsEnum(OffspringSex)
  @IsNotEmpty()
  calfGender: OffspringSex;

  @IsString()
  @IsOptional()
  offspringTagId?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
