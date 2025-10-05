import { create } from 'zustand';
import type { WizardState } from '../types';

export const useWizardStore = create<WizardState>((set) => ({
  currentStep: 0,
  formData: {},
  uploadId: null,
  reportId: null,
  setStep: (step) => set({ currentStep: step }),
  setFormData: (data) =>
    set((state) => ({ formData: { ...state.formData, ...data } })),
  setUploadId: (id) => set({ uploadId: id }),
  setReportId: (id) => set({ reportId: id }),
  reset: () =>
    set({
      currentStep: 0,
      formData: {},
      uploadId: null,
      reportId: null,
    }),
}));
