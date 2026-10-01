import { Injectable } from '@nestjs/common';
import { DietDto } from './dto/diet.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NutritionRecord } from './entities/nutrition-record.entity';

@Injectable()
export class NutritionService {
  constructor(
    @InjectRepository(NutritionRecord)
    private readonly nutritionRepository: Repository<NutritionRecord>,
  ) {}

  async assignDiet(dietDto: DietDto): Promise<any> {
    return {
      message: 'Diet assigned',
      data: dietDto,
    };
  }

  async calculateConsumption(farmId: string): Promise<any> {
    return {
      farmId,
      calculatedConsumption: 'Structural return: 500kg per day',
    };
  }
}
