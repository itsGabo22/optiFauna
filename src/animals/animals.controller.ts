import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Patch,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AnimalsService } from './animals.service';
import { CreateAnimalDto } from './dto/create-animal.dto';
import { UpdateAnimalDto } from './dto/update-animal.dto';
import { QueryAnimalsDto } from './dto/query-animals.dto';
import { ChangeStatusDto } from './dto/change-status.dto';

@ApiTags('animals')
@Controller('animals')
export class AnimalsController {
  constructor(private readonly animalsService: AnimalsService) {}

  @Post()
  async createAnimal(@Body() createAnimalDto: CreateAnimalDto) {
    return this.animalsService.createAnimal(createAnimalDto);
  }

  @Get()
  async getAnimals(@Query() query: QueryAnimalsDto) {
    return this.animalsService.getAnimals(query);
  }

  @Get(':tagId/offspring')
  async getOffspring(@Param('tagId') tagId: string) {
    return this.animalsService.getOffspring(tagId);
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

  @Patch(':tagId/status')
  async changeStatus(
    @Param('tagId') tagId: string,
    @Body() changeStatusDto: ChangeStatusDto,
  ) {
    return this.animalsService.changeStatus(tagId, changeStatusDto);
  }
}
