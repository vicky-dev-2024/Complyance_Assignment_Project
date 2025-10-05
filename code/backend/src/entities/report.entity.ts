import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Upload } from './upload.entity';
import { ReportDto } from '../dto/report.dto';

@Entity('reports')
export class Report {
  @PrimaryColumn()
  id: string;

  @Column()
  upload_id: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @Column({ type: 'int', default: 0 })
  scores_overall: number;

  @Column({ type: 'jsonb' })
  report_json: ReportDto;

  @Column({ type: 'timestamp', nullable: true })
  expires_at: Date;

  @ManyToOne(() => Upload, (upload) => upload.reports)
  @JoinColumn({ name: 'upload_id' })
  upload: Upload;
}
