import { Controller, Post, Get, Body } from '@nestjs/common';
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
  async getInventory() {
    return { inventory: 'Structural inventory data' };
  }
}
