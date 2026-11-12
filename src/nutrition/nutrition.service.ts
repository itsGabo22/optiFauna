import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DietDto } from './dto/diet.dto';
import { CreateFeedInventoryDto } from './dto/inventory.dto';
import { StockMovementDto } from './dto/stock-movement.dto';
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

  async restockFeedItem(
    id: string,
    dto: StockMovementDto,
  ): Promise<FeedInventory> {
    const item = await this.findFeedItemOrFail(id);

    item.currentStockKg = Number(item.currentStockKg) + dto.quantityKg;
    if (dto.unitCost !== undefined) {
      item.unitCost = dto.unitCost;
    }
    item.lastRestockDate = dto.date ?? todayIso();

    return this.feedInventoryRepository.save(item);
  }

  async consumeFeedItem(
    id: string,
    dto: StockMovementDto,
  ): Promise<FeedInventory> {
    const item = await this.findFeedItemOrFail(id);
    const available = Number(item.currentStockKg);

    if (dto.quantityKg > available) {
      throw new BadRequestException(
        `Insufficient stock for ${item.feedName}: ${available} kg available, ${dto.quantityKg} kg requested`,
      );
    }

    item.currentStockKg = available - dto.quantityKg;
    return this.feedInventoryRepository.save(item);
  }

  private async findFeedItemOrFail(id: string): Promise<FeedInventory> {
    const item = await this.feedInventoryRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException(`Feed inventory item with id ${id} not found`);
    }
    return item;
  }

  async getInventory(farmId?: string): Promise<FeedInventory[]> {
    return this.feedInventoryRepository.find({
      where: farmId ? { farmId } : {},
    });
  }
}
