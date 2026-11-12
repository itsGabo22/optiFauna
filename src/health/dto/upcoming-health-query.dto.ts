import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpcomingHealthQueryDto {
  @IsString()
  @IsOptional()
  farmId?: string;

  /** Window in days counted from today. Defaults to 30. */
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(365)
  @IsOptional()
  days?: number;
}
