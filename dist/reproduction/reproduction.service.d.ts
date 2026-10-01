import { InseminationDto } from './dto/insemination.dto';
import { BirthDto } from './dto/birth.dto';
import { Repository } from 'typeorm';
import { ReproductionRecord } from './entities/reproduction-record.entity';
export declare class ReproductionService {
    private readonly reproductionRepository;
    constructor(reproductionRepository: Repository<ReproductionRecord>);
    logInsemination(inseminationDto: InseminationDto): Promise<any>;
    calculateDueDates(animalId: string): Promise<any>;
    logBirth(birthDto: BirthDto): Promise<any>;
}
