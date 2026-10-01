import { NutritionService } from './nutrition.service';
import { DietDto } from './dto/diet.dto';
export declare class NutritionController {
    private readonly nutritionService;
    constructor(nutritionService: NutritionService);
    assignDiet(dietDto: DietDto): Promise<any>;
    getInventory(): Promise<{
        inventory: string;
    }>;
}
