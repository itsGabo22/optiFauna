import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ReproductionService } from './reproduction.service';
import { InseminationDto } from './dto/insemination.dto';
import { PregnancyCheckDto } from './dto/pregnancy-check.dto';
import { BirthDto } from './dto/birth.dto';

@Controller('reproduction')
export class ReproductionController {
  constructor(private readonly reproductionService: ReproductionService) {}

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

  @Get('due-date/:animalId')
  async getDueDate(@Param('animalId') animalId: string) {
    return this.reproductionService.calculateDueDates(animalId);
  }
}
