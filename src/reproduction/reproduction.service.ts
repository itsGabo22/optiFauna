import { Injectable } from '@nestjs/common';
import { InseminationDto } from './dto/insemination.dto';
import { PregnancyCheckDto } from './dto/pregnancy-check.dto';
import { BirthDto } from './dto/birth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ReproductionRecord,
  ReproductionEventType,
  PregnancyResult,
} from './entities/reproduction-record.entity';

@Injectable()
export class ReproductionService {
  constructor(
    @InjectRepository(ReproductionRecord)
    private readonly reproductionRepository: Repository<ReproductionRecord>,
  ) {}

  async logInsemination(inseminationDto: InseminationDto): Promise<ReproductionRecord> {
    // Gestation period for cattle is roughly 283 days (~9 months and 10 days)
    const inseminationDate = new Date(inseminationDto.date);
    const estimatedDueDate = new Date(inseminationDate);
    estimatedDueDate.setDate(estimatedDueDate.getDate() + 283);

    const record = this.reproductionRepository.create({
      animalId: inseminationDto.animalId,
      eventType: ReproductionEventType.INSEMINATION,
      eventDate: inseminationDto.date,
      sireIdOrSemen: inseminationDto.bullIdOrSemen,
      estimatedDueDate: estimatedDueDate.toISOString().split('T')[0],
      pregnancyResult: PregnancyResult.PENDING,
      details: `Insemination with sire/straw: ${inseminationDto.bullIdOrSemen}`,
    });

    return this.reproductionRepository.save(record);
  }

  async logPregnancyCheck(
    pregnancyCheckDto: PregnancyCheckDto,
  ): Promise<ReproductionRecord> {
    const record = this.reproductionRepository.create({
      animalId: pregnancyCheckDto.animalId,
      eventType: ReproductionEventType.PREGNANCY_CHECK,
      eventDate: pregnancyCheckDto.date,
      pregnancyResult: pregnancyCheckDto.isPregnant
        ? PregnancyResult.CONFIRMED_POSITIVE
        : PregnancyResult.CONFIRMED_NEGATIVE,
      details: pregnancyCheckDto.isPregnant
        ? 'Pregnancy confirmed positive'
        : 'Pregnancy confirmed negative',
    });

    return this.reproductionRepository.save(record);
  }

  async calculateDueDates(animalId: string): Promise<any> {
    const lastInsemination = await this.reproductionRepository.findOne({
      where: {
        animalId,
        eventType: ReproductionEventType.INSEMINATION,
      },
      order: { eventDate: 'DESC' },
    });

    return {
      animalId,
      lastInseminationDate: lastInsemination?.eventDate || null,
      estimatedDueDate: lastInsemination?.estimatedDueDate || null,
    };
  }

  async logBirth(birthDto: BirthDto): Promise<ReproductionRecord> {
    const record = this.reproductionRepository.create({
      animalId: birthDto.motherId,
      eventType: ReproductionEventType.BIRTH,
      eventDate: birthDto.date,
      offspringSex: birthDto.calfGender,
      details: `Birth of calf (${birthDto.calfGender}) recorded`,
    });

    return this.reproductionRepository.save(record);
  }
}
