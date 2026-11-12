import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { HealthService } from './health.service';
import { VaccineDto } from './dto/vaccine.dto';
import { TreatmentDto } from './dto/treatment.dto';
import { DewormingDto } from './dto/deworming.dto';

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

  @Get('reports/ica')
  async generateICAReport(@Query('farmId') farmId: string) {
    return this.healthService.generateICAReport(farmId);
  }
}
