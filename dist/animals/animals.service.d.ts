import { CreateAnimalDto } from './dto/create-animal.dto';
import { UpdateAnimalDto } from './dto/update-animal.dto';
import { Repository } from 'typeorm';
import { Animal } from './entities/animal.entity';
export declare class AnimalsService {
    private readonly animalRepository;
    constructor(animalRepository: Repository<Animal>);
    createAnimal(createAnimalDto: CreateAnimalDto): Promise<Animal>;
    getAnimals(farmId?: string, page?: number): Promise<{
        data: Animal[];
        total: number;
    }>;
    findByTagId(tagId: string): Promise<Animal>;
    updateAnimalData(tagId: string, updateAnimalDto: UpdateAnimalDto): Promise<Animal>;
}
