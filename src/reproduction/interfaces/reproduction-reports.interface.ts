import {
  PregnancyResult,
  ReproductionEventType,
} from '../entities/reproduction-record.entity';

export type ReproductiveStatus =
  'NO_RECORDS' | 'OPEN' | 'INSEMINATED' | 'PREGNANT';

export interface ReproductiveStatusReport {
  animalId: string;
  status: ReproductiveStatus;
  lastEventType: ReproductionEventType | null;
  lastEventDate: string | null;
  daysInStatus: number | null;
  estimatedDueDate: string | null;
  daysToDueDate: number | null;
}

export interface DueDateInfo {
  animalId: string;
  lastInseminationDate: string | null;
  pregnancyResult: PregnancyResult | null;
  estimatedDueDate: string | null;
  daysToDueDate: number | null;
}

export const OPEN_DAYS_TARGET = 85;

export interface OpenDaysReport {
  animalId: string;
  lastBirthDate: string | null;
  conceptionDate: string | null;
  openDays: number | null;
  isClosed: boolean;
  target: number;
  exceedsTarget: boolean | null;
}

export interface UpcomingBirth {
  animalId: string;
  tagId: string | null;
  farmId: string | null;
  inseminationDate: string;
  estimatedDueDate: string;
  daysToDueDate: number;
  sireIdOrSemen: string | null;
}
