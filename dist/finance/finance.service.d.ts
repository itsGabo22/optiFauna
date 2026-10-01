import { YieldDto } from './dto/yield.dto';
import { ExpenseDto } from './dto/expense.dto';
import { Repository } from 'typeorm';
import { FinanceRecord } from './entities/finance-record.entity';
export declare class FinanceService {
    private readonly financeRepository;
    constructor(financeRepository: Repository<FinanceRecord>);
    registerYield(yieldDto: YieldDto): Promise<any>;
    registerExpense(expenseDto: ExpenseDto): Promise<any>;
    calculateAnimalProfitability(animalId: string): Promise<any>;
}
