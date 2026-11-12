import { Farm } from '../entities/farm.entity';

export interface FarmDetails extends Farm {
  animalsCount: number;
}

export interface RemovedWorkerResult {
  deleted: boolean;
  id: string;
  farmId: string;
  userId: string;
}
