export interface WizardFormData {
  country: string;
  erp: string;
  webhooks: boolean;
  sandbox_env: boolean;
  retries: boolean;
}

export interface WizardState {
  currentStep: number;
  formData: Partial<WizardFormData>;
  uploadId: string | null;
  reportId: string | null;
  setStep: (step: number) => void;
  setFormData: (data: Partial<WizardFormData>) => void;
  setUploadId: (id: string) => void;
  setReportId: (id: string) => void;
  reset: () => void;
}
