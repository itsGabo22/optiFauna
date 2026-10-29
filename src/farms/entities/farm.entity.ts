import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Animal } from '../../animals/entities/animal.entity';
import { FarmWorker } from './farm-worker.entity';
import { FinanceRecord } from '../../finance/entities/finance-record.entity';
import { NutritionRecord } from '../../nutrition/entities/nutrition-record.entity';

@Entity('farms')
export class Farm {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  name: string;

  @Column({ length: 255 })
  location: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  sizeHectares?: number;

  @Column({ nullable: true })
  ownerId?: string;

  @OneToMany(() => Animal, (animal) => animal.farm)
  animals: Animal[];

  @OneToMany(() => FarmWorker, (worker) => worker.farm)
  workers: FarmWorker[];

  @OneToMany(() => FinanceRecord, (finance) => finance.farm)
  financeRecords: FinanceRecord[];

  @OneToMany(() => NutritionRecord, (nutrition) => nutrition.farm)
  nutritionRecords: NutritionRecord[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
