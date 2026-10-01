import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('nutrition_records')
export class NutritionRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  animalGroupId: string;

  @Column()
  dietName: string;

  @Column('decimal')
  dailyAmountKg: number;

  @CreateDateColumn()
  createdAt: Date;
}
