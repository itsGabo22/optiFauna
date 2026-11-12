import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class DietsQueryDto {
  @IsString()
  @IsOptional()
  farmId?: string;

  @IsString()
  @IsOptional()
  animalId?: string;

  @IsString()
  @IsOptional()
  animalGroupId?: string;

  /** `true` returns only diets in force today (started, not yet ended). */
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
