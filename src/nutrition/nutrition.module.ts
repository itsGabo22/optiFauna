import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NutritionService } from './nutrition.service';
import { NutritionController } from './nutrition.controller';
import { NutritionRecord } from './entities/nutrition-record.entity';
import { FeedInventory } from './entities/feed-inventory.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NutritionRecord, FeedInventory])],
  controllers: [NutritionController],
  providers: [NutritionService],
  exports: [NutritionService, TypeOrmModule],
})
export class NutritionModule {}
