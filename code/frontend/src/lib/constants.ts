// API Endpoints
export const API_ENDPOINTS = {
  UPLOAD: '/upload',
  ANALYZE: '/analyze',
  REPORT: '/report',
  REPORTS: '/reports',
} as const;

// File Upload
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ACCEPTED_FILE_TYPES = {
  'text/csv': ['.csv'],
  'application/json': ['.json'],
} as const;

// Score Thresholds
export const READINESS_THRESHOLDS = {
  HIGH: 80,
  MEDIUM: 60,
  LOW: 0,
} as const;

// Rule Names
export const RULE_NAMES = {
  TOTALS_BALANCE: 'TOTALS_BALANCE',
  LINE_MATH: 'LINE_MATH',
  DATE_ISO: 'DATE_ISO',
  CURRENCY_ALLOWED: 'CURRENCY_ALLOWED',
  TRN_PRESENT: 'TRN_PRESENT',
} as const;
