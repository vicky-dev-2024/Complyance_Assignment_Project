import { apiClient } from '@/lib/api';
import type { ReportResponse } from '@/types/api.types';
import { API_ENDPOINTS } from '@/lib/constants';

export async function fetchReport(reportId: string): Promise<ReportResponse> {
  const { data } = await apiClient.get<ReportResponse>(
    `${API_ENDPOINTS.REPORT}/${reportId}`
  );

  return data;
}

export async function downloadReportJSON(
  report: ReportResponse,
  filename?: string
): Promise<void> {
  const blob = new Blob([JSON.stringify(report, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `report-${report.reportId}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function copyShareableLink(reportId: string): void {
  const url = `${window.location.origin}/report/${reportId}`;
  navigator.clipboard.writeText(url);
}
