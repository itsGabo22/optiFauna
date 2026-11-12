import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { FeedCategory } from '../entities/feed-inventory.entity';

export class CreateFeedInventoryDto {
  @IsString()
  @IsNotEmpty()
  farmId: string;

  @IsString()
  @IsNotEmpty()
  feedName: string;

  @IsEnum(FeedCategory)
  @IsNotEmpty()
  category: FeedCategory;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  currentStockKg: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  minStockAlertKg?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  unitCost?: number;
}
