import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FinanceService } from './finance.service';
import { YieldDto } from './dto/yield.dto';
import { ExpenseDto } from './dto/expense.dto';
import { AnimalSaleDto } from './dto/animal-sale.dto';

@ApiTags('finance')
@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Post('milk')
  async registerMilkProduction(@Body() yieldDto: YieldDto) {
    return this.financeService.registerMilkProduction(yieldDto);
  }

  @Post('yields')
  async registerYield(@Body() yieldDto: YieldDto) {
    return this.financeService.registerMilkProduction(yieldDto);
  }

  @Post('expenses')
  async registerExpense(@Body() expenseDto: ExpenseDto) {
    return this.financeService.registerExpense(expenseDto);
  }

  @Post('animal-sales')
  async registerAnimalSale(@Body() animalSaleDto: AnimalSaleDto) {
    return this.financeService.registerAnimalSale(animalSaleDto);
  }

  @Get('cost-per-liter/:animalId')
  async getCostPerLiter(
    @Param('animalId') animalId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.financeService.calculateCostPerLiter(animalId, from, to);
  }

  @Get('summary')
  async getFarmSummary(
    @Query('farmId') farmId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.financeService.getFarmSummary(farmId, from, to);
  }

  @Get('roi/:animalId')
  async getRoi(
    @Param('animalId') animalId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.financeService.calculateAnimalProfitability(animalId, from, to);
  }
}
