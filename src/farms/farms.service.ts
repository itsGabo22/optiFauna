import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateFarmDto } from './dto/create-farm.dto';
import { UpdateFarmDto } from './dto/update-farm.dto';
import { AssignWorkerDto } from './dto/assign-worker.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Farm } from './entities/farm.entity';
import { FarmWorker, WorkerRole } from './entities/farm-worker.entity';
import { Animal } from '../animals/entities/animal.entity';
import {
  FarmDetails,
  RemovedWorkerResult,
} from './interfaces/farm-details.interface';

@Injectable()
export class FarmsService {
  constructor(
    @InjectRepository(Farm)
    private readonly farmRepository: Repository<Farm>,
    @InjectRepository(FarmWorker)
    private readonly farmWorkerRepository: Repository<FarmWorker>,
    @InjectRepository(Animal)
    private readonly animalRepository: Repository<Animal>,
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

  async findAll(ownerId?: string): Promise<Farm[]> {
    return this.farmRepository.find({
      where: ownerId ? { ownerId } : {},
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<FarmDetails> {
    const farm = await this.farmRepository.findOne({
      where: { id },
      relations: { workers: true },
    });
    if (!farm) {
      throw new NotFoundException(`Farm with id ${id} not found`);
    }

    const animalsCount = await this.animalRepository.count({
      where: { farmId: id },
    });

    return {
      ...farm,
      animalsCount,
    };
  }

  async updateFarm(id: string, updateFarmDto: UpdateFarmDto): Promise<Farm> {
    const farm = await this.findFarmOrFail(id);
    Object.assign(farm, updateFarmDto);
    return this.farmRepository.save(farm);
  }

  async assignWorker(
    farmId: string,
    assignWorkerDto: AssignWorkerDto,
  ): Promise<FarmWorker> {
    await this.findFarmOrFail(farmId);

    const existing = await this.farmWorkerRepository.findOne({
      where: { farmId, userId: assignWorkerDto.userId },
    });

    if (existing) {
      const nextRole = assignWorkerDto.role ?? existing.role;
      if (existing.role === WorkerRole.OWNER && nextRole !== WorkerRole.OWNER) {
        await this.ensureAnotherOwnerExists(farmId);
      }
      existing.role = nextRole;
      return this.farmWorkerRepository.save(existing);
    }

    const worker = this.farmWorkerRepository.create({
      farmId,
      userId: assignWorkerDto.userId,
      role: assignWorkerDto.role ?? WorkerRole.OPERATOR,
    });

    return this.farmWorkerRepository.save(worker);
  }

  private async ensureAnotherOwnerExists(farmId: string): Promise<void> {
    const ownersCount = await this.farmWorkerRepository.count({
      where: { farmId, role: WorkerRole.OWNER },
    });
    if (ownersCount <= 1) {
      throw new BadRequestException(
        'Cannot remove or downgrade the last OWNER of the farm',
      );
    }
  }

  private async findFarmOrFail(id: string): Promise<Farm> {
    const farm = await this.farmRepository.findOne({ where: { id } });
    if (!farm) {
      throw new NotFoundException(`Farm with id ${id} not found`);
    }
    return farm;
  }
}
