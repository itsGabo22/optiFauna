import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('reproduction_records')
export class ReproductionRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  animalId: string;

  @Column()
  eventType: string; // 'INSEMINATION', 'PREGNANCY_CHECK', 'BIRTH'

  @Column({ type: 'date' })
  eventDate: string;

  @Column({ nullable: true })
  details: string;

  @CreateDateColumn()
  createdAt: Date;
}
