import { IsEnum, IsOptional } from 'class-validator';
import { HealthRecordType } from '../entities/health-record.entity';

export class HealthHistoryQueryDto {
  @IsEnum(HealthRecordType)
  @IsOptional()
  type?: HealthRecordType;
}
