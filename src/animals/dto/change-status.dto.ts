import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  NotEquals,
} from 'class-validator';
import { AnimalStatus } from '../entities/animal.entity';

export class ChangeStatusDto {
  @IsEnum(AnimalStatus)
  @NotEquals(AnimalStatus.ACTIVE, {
    message: 'status cannot be ACTIVE',
  })
  @IsNotEmpty()
  status: AnimalStatus;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsOptional()
  reason?: string;
}
