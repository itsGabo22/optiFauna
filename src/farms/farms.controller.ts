import { Controller, Post, Body, Param } from '@nestjs/common';
import { FarmsService } from './farms.service';
import { CreateFarmDto } from './dto/create-farm.dto';
import { AssignWorkerDto } from './dto/assign-worker.dto';

@Controller('farms')
export class FarmsController {
  constructor(private readonly farmsService: FarmsService) {}

  @Post()
  async createFarm(@Body() createFarmDto: CreateFarmDto) {
    return this.farmsService.createFarm(createFarmDto);
  }

  @Post(':id/workers')
  async assignWorker(
    @Param('id') farmId: string,
    @Body() assignWorkerDto: AssignWorkerDto,
  ) {
    return this.farmsService.assignWorker(farmId, assignWorkerDto.userId);
  }
}
