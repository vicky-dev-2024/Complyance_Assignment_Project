# Implementation Phases
## E-Invoicing Readiness & Gap Analyzer - Frontend Development

**Timeline:** 4 Days
**Focus:** Production-grade frontend implementation
**Methodology:** Phase-by-phase with clear deliverables

---

## Overview

This document provides a detailed, actionable implementation plan broken down by phases and days. Each phase has clear objectives, tasks, and acceptance criteria.

---

## **Phase 1: Foundation & Setup**
**Timeline:** Day 1 Morning (2-3 hours)
**Priority:** P0 Critical

### Objectives
- Set up development environment
- Configure tooling and dependencies
- Establish project structure
- Create core infrastructure

### Tasks

#### 1.1 Project Initialization
```bash
# Create Vite project
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Configure Tailwind
```

**Configuration Files:**
- `tailwind.config.js` - Tailwind configuration
- `postcss.config.js` - PostCSS configuration
- `src/styles/globals.css` - Tailwind imports + custom CSS

#### 1.2 Core Dependencies Installation
```bash
# UI & Styling
npm install clsx tailwind-merge
npm install lucide-react

# State Management
npm install zustand
npm install @tanstack/react-query
npm install axios

# Forms & Validation
npm install react-hook-form @hookform/resolvers zod

# Routing
npm install react-router-dom

# UI Components (shadcn/ui)
npx shadcn-ui@latest init

# Data Visualization
npm install @tanstack/react-table
npm install recharts
npm install react-circular-progressbar

# File Handling
npm install react-dropzone papaparse
npm install @types/papaparse -D

# Notifications
npm install sonner

# Error Boundaries
npm install react-error-boundary

# Developer Tools
npm install -D eslint prettier eslint-config-prettier
npm install -D @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

#### 1.3 Project Structure Setup
```bash
# Create folder structure
mkdir -p src/app
mkdir -p src/features/{wizard,upload,analysis,report}/{components,hooks,api}
mkdir -p src/components/{ui,layout,common}
mkdir -p src/lib
mkdir -p src/hooks
mkdir -p src/types
mkdir -p src/store
mkdir -p src/styles
```

#### 1.4 Configuration Files

**vite.config.ts:**
```typescript
import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
})
```

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**.env.example:**
```env
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_VERSION=1.0.0
```

#### 1.5 Core Infrastructure

**src/lib/api.ts:**
```typescript
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add any auth headers here if needed
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Global error handling
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);
```

**src/lib/utils.ts:**
```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**src/app/providers.tsx:**
```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 3,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="top-right" richColors />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### Deliverables
- ✅ Project initialized with Vite + React + TypeScript
- ✅ All dependencies installed
- ✅ Folder structure created
- ✅ Configuration files set up
- ✅ API client configured
- ✅ Providers configured
- ✅ Dev server running on http://localhost:3001

### Acceptance Criteria
- [ ] `npm run dev` starts successfully
- [ ] No TypeScript errors
- [ ] Hot reload working
- [ ] API proxy configured

---

## **Phase 2: Wizard Implementation (Steps 1-3)**
**Timeline:** Day 1 Afternoon - Day 2 Morning (5-6 hours)
**Priority:** P0 Critical

### Objectives
- Implement 3-step wizard flow
- Create context/questionnaire form
- Build file upload functionality
- Integrate analysis trigger

---

### **Phase 2.1: Wizard Layout & Navigation**
**Timeline:** 1.5 hours

#### Type Definitions

**src/features/wizard/types.ts:**
```typescript
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
  setStep: (step: number) => void;
  setFormData: (data: Partial<WizardFormData>) => void;
  setUploadId: (id: string) => void;
  reset: () => void;
}
```

#### Zustand Store

**src/features/wizard/store/wizardStore.ts:**
```typescript
import { create } from 'zustand';
import { WizardState, WizardFormData } from '../types';

export const useWizardStore = create<WizardState>((set) => ({
  currentStep: 0,
  formData: {},
  uploadId: null,
  setStep: (step) => set({ currentStep: step }),
  setFormData: (data) =>
    set((state) => ({ formData: { ...state.formData, ...data } })),
  setUploadId: (id) => set({ uploadId: id }),
  reset: () => set({ currentStep: 0, formData: {}, uploadId: null }),
}));
```

#### Components

**src/features/wizard/components/WizardStepper.tsx:**
```typescript
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: number;
  name: string;
  description: string;
}

const steps: Step[] = [
  { id: 0, name: 'Context', description: 'Business information' },
  { id: 1, name: 'Upload', description: 'Upload invoice data' },
  { id: 2, name: 'Results', description: 'View analysis' },
];

