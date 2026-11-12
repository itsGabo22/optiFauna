import {
  HealthRecord,
  HealthRecordType,
} from '../entities/health-record.entity';

export interface UpcomingHealthEvent {
  recordId: string;
  animalId: string | null;
  type: HealthRecordType;
  title: string | null;
  nextDueDate: string;
  daysRemaining: number;
  overdue: boolean;
}

export interface VaccineSummaryItem {
  vaccineName: string;
  count: number;
  animalsCovered: number;
}

export interface TreatmentSummaryItem {
  medication: string;
  count: number;
}

export interface IcaReport {
  farmId: string;
  period: { from: string; to: string };
  generatedAt: string;
  totalAnimals: number;
  vaccinations: {
    total: number;
    byVaccine: VaccineSummaryItem[];
    coveragePercentage: number;
  };
  treatments: {
    total: number;
    byMedication: TreatmentSummaryItem[];
  };
  dewormings: {
    total: number;
  };
  pendingEvents: UpcomingHealthEvent[];
  records: HealthRecord[];
}
