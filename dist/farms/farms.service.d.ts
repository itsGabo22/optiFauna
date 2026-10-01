import { CreateFarmDto } from './dto/create-farm.dto';
import { Repository } from 'typeorm';
import { Farm } from './entities/farm.entity';
export declare class FarmsService {
    private readonly farmRepository;
    constructor(farmRepository: Repository<Farm>);
    createFarm(createFarmDto: CreateFarmDto): Promise<Farm>;
    assignWorker(farmId: string, userId: string): Promise<any>;
}
