import { Injectable } from '@nestjs/common';
import { InseminationDto } from './dto/insemination.dto';
import { PregnancyCheckDto } from './dto/pregnancy-check.dto';
import { BirthDto } from './dto/birth.dto';
import { HeatDto } from './dto/heat.dto';
import { AbortionDto } from './dto/abortion.dto';
import { HistoryQueryDto } from './dto/history-query.dto';
import { UpcomingBirthsQueryDto } from './dto/upcoming-births-query.dto';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';
import {
  ReproductionRecord,
  ReproductionEventType,
  PregnancyResult,
} from './entities/reproduction-record.entity';
import {
  DueDateInfo,
  OPEN_DAYS_TARGET,
  OpenDaysReport,
  ReproductiveStatusReport,
  UpcomingBirth,
} from './interfaces/reproduction-reports.interface';
import {
  addDays,
  daysBetween,
  todayIso,
  toIsoDate,
} from '../common/utils/date.utils';

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

  async logInsemination(
    inseminationDto: InseminationDto,
  ): Promise<ReproductionRecord> {
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

  async calculateDueDates(animalId: string): Promise<DueDateInfo> {
    const lastInsemination = await this.reproductionRepository.findOne({
      where: {
        animalId,
        eventType: ReproductionEventType.INSEMINATION,
      },
      order: { eventDate: 'DESC' },
    });

    const estimatedDueDate = lastInsemination?.estimatedDueDate
      ? toIsoDate(lastInsemination.estimatedDueDate)
      : null;

    return {
      animalId,
      lastInseminationDate: lastInsemination
        ? toIsoDate(lastInsemination.eventDate)
        : null,
      pregnancyResult: lastInsemination?.pregnancyResult ?? null,
      estimatedDueDate,
      daysToDueDate: estimatedDueDate
        ? daysBetween(todayIso(), estimatedDueDate)
        : null,
    };
  }

  async getReproductiveStatus(
    animalId: string,
  ): Promise<ReproductiveStatusReport> {
    const records = await this.getHistory(animalId);
    const today = todayIso();

    const report: ReproductiveStatusReport = {
      animalId,
      status: 'NO_RECORDS',
      lastEventType: null,
      lastEventDate: null,
      daysInStatus: null,
      estimatedDueDate: null,
      daysToDueDate: null,
    };

    if (records.length === 0) {
      return report;
    }

    report.lastEventType = records[0].eventType;
    report.lastEventDate = toIsoDate(records[0].eventDate);

    // Records are ordered newest first; the first state-changing event wins.
    for (const record of records) {
      const eventDate = toIsoDate(record.eventDate);

      switch (record.eventType) {
        case ReproductionEventType.BIRTH:
        case ReproductionEventType.ABORTION:
          return this.withStatus(report, 'OPEN', eventDate, today);

        case ReproductionEventType.PREGNANCY_CHECK:
          if (record.pregnancyResult === PregnancyResult.CONFIRMED_POSITIVE) {
            const dueDate =
              record.estimatedDueDate ??
              this.findDueDateBefore(records, eventDate);
            return this.withStatus(
              report,
              'PREGNANT',
              eventDate,
              today,
              dueDate,
            );
          }
          return this.withStatus(report, 'OPEN', eventDate, today);

        case ReproductionEventType.INSEMINATION:
          if (record.pregnancyResult === PregnancyResult.CONFIRMED_NEGATIVE) {
            return this.withStatus(report, 'OPEN', eventDate, today);
          }
          if (record.pregnancyResult === PregnancyResult.CONFIRMED_POSITIVE) {
            return this.withStatus(
              report,
              'PREGNANT',
              eventDate,
              today,
              record.estimatedDueDate,
            );
          }
          return this.withStatus(
            report,
            'INSEMINATED',
            eventDate,
            today,
            record.estimatedDueDate,
          );

        default:
          // HEAT_DETECTION and WEANING do not change the reproductive state.
          continue;
      }
    }

    // Only heats/weanings on file: the animal has never been served.
    return this.withStatus(report, 'OPEN', report.lastEventDate, today);
  }

  async calculateOpenDays(animalId: string): Promise<OpenDaysReport> {
    const records = await this.getHistory(animalId); // newest first
    const today = todayIso();

    const report: OpenDaysReport = {
      animalId,
      lastBirthDate: null,
      conceptionDate: null,
      openDays: null,
      isClosed: false,
      target: OPEN_DAYS_TARGET,
      exceedsTarget: null,
    };

    const lastBirth = records.find(
      (r) => r.eventType === ReproductionEventType.BIRTH,
    );
    if (!lastBirth) {
      // Heifers have no calving yet, so open days are not defined.
      return report;
    }

    const lastBirthDate = toIsoDate(lastBirth.eventDate);
    const afterBirth = records.filter(
      (r) => r.id !== lastBirth.id && toIsoDate(r.eventDate) >= lastBirthDate,
    );

    // Conception = the insemination after the last calving whose pregnancy was
    // confirmed positive and that was not undone by a later abortion.
    const lastAbortion = afterBirth.find(
      (r) => r.eventType === ReproductionEventType.ABORTION,
    );
    const conception = afterBirth.find(
      (r) =>
        r.eventType === ReproductionEventType.INSEMINATION &&
        r.pregnancyResult === PregnancyResult.CONFIRMED_POSITIVE &&
        (!lastAbortion ||
          toIsoDate(r.eventDate) > toIsoDate(lastAbortion.eventDate)),
    );

    const conceptionDate = conception ? toIsoDate(conception.eventDate) : null;
    const openDays = daysBetween(lastBirthDate, conceptionDate ?? today);

    return {
      ...report,
      lastBirthDate,
      conceptionDate,
      openDays,
      isClosed: conception !== undefined,
      exceedsTarget: openDays > OPEN_DAYS_TARGET,
    };
  }

  async getUpcomingBirths(
    query: UpcomingBirthsQueryDto = {},
  ): Promise<UpcomingBirth[]> {
    const today = todayIso();
    const until = addDays(today, query.days ?? 30);

    const candidates = await this.reproductionRepository.find({
      where: {
        eventType: ReproductionEventType.INSEMINATION,
        pregnancyResult: PregnancyResult.CONFIRMED_POSITIVE,
        estimatedDueDate: Between(today, until),
        ...(query.farmId ? { animal: { farmId: query.farmId } } : {}),
      },
      relations: { animal: true },
      order: { estimatedDueDate: 'ASC' },
    });

    const upcoming: UpcomingBirth[] = [];
    for (const record of candidates) {
      // Skip pregnancies that already ended (calving or abortion registered
      // on or after the insemination date).
      const alreadyEnded = await this.reproductionRepository.count({
        where: {
          animalId: record.animalId,
          eventType: In([
            ReproductionEventType.BIRTH,
            ReproductionEventType.ABORTION,
          ]),
          eventDate: MoreThanOrEqual(record.eventDate),
        },
      });
      if (alreadyEnded > 0) {
        continue;
      }

      const estimatedDueDate = toIsoDate(record.estimatedDueDate as string);
      upcoming.push({
        animalId: record.animalId,
        tagId: record.animal?.tagId ?? null,
        farmId: record.animal?.farmId ?? null,
        inseminationDate: toIsoDate(record.eventDate),
        estimatedDueDate,
        daysToDueDate: daysBetween(today, estimatedDueDate),
        sireIdOrSemen: record.sireIdOrSemen ?? null,
      });
    }

    return upcoming;
  }

  private withStatus(
    report: ReproductiveStatusReport,
    status: ReproductiveStatusReport['status'],
    sinceDate: string | null,
    today: string,
    dueDate?: string | null,
  ): ReproductiveStatusReport {
    const estimatedDueDate = dueDate ? toIsoDate(dueDate) : null;
    return {
      ...report,
      status,
      daysInStatus: sinceDate ? daysBetween(sinceDate, today) : null,
      estimatedDueDate,
      daysToDueDate: estimatedDueDate
        ? daysBetween(today, estimatedDueDate)
        : null,
    };
  }

  /** Due date of the latest insemination on or before `date` (records newest first). */
  private findDueDateBefore(
    records: ReproductionRecord[],
    date: string,
  ): string | null {
    const insemination = records.find(
      (r) =>
        r.eventType === ReproductionEventType.INSEMINATION &&
        toIsoDate(r.eventDate) <= date,
    );
    return insemination?.estimatedDueDate ?? null;
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
