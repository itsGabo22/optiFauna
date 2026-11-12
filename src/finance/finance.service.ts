import { BadRequestException, Injectable } from '@nestjs/common';
import { YieldDto } from './dto/yield.dto';
import { ExpenseDto } from './dto/expense.dto';
import { AnimalSaleDto } from './dto/animal-sale.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import {
  FinanceRecord,
  FinanceRecordType,
  FinanceCategory,
} from './entities/finance-record.entity';
import { NutritionService } from '../nutrition/nutrition.service';
import { addDays, todayIso, toIsoDate } from '../common/utils/date.utils';
import {
  CostPerLiterReport,
  DatePeriod,
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

  async calculateCostPerLiter(
    animalId: string,
    from?: string,
    to?: string,
  ): Promise<CostPerLiterReport> {
    const period = this.resolvePeriod(from, to);

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

    const feedCost = this.round2(feedReport.periodFeedCost);
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

  async calculateAnimalProfitability(animalId: string): Promise<any> {
    const records = await this.financeRepository.find({
      where: { animalId },
    });

    let totalYield = 0;
    let totalExpense = 0;

    for (const record of records) {
      const amount = Number(record.amount) || 0;
      if (record.recordType === FinanceRecordType.YIELD) {
        totalYield += amount;
      } else if (record.recordType === FinanceRecordType.EXPENSE) {
        totalExpense += amount;
      }
    }

    const netProfit = totalYield - totalExpense;
    const roiPercentage =
      totalExpense > 0
        ? ((netProfit / totalExpense) * 100).toFixed(2)
        : '100.00';

    return {
      animalId,
      totalYield,
      totalExpense,
      netProfit,
      roiPercentage: `${roiPercentage}%`,
      recordsCount: records.length,
    };
  }
}
