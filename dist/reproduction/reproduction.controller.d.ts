import { ReproductionService } from './reproduction.service';
import { InseminationDto } from './dto/insemination.dto';
import { PregnancyCheckDto } from './dto/pregnancy-check.dto';
import { BirthDto } from './dto/birth.dto';
export declare class ReproductionController {
    private readonly reproductionService;
    constructor(reproductionService: ReproductionService);
    logInsemination(inseminationDto: InseminationDto): Promise<any>;
    logPregnancyCheck(pregnancyCheckDto: PregnancyCheckDto): Promise<{
        message: string;
        data: PregnancyCheckDto;
    }>;
    logBirth(birthDto: BirthDto): Promise<any>;
}
