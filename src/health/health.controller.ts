import { Controller, Post, Get, Body, Query, Param } from '@nestjs/common';
import { HealthService } from './health.service';
import { VaccineDto } from './dto/vaccine.dto';
import { TreatmentDto } from './dto/treatment.dto';
import { DewormingDto } from './dto/deworming.dto';
import { HealthHistoryQueryDto } from './dto/health-history-query.dto';
import { UpcomingHealthQueryDto } from './dto/upcoming-health-query.dto';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Post('vaccines')
  async registerVaccine(@Body() vaccineDto: VaccineDto) {
    return this.healthService.registerVaccine(vaccineDto);
  }

  @Post('treatments')
  async registerTreatment(@Body() treatmentDto: TreatmentDto) {
    return this.healthService.registerTreatment(treatmentDto);
  }

  @Post('dewormings')
  async registerDeworming(@Body() dewormingDto: DewormingDto) {
    return this.healthService.registerDeworming(dewormingDto);
  }

  @Get('animal/:animalId')
  async getAnimalHistory(
    @Param('animalId') animalId: string,
    @Query() query: HealthHistoryQueryDto,
  ) {
    return this.healthService.getAnimalHistory(animalId, query);
  }

  @Get('upcoming')
  async getUpcomingEvents(@Query() query: UpcomingHealthQueryDto) {
    return this.healthService.getUpcomingEvents(query);
  }

  @Get('reports/ica')
  async generateICAReport(@Query('farmId') farmId: string) {
    return this.healthService.generateICAReport(farmId);
  }
}
