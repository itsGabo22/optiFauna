import {
  PregnancyResult,
  ReproductionEventType,
} from '../entities/reproduction-record.entity';

/**
 * Current reproductive state of a female, derived from her latest
 * state-changing event (heat detections and weanings do not change it).
 *
 * - NO_RECORDS: the animal has no reproductive events.
 * - OPEN: calved, aborted, confirmed empty, or never inseminated.
 * - INSEMINATED: inseminated, pregnancy check still pending.
 * - PREGNANT: pregnancy confirmed positive.
 */
export type ReproductiveStatus =
  | 'NO_RECORDS'
  | 'OPEN'
  | 'INSEMINATED'
  | 'PREGNANT';

export interface ReproductiveStatusReport {
  animalId: string;
  status: ReproductiveStatus;
  lastEventType: ReproductionEventType | null;
  lastEventDate: string | null;
  /** Days elapsed since the event that defines the current status. */
  daysInStatus: number | null;
  estimatedDueDate: string | null;
  /** Negative when the due date already passed. */
  daysToDueDate: number | null;
}

export interface DueDateInfo {
  animalId: string;
  lastInseminationDate: string | null;
  pregnancyResult: PregnancyResult | null;
  estimatedDueDate: string | null;
  daysToDueDate: number | null;
}

/** Target used by dairy herds in the Nariño highlands: calving every ~12 months. */
export const OPEN_DAYS_TARGET = 85;

export interface OpenDaysReport {
  animalId: string;
  lastBirthDate: string | null;
  /** Date of the insemination that produced the confirmed pregnancy. */
  conceptionDate: string | null;
  /** Days from last birth to conception, or to today if still open. */
  openDays: number | null;
  /** true when a pregnancy has been confirmed after the last birth. */
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
