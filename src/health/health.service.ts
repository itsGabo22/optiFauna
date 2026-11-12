import { BadRequestException, Injectable } from '@nestjs/common';
import { VaccineDto } from './dto/vaccine.dto';
import { TreatmentDto } from './dto/treatment.dto';
import { DewormingDto } from './dto/deworming.dto';
import { HealthHistoryQueryDto } from './dto/health-history-query.dto';
import { UpcomingHealthQueryDto } from './dto/upcoming-health-query.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, IsNull, LessThanOrEqual, Repository } from 'typeorm';
import {
  HealthRecord,
  HealthRecordType,
} from './entities/health-record.entity';
import {
  IcaReport,
  TreatmentSummaryItem,
  UpcomingHealthEvent,
  VaccineSummaryItem,
} from './interfaces/health-reports.interface';
import { AnimalsService } from '../animals/animals.service';
import { AnimalStatus } from '../animals/entities/animal.entity';
import {
  addDays,
  daysBetween,
  todayIso,
  toIsoDate,
} from '../common/utils/date.utils';

@Injectable()
export class HealthService {
  constructor(
    @InjectRepository(HealthRecord)
    private readonly healthRecordRepository: Repository<HealthRecord>,
    private readonly animalsService: AnimalsService,
  ) {}

  async registerVaccine(vaccineDto: VaccineDto): Promise<HealthRecord> {
    if (!vaccineDto.animalId && !vaccineDto.batchId) {
      throw new BadRequestException(
        'Either animalId or batchId is required to register a vaccine',
      );
    }

    const record = this.healthRecordRepository.create({
      animalId: vaccineDto.animalId,
      batchId: vaccineDto.batchId,
      farmId: vaccineDto.farmId,
      type: HealthRecordType.VACCINE,
      title: vaccineDto.vaccineName,
      medication: vaccineDto.vaccineName,
      dosage: vaccineDto.dosage,
      cost: vaccineDto.cost,
      date: vaccineDto.date,
      nextDueDate: vaccineDto.nextDueDate,
      veterinarian: vaccineDto.veterinarian,
      description:
        vaccineDto.description ?? `Vaccination: ${vaccineDto.vaccineName}`,
    });
    return this.healthRecordRepository.save(record);
  }

  async registerTreatment(treatmentDto: TreatmentDto): Promise<HealthRecord> {
    const record = this.healthRecordRepository.create({
      animalId: treatmentDto.animalId,
      farmId: treatmentDto.farmId,
      type: HealthRecordType.TREATMENT,
      title: treatmentDto.treatmentName,
      medication: treatmentDto.medication ?? treatmentDto.treatmentName,
      dosage: treatmentDto.dosage,
      cost: treatmentDto.cost,
      date: treatmentDto.date,
      nextDueDate: treatmentDto.nextDueDate,
      veterinarian: treatmentDto.veterinarian,
      description:
        treatmentDto.description ?? `Treatment: ${treatmentDto.treatmentName}`,
    });
    return this.healthRecordRepository.save(record);
  }

  async registerDeworming(dewormingDto: DewormingDto): Promise<HealthRecord> {
    const record = this.healthRecordRepository.create({
      animalId: dewormingDto.animalId,
      farmId: dewormingDto.farmId,
      type: HealthRecordType.DEWORMING,
      title: dewormingDto.medication,
      medication: dewormingDto.medication,
      dosage: dewormingDto.dosage,
      cost: dewormingDto.cost,
      date: dewormingDto.date,
      nextDueDate: dewormingDto.nextDueDate,
      veterinarian: dewormingDto.veterinarian,
      description:
        dewormingDto.description ?? `Deworming: ${dewormingDto.medication}`,
    });
    return this.healthRecordRepository.save(record);
  }

  async getAnimalHistory(
    animalId: string,
    query: HealthHistoryQueryDto = {},
  ): Promise<HealthRecord[]> {
    return this.healthRecordRepository.find({
      where: query.type ? { animalId, type: query.type } : { animalId },
      order: { date: 'DESC', createdAt: 'DESC' },
    });
  }

