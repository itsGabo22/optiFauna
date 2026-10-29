import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { NutritionService } from './nutrition.service';
import { DietDto } from './dto/diet.dto';

@Controller('nutrition')
export class NutritionController {
  constructor(private readonly nutritionService: NutritionService) {}

  @Post('diets')
  async assignDiet(@Body() dietDto: DietDto) {
    return this.nutritionService.assignDiet(dietDto);
  }

  @Get('inventory')
  async getInventory(@Query('farmId') farmId?: string) {
    return this.nutritionService.getInventory(farmId);
  }

  @Get('consumption')
  async getConsumption(@Query('farmId') farmId: string) {
    return this.nutritionService.calculateConsumption(farmId);
  }
}
