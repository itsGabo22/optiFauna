import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { NutritionService } from './nutrition.service';
import { DietDto } from './dto/diet.dto';
import { CreateFeedInventoryDto } from './dto/inventory.dto';

@Controller('nutrition')
export class NutritionController {
  constructor(private readonly nutritionService: NutritionService) {}

  @Post('diets')
  async assignDiet(@Body() dietDto: DietDto) {
    return this.nutritionService.assignDiet(dietDto);
  }

  @Post('inventory')
  async createFeedItem(@Body() dto: CreateFeedInventoryDto) {
    return this.nutritionService.createFeedItem(dto);
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
