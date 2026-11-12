import { Controller, Post, Get, Body, Query, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { NutritionService } from './nutrition.service';
import { DietDto } from './dto/diet.dto';
import { CreateFeedInventoryDto } from './dto/inventory.dto';
import { StockMovementDto } from './dto/stock-movement.dto';
import { DietsQueryDto } from './dto/diets-query.dto';

@ApiTags('nutrition')
@Controller('nutrition')
export class NutritionController {
  constructor(private readonly nutritionService: NutritionService) {}

  @Post('diets')
  async assignDiet(@Body() dietDto: DietDto) {
    return this.nutritionService.assignDiet(dietDto);
  }

  @Get('diets')
  async getDiets(@Query() query: DietsQueryDto) {
    return this.nutritionService.getDiets(query);
  }

  @Post('inventory')
  async createFeedItem(@Body() dto: CreateFeedInventoryDto) {
    return this.nutritionService.createFeedItem(dto);
  }

  @Post('inventory/:id/restock')
  async restockFeedItem(
    @Param('id') id: string,
    @Body() dto: StockMovementDto,
  ) {
    return this.nutritionService.restockFeedItem(id, dto);
  }

  @Post('inventory/:id/consume')
  async consumeFeedItem(
    @Param('id') id: string,
    @Body() dto: StockMovementDto,
  ) {
    return this.nutritionService.consumeFeedItem(id, dto);
  }

  @Get('inventory/alerts')
  async getLowStockAlerts(@Query('farmId') farmId?: string) {
    return this.nutritionService.getLowStockAlerts(farmId);
  }

  @Get('inventory')
  async getInventory(@Query('farmId') farmId?: string) {
    return this.nutritionService.getInventory(farmId);
  }

  @Get('cost/:animalId')
  async getFeedCost(
    @Param('animalId') animalId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.nutritionService.getFeedCostForAnimal(animalId, from, to);
  }

  @Get('consumption')
  async getConsumption(@Query('farmId') farmId: string) {
    return this.nutritionService.calculateConsumption(farmId);
  }
}
