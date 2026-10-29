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

export enum ReproductionEventType {
  INSEMINATION = 'INSEMINATION',
  HEAT_DETECTION = 'HEAT_DETECTION',
  PREGNANCY_CHECK = 'PREGNANCY_CHECK',
  BIRTH = 'BIRTH',
  ABORTION = 'ABORTION',
  WEANING = 'WEANING',
}

export enum PregnancyResult {
  PENDING = 'PENDING',
  CONFIRMED_POSITIVE = 'CONFIRMED_POSITIVE',
  CONFIRMED_NEGATIVE = 'CONFIRMED_NEGATIVE',
}

@Entity('reproduction_records')
export class ReproductionRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  animalId: string;

  @ManyToOne(() => Animal, (animal) => animal.reproductionRecords, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'animalId' })
  animal: Animal;

  @Column({
    type: 'enum',
    enum: ReproductionEventType,
    default: ReproductionEventType.INSEMINATION,
  })
  eventType: ReproductionEventType;

  @Column({ type: 'date' })
  eventDate: string;

  @Column({ nullable: true })
  inseminationType?: string; // e.g. ARTIFICIAL, NATURAL

  @Column({ nullable: true })
  sireIdOrSemen?: string; // Bull ID or Semen Straw code

  @Column({
    type: 'enum',
    enum: PregnancyResult,
    nullable: true,
  })
  pregnancyResult?: PregnancyResult;

  @Column({ type: 'date', nullable: true })
  estimatedDueDate?: string;

  @Column({ nullable: true })
  offspringTagId?: string;

  @Column({ nullable: true })
  offspringSex?: string;

  @Column({ type: 'text', nullable: true })
  details?: string;

  @Column({ nullable: true })
  technician?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
