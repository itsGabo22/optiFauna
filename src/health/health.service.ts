import { BadRequestException, Injectable } from '@nestjs/common';
import { VaccineDto } from './dto/vaccine.dto';
import { TreatmentDto } from './dto/treatment.dto';
import { DewormingDto } from './dto/deworming.dto';
import { HealthHistoryQueryDto } from './dto/health-history-query.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  HealthRecord,
  HealthRecordType,
} from './entities/health-record.entity';

@Injectable()
export class HealthService {
  constructor(
    @InjectRepository(HealthRecord)
    private readonly healthRecordRepository: Repository<HealthRecord>,
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

  async generateICAReport(farmId: string): Promise<any> {
    const records = await this.healthRecordRepository.find({
      where: farmId ? { farmId } : {},
      order: { date: 'DESC' },
    });

    return {
      farmId,
      status: 'GENERATED',
      totalSanitaryEvents: records.length,
      reportUrl: `http://localhost:3000/reports/ica-${farmId || 'all'}-${Date.now()}.pdf`,
      records,
    };
  }
}
