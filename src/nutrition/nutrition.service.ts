import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DietDto } from './dto/diet.dto';
import { CreateFeedInventoryDto } from './dto/inventory.dto';
import { StockMovementDto } from './dto/stock-movement.dto';
import { DietsQueryDto } from './dto/diets-query.dto';
import { InjectRepository } from '@nestjs/typeorm';
import {
  FindOptionsWhere,
  IsNull,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import { NutritionRecord } from './entities/nutrition-record.entity';
import { FeedInventory } from './entities/feed-inventory.entity';
import {
  addDays,
  daysBetween,
  overlapDays,
  todayIso,
  toIsoDate,
} from '../common/utils/date.utils';
import {
  ConsumptionReport,
  FeedCostDietLine,
  FeedCostReport,
} from './interfaces/nutrition-reports.interface';

@Injectable()
export class NutritionService {
  constructor(
    @InjectRepository(NutritionRecord)
    private readonly nutritionRepository: Repository<NutritionRecord>,
    @InjectRepository(FeedInventory)
    private readonly feedInventoryRepository: Repository<FeedInventory>,
  ) {}

  async assignDiet(dietDto: DietDto): Promise<NutritionRecord> {
    if (!dietDto.animalId && !dietDto.animalGroupId) {
      throw new BadRequestException(
        'Either animalId or animalGroupId is required',
      );
    }
    if (
      dietDto.startDate &&
      dietDto.endDate &&
      dietDto.endDate < dietDto.startDate
    ) {
      throw new BadRequestException('endDate must be on or after startDate');
    }

    const record = this.nutritionRepository.create({
      ...dietDto,
      startDate: dietDto.startDate ?? todayIso(),
    });
    return this.nutritionRepository.save(record);
  }

  async getDiets(query: DietsQueryDto = {}): Promise<NutritionRecord[]> {
    const base: FindOptionsWhere<NutritionRecord> = {};
    if (query.farmId) base.farmId = query.farmId;
    if (query.animalId) base.animalId = query.animalId;
    if (query.animalGroupId) base.animalGroupId = query.animalGroupId;

    const order = { startDate: 'DESC' as const, createdAt: 'DESC' as const };

    if (!query.active) {
      return this.nutritionRepository.find({ where: base, order });
    }

    const today = todayIso();
    return this.nutritionRepository.find({
      where: [
        { ...base, startDate: LessThanOrEqual(today), endDate: IsNull() },
        {
          ...base,
          startDate: LessThanOrEqual(today),
          endDate: MoreThanOrEqual(today),
        },
      ],
      order,
    });
  }

  async getFeedCostForAnimal(
    animalId: string,
    from?: string,
    to?: string,
  ): Promise<FeedCostReport> {
    const today = todayIso();
    const periodTo = to ? toIsoDate(to) : today;
    const periodFrom = from ? toIsoDate(from) : addDays(periodTo, -29);

    if (periodFrom > periodTo) {
      throw new BadRequestException('from must be on or before to');
    }

    const diets = await this.nutritionRepository.find({
      where: { animalId },
      order: { startDate: 'ASC' },
    });

    let dailyFeedCost = 0;
    let periodFeedCost = 0;
    let dietsWithoutCost = 0;

    const lines: FeedCostDietLine[] = diets.map((diet) => {
      const startDate = toIsoDate(diet.startDate ?? diet.createdAt);
      const endDate = diet.endDate ? toIsoDate(diet.endDate) : null;
      const dailyAmountKg = Number(diet.dailyAmountKg) || 0;
      const costPerKg =
        diet.costPerKg === null || diet.costPerKg === undefined
          ? null
          : Number(diet.costPerKg);

      if (costPerKg === null) {
        dietsWithoutCost += 1;
      }

      const dailyCost =
        costPerKg === null ? 0 : this.round2(dailyAmountKg * costPerKg);
      const daysInPeriod = overlapDays(
        startDate,
        endDate ?? '9999-12-31',
        periodFrom,
        periodTo,
      );
      const periodCost = this.round2(dailyCost * daysInPeriod);
      const activeToday =
        startDate <= today && (endDate === null || endDate >= today);

      periodFeedCost += periodCost;
      if (activeToday) {
        dailyFeedCost += dailyCost;
      }

      return {
        dietId: diet.id,
        dietName: diet.dietName,
        dailyAmountKg,
        costPerKg,
        dailyCost,
        startDate,
        endDate,
        daysInPeriod,
        periodCost,
        activeToday,
      };
    });

    return {
      animalId,
      period: { from: periodFrom, to: periodTo },
      periodDays: daysBetween(periodFrom, periodTo) + 1,
      dailyFeedCost: this.round2(dailyFeedCost),
      periodFeedCost: this.round2(periodFeedCost),
      dietsWithoutCost,
      diets: lines,
    };
  }

  private round2(value: number): number {
    return Math.round(value * 100) / 100;
  }

  async calculateConsumption(farmId?: string): Promise<ConsumptionReport> {
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

  async getLowStockAlerts(farmId?: string): Promise<FeedInventory[]> {
    const query = this.feedInventoryRepository
      .createQueryBuilder('item')
      .where('item.minStockAlertKg IS NOT NULL')
      .andWhere('item.currentStockKg <= item.minStockAlertKg')
      .orderBy('item.currentStockKg', 'ASC');

    if (farmId) {
      query.andWhere('item.farmId = :farmId', { farmId });
    }

    return query.getMany();
  }

  private async findFeedItemOrFail(id: string): Promise<FeedInventory> {
    const item = await this.feedInventoryRepository.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException(
        `Feed inventory item with id ${id} not found`,
      );
    }
    return item;
  }

  async getInventory(farmId?: string): Promise<FeedInventory[]> {
    return this.feedInventoryRepository.find({
      where: farmId ? { farmId } : {},
    });
  }
}
