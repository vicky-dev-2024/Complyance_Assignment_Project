import { apiClient } from '@/lib/api';
import type { AnalyzeRequest, ReportResponse } from '@/types/api.types';
import { API_ENDPOINTS } from '@/lib/constants';

export async function analyzeUpload(
  request: AnalyzeRequest
): Promise<ReportResponse> {
  const { data } = await apiClient.post<ReportResponse>(
    API_ENDPOINTS.ANALYZE,
    request
  );

  return data;
}
