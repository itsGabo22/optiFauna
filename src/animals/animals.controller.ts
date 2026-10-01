import { Controller, Get, Post, Body, Put, Param, Query } from '@nestjs/common';
import { AnimalsService } from './animals.service';
import { CreateAnimalDto } from './dto/create-animal.dto';
import { UpdateAnimalDto } from './dto/update-animal.dto';

@Controller('animals')
export class AnimalsController {
  constructor(private readonly animalsService: AnimalsService) {}

  @Post()
  async createAnimal(@Body() createAnimalDto: CreateAnimalDto) {
    return this.animalsService.createAnimal(createAnimalDto);
  }

  @Get()
  async getAnimals(
    @Query('farmId') farmId?: string,
    @Query('page') page?: string,
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    return this.animalsService.getAnimals(farmId, pageNumber);
  }

  @Get(':tagId')
  async findByTagId(@Param('tagId') tagId: string) {
    return this.animalsService.findByTagId(tagId);
  }

  @Put(':tagId')
  async updateAnimalData(
    @Param('tagId') tagId: string,
    @Body() updateAnimalDto: UpdateAnimalDto,
  ) {
    return this.animalsService.updateAnimalData(tagId, updateAnimalDto);
  }
}
