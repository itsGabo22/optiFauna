import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { YieldDto } from './dto/yield.dto';
import { ExpenseDto } from './dto/expense.dto';

@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Post('yields')
  async registerYield(@Body() yieldDto: YieldDto) {
    return this.financeService.registerYield(yieldDto);
  }

  @Post('expenses')
  async registerExpense(@Body() expenseDto: ExpenseDto) {
    return this.financeService.registerExpense(expenseDto);
  }

  @Get('roi/:animalId')
  async getRoi(@Param('animalId') animalId: string) {
    return this.financeService.calculateAnimalProfitability(animalId);
  }
}
