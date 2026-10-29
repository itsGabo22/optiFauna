import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Farm } from '../../farms/entities/farm.entity';
import { HealthRecord } from '../../health/entities/health-record.entity';
import { ReproductionRecord } from '../../reproduction/entities/reproduction-record.entity';
import { FinanceRecord } from '../../finance/entities/finance-record.entity';

export enum AnimalSex {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
}

export enum AnimalStatus {
  ACTIVE = 'ACTIVE',
  SOLD = 'SOLD',
  DECEASED = 'DECEASED',
  CULLED = 'CULLED',
}

@Entity('animals')
export class Animal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  tagId: string;

  @Column({ nullable: true })
  name?: string;

  @Column()
  species: string;

  @Column()
  breed: string;

  @Column({
    type: 'enum',
    enum: AnimalSex,
    default: AnimalSex.FEMALE,
  })
  sex: AnimalSex;

  @Column({ type: 'date' })
  birthDate: string;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  weightKg?: number;

  @Column({
    type: 'enum',
    enum: AnimalStatus,
    default: AnimalStatus.ACTIVE,
  })
  status: AnimalStatus;

  @Column({ nullable: true })
  farmId?: string;

  @ManyToOne(() => Farm, (farm) => farm.animals, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'farmId' })
  farm?: Farm;

  @Column({ nullable: true })
  motherId?: string;

  @ManyToOne(() => Animal, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'motherId' })
  mother?: Animal;

  @Column({ nullable: true })
  fatherId?: string;

  @ManyToOne(() => Animal, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'fatherId' })
  father?: Animal;

  @OneToMany(() => HealthRecord, (record) => record.animal)
  healthRecords: HealthRecord[];

  @OneToMany(() => ReproductionRecord, (record) => record.animal)
  reproductionRecords: ReproductionRecord[];

  @OneToMany(() => FinanceRecord, (record) => record.animal)
  financeRecords: FinanceRecord[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
