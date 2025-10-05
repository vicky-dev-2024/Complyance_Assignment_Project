import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Download, Link2 } from 'lucide-react';
import { useReport } from '../hooks/useReport';
import { DataTablePreview } from './DataTablePreview';
import { CoveragePanel } from './CoveragePanel';
import { ScoreCards } from './ScoreCards';
import { RuleFindingsList } from './RuleFindingsList';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/common/Skeleton';
import { useWizardStore } from '@/features/wizard/store/wizardStore';
import { downloadReportJSON, copyShareableLink } from '../api/reportApi';
import { toast } from 'sonner';
import type { ReportResponse } from '@/types/api.types';

function LoadingState() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 lg:col-span-1" />
          <Skeleton className="h-64 lg:col-span-2" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Failed to Load Report
        </h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" onClick={() => navigate('/wizard/context')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Start New Analysis
          </Button>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    </div>
  );
}

interface ReportHeaderProps {
  report: ReportResponse;
  onNewAnalysis: () => void;
}

function ReportHeader({ report, onNewAnalysis }: ReportHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-gray-100 mb-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Analysis Report
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          {report.meta.country} • {report.meta.erp} • {report.meta.rowsParsed}{' '}
          rows parsed
        </p>
        <div className="mt-2 p-2 bg-gray-50 rounded-md inline-block">
          <span className="text-xs text-gray-600 font-semibold">Report ID:</span>{' '}
          <code className="bg-white px-2 py-1 rounded border text-gray-800">
            {report.reportId}
          </code>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
        <Button
          onClick={onNewAnalysis}
          variant="outline"
          className="w-full sm:w-auto"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          New Analysis
        </Button>
        <Button
          onClick={() => {
            downloadReportJSON(report);
            toast.success('Report downloaded successfully');
          }}
          className="w-full sm:w-auto"
          variant="default"
        >
          <Download className="h-4 w-4 mr-2" />
          Download JSON
        </Button>
        <Button
          onClick={() => {
            copyShareableLink(report.reportId);
            toast.success('Link copied to clipboard');
          }}
          className="w-full sm:w-auto"
          variant="outline"
        >
          <Link2 className="h-4 w-4 mr-2" />
          Copy Link
        </Button>
      </div>
    </div>
  );
}

export function ReportDashboard() {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const { data: report, isLoading, error } = useReport(reportId);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error || !report) {
    return (
      <ErrorState
        message={
          error?.message || 'Report not found. It may have expired or been deleted.'
        }
      />
    );
  }

  // Mock data for table preview (since we don't have the original upload data in the response)
  // In a real scenario, the backend would include this in the report
  const mockTableData: Record<string, unknown>[] = [];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <ReportHeader
          report={report}
          onNewAnalysis={() => {
            useWizardStore.getState().reset();
            navigate('/wizard/context');
          }}
        />
        {/* Score Cards */}
        <ScoreCards scores={report.scores} />
        {/* Coverage Panel */}
        <CoveragePanel coverage={report.coverage} />
        {/* Rule Findings */}
        <RuleFindingsList findings={report.ruleFindings} />
        {/* Data Table Preview */}
        {mockTableData.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <DataTablePreview data={mockTableData} />
          </div>
        )}
        {/* Gaps Summary */}
        {report.gaps.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-900 mb-3">
              Identified Gaps
            </h3>
            <ul className="space-y-2">
              {report.gaps.map((gap, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-yellow-600 mt-1">•</span>
                  <span className="text-sm text-yellow-800">{gap}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
