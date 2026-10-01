import { FarmsService } from './farms.service';
import { CreateFarmDto } from './dto/create-farm.dto';
import { AssignWorkerDto } from './dto/assign-worker.dto';
export declare class FarmsController {
    private readonly farmsService;
    constructor(farmsService: FarmsService);
    createFarm(createFarmDto: CreateFarmDto): Promise<import("./entities/farm.entity").Farm>;
    assignWorker(farmId: string, assignWorkerDto: AssignWorkerDto): Promise<any>;
}
