import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Report } from './report.entity';
import { InvoiceData } from '../types/invoice.types';

@Entity('uploads')
export class Upload {
  @PrimaryColumn()
  id: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @Column({ type: 'varchar', nullable: true })
  country: string | null;

  @Column({ type: 'varchar', nullable: true })
  erp: string | null;

  @Column({ type: 'int', default: 0 })
  rows_parsed: number;

  @Column({ type: 'jsonb' })
  file_data: InvoiceData;

  @Column({ type: 'varchar', length: 50 })
  file_type: string;

  @OneToMany(() => Report, (report) => report.upload)
  reports: Report[];
}
