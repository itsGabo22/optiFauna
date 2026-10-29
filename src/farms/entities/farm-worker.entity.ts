import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Farm } from './farm.entity';

export enum WorkerRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  VETERINARIAN = 'VETERINARIAN',
  OPERATOR = 'OPERATOR',
}

@Entity('farm_workers')
export class FarmWorker {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  farmId: string;

  @Column()
  userId: string;

  @Column({
    type: 'enum',
    enum: WorkerRole,
    default: WorkerRole.OPERATOR,
  })
  role: WorkerRole;

  @ManyToOne(() => Farm, (farm) => farm.workers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'farmId' })
  farm: Farm;

  @CreateDateColumn()
  assignedAt: Date;
}