  async getUpcomingEvents(
    query: UpcomingHealthQueryDto = {},
  ): Promise<UpcomingHealthEvent[]> {
    const today = todayIso();
    const until = addDays(today, query.days ?? 30);

    const records = await this.healthRecordRepository.find({
      where: query.farmId
        ? [
            { farmId: query.farmId, nextDueDate: LessThanOrEqual(until) },
            {
              farmId: IsNull(),
              animal: { farmId: query.farmId },
              nextDueDate: LessThanOrEqual(until),
            },
          ]
        : { nextDueDate: LessThanOrEqual(until) },
      relations: { animal: true },
      order: { nextDueDate: 'ASC' },
    });

    return records.map((record) => {
      const nextDueDate = toIsoDate(record.nextDueDate as string);
      const daysRemaining = daysBetween(today, nextDueDate);
      return {
        recordId: record.id,
        animalId: record.animalId ?? null,
        type: record.type,
        title: record.title ?? null,
        nextDueDate,
        daysRemaining,
        overdue: daysRemaining < 0,
      };
    });
  }

  async generateICAReport(
    farmId?: string,
    from?: string,
    to?: string,
  ): Promise<IcaReport> {
    if (!farmId || !farmId.trim()) {
      throw new BadRequestException('farmId query parameter is required');
    }

    const today = todayIso();
    const periodTo = to ? toIsoDate(to) : today;
    const periodFrom = from ? toIsoDate(from) : addDays(periodTo, -365);

    if (periodFrom > periodTo) {
      throw new BadRequestException('from must be on or before to');
    }

    const records = await this.healthRecordRepository.find({
      where: [
        { farmId, date: Between(periodFrom, periodTo) },
        {
          farmId: IsNull(),
          animal: { farmId },
          date: Between(periodFrom, periodTo),
        },
      ],
      relations: { animal: true },
      order: { date: 'DESC', createdAt: 'DESC' },
    });

    const totalAnimals = await this.animalsService.countByFarm(
      farmId,
      AnimalStatus.ACTIVE,
    );

    const vaccineRecords = records.filter(
      (r) => r.type === HealthRecordType.VACCINE,
    );
    const vaccineMap = new Map<
      string,
      { count: number; animalIds: Set<string> }
    >();
    const allVaccinatedAnimals = new Set<string>();

    for (const record of vaccineRecords) {
      const vaccineName = record.title ?? record.medication ?? 'Unknown';
      const entry = vaccineMap.get(vaccineName) ?? {
        count: 0,
        animalIds: new Set<string>(),
      };
      entry.count += 1;
      if (record.animalId) {
        entry.animalIds.add(record.animalId);
        allVaccinatedAnimals.add(record.animalId);
      }
      vaccineMap.set(vaccineName, entry);
    }

    const byVaccine: VaccineSummaryItem[] = Array.from(
      vaccineMap.entries(),
    ).map(([vaccineName, data]) => ({
      vaccineName,
      count: data.count,
      animalsCovered: data.animalIds.size,
    }));

    const coveragePercentage =
      totalAnimals > 0
        ? Math.round((allVaccinatedAnimals.size / totalAnimals) * 10000) / 100
        : 0;

    const treatmentRecords = records.filter(
      (r) => r.type === HealthRecordType.TREATMENT,
    );
    const medicationMap = new Map<string, number>();
    for (const record of treatmentRecords) {
      const medication = record.medication ?? record.title ?? 'Unknown';
      medicationMap.set(medication, (medicationMap.get(medication) ?? 0) + 1);
    }

    const byMedication: TreatmentSummaryItem[] = Array.from(
      medicationMap.entries(),
    ).map(([medication, count]) => ({
      medication,
      count,
    }));

    const dewormingRecords = records.filter(
      (r) => r.type === HealthRecordType.DEWORMING,
    );

    const pendingEvents = await this.getUpcomingEvents({ farmId, days: 30 });

    return {
      farmId,
      period: { from: periodFrom, to: periodTo },
      generatedAt: new Date().toISOString(),
      totalAnimals,
      vaccinations: {
        total: vaccineRecords.length,
        byVaccine,
        coveragePercentage,
      },
      treatments: {
        total: treatmentRecords.length,
        byMedication,
      },
      dewormings: {
        total: dewormingRecords.length,
      },
      pendingEvents,
      records,
    };
  }
}
