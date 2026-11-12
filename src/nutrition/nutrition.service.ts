import { Injectable } from '@nestjs/common';
import { DietDto } from './dto/diet.dto';
import { CreateFeedInventoryDto } from './dto/inventory.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NutritionRecord } from './entities/nutrition-record.entity';
import { FeedInventory } from './entities/feed-inventory.entity';
import { todayIso } from '../common/utils/date.utils';

@Injectable()
export class NutritionService {
  constructor(
    @InjectRepository(NutritionRecord)
    private readonly nutritionRepository: Repository<NutritionRecord>,
    @InjectRepository(FeedInventory)
    private readonly feedInventoryRepository: Repository<FeedInventory>,
  ) {}

  async assignDiet(dietDto: DietDto): Promise<NutritionRecord> {
    const record = this.nutritionRepository.create({
      animalGroupId: dietDto.animalGroupId,
      dietName: dietDto.dietName,
      dailyAmountKg: dietDto.dailyAmountKg,
    });
    return this.nutritionRepository.save(record);
  }

  async calculateConsumption(farmId: string): Promise<any> {
    const records = await this.nutritionRepository.find({
      where: farmId ? { farmId } : {},
    });

    const totalDailyKg = records.reduce(
      (sum, r) => sum + (Number(r.dailyAmountKg) || 0),
      0,
    );

    return {
      farmId,
      activeDietPlansCount: records.length,
      calculatedTotalDailyKg: totalDailyKg,
      diets: records,
    };
  }

  async createFeedItem(dto: CreateFeedInventoryDto): Promise<FeedInventory> {
    const item = this.feedInventoryRepository.create({
      ...dto,
      lastRestockDate: dto.currentStockKg > 0 ? todayIso() : undefined,
    });
    return this.feedInventoryRepository.save(item);
  }

  async getInventory(farmId?: string): Promise<FeedInventory[]> {
    return this.feedInventoryRepository.find({
      where: farmId ? { farmId } : {},
    });
  }
}
