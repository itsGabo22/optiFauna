import { HealthRecordType } from '../entities/health-record.entity';

export interface UpcomingHealthEvent {
  recordId: string;
  animalId: string | null;
  type: HealthRecordType;
  title: string | null;
  nextDueDate: string;
  daysRemaining: number;
  overdue: boolean;
}
