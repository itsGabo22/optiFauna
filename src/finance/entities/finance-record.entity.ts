import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('finance_records')
export class FinanceRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  animalId: string; // Can be null if it's a general farm expense

  @Column()
  recordType: string; // 'YIELD' or 'EXPENSE'

  @Column('decimal')
  amount: number;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;
}
