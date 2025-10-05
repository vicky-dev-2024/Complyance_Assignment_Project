import { useQuery } from '@tanstack/react-query';
import { fetchReport } from '../api/reportApi';

export function useReport(reportId: string | undefined) {
  return useQuery({
    queryKey: ['report', reportId],
    queryFn: () => fetchReport(reportId!),
    enabled: !!reportId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });
}
