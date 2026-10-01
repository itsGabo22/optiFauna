import { Controller, Post, Body } from '@nestjs/common';
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
    // Structural implementation: controller delegates business operations to service
    // In a real implementation this would call a method like logPregnancyCheck on the service
    return { message: 'Pregnancy check structurally logged', data: pregnancyCheckDto };
  }

  @Post('birth')
  async logBirth(@Body() birthDto: BirthDto) {
    return this.reproductionService.logBirth(birthDto);
  }
}
