import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: number;
  name: string;
  description: string;
}

const STEPS: Step[] = [
  { id: 0, name: 'Context', description: 'Business information' },
  { id: 1, name: 'Upload', description: 'Upload invoice data' },
  { id: 2, name: 'Results', description: 'View analysis' },
];

interface WizardStepperProps {
  currentStep: number;
}

export function WizardStepper({ currentStep }: WizardStepperProps) {
  return (
    <nav aria-label="Progress" className="mb-8">
      <ol className="flex flex-row items-center justify-center w-full max-w-2xl mx-auto">
        {STEPS.map((step) => (
          <li
            key={step.name}
            className="flex flex-col items-center flex-1 min-w-0"
          >
            {/* Step circle */}
            <div
              className={cn(
                'flex h-12 w-12 items-center justify-center rounded-full border-2 transition-colors duration-200 z-10 bg-white',
                currentStep > step.id
                  ? 'border-green-600 bg-green-600 text-white shadow-lg'
                  : currentStep === step.id
                  ? 'border-blue-600 text-blue-600 shadow-md'
                  : 'border-gray-300 text-gray-400'
              )}
            >
              {currentStep > step.id ? (
                <Check className="h-5 w-5" aria-hidden="true" />
              ) : (
                <span className="text-lg font-bold">{step.id + 1}</span>
              )}
            </div>
            {/* Step label */}
            <div className="mt-2 text-center w-full px-1">
              <div
                className={cn(
                  'text-base font-medium',
                  currentStep === step.id ? 'text-blue-700' : 'text-gray-700'
                )}
              >
                {step.name}
              </div>
              <div className="text-xs text-gray-500 mt-0.5 truncate">
                {step.description}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}
