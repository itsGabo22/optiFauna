import { HealthService } from './health.service';
import { VaccineDto } from './dto/vaccine.dto';
import { TreatmentDto } from './dto/treatment.dto';
export declare class HealthController {
    private readonly healthService;
    constructor(healthService: HealthService);
    registerVaccine(vaccineDto: VaccineDto): Promise<any>;
    registerTreatment(treatmentDto: TreatmentDto): Promise<any>;
    generateICAReport(farmId: string): Promise<any>;
}
