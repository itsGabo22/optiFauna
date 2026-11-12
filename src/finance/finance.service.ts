import { Injectable } from '@nestjs/common';
import { YieldDto } from './dto/yield.dto';
import { ExpenseDto } from './dto/expense.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  FinanceRecord,
  FinanceRecordType,
  FinanceCategory,
} from './entities/finance-record.entity';

@Injectable()
export class FinanceService {
  constructor(
    @InjectRepository(FinanceRecord)
    private readonly financeRepository: Repository<FinanceRecord>,
  ) {}

  async registerMilkProduction(yieldDto: YieldDto): Promise<FinanceRecord> {
    const amount =
      Math.round(yieldDto.liters * yieldDto.pricePerLiter * 100) / 100;
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
    const record = this.financeRepository.create({
      recordType: FinanceRecordType.EXPENSE,
      category:
        (expenseDto.category as FinanceCategory) || FinanceCategory.OTHER,
      amount: expenseDto.amount,
      date: expenseDto.date,
      description: 'Operational expense recorded',
    });
    return this.financeRepository.save(record);
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
