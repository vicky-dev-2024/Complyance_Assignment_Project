import { useMutation } from '@tanstack/react-query';
import { analyzeUpload } from '../api/analysisApi';
import type { AnalyzeRequest } from '@/types/api.types';
import { toast } from 'sonner';

export function useAnalysis() {
  const mutation = useMutation({
    mutationFn: (request: AnalyzeRequest) => analyzeUpload(request),
    onSuccess: () => {
      toast.success('Analysis completed successfully');
    },
    onError: (error: Error) => {
      toast.error(`Analysis failed: ${error.message}`);
    },
  });

  return {
    analyze: mutation.mutate,
    isAnalyzing: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
  };
}
