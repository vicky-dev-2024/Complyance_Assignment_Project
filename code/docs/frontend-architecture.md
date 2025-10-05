# Frontend Architecture
## E-Invoicing Readiness & Gap Analyzer

**Version:** 1.0
**Last Updated:** 2025-10-04
**Stack:** React 18 + TypeScript + Vite

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Folder Structure](#folder-structure)
4. [Design Patterns](#design-patterns)
5. [State Management](#state-management)
6. [Routing Strategy](#routing-strategy)
7. [API Integration](#api-integration)
8. [Type System](#type-system)
9. [Error Handling](#error-handling)
10. [Performance Optimization](#performance-optimization)

---

## Architecture Overview

### Core Principles
- **Feature-based organization** - Scalable, maintainable codebase
- **Separation of concerns** - Logic separated from presentation
- **Type safety** - TypeScript strict mode, no `any` types
- **Composition over inheritance** - Small, focused, reusable components
- **Progressive enhancement** - Core functionality first, enhancements later
- **Accessibility-first** - WCAG 2.1 AA compliance from the start

### Architecture Layers

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│   (React Components + UI Library)       │
├─────────────────────────────────────────┤
│         Business Logic Layer            │
│     (Custom Hooks + State Mgmt)         │
├─────────────────────────────────────────┤
│         Data Access Layer               │
│  (API Client + React Query + Types)     │
├─────────────────────────────────────────┤
│         Infrastructure Layer            │
│    (Router + Error Boundaries + Utils)  │
└─────────────────────────────────────────┘
```

---

## Technology Stack

### Core Framework
- **React 18.2+** - Component library with concurrent features
- **TypeScript 5.0+** - Type safety and developer experience
- **Vite 5.0+** - Fast build tool with HMR

### UI & Styling
- **Tailwind CSS 3.4+** - Utility-first CSS framework
- **shadcn/ui** - Accessible component library built on Radix UI
- **Lucide React** - Modern icon library (tree-shakeable)
- **clsx** + **tailwind-merge** - Conditional className utilities

### State Management
- **Zustand 4.4+** - Lightweight global state (wizard, UI state)
- **TanStack Query v5** - Server state, caching, synchronization
- **React Context** - Feature-specific state (when needed)

### Forms & Validation
- **React Hook Form 7.48+** - Performant form management
- **Zod 3.22+** - Runtime schema validation
- **@hookform/resolvers** - Zod + RHF integration

### Data Visualization
- **TanStack Table v8** - Headless table library
- **Recharts 2.10+** - Composable charts
- **react-circular-progressbar** - Progress indicators

### File Handling
- **react-dropzone** - Drag-and-drop file upload
- **papaparse** - CSV parsing
- **jsPDF** + **html2canvas** - PDF generation (P1)

### Routing & Navigation
- **React Router v6** - Client-side routing

### Developer Experience
- **ESLint 8** - Code linting
- **Prettier 3** - Code formatting
- **TypeScript ESLint** - TypeScript-specific linting
- **Husky** + **lint-staged** - Git hooks

---

## Folder Structure

```
frontend/
├── public/                       # Static assets
│   ├── favicon.ico
│   └── robots.txt
│
├── src/
│   ├── app/                      # App configuration
│   │   ├── App.tsx               # Root app component
│   │   ├── router.tsx            # Route definitions
│   │   └── providers.tsx         # Global providers (Query, Toast, Theme)
│   │
│   ├── features/                 # Feature modules (vertical slices)
│   │   ├── upload/
│   │   │   ├── components/
│   │   │   │   ├── FileUpload.tsx
│   │   │   │   ├── TextPasteArea.tsx
│   │   │   │   └── UploadToggle.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useFileUpload.ts
│   │   │   │   ├── useTextUpload.ts
│   │   │   │   └── useFileValidation.ts
│   │   │   ├── api/
│   │   │   │   └── uploadApi.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts          # Public API
│   │   │
│   │   ├── wizard/
│   │   │   ├── components/
│   │   │   │   ├── WizardLayout.tsx
│   │   │   │   ├── WizardStepper.tsx
│   │   │   │   ├── StepNavigation.tsx
│   │   │   │   ├── ContextForm.tsx
│   │   │   │   └── UploadStep.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useWizardNavigation.ts
│   │   │   ├── store/
│   │   │   │   └── wizardStore.ts
│   │   │   └── types.ts
│   │   │
│   │   ├── analysis/
│   │   │   ├── components/
│   │   │   │   ├── AnalyzeButton.tsx
│   │   │   │   └── AnalysisLoader.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useAnalysis.ts
│   │   │   ├── api/
│   │   │   │   └── analysisApi.ts
│   │   │   └── types.ts
│   │   │
│   │   └── report/
│   │       ├── components/
│   │       │   ├── ReportDashboard.tsx
│   │       │   ├── DataTablePreview.tsx
│   │       │   ├── CoveragePanel.tsx
│   │       │   ├── ScoreCards.tsx
│   │       │   ├── RuleFindingsList.tsx
│   │       │   ├── ActionsPanel.tsx
│   │       │   └── SharePage.tsx
│   │       ├── hooks/
│   │       │   ├── useReport.ts
│   │       │   └── useReportExport.ts
│   │       ├── api/
│   │       │   └── reportApi.ts
│   │       └── types.ts
│   │
│   ├── components/               # Shared components
│   │   ├── ui/                   # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── toast.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/               # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Container.tsx
│   │   │   └── PageLayout.tsx
│   │   │
│   │   └── common/               # Common reusable components
│   │       ├── LoadingSpinner.tsx
│   │       ├── EmptyState.tsx
│   │       ├── ErrorFallback.tsx
│   │       ├── TypeBadge.tsx
│   │       └── Skeleton.tsx
│   │
│   ├── lib/                      # Utilities & configuration
│   │   ├── api.ts                # Axios instance & config
│   │   ├── utils.ts              # Utility functions
│   │   ├── constants.ts          # App constants
│   │   └── cn.ts                 # className utility (from shadcn)
│   │
│   ├── hooks/                    # Global custom hooks
│   │   ├── useDebounce.ts
│   │   ├── useLocalStorage.ts
│   │   └── useClipboard.ts
│   │
│   ├── types/                    # Global TypeScript types
│   │   ├── api.types.ts          # API response types
│   │   ├── schema.types.ts       # GETS schema types
│   │   └── common.types.ts       # Common shared types
│   │
│   ├── store/                    # Global Zustand stores
│   │   └── themeStore.ts         # Theme state (P2)
│   │
│   ├── styles/                   # Global styles
│   │   └── globals.css           # Tailwind imports + custom CSS
│   │
│   ├── main.tsx                  # App entry point
│   └── vite-env.d.ts             # Vite type declarations
│
├── .env.example                  # Environment variables template
├── .env.local                    # Local environment (gitignored)
├── .eslintrc.cjs                 # ESLint configuration
├── .prettierrc                   # Prettier configuration
├── index.html                    # HTML entry point
├── package.json                  # Dependencies & scripts
├── postcss.config.js             # PostCSS configuration
├── tailwind.config.js            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
├── tsconfig.node.json            # TypeScript config for Vite
└── vite.config.ts                # Vite configuration
```

---

## Design Patterns

### 1. Feature-Based Organization
Each feature is a self-contained module with its own components, hooks, API layer, and types.

**Benefits:**
- Clear boundaries
- Easy to scale
- Better code splitting
- Team-friendly (multiple devs can work on different features)

**Example:**
```typescript
// features/upload/index.ts
export { FileUpload } from './components/FileUpload';
export { useFileUpload } from './hooks/useFileUpload';
export type { UploadResponse } from './types';
```

### 2. Custom Hooks Pattern
Business logic is extracted into custom hooks for reusability and testability.

**Example:**
```typescript
// features/upload/hooks/useFileUpload.ts
export function useFileUpload() {
  const mutation = useMutation({
    mutationFn: uploadFile,
    onSuccess: (data) => { /* ... */ },
    onError: (error) => { /* ... */ }
  });

  return {
    upload: mutation.mutate,
    isUploading: mutation.isPending,
    error: mutation.error,
    data: mutation.data
  };
}
```

### 3. Composition Pattern
Small, focused components composed together.

**Example:**
```typescript
// Large component broken into smaller pieces
<ReportDashboard>
  <DataTablePreview data={report.data} />
  <CoveragePanel coverage={report.coverage} />
  <ScoreCards scores={report.scores} />
  <RuleFindingsList findings={report.ruleFindings} />
  <ActionsPanel reportId={report.reportId} />
</ReportDashboard>
```

### 4. Container/Presenter Pattern
- **Container**: Handles logic, data fetching (custom hooks)
- **Presenter**: Pure UI component (receives props)

**Example:**
```typescript
// Container
function ReportContainer() {
  const { data, isLoading } = useReport(reportId);
  return <ReportPresenter data={data} loading={isLoading} />;
}

// Presenter
function ReportPresenter({ data, loading }: Props) {
  if (loading) return <Skeleton />;
  return <div>{/* render UI */}</div>;
}
```

### 5. Error Boundary Pattern
Feature-level error boundaries for graceful degradation.

**Example:**
```typescript
<ErrorBoundary FallbackComponent={ErrorFallback}>
  <ReportDashboard />
</ErrorBoundary>
```

---

## State Management

### State Categories

#### 1. Server State (TanStack Query)
- **Use for:** API data, reports, uploads
- **Benefits:** Automatic caching, refetching, optimistic updates
- **Example:**
```typescript
const { data: report } = useQuery({
  queryKey: ['report', reportId],
  queryFn: () => fetchReport(reportId),
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

#### 2. Client State (Zustand)
- **Use for:** Wizard state, UI preferences
- **Benefits:** Simple API, no boilerplate, TypeScript-friendly
- **Example:**
```typescript
// store/wizardStore.ts
export const useWizardStore = create<WizardState>((set) => ({
  currentStep: 0,
  formData: {},
  setStep: (step) => set({ currentStep: step }),
  setFormData: (data) => set({ formData: data }),
}));
```

#### 3. Local Component State (useState)
- **Use for:** Form inputs, toggles, local UI state
- **Example:**
```typescript
const [isOpen, setIsOpen] = useState(false);
```

#### 4. URL State (React Router)
- **Use for:** Sharable state (report ID, filters)
- **Example:**
```typescript
const { reportId } = useParams();
const [searchParams] = useSearchParams();
```

---

## Routing Strategy

### Route Structure
```typescript
// app/router.tsx
const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: 'wizard',
        element: <WizardLayout />,
        children: [
          { path: 'context', element: <ContextForm /> },
          { path: 'upload', element: <UploadStep /> },
          { path: 'results', element: <ResultsStep /> },
        ]
      },
      { path: 'report/:reportId', element: <ReportDashboard /> },
      { path: 'share/:reportId', element: <SharePage /> },  // P1
      { path: 'reports', element: <RecentReports /> },      // P1
    ]
  }
]);
```

### Navigation Guards
- Wizard step validation
- Protected routes (if needed)
- Redirect logic

---

## API Integration

### Axios Configuration
```typescript
// lib/api.ts
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Request interceptor
apiClient.interceptors.request.use((config) => {
  // Add auth token, logging, etc.
  return config;
});

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Global error handling
    toast.error(error.message);
    return Promise.reject(error);
  }
);
```

### API Layer Pattern
```typescript
// features/upload/api/uploadApi.ts
export async function uploadFile(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await apiClient.post<UploadResponse>('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  return data;
}
```

---

## Type System

### Type Strategy
- **API types** - Match backend contract exactly
- **Domain types** - Internal business logic types
- **Component props** - Explicit prop types
- **Utility types** - TypeScript utility types

### Example Type Hierarchy
```typescript
// types/api.types.ts
export interface UploadResponse {
  uploadId: string;
}

export interface AnalyzeRequest {
  uploadId: string;
  questionnaire: Questionnaire;
}

export interface ReportResponse {
  reportId: string;
  scores: Scores;
  coverage: Coverage;
  ruleFindings: RuleFinding[];
  gaps: string[];
  meta: Meta;
}

// Nested types
export interface Scores {
  data: number;
  coverage: number;
  rules: number;
  posture: number;
  overall: number;
}

export interface Coverage {
  matched: string[];
  close: CloseMatch[];
  missing: string[];
}

export interface CloseMatch {
  target: string;
  candidate: string;
  confidence: number;
}

export interface RuleFinding {
  rule: RuleName;
  ok: boolean;
  exampleLine?: number;
  expected?: number;
  got?: number;
  value?: string;
}

export type RuleName =
  | 'TOTALS_BALANCE'
  | 'LINE_MATH'
  | 'DATE_ISO'
  | 'CURRENCY_ALLOWED'
  | 'TRN_PRESENT';
```

---

## Error Handling

### Error Handling Layers

#### 1. API Layer
```typescript
try {
  const data = await uploadFile(file);
  return data;
} catch (error) {
  if (axios.isAxiosError(error)) {
    throw new ApiError(error.response?.data?.message || 'Upload failed');
  }
  throw error;
}
```

#### 2. React Query Layer
```typescript
const { error, isError } = useQuery({
  queryKey: ['report'],
  queryFn: fetchReport,
  retry: 3,
  retryDelay: 1000,
});

if (isError) {
  toast.error(error.message);
}
```

#### 3. Component Error Boundaries
```typescript
<ErrorBoundary
  FallbackComponent={ErrorFallback}
  onError={(error) => console.error(error)}
>
  <FeatureComponent />
</ErrorBoundary>
```

#### 4. User Feedback
- **Toast notifications** for transient errors
- **Inline errors** for form validation
- **Error pages** for critical failures

---

## Performance Optimization

### Strategies

#### 1. Code Splitting
```typescript
// Lazy load routes
const ReportDashboard = lazy(() => import('./features/report/ReportDashboard'));
```

#### 2. Memoization
```typescript
const expensiveValue = useMemo(() => computeScores(data), [data]);
const handleClick = useCallback(() => onClick(id), [id, onClick]);
```

#### 3. Virtualization
```typescript
// For large tables (if needed)
import { useVirtualizer } from '@tanstack/react-virtual';
```

#### 4. Image Optimization
- Use modern formats (WebP)
- Lazy loading
- Proper sizing

#### 5. Bundle Optimization
- Tree shaking (Vite default)
- Dynamic imports
- Minimal dependencies

#### 6. React Query Caching
- Stale-while-revalidate strategy
- Prefetching critical data
- Optimistic updates

---

## Accessibility

### Requirements (WCAG 2.1 AA)
- ✅ Keyboard navigation
- ✅ ARIA labels and roles
- ✅ Focus management
- ✅ Color contrast (4.5:1 for text)
- ✅ Screen reader support
- ✅ Alt text for images
- ✅ Form label associations

### Implementation
```typescript
// Example: Accessible button
<button
  type="button"
  aria-label="Download report"
  onClick={handleDownload}
  disabled={isLoading}
>
  <Download className="mr-2" aria-hidden="true" />
  Download
</button>
```

---

## Security Considerations

### Frontend Security
- ✅ Input validation (client + server)
- ✅ XSS prevention (React escapes by default)
- ✅ CSRF protection (if needed)
- ✅ Secure HTTP only (HTTPS in production)
- ✅ Environment variables for sensitive config
- ✅ Content Security Policy headers

### File Upload Security
- ✅ File type validation
- ✅ File size limits (5MB)
- ✅ Client-side sanitization
- ✅ Server-side validation (backend responsibility)

---

## Build & Deployment

### Build Configuration
```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Linting
npm run lint

# Type checking
npm run type-check
```

### Environment Variables
```env
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_VERSION=1.0.0
VITE_ENABLE_DEVTOOLS=true
```

### Deployment Targets
- Vercel (recommended for React)
- Netlify
- AWS Amplify
- Static hosting (S3 + CloudFront)

---

## Testing Strategy (Future)

### Recommended Tools
- **Vitest** - Unit tests
- **Testing Library** - Component tests
- **Playwright** - E2E tests
- **MSW** - API mocking

### Test Coverage Goals
- Components: 80%+
- Hooks: 90%+
- Utilities: 100%

---

## Documentation & Maintenance

### Code Documentation
- JSDoc for complex functions
- README for each feature
- Storybook for component catalog (optional)

### Version Control
- Conventional commits
- Feature branches
- PR reviews
- Semantic versioning

---

**Next Steps:** See `implementation-phases.md` for detailed implementation guide.
