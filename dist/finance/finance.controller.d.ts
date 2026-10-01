import { FinanceService } from './finance.service';
import { YieldDto } from './dto/yield.dto';
import { ExpenseDto } from './dto/expense.dto';
export declare class FinanceController {
    private readonly financeService;
    constructor(financeService: FinanceService);
    registerYield(yieldDto: YieldDto): Promise<any>;
    registerExpense(expenseDto: ExpenseDto): Promise<any>;
    getRoi(animalId: string): Promise<any>;
}
