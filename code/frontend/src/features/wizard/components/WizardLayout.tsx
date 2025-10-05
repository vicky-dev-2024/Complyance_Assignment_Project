import { Outlet } from 'react-router-dom';
import { WizardStepper } from './WizardStepper';
import { useWizardStore } from '../store/wizardStore';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function WizardLayout() {
  const currentStep = useWizardStore((state) => state.currentStep);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl">
              E-Invoicing Readiness Analyzer
            </CardTitle>
            <CardDescription>
              Analyze your invoice data against GETS v0.1 standards
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 sm:space-y-8">
            <WizardStepper currentStep={currentStep} />
            <Outlet />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
