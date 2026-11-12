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

@Entity('nutrition_records')
export class NutritionRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  farmId?: string;

  @ManyToOne(() => Farm, (farm) => farm.nutritionRecords, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'farmId' })
  farm?: Farm;

  /** A diet targets either one animal (animalId) or a group/lot (animalGroupId). */
  @Column({ nullable: true })
  animalId?: string;

  @ManyToOne(() => Animal, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'animalId' })
  animal?: Animal;

  @Column({ nullable: true })
  animalGroupId?: string;

  @Column()
  dietName: string;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  dailyAmountKg: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  costPerKg?: number;

  @Column({ type: 'date', nullable: true })
  startDate?: string;

  @Column({ type: 'date', nullable: true })
  endDate?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
