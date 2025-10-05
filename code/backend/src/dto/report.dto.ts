export interface ScoresDto {
  data: number;
  coverage: number;
  rules: number;
  posture: number;
  overall: number;
}

export interface CoverageMatchDto {
  target: string;
  candidate: string;
  confidence: number;
}

export interface CoverageDto {
  matched: string[];
  close: CoverageMatchDto[];
  missing: string[];
}

export interface RuleFindingDto {
  rule: string;
  ok: boolean;
  exampleLine?: number;
  expected?: number;
  got?: number;
  value?: string;
  details?: string;
}

export interface ReportMetaDto {
  rowsParsed: number;
  linesTotal: number;
  country?: string;
  erp?: string;
  db: string;
}

export class ReportDto {
  reportId: string;
  scores: ScoresDto;
  coverage: CoverageDto;
  ruleFindings: RuleFindingDto[];
  gaps: string[];
  meta: ReportMetaDto;
}

export interface ReportSummaryDto {
  id: string;
  uploadId: string;
  createdAt: Date;
  overallScore: number;
  expiresAt: Date;
}

export interface HealthDto {
  status: string;
  database: {
    type: string;
    connected: boolean;
    error?: string;
  };
  timestamp: string;
}
