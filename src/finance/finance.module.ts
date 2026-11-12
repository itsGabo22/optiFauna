import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinanceService } from './finance.service';
import { FinanceController } from './finance.controller';
import { FinanceRecord } from './entities/finance-record.entity';
import { NutritionModule } from '../nutrition/nutrition.module';

@Module({
  imports: [TypeOrmModule.forFeature([FinanceRecord]), NutritionModule],
  controllers: [FinanceController],
  providers: [FinanceService],
  exports: [FinanceService],
})
export class FinanceModule {}
