import { Injectable } from '@nestjs/common';
import { VaccineDto } from './dto/vaccine.dto';
import { TreatmentDto } from './dto/treatment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HealthRecord, HealthRecordType } from './entities/health-record.entity';

@Injectable()
export class HealthService {
  constructor(
    @InjectRepository(HealthRecord)
    private readonly healthRecordRepository: Repository<HealthRecord>,
  ) {}

  async registerVaccine(vaccineDto: VaccineDto): Promise<HealthRecord> {
    const record = this.healthRecordRepository.create({
      animalId: vaccineDto.animalId,
      batchId: vaccineDto.batchId,
      type: HealthRecordType.VACCINE,
      title: vaccineDto.vaccineName,
      medication: vaccineDto.vaccineName,
      date: vaccineDto.date,
      description: `Vaccination: ${vaccineDto.vaccineName}`,
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
