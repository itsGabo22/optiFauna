import { IsEnum, IsOptional } from 'class-validator';
import { ReproductionEventType } from '../entities/reproduction-record.entity';

export class HistoryQueryDto {
  @IsEnum(ReproductionEventType)
  @IsOptional()
  eventType?: ReproductionEventType;
}
