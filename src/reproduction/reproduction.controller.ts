import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { ReproductionService } from './reproduction.service';
import { InseminationDto } from './dto/insemination.dto';
import { PregnancyCheckDto } from './dto/pregnancy-check.dto';
import { BirthDto } from './dto/birth.dto';
import { HeatDto } from './dto/heat.dto';
import { AbortionDto } from './dto/abortion.dto';
import { HistoryQueryDto } from './dto/history-query.dto';

@Controller('reproduction')
export class ReproductionController {
  constructor(private readonly reproductionService: ReproductionService) {}

  @Post('heat')
  async logHeat(@Body() heatDto: HeatDto) {
    return this.reproductionService.logHeat(heatDto);
  }

  @Post('insemination')
  async logInsemination(@Body() inseminationDto: InseminationDto) {
    return this.reproductionService.logInsemination(inseminationDto);
  }

  @Post('pregnancy-check')
  async logPregnancyCheck(@Body() pregnancyCheckDto: PregnancyCheckDto) {
    return this.reproductionService.logPregnancyCheck(pregnancyCheckDto);
  }

  @Post('birth')
  async logBirth(@Body() birthDto: BirthDto) {
    return this.reproductionService.logBirth(birthDto);
  }

  @Post('abortion')
  async logAbortion(@Body() abortionDto: AbortionDto) {
    return this.reproductionService.logAbortion(abortionDto);
  }

  @Get('history/:animalId')
  async getHistory(
    @Param('animalId') animalId: string,
    @Query() query: HistoryQueryDto,
  ) {
    return this.reproductionService.getHistory(animalId, query);
  }

  @Get('status/:animalId')
  async getStatus(@Param('animalId') animalId: string) {
    return this.reproductionService.getReproductiveStatus(animalId);
  }

  @Get('due-date/:animalId')
  async getDueDate(@Param('animalId') animalId: string) {
    return this.reproductionService.calculateDueDates(animalId);
  }
}
