import { BadRequestException, Injectable } from '@nestjs/common';
import { YieldDto } from './dto/yield.dto';
import { ExpenseDto } from './dto/expense.dto';
import { AnimalSaleDto } from './dto/animal-sale.dto';
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
