import { BadRequestException, Injectable } from '@nestjs/common';
import { YieldDto } from './dto/yield.dto';
import { ExpenseDto } from './dto/expense.dto';
import { AnimalSaleDto } from './dto/animal-sale.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, IsNull, Repository } from 'typeorm';
import {
  FinanceRecord,
  FinanceRecordType,
  FinanceCategory,
} from './entities/finance-record.entity';
import { NutritionService } from '../nutrition/nutrition.service';
import { addDays, todayIso, toIsoDate } from '../common/utils/date.utils';
import {
  AnimalProfitabilityReport,
  CategoryTotal,
  CostPerLiterReport,
  DatePeriod,
  FinanceSummary,
} from './interfaces/finance-reports.interface';

@Injectable()
export class FinanceService {
  constructor(
    @InjectRepository(FinanceRecord)
    private readonly financeRepository: Repository<FinanceRecord>,
    private readonly nutritionService: NutritionService,
  ) {}

  async registerMilkProduction(yieldDto: YieldDto): Promise<FinanceRecord> {
    const amount = this.round2(yieldDto.liters * yieldDto.pricePerLiter);
    const record = this.financeRepository.create({
      farmId: yieldDto.farmId,
      animalId: yieldDto.animalId,
      recordType: FinanceRecordType.YIELD,
      category: FinanceCategory.MILK_SALE,
      quantity: yieldDto.liters,
      unitPrice: yieldDto.pricePerLiter,
      amount,
      date: yieldDto.date,
      description: yieldDto.description ?? 'Milk production recorded',
    });
    return this.financeRepository.save(record);
  }

  async registerExpense(expenseDto: ExpenseDto): Promise<FinanceRecord> {
    const computedAmount =
      expenseDto.amount !== undefined
        ? expenseDto.amount
        : expenseDto.quantity !== undefined &&
            expenseDto.unitPrice !== undefined
          ? this.round2(expenseDto.quantity * expenseDto.unitPrice)
          : null;

    if (computedAmount === null) {
      throw new BadRequestException(
        'Either amount or both quantity and unitPrice are required',
      );
    }

    const record = this.financeRepository.create({
      farmId: expenseDto.farmId,
      animalId: expenseDto.animalId,
      recordType: FinanceRecordType.EXPENSE,
      category: expenseDto.category,
      amount: computedAmount,
      quantity: expenseDto.quantity,
      unitPrice: expenseDto.unitPrice,
      date: expenseDto.date,
      description: expenseDto.description ?? 'Operational expense recorded',
      receiptNumber: expenseDto.receiptNumber,
    });
    return this.financeRepository.save(record);
  }

  async registerAnimalSale(
    animalSaleDto: AnimalSaleDto,
  ): Promise<FinanceRecord> {
    const record = this.financeRepository.create({
      farmId: animalSaleDto.farmId,
      animalId: animalSaleDto.animalId,
      recordType: FinanceRecordType.YIELD,
      category: FinanceCategory.ANIMAL_SALE,
      amount: animalSaleDto.amount,
      date: animalSaleDto.date,
      description: animalSaleDto.buyer
        ? `Animal sale - Buyer: ${animalSaleDto.buyer}`
        : 'Animal sale recorded',
      receiptNumber: animalSaleDto.receiptNumber,
    });
    return this.financeRepository.save(record);
  }

  private round2(value: number): number {
    return Math.round(value * 100) / 100;
  }

  private resolvePeriod(from?: string, to?: string): DatePeriod {
    const periodTo = to ? toIsoDate(to) : todayIso();
    const periodFrom = from ? toIsoDate(from) : addDays(periodTo, -29);
    if (periodFrom > periodTo) {
      throw new BadRequestException('from must be on or before to');
    }
    return { from: periodFrom, to: periodTo };
  }

  private async fetchAnimalPeriodData(
    animalId: string,
    period: DatePeriod,
  ): Promise<[FinanceRecord[], number]> {
    const [records, feedReport] = await Promise.all([
      this.financeRepository.find({
        where: {
          animalId,
          date: Between(period.from, period.to),
        },
        order: { date: 'DESC', createdAt: 'DESC' },
      }),
      this.nutritionService.getFeedCostForAnimal(
        animalId,
        period.from,
        period.to,
      ),
    ]);

    return [records, this.round2(feedReport.periodFeedCost)];
  }

