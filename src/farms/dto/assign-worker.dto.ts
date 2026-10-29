import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { WorkerRole } from '../entities/farm-worker.entity';

export class AssignWorkerDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsEnum(WorkerRole)
  @IsOptional()
  role?: WorkerRole;
}