export function WizardStepper({ currentStep }: { currentStep: number }) {
  return (
    <nav aria-label="Progress">
      <ol className="flex items-center justify-between">
        {steps.map((step, stepIdx) => (
          <li
            key={step.name}
            className={cn(
              stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : '',
              'relative flex-1'
            )}
          >
            {/* Step implementation */}
            <div className="group flex items-center">
              <span className="flex items-center px-6 py-4 text-sm font-medium">
                <span
                  className={cn(
                    'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full',
                    currentStep > step.id
                      ? 'bg-green-600'
                      : currentStep === step.id
                      ? 'border-2 border-blue-600 bg-white'
                      : 'border-2 border-gray-300 bg-white'
                  )}
                >
                  {currentStep > step.id ? (
                    <Check className="h-6 w-6 text-white" />
                  ) : (
                    <span
                      className={cn(
                        currentStep === step.id
                          ? 'text-blue-600'
                          : 'text-gray-500'
                      )}
                    >
                      {step.id + 1}
                    </span>
                  )}
                </span>
                <span className="ml-4 flex min-w-0 flex-col">
                  <span className="text-sm font-medium">{step.name}</span>
                  <span className="text-sm text-gray-500">
                    {step.description}
                  </span>
                </span>
              </span>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}
```

**src/features/wizard/components/WizardLayout.tsx:**
```typescript
import { Outlet } from 'react-router-dom';
import { WizardStepper } from './WizardStepper';
import { useWizardStore } from '../store/wizardStore';

export function WizardLayout() {
  const currentStep = useWizardStore((state) => state.currentStep);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-sm rounded-lg">
          {/* Header */}
          <div className="px-6 py-8 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">
              E-Invoicing Readiness Analyzer
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Analyze your invoice data against GETS v0.1 standards
            </p>
          </div>

          {/* Stepper */}
          <div className="px-6 py-8 border-b border-gray-200">
            <WizardStepper currentStep={currentStep} />
          </div>

          {/* Step Content */}
          <div className="px-6 py-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

### **Phase 2.2: Step 1 - Context Form**
**Timeline:** 1.5 hours

#### Form Schema

**src/features/wizard/components/ContextForm.tsx:**
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useWizardStore } from '../store/wizardStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

const contextSchema = z.object({
  country: z.string().min(1, 'Country is required'),
  erp: z.string().min(1, 'ERP system is required'),
  webhooks: z.boolean().default(false),
  sandbox_env: z.boolean().default(false),
  retries: z.boolean().default(false),
});

type ContextFormData = z.infer<typeof contextSchema>;

export function ContextForm() {
  const navigate = useNavigate();
  const { formData, setFormData, setStep } = useWizardStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContextFormData>({
    resolver: zodResolver(contextSchema),
    defaultValues: formData,
  });

  const onSubmit = (data: ContextFormData) => {
    setFormData(data);
    setStep(1);
    navigate('/wizard/upload');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="country">Country</Label>
        <Input
          id="country"
          {...register('country')}
          placeholder="e.g., UAE, KSA, Malaysia"
        />
        {errors.country && (
          <p className="text-sm text-red-600 mt-1">{errors.country.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="erp">ERP System</Label>
        <Input
          id="erp"
          {...register('erp')}
          placeholder="e.g., SAP, Oracle, Custom"
        />
        {errors.erp && (
          <p className="text-sm text-red-600 mt-1">{errors.erp.message}</p>
        )}
      </div>

      <div className="space-y-4">
        <Label>Technical Capabilities</Label>

        <div className="flex items-center space-x-2">
          <Checkbox id="webhooks" {...register('webhooks')} />
          <label htmlFor="webhooks" className="text-sm">
            Supports webhooks for real-time notifications
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox id="sandbox_env" {...register('sandbox_env')} />
          <label htmlFor="sandbox_env" className="text-sm">
            Has sandbox/testing environment
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox id="retries" {...register('retries')} />
          <label htmlFor="retries" className="text-sm">
            Implements automatic retry logic
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit">
          Next: Upload Data
        </Button>
      </div>
    </form>
  );
}
```

---

### **Phase 2.3: Step 2 - Upload/Paste**
**Timeline:** 2 hours

#### File Upload Hook

**src/features/upload/hooks/useFileUpload.ts:**
```typescript
import { useMutation } from '@tanstack/react-query';
import { uploadFile, uploadText } from '../api/uploadApi';
import { toast } from 'sonner';

export function useFileUpload() {
  const mutation = useMutation({
    mutationFn: uploadFile,
    onSuccess: (data) => {
      toast.success('File uploaded successfully');
    },
    onError: (error: Error) => {
      toast.error(`Upload failed: ${error.message}`);
    },
  });

  return {
    upload: mutation.mutate,
    isUploading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
  };
}

export function useTextUpload() {
  const mutation = useMutation({
    mutationFn: uploadText,
    onSuccess: () => {
      toast.success('Data uploaded successfully');
    },
    onError: (error: Error) => {
      toast.error(`Upload failed: ${error.message}`);
    },
  });

  return {
    upload: mutation.mutate,
    isUploading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
  };
}
```

**See component-specifications.md for full component implementations**

### Deliverables
- ✅ Complete 3-step wizard navigation
- ✅ Context form with validation
- ✅ File upload with drag-and-drop
- ✅ Text paste functionality
- ✅ Analysis trigger

### Acceptance Criteria
- [ ] Can navigate through all 3 steps
- [ ] Form validation works
- [ ] File upload accepts CSV/JSON
- [ ] Upload progress feedback shown
- [ ] Error states handled

---

## **Phase 3: Results Dashboard**
**Timeline:** Day 2 Afternoon - Day 3 (6-8 hours)
**Priority:** P0 Critical

### Objectives
- Display data table preview (20 rows)
- Show coverage panel (matched/close/missing)
- Render score cards (4 + overall)
- List rule findings with details
- Provide download/share actions

---

### **Phase 3.1: Data Table Preview**
**Timeline:** 1.5 hours

**Features:**
- TanStack Table implementation
- First 20 rows display
- Type badges (number/date/text)
- Responsive horizontal scroll
- Empty/loading states

**See component-specifications.md for implementation**

---

### **Phase 3.2: Coverage Panel**
**Timeline:** 1.5 hours

**Features:**
- Matched fields (green checkmarks)
- Close matches (yellow with confidence %)
- Missing fields (red X)
- Visual field mapping
- GETS schema reference

---

### **Phase 3.3: Score Visualization**
**Timeline:** 2 hours

**Components:**
- 4 individual score bars (Data, Coverage, Rules, Posture)
- Overall score card (large, prominent)
- Readiness label (Low/Med/High)
- Color-coded progress bars
- Tooltips with explanations

**Score Thresholds:**
- Low: 0-59
- Medium: 60-79
- High: 80-100

---

### **Phase 3.4: Rule Findings Panel**
**Timeline:** 1.5 hours

**Features:**
- List of 5 rule checks
- Pass/fail icons
- Expandable details on failure
- Example line numbers
- Offending values displayed

**Rules:**
1. TOTALS_BALANCE - Math validation
2. LINE_MATH - Line item calculation
3. DATE_ISO - Date format check
4. CURRENCY_ALLOWED - Currency whitelist
5. TRN_PRESENT - Required field check

---

### **Phase 3.5: Actions Panel**
**Timeline:** 1 hour

**Features:**
- Download JSON report
- Copy shareable link
- Toast confirmation
- Loading states

### Deliverables
- ✅ Complete results dashboard
- ✅ All 6 P0 UI acceptance criteria met
- ✅ Responsive layout
- ✅ Accessible components

### Acceptance Criteria
- [ ] Table shows first 20 rows with type badges
- [ ] Coverage panel displays all 3 categories
- [ ] 4 score bars + overall score render correctly
- [ ] Rule findings list shows all 5 rules
- [ ] Download JSON works
- [ ] Copy link to clipboard works

---

## **Phase 4: Polish & Error Handling**
**Timeline:** Day 3 (4-5 hours)
**Priority:** P0 Critical

### Objectives
- Implement comprehensive error handling
- Add loading states everywhere
- Create empty states
- Ensure responsive design
- Accessibility audit

---

### **Phase 4.1: Error Handling**
**Timeline:** 1.5 hours

#### Global Error Boundary

**src/components/common/ErrorFallback.tsx:**
```typescript
export function ErrorFallback({ error, resetErrorBoundary }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          Something went wrong
        </h2>
        <p className="text-gray-600 mb-4">{error.message}</p>
        <Button onClick={resetErrorBoundary}>Try again</Button>
      </div>
    </div>
  );
}
```

#### Error Boundary Usage
```typescript
<ErrorBoundary FallbackComponent={ErrorFallback}>
  <ReportDashboard />
</ErrorBoundary>
```

---

### **Phase 4.2: Loading States**
**Timeline:** 1 hour

**Components:**
- Skeleton loaders for tables
- Spinners for buttons
- Progress bars for uploads
- Loading overlays

---

### **Phase 4.3: Empty States**
**Timeline:** 1 hour

**Scenarios:**
- No data uploaded yet
- Analysis not run
- No results found
- Failed analysis

---

### **Phase 4.4: Responsive Design**
**Timeline:** 1.5 hours

**Breakpoints:**
- Mobile: 640px
- Tablet: 768px
- Desktop: 1024px
- Wide: 1280px

**Mobile Optimizations:**
- Collapsible panels
- Stacked layout
- Touch-friendly controls
- Horizontal scroll for tables

---

### **Phase 4.5: Accessibility Audit**
**Timeline:** 1 hour

**Checklist:**
- [ ] All buttons have aria-labels
- [ ] Forms have proper labels
- [ ] Focus visible on all interactive elements
- [ ] Keyboard navigation works
- [ ] Screen reader tested
- [ ] Color contrast meets 4.5:1 ratio
- [ ] Skip to content link
- [ ] Error messages announced

### Deliverables
- ✅ Production-ready error handling
- ✅ Complete loading states
- ✅ Helpful empty states
- ✅ Fully responsive design
- ✅ WCAG 2.1 AA compliant

---

## **Phase 5: P1 Features (Optional)**
**Timeline:** Day 4 (6-8 hours)
**Priority:** P1 Nice-to-have

### Phase 5.1: AI-lite Hints (2 hours)
- Close match suggestions
- Rule fix tips
- Human-readable explanations

### Phase 5.2: PDF Export (1.5 hours)
- jsPDF integration
- Report layout design
- Download functionality

### Phase 5.3: Share Page (1.5 hours)
- Read-only report view
- Public route
- Clean presentation

### Phase 5.4: Recent Reports (1.5 hours)
- Reports list page
- API integration
- Table with sorting

### Phase 5.5: UI Enhancements (1.5 hours)
- Animations
- Transitions
- Micro-interactions

---

## **Phase 6: P2 Stretch (Optional)**
**Timeline:** Day 4 (if time permits)
**Priority:** P2 Stretch

### Phase 6.1: Theming (1 hour)
- Light/dark mode toggle
- Theme persistence

### Phase 6.2: i18n Prep (0.5 hours)
- String extraction
- Language file structure

### Phase 6.3: Advanced Features (1 hour)
- Country presets
- Mapping skeleton download

---

## Testing & Quality Assurance

### Manual Testing Checklist
- [ ] Test with sample_clean.json (should pass)
- [ ] Test with sample_flawed.csv (should fail specific rules)
- [ ] Test file upload (CSV + JSON)
- [ ] Test text paste
- [ ] Test wizard navigation (forward/back)
- [ ] Test error scenarios
- [ ] Test on mobile device
- [ ] Test keyboard navigation
- [ ] Test in different browsers (Chrome, Firefox, Safari)

### Performance Testing
- [ ] Lighthouse score > 90
- [ ] Initial load < 2s
- [ ] Route transitions < 100ms
- [ ] No console errors
- [ ] No memory leaks

---

## Deployment Preparation

### Build Optimization
```bash
npm run build
npm run preview  # Test production build
```

### Environment Setup
- Configure production API URL
- Set up error tracking (optional)
- Configure analytics (optional)

### Deployment Platforms
1. **Vercel** (recommended)
   - Connect GitHub repo
   - Auto-deploy on push
   - Preview deployments

2. **Netlify**
   - Drag and drop build folder
   - Or connect GitHub

3. **Static Hosting**
   - AWS S3 + CloudFront
   - GitHub Pages

---

## Success Metrics

### P0 Completion (Required)
- ✅ All 6 UI acceptance criteria met
- ✅ Works with provided samples
- ✅ Responsive and accessible
- ✅ No critical bugs

### P1 Completion (Bonus)
- ✅ PDF export working
- ✅ Share page implemented
- ✅ Recent reports list
- ✅ Enhanced UX

### Quality Metrics
- TypeScript strict mode (no errors)
- ESLint warnings < 5
- Lighthouse performance > 90
- Accessibility score 100
- Bundle size < 500KB

---

## Risk Management

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| CORS errors | Configure proxy in vite.config.ts |
| Large bundle size | Code splitting, lazy loading |
| Slow table rendering | Virtualization, pagination |
| Type errors | Strict type definitions, Zod validation |
| Mobile layout issues | Mobile-first development, test early |

---

**Next:** See `component-specifications.md` for detailed component implementations.
