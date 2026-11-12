import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAnimalDto } from './dto/create-animal.dto';
import { UpdateAnimalDto } from './dto/update-animal.dto';
import { QueryAnimalsDto } from './dto/query-animals.dto';
import { ChangeStatusDto } from './dto/change-status.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Animal, AnimalStatus } from './entities/animal.entity';

@Injectable()
export class AnimalsService {
  constructor(
    @InjectRepository(Animal)
    private readonly animalRepository: Repository<Animal>,
  ) {}

  async createAnimal(createAnimalDto: CreateAnimalDto): Promise<Animal> {
    const animal = this.animalRepository.create(createAnimalDto);
    return this.animalRepository.save(animal);
  }

  async getAnimals(
    query: QueryAnimalsDto = {},
  ): Promise<{ data: Animal[]; total: number }> {
    const limit = 10;
    const page = query.page ?? 1;
    const where: FindOptionsWhere<Animal> = {};

    if (query.farmId) {
      where.farmId = query.farmId;
    }
    if (query.sex) {
      where.sex = query.sex;
    }
    if (query.species) {
      where.species = query.species;
    }
    if (!query.status) {
      where.status = AnimalStatus.ACTIVE;
    } else if (query.status !== 'ALL') {
      where.status = query.status;
    }

    const [data, total] = await this.animalRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { data, total };
  }

  async findByTagId(tagId: string): Promise<Animal> {
    const animal = await this.animalRepository.findOne({ where: { tagId } });
    if (!animal) {
      throw new NotFoundException(`Animal with tagId ${tagId} not found`);
    }
    return animal;
  }

  async updateAnimalData(
    tagId: string,
    updateAnimalDto: UpdateAnimalDto,
  ): Promise<Animal> {
    const animal = await this.findByTagId(tagId);
    Object.assign(animal, updateAnimalDto);
    return this.animalRepository.save(animal);
  }

  async changeStatus(
    tagId: string,
    changeStatusDto: ChangeStatusDto,
  ): Promise<Animal> {
    if (changeStatusDto.status === AnimalStatus.ACTIVE) {
      throw new BadRequestException('status cannot be ACTIVE');
    }
    const animal = await this.findByTagId(tagId);
    animal.status = changeStatusDto.status;
    animal.statusChangedAt = changeStatusDto.date;
    animal.statusReason = changeStatusDto.reason;
    return this.animalRepository.save(animal);
  }

  async getOffspring(tagId: string): Promise<Animal[]> {
    const parent = await this.findByTagId(tagId);
    return this.animalRepository.find({
      where: [{ motherId: parent.id }, { fatherId: parent.id }],
      order: { birthDate: 'DESC', createdAt: 'DESC' },
    });
  }
}
