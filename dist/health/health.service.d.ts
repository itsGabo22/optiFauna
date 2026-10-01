import { VaccineDto } from './dto/vaccine.dto';
import { TreatmentDto } from './dto/treatment.dto';
import { Repository } from 'typeorm';
import { HealthRecord } from './entities/health-record.entity';
export declare class HealthService {
    private readonly healthRecordRepository;
    constructor(healthRecordRepository: Repository<HealthRecord>);
    registerVaccine(vaccineDto: VaccineDto): Promise<any>;
    registerTreatment(treatmentDto: TreatmentDto): Promise<any>;
    generateICAReport(farmId: string): Promise<any>;
}
