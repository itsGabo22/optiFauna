import { AnimalsService } from './animals.service';
import { CreateAnimalDto } from './dto/create-animal.dto';
import { UpdateAnimalDto } from './dto/update-animal.dto';
export declare class AnimalsController {
    private readonly animalsService;
    constructor(animalsService: AnimalsService);
    createAnimal(createAnimalDto: CreateAnimalDto): Promise<import("./entities/animal.entity").Animal>;
    getAnimals(farmId?: string, page?: string): Promise<{
        data: import("./entities/animal.entity").Animal[];
        total: number;
    }>;
    findByTagId(tagId: string): Promise<import("./entities/animal.entity").Animal>;
    updateAnimalData(tagId: string, updateAnimalDto: UpdateAnimalDto): Promise<import("./entities/animal.entity").Animal>;
}
