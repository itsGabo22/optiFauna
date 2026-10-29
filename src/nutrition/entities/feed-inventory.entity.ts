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

export enum FeedCategory {
  FORAGE = 'FORAGE',
  CONCENTRATE = 'CONCENTRATE',
  MINERAL_SALT = 'MINERAL_SALT',
  SUPPLEMENT = 'SUPPLEMENT',
  SILAGE = 'SILAGE',
  OTHER = 'OTHER',
}

@Entity('feed_inventory')
export class FeedInventory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  farmId: string;

  @ManyToOne(() => Farm, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'farmId' })
  farm: Farm;

  @Column()
  feedName: string;

  @Column({
    type: 'enum',
    enum: FeedCategory,
    default: FeedCategory.CONCENTRATE,
  })
  category: FeedCategory;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  currentStockKg: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  minStockAlertKg?: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  unitCost?: number;

  @Column({ type: 'date', nullable: true })
  lastRestockDate?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
