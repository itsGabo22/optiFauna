import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Animal } from '../../animals/entities/animal.entity';
import { Farm } from '../../farms/entities/farm.entity';

export enum HealthRecordType {
  VACCINE = 'VACCINE',
  TREATMENT = 'TREATMENT',
  CHECKUP = 'CHECKUP',
  DEWORMING = 'DEWORMING',
}

@Entity('health_records')
export class HealthRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  animalId?: string;

  @ManyToOne(() => Animal, (animal) => animal.healthRecords, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'animalId' })
  animal?: Animal;

  @Column({ nullable: true })
  farmId?: string;

  @ManyToOne(() => Farm, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'farmId' })
  farm?: Farm;

  @Column({ nullable: true })
  batchId?: string;

  @Column({
    type: 'enum',
    enum: HealthRecordType,
    default: HealthRecordType.CHECKUP,
  })
  type: HealthRecordType;

  @Column({ nullable: true })
  title?: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  medication?: string;

  @Column({ nullable: true })
  dosage?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cost?: number;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'date', nullable: true })
  nextDueDate?: string;

  @Column({ nullable: true })
  veterinarian?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
