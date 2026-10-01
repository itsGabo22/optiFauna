import { DietDto } from './dto/diet.dto';
import { Repository } from 'typeorm';
import { NutritionRecord } from './entities/nutrition-record.entity';
export declare class NutritionService {
    private readonly nutritionRepository;
    constructor(nutritionRepository: Repository<NutritionRecord>);
    assignDiet(dietDto: DietDto): Promise<any>;
    calculateConsumption(farmId: string): Promise<any>;
}
