import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { FarmsService } from './farms.service';
import { CreateFarmDto } from './dto/create-farm.dto';
import { UpdateFarmDto } from './dto/update-farm.dto';
import { AssignWorkerDto } from './dto/assign-worker.dto';

@Controller('farms')
export class FarmsController {
  constructor(private readonly farmsService: FarmsService) {}

  @Post()
  async createFarm(@Body() createFarmDto: CreateFarmDto) {
    return this.farmsService.createFarm(createFarmDto);
  }

  @Get()
  async findAll(@Query('ownerId') ownerId?: string) {
    return this.farmsService.findAll(ownerId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.farmsService.findOne(id);
  }

  @Put(':id')
  async updateFarm(
    @Param('id') id: string,
    @Body() updateFarmDto: UpdateFarmDto,
  ) {
    return this.farmsService.updateFarm(id, updateFarmDto);
  }

  @Post(':id/workers')
  async assignWorker(
    @Param('id') farmId: string,
    @Body() assignWorkerDto: AssignWorkerDto,
  ) {
    return this.farmsService.assignWorker(farmId, assignWorkerDto);
  }
}
