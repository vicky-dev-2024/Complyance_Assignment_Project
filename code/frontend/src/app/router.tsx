import { createBrowserRouter, Navigate } from 'react-router-dom';
import { WizardLayout } from '@/features/wizard/components/WizardLayout';
import { ContextForm } from '@/features/wizard/components/ContextForm';
import { UploadStep } from '@/features/upload/components/UploadStep';
import { ResultsStep } from '@/features/analysis/components/ResultsStep';
import { ReportDashboard } from '@/features/report/components/ReportDashboard';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/wizard/context" replace />,
  },
  {
    path: '/wizard',
    element: <WizardLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/wizard/context" replace />,
      },
      {
        path: 'context',
        element: <ContextForm />,
      },
      {
        path: 'upload',
        element: <UploadStep />,
      },
      {
        path: 'results',
        element: <ResultsStep />,
      },
    ],
  },
  {
    path: '/report/:reportId',
    element: <ReportDashboard />,
  },
]);
