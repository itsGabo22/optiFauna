import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFarmDto } from './dto/create-farm.dto';
import { AssignWorkerDto } from './dto/assign-worker.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Farm } from './entities/farm.entity';
import { FarmWorker, WorkerRole } from './entities/farm-worker.entity';

@Injectable()
export class FarmsService {
  constructor(
    @InjectRepository(Farm)
    private readonly farmRepository: Repository<Farm>,
    @InjectRepository(FarmWorker)
    private readonly farmWorkerRepository: Repository<FarmWorker>,
  ) {}

  async createFarm(createFarmDto: CreateFarmDto): Promise<Farm> {
    const farm = this.farmRepository.create(createFarmDto);
    const savedFarm = await this.farmRepository.save(farm);

    if (createFarmDto.ownerId) {
      await this.farmWorkerRepository.save(
        this.farmWorkerRepository.create({
          farmId: savedFarm.id,
          userId: createFarmDto.ownerId,
          role: WorkerRole.OWNER,
        }),
      );
    }

    return savedFarm;
  }

  async assignWorker(farmId: string, assignWorkerDto: AssignWorkerDto): Promise<FarmWorker> {
    const farm = await this.farmRepository.findOne({ where: { id: farmId } });
    if (!farm) {
      throw new NotFoundException(`Farm with id ${farmId} not found`);
    }

    const worker = this.farmWorkerRepository.create({
      farmId,
      userId: assignWorkerDto.userId,
      role: assignWorkerDto.role || WorkerRole.OPERATOR,
    });

    return this.farmWorkerRepository.save(worker);
  }
}
