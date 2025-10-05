import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAnalysis } from '../hooks/useAnalysis';
import { useWizardStore } from '@/features/wizard/store/wizardStore';
import { Button } from '@/components/ui/button';

export function ResultsStep() {
  const navigate = useNavigate();
  const { uploadId, formData, setReportId } = useWizardStore();
  const { analyze, isAnalyzing, data, error } = useAnalysis();

  useEffect(() => {
    // Automatically trigger analysis when component mounts
    if (uploadId && formData) {
      analyze({
        uploadId,
        questionnaire: {
          webhooks: formData.webhooks || false,
          sandbox_env: formData.sandbox_env || false,
          retries: formData.retries || false,
        },
      });
    }
  }, [uploadId, formData, analyze]);

  useEffect(() => {
    // Navigate to report when analysis completes
    if (data?.reportId) {
      setReportId(data.reportId);
      navigate(`/report/${data.reportId}`);
    }
  }, [data, setReportId, navigate]);

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="mb-4">
          <p className="text-red-600 font-medium">Analysis Failed</p>
          <p className="text-sm text-gray-600 mt-2">{error.message}</p>
        </div>
        <Button onClick={() => navigate('/wizard/upload')} variant="outline">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Analyzing Your Data
      </h3>
      <p className="text-sm text-gray-600">
        {isAnalyzing
          ? 'Running validation checks and calculating readiness scores...'
          : 'Preparing your report...'}
      </p>
    </div>
  );
}
