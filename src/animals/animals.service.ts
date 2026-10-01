import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAnimalDto } from './dto/create-animal.dto';
import { UpdateAnimalDto } from './dto/update-animal.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Animal } from './entities/animal.entity';

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

  async getAnimals(farmId?: string, page: number = 1): Promise<{ data: Animal[], total: number }> {
    const limit = 10;
    const [data, total] = await this.animalRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
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

  async updateAnimalData(tagId: string, updateAnimalDto: UpdateAnimalDto): Promise<Animal> {
    const animal = await this.findByTagId(tagId);
    Object.assign(animal, updateAnimalDto);
    return this.animalRepository.save(animal);
  }
}