  async calculateCostPerLiter(
    animalId: string,
    from?: string,
    to?: string,
  ): Promise<CostPerLiterReport> {
    const period = this.resolvePeriod(from, to);
    const [records, feedCost] = await this.fetchAnimalPeriodData(
      animalId,
      period,
    );

    let litersProduced = 0;
    let milkIncome = 0;
    let directExpenses = 0;

    for (const record of records) {
      const amount = Number(record.amount) || 0;
      if (
        record.recordType === FinanceRecordType.YIELD &&
        record.category === FinanceCategory.MILK_SALE
      ) {
        litersProduced += Number(record.quantity) || 0;
        milkIncome += amount;
      } else if (record.recordType === FinanceRecordType.EXPENSE) {
        directExpenses += amount;
      }
    }

    litersProduced = this.round2(litersProduced);
    milkIncome = this.round2(milkIncome);
    directExpenses = this.round2(directExpenses);

    const totalCost = this.round2(directExpenses + feedCost);
    const costPerLiter =
      litersProduced > 0 ? this.round2(totalCost / litersProduced) : null;
    const averagePricePerLiter =
      litersProduced > 0 ? this.round2(milkIncome / litersProduced) : null;
    const marginPerLiter =
      averagePricePerLiter !== null && costPerLiter !== null
        ? this.round2(averagePricePerLiter - costPerLiter)
        : null;

    return {
      animalId,
      period,
      litersProduced,
      milkIncome,
      directExpenses,
      feedCost,
      totalCost,
      costPerLiter,
      averagePricePerLiter,
      marginPerLiter,
    };
  }

  async getFarmSummary(
    farmId?: string,
    from?: string,
    to?: string,
  ): Promise<FinanceSummary> {
    if (!farmId || !farmId.trim()) {
      throw new BadRequestException('farmId query parameter is required');
    }

    const period = this.resolvePeriod(from, to);

    const records = await this.financeRepository.find({
      where: [
        { farmId, date: Between(period.from, period.to) },
        {
          farmId: IsNull(),
          animal: { farmId },
          date: Between(period.from, period.to),
        },
      ],
      relations: { animal: true },
      order: { date: 'DESC', createdAt: 'DESC' },
    });

    let totalIncome = 0;
    let totalExpenses = 0;
    let litersProduced = 0;

    const incomeMap = new Map<FinanceCategory, CategoryTotal>();
    const expenseMap = new Map<FinanceCategory, CategoryTotal>();

    for (const record of records) {
      const amount = Number(record.amount) || 0;
      if (record.recordType === FinanceRecordType.YIELD) {
        totalIncome += amount;
        this.addToCategoryMap(incomeMap, record.category, amount);
        if (record.category === FinanceCategory.MILK_SALE) {
          litersProduced += Number(record.quantity) || 0;
        }
      } else if (record.recordType === FinanceRecordType.EXPENSE) {
        totalExpenses += amount;
        this.addToCategoryMap(expenseMap, record.category, amount);
      }
    }

    totalIncome = this.round2(totalIncome);
    totalExpenses = this.round2(totalExpenses);

    return {
      farmId,
      period,
      totalIncome,
      totalExpenses,
      netResult: this.round2(totalIncome - totalExpenses),
      incomeByCategory: Array.from(incomeMap.values()),
      expensesByCategory: Array.from(expenseMap.values()),
      litersProduced: this.round2(litersProduced),
    };
  }

  private addToCategoryMap(
    map: Map<FinanceCategory, CategoryTotal>,
    category: FinanceCategory,
    amount: number,
  ): void {
    const existing = map.get(category) ?? { category, total: 0, count: 0 };
    existing.total = this.round2(existing.total + amount);
    existing.count += 1;
    map.set(category, existing);
  }

  async calculateAnimalProfitability(
    animalId: string,
    from?: string,
    to?: string,
  ): Promise<AnimalProfitabilityReport> {
    const period = this.resolvePeriod(from, to);
    const [records, feedCost] = await this.fetchAnimalPeriodData(
      animalId,
      period,
    );

    let totalYield = 0;
    let directExpenses = 0;

    for (const record of records) {
      const amount = Number(record.amount) || 0;
      if (record.recordType === FinanceRecordType.YIELD) {
        totalYield += amount;
      } else if (record.recordType === FinanceRecordType.EXPENSE) {
        directExpenses += amount;
      }
    }

    totalYield = this.round2(totalYield);
    directExpenses = this.round2(directExpenses);

    const totalExpense = this.round2(directExpenses + feedCost);
    const netProfit = this.round2(totalYield - totalExpense);
    const roiPercentage =
      totalExpense > 0
        ? ((netProfit / totalExpense) * 100).toFixed(2)
        : totalYield > 0
          ? '100.00'
          : '0.00';

    return {
      animalId,
      period,
      totalYield,
      directExpenses,
      feedCost,
      totalExpense,
      netProfit,
      roiPercentage: `${roiPercentage}%`,
      recordsCount: records.length,
    };
  }
}
