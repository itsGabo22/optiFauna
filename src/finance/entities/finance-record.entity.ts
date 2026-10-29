import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Farm } from '../../farms/entities/farm.entity';
import { Animal } from '../../animals/entities/animal.entity';

export enum FinanceRecordType {
  YIELD = 'YIELD',
  EXPENSE = 'EXPENSE',
}

export enum FinanceCategory {
  MILK_SALE = 'MILK_SALE',
  MEAT_SALE = 'MEAT_SALE',
  ANIMAL_SALE = 'ANIMAL_SALE',
  FEED_PURCHASE = 'FEED_PURCHASE',
  VETERINARY = 'VETERINARIAN',
  LABOR = 'LABOR',
  INFRASTRUCTURE = 'INFRASTRUCTURE',
  EQUIPMENT = 'EQUIPMENT',
  SERVICES = 'SERVICES',
  OTHER = 'OTHER',
}

@Entity('finance_records')
export class FinanceRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  farmId?: string;

  @ManyToOne(() => Farm, (farm) => farm.financeRecords, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'farmId' })
  farm?: Farm;

  @Column({ nullable: true })
  animalId?: string;

  @ManyToOne(() => Animal, (animal) => animal.financeRecords, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'animalId' })
  animal?: Animal;

  @Column({
    type: 'enum',
    enum: FinanceRecordType,
    default: FinanceRecordType.EXPENSE,
  })
  recordType: FinanceRecordType;

  @Column({
    type: 'enum',
    enum: FinanceCategory,
    default: FinanceCategory.OTHER,
  })
  category: FinanceCategory;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  quantity?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  unitPrice?: number;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ nullable: true })
  receiptNumber?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
