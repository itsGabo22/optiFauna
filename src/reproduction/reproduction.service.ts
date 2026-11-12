import { Injectable } from '@nestjs/common';
import { InseminationDto } from './dto/insemination.dto';
import { PregnancyCheckDto } from './dto/pregnancy-check.dto';
import { BirthDto } from './dto/birth.dto';
import { HeatDto } from './dto/heat.dto';
import { AbortionDto } from './dto/abortion.dto';
import { HistoryQueryDto } from './dto/history-query.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
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

  async logHeat(heatDto: HeatDto): Promise<ReproductionRecord> {
    const record = this.reproductionRepository.create({
      animalId: heatDto.animalId,
      eventType: ReproductionEventType.HEAT_DETECTION,
      eventDate: heatDto.date,
      technician: heatDto.observedBy,
      details: heatDto.notes ?? 'Heat (estrus) detected',
    });

    return this.reproductionRepository.save(record);
  }

  async logInsemination(inseminationDto: InseminationDto): Promise<ReproductionRecord> {
    // Gestation period for cattle is roughly 283 days (~9 months and 10 days)
    const inseminationDate = new Date(inseminationDto.date);
    const estimatedDueDate = new Date(inseminationDate);
    estimatedDueDate.setDate(estimatedDueDate.getDate() + 283);

    const record = this.reproductionRepository.create({
      animalId: inseminationDto.animalId,
      eventType: ReproductionEventType.INSEMINATION,
      eventDate: inseminationDto.date,
      inseminationType: inseminationDto.inseminationType,
      sireIdOrSemen: inseminationDto.bullIdOrSemen,
      technician: inseminationDto.technician,
      estimatedDueDate: estimatedDueDate.toISOString().split('T')[0],
      pregnancyResult: PregnancyResult.PENDING,
      details: `${inseminationDto.inseminationType} insemination with sire/straw: ${inseminationDto.bullIdOrSemen}`,
    });

    return this.reproductionRepository.save(record);
  }

  async logPregnancyCheck(
    pregnancyCheckDto: PregnancyCheckDto,
  ): Promise<ReproductionRecord> {
    const result = pregnancyCheckDto.isPregnant
      ? PregnancyResult.CONFIRMED_POSITIVE
      : PregnancyResult.CONFIRMED_NEGATIVE;

    // The check resolves the most recent insemination that is still pending,
    // so the insemination record carries the final result and its due date
    // can be used for upcoming-birth alerts.
    const pendingInsemination = await this.reproductionRepository.findOne({
      where: {
        animalId: pregnancyCheckDto.animalId,
        eventType: ReproductionEventType.INSEMINATION,
        pregnancyResult: PregnancyResult.PENDING,
        eventDate: LessThanOrEqual(pregnancyCheckDto.date),
      },
      order: { eventDate: 'DESC' },
    });

    if (pendingInsemination) {
      pendingInsemination.pregnancyResult = result;
      await this.reproductionRepository.save(pendingInsemination);
    }

    const record = this.reproductionRepository.create({
      animalId: pregnancyCheckDto.animalId,
      eventType: ReproductionEventType.PREGNANCY_CHECK,
      eventDate: pregnancyCheckDto.date,
      pregnancyResult: result,
      estimatedDueDate: pregnancyCheckDto.isPregnant
        ? pendingInsemination?.estimatedDueDate
        : undefined,
      details: pregnancyCheckDto.isPregnant
        ? 'Pregnancy confirmed positive'
        : 'Pregnancy confirmed negative',
    });

    return this.reproductionRepository.save(record);
  }

  async getHistory(
    animalId: string,
    query: HistoryQueryDto = {},
  ): Promise<ReproductionRecord[]> {
    return this.reproductionRepository.find({
      where: query.eventType
        ? { animalId, eventType: query.eventType }
        : { animalId },
      order: { eventDate: 'DESC', createdAt: 'DESC' },
    });
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

  async logAbortion(abortionDto: AbortionDto): Promise<ReproductionRecord> {
    const record = this.reproductionRepository.create({
      animalId: abortionDto.animalId,
      eventType: ReproductionEventType.ABORTION,
      eventDate: abortionDto.date,
      pregnancyResult: PregnancyResult.CONFIRMED_NEGATIVE,
      details: abortionDto.cause
        ? `Abortion recorded. Cause: ${abortionDto.cause}`
        : 'Abortion recorded',
    });

    return this.reproductionRepository.save(record);
  }

  async logBirth(birthDto: BirthDto): Promise<ReproductionRecord> {
    const record = this.reproductionRepository.create({
      animalId: birthDto.motherId,
      eventType: ReproductionEventType.BIRTH,
      eventDate: birthDto.date,
      offspringSex: birthDto.calfGender,
      offspringTagId: birthDto.offspringTagId,
      details:
        birthDto.notes ??
        `Birth of ${birthDto.calfGender.toLowerCase()} calf recorded`,
    });

    return this.reproductionRepository.save(record);
  }
}
