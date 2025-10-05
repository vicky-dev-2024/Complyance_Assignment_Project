// API Request and Response Types

export interface UploadResponse {
  uploadId: string;
}

export interface UploadTextRequest {
  text: string;
  country: string;
  erp: string;
}

export interface Questionnaire {
  webhooks: boolean;
  sandbox_env: boolean;
  retries: boolean;
}

export interface AnalyzeRequest {
  uploadId: string;
  questionnaire: Questionnaire;
}

export interface Scores {
  data: number;
  coverage: number;
  rules: number;
  posture: number;
  overall: number;
}

export interface CloseMatch {
  target: string;
  candidate: string;
  confidence: number;
}

export interface Coverage {
  matched: string[];
  close: CloseMatch[];
  missing: string[];
}

export type RuleName =
  | 'TOTALS_BALANCE'
  | 'LINE_MATH'
  | 'DATE_ISO'
  | 'CURRENCY_ALLOWED'
  | 'TRN_PRESENT';

export interface RuleFinding {
  rule: RuleName;
  ok: boolean;
  exampleLine?: number;
  expected?: number;
  got?: number;
  value?: string;
}

export interface ReportMeta {
  rowsParsed: number;
  linesTotal: number;
  country: string;
  erp: string;
  db: string;
}

export interface ReportResponse {
  reportId: string;
  scores: Scores;
  coverage: Coverage;
  ruleFindings: RuleFinding[];
  gaps: string[];
  meta: ReportMeta;
}
