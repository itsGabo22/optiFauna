import { BadRequestException, Injectable } from '@nestjs/common';
import { VaccineDto } from './dto/vaccine.dto';
import { TreatmentDto } from './dto/treatment.dto';
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
      type: HealthRecordType.TREATMENT,
      title: treatmentDto.treatmentName,
      medication: treatmentDto.treatmentName,
      date: treatmentDto.date,
      description: `Treatment: ${treatmentDto.treatmentName}`,
    });
    return this.healthRecordRepository.save(record);
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
