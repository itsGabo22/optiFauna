import {
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AnimalSex, AnimalStatus } from '../entities/animal.entity';

export type AnimalStatusFilter = AnimalStatus | 'ALL';

export const ANIMAL_STATUS_FILTER_VALUES: AnimalStatusFilter[] = [
  ...Object.values(AnimalStatus),
  'ALL',
];

export class QueryAnimalsDto {
  @IsString()
  @IsOptional()
  farmId?: string;

  @IsIn(ANIMAL_STATUS_FILTER_VALUES)
  @IsOptional()
  status?: AnimalStatusFilter;

  @IsEnum(AnimalSex)
  @IsOptional()
  sex?: AnimalSex;

  @IsString()
  @IsOptional()
  species?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;
}
