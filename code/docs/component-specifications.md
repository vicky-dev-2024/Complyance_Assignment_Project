# Component Specifications
## E-Invoicing Readiness & Gap Analyzer - Frontend Components

**Version:** 1.0
**Last Updated:** 2025-10-04

---

## Table of Contents
1. [Component Overview](#component-overview)
2. [Wizard Components](#wizard-components)
3. [Upload Components](#upload-components)
4. [Report Components](#report-components)
5. [Shared Components](#shared-components)
6. [Layout Components](#layout-components)

---

## Component Overview

### Naming Conventions
- **PascalCase** for component names
- **Descriptive names** that indicate purpose
- **Suffix with type** when ambiguous (e.g., `UploadButton`, `UploadModal`)

### Component Structure Template
```typescript
// 1. Imports
import { ... } from 'react';
import { ... } from '@/lib/utils';

// 2. Type definitions
interface ComponentProps {
  // props
}

// 3. Component
export function Component({ ...props }: ComponentProps) {
  // hooks
  // state
  // handlers
  // effects

  return (
    // JSX
  );
}
```

---

## Wizard Components

### 1. WizardLayout
**Location:** `src/features/wizard/components/WizardLayout.tsx`
**Purpose:** Main container for wizard flow with stepper

**Props:**
```typescript
interface WizardLayoutProps {
  // No props - uses outlet for nested routes
}
```

**Implementation:**
```typescript
import { Outlet } from 'react-router-dom';
import { WizardStepper } from './WizardStepper';
import { useWizardStore } from '../store/wizardStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function WizardLayout() {
  const currentStep = useWizardStore((state) => state.currentStep);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">
              E-Invoicing Readiness Analyzer
            </CardTitle>
            <CardDescription>
              Analyze your invoice data against GETS v0.1 standards
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            <WizardStepper currentStep={currentStep} />
            <Outlet />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

---

### 2. WizardStepper
**Location:** `src/features/wizard/components/WizardStepper.tsx`
**Purpose:** Progress indicator for wizard steps

**Props:**
```typescript
interface WizardStepperProps {
  currentStep: number;
}
```

**Implementation:**
```typescript
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

export function WizardStepper({ currentStep }: WizardStepperProps) {
  return (
    <nav aria-label="Progress" className="mb-8">
      <ol className="flex items-center justify-between">
        {STEPS.map((step, stepIdx) => (
          <li
            key={step.name}
            className={cn(
              stepIdx !== STEPS.length - 1 ? 'flex-1' : '',
              'relative'
            )}
          >
            {/* Connector line */}
            {stepIdx !== STEPS.length - 1 && (
              <div
                className={cn(
                  'absolute top-5 left-[calc(50%+2rem)] right-[calc(-50%+2rem)] h-0.5',
                  currentStep > step.id ? 'bg-green-600' : 'bg-gray-300'
                )}
                aria-hidden="true"
              />
            )}

            {/* Step content */}
            <div className="group flex flex-col items-center">
              <span
                className={cn(
                  'relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2',
                  currentStep > step.id
                    ? 'border-green-600 bg-green-600'
                    : currentStep === step.id
                    ? 'border-blue-600 bg-white'
                    : 'border-gray-300 bg-white'
                )}
              >
                {currentStep > step.id ? (
                  <Check className="h-5 w-5 text-white" aria-hidden="true" />
                ) : (
                  <span
                    className={cn(
                      'text-sm font-semibold',
                      currentStep === step.id
                        ? 'text-blue-600'
                        : 'text-gray-500'
                    )}
                  >
                    {step.id + 1}
                  </span>
                )}
              </span>
              <span className="mt-2 text-center">
                <span
                  className={cn(
                    'text-sm font-medium',
                    currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
                  )}
                >
                  {step.name}
                </span>
                <span className="block text-xs text-gray-500">
                  {step.description}
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

---

### 3. ContextForm
**Location:** `src/features/wizard/components/ContextForm.tsx`
**Purpose:** Collects business context and questionnaire data

**Form Schema:**
```typescript
const contextSchema = z.object({
  country: z.string().min(1, 'Country is required'),
  erp: z.string().min(1, 'ERP system is required'),
  webhooks: z.boolean().default(false),
  sandbox_env: z.boolean().default(false),
  retries: z.boolean().default(false),
});

type ContextFormData = z.infer<typeof contextSchema>;
```

**Full Implementation:**
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
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
    formState: { errors, isSubmitting },
    watch,
  } = useForm<ContextFormData>({
    resolver: zodResolver(contextSchema),
    defaultValues: {
      country: formData.country || '',
      erp: formData.erp || '',
      webhooks: formData.webhooks || false,
      sandbox_env: formData.sandbox_env || false,
      retries: formData.retries || false,
    },
  });

  const onSubmit = (data: ContextFormData) => {
    setFormData(data);
    setStep(1);
    navigate('/wizard/upload');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Country Input */}
      <div className="space-y-2">
        <Label htmlFor="country">
          Country <span className="text-red-500">*</span>
        </Label>
        <Input
          id="country"
          {...register('country')}
          placeholder="e.g., UAE, KSA, Malaysia"
          aria-invalid={errors.country ? 'true' : 'false'}
        />
        {errors.country && (
          <p className="text-sm text-red-600" role="alert">
            {errors.country.message}
          </p>
        )}
      </div>

      {/* ERP Input */}
      <div className="space-y-2">
        <Label htmlFor="erp">
          ERP System <span className="text-red-500">*</span>
        </Label>
        <Input
          id="erp"
          {...register('erp')}
          placeholder="e.g., SAP, Oracle, NetSuite, Custom"
          aria-invalid={errors.erp ? 'true' : 'false'}
        />
        {errors.erp && (
          <p className="text-sm text-red-600" role="alert">
            {errors.erp.message}
          </p>
        )}
      </div>

      {/* Technical Capabilities */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">
          Technical Capabilities
        </Label>
        <p className="text-sm text-gray-600">
          Select the capabilities your system supports
        </p>

        <div className="space-y-3 bg-gray-50 p-4 rounded-md">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="webhooks"
              {...register('webhooks')}
              className="mt-0.5"
            />
            <div className="flex-1">
              <label
                htmlFor="webhooks"
                className="text-sm font-medium leading-none cursor-pointer"
              >
                Webhooks Support
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Real-time notifications for invoice events
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="sandbox_env"
              {...register('sandbox_env')}
              className="mt-0.5"
            />
            <div className="flex-1">
              <label
                htmlFor="sandbox_env"
                className="text-sm font-medium leading-none cursor-pointer"
              >
                Sandbox Environment
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Dedicated testing environment available
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="retries"
              {...register('retries')}
              className="mt-0.5"
            />
            <div className="flex-1">
              <label
                htmlFor="retries"
                className="text-sm font-medium leading-none cursor-pointer"
              >
                Automatic Retry Logic
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Handles transient failures automatically
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="min-w-[200px]"
        >
          Next: Upload Data
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
```

---

## Upload Components

### 4. FileUpload
**Location:** `src/features/upload/components/FileUpload.tsx`
**Purpose:** Drag-and-drop file upload with preview

**Props:**
```typescript
interface FileUploadProps {
  onUpload: (uploadId: string) => void;
}
```

**Implementation:**
```typescript
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { useFileUpload } from '../hooks/useFileUpload';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onUpload: (uploadId: string) => void;
}

export function FileUpload({ onUpload }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { upload, isUploading, data, error } = useFileUpload();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept: {
        'text/csv': ['.csv'],
        'application/json': ['.json'],
      },
      maxSize: 5 * 1024 * 1024, // 5MB
      maxFiles: 1,
    });

  const handleUpload = () => {
    if (selectedFile) {
      upload(selectedFile, {
        onSuccess: (response) => {
          onUpload(response.uploadId);
        },
      });
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors',
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400',
          selectedFile && 'border-green-500 bg-green-50'
        )}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center space-y-4">
          {selectedFile ? (
            <>
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <div>
                <p className="text-lg font-medium text-gray-900">
                  File selected
                </p>
                <p className="text-sm text-gray-500">{selectedFile.name}</p>
                <p className="text-xs text-gray-400">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </>
          ) : (
            <>
              <Upload className="h-12 w-12 text-gray-400" />
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {isDragActive
                    ? 'Drop your file here'
                    : 'Drag & drop your invoice file'}
                </p>
                <p className="text-sm text-gray-500">
                  or click to browse
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Supports CSV and JSON (max 5MB)
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* File Rejections */}
      {fileRejections.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                File rejected
              </h3>
              <div className="text-sm text-red-700 mt-1">
                {fileRejections[0].errors.map((err) => (
                  <p key={err.code}>{err.message}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Selected File Card */}
      {selectedFile && (
        <div className="bg-white border rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <File className="h-8 w-8 text-blue-500" />
            <div>
              <p className="font-medium text-gray-900">{selectedFile.name}</p>
              <p className="text-sm text-gray-500">
                {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={isUploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-2">
          <Progress value={undefined} className="h-2" />
          <p className="text-sm text-gray-600 text-center">
            Uploading file...
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-800">{error.message}</p>
        </div>
      )}

      {/* Upload Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          className="min-w-[200px]"
        >
          {isUploading ? 'Uploading...' : 'Upload & Continue'}
        </Button>
      </div>
    </div>
  );
}
```

---

### 5. TextPasteArea
**Location:** `src/features/upload/components/TextPasteArea.tsx`
**Purpose:** Text paste alternative for CSV/JSON data

**Props:**
```typescript
interface TextPasteAreaProps {
  onUpload: (uploadId: string) => void;
}
```

**Implementation:**
```typescript
import { useState } from 'react';
import { useTextUpload } from '../hooks/useTextUpload';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useWizardStore } from '@/features/wizard/store/wizardStore';

export function TextPasteArea({ onUpload }: TextPasteAreaProps) {
  const [text, setText] = useState('');
  const { formData } = useWizardStore();
  const { upload, isUploading, error } = useTextUpload();

  const handleUpload = () => {
    upload(
      {
        text,
        country: formData.country!,
        erp: formData.erp!,
      },
      {
        onSuccess: (response) => {
          onUpload(response.uploadId);
        },
      }
    );
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="text-data">Paste your CSV or JSON data</Label>
        <Textarea
          id="text-data"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste CSV or JSON invoice data here..."
          className="min-h-[300px] font-mono text-sm"
        />
        <p className="text-xs text-gray-500">
          Supports CSV (with headers) or JSON array format
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-800">{error.message}</p>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          onClick={handleUpload}
          disabled={!text.trim() || isUploading}
          className="min-w-[200px]"
        >
          {isUploading ? 'Uploading...' : 'Upload & Continue'}
        </Button>
      </div>
    </div>
  );
}
```

---

## Report Components

### 6. DataTablePreview
**Location:** `src/features/report/components/DataTablePreview.tsx`
**Purpose:** Display first 20 rows with type badges

**Props:**
```typescript
interface DataTablePreviewProps {
  data: Record<string, any>[];
  isLoading?: boolean;
}
```

**Implementation:**
```typescript
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';
import { TypeBadge } from '@/components/common/TypeBadge';
import { Skeleton } from '@/components/common/Skeleton';

function inferType(value: any): 'number' | 'date' | 'text' {
  if (typeof value === 'number') return 'number';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value))
    return 'date';
  return 'text';
}

export function DataTablePreview({ data, isLoading }: DataTablePreviewProps) {
  if (isLoading) {
    return <TableSkeleton />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No data to preview
      </div>
    );
  }

  // Take first 20 rows
  const previewData = data.slice(0, 20);

  // Generate columns from first row
  const columns: ColumnDef<Record<string, any>>[] = Object.keys(
    previewData[0]
  ).map((key) => ({
    accessorKey: key,
    header: () => (
      <div className="flex flex-col space-y-1">
        <span className="font-semibold">{key}</span>
        <TypeBadge type={inferType(previewData[0][key])} />
      </div>
    ),
    cell: ({ getValue }) => {
      const value = getValue();
      return (
        <span className="text-sm">
          {value === null || value === undefined ? (
            <span className="text-gray-400 italic">empty</span>
          ) : (
            String(value)
          )}
        </span>
      );
    },
  }));

  const table = useReactTable({
    data: previewData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Data Preview</h3>
        <p className="text-sm text-gray-500">
          Showing {previewData.length} of {data.length} rows
        </p>
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
```

---

### 7. CoveragePanel
**Location:** `src/features/report/components/CoveragePanel.tsx`
**Purpose:** Display matched/close/missing fields

**Props:**
```typescript
interface CoveragePanelProps {
  coverage: {
    matched: string[];
    close: Array<{
      target: string;
      candidate: string;
      confidence: number;
    }>;
    missing: string[];
  };
}
```

**Implementation:**
```typescript
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function CoveragePanel({ coverage }: CoveragePanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Field Coverage</CardTitle>
        <p className="text-sm text-gray-600">
          Mapping against GETS v0.1 schema
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Matched Fields */}
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <h4 className="font-semibold text-green-900">
              Matched ({coverage.matched.length})
            </h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {coverage.matched.map((field) => (
              <Badge key={field} variant="success" className="bg-green-100">
                {field}
              </Badge>
            ))}
          </div>
        </div>

        {/* Close Matches */}
        {coverage.close.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <h4 className="font-semibold text-yellow-900">
                Close Matches ({coverage.close.length})
              </h4>
            </div>
            <div className="space-y-2">
              {coverage.close.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-md p-3"
                >
                  <div>
                    <span className="font-mono text-sm">{item.candidate}</span>
                    <span className="mx-2 text-gray-400">→</span>
                    <span className="font-mono text-sm font-semibold">
                      {item.target}
                    </span>
                  </div>
                  <Badge variant="warning">
                    {(item.confidence * 100).toFixed(0)}% match
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Missing Fields */}
        {coverage.missing.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <XCircle className="h-5 w-5 text-red-600" />
              <h4 className="font-semibold text-red-900">
                Missing ({coverage.missing.length})
              </h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {coverage.missing.map((field) => (
                <Badge key={field} variant="destructive">
                  {field}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

---

### 8. ScoreCards
**Location:** `src/features/report/components/ScoreCards.tsx`
**Purpose:** Display score bars and overall readiness

**Props:**
```typescript
interface ScoreCardsProps {
  scores: {
    data: number;
    coverage: number;
    rules: number;
    posture: number;
    overall: number;
  };
}
```

**Implementation:**
```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

function getReadinessLabel(score: number): {
  label: string;
  color: string;
} {
  if (score >= 80) return { label: 'High', color: 'text-green-600' };
  if (score >= 60) return { label: 'Medium', color: 'text-yellow-600' };
  return { label: 'Low', color: 'text-red-600' };
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'bg-green-600';
  if (score >= 60) return 'bg-yellow-500';
  return 'bg-red-500';
}

interface ScoreBarProps {
  label: string;
  score: number;
  weight: string;
}

function ScoreBar({ label, score, weight }: ScoreBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">{weight}</span>
          <span className="text-lg font-bold">{score}</span>
        </div>
      </div>
      <div className="relative">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={cn('h-full transition-all duration-500', getScoreColor(score))}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export function ScoreCards({ scores }: ScoreCardsProps) {
  const readiness = getReadinessLabel(scores.overall);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Overall Score - Large Card */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Overall Readiness</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <div className="relative inline-flex">
            <svg className="w-32 h-32">
              <circle
                className="text-gray-200"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
                r="56"
                cx="64"
                cy="64"
              />
              <circle
                className={cn('transition-all duration-500', readiness.color)}
                strokeWidth="8"
                strokeDasharray={2 * Math.PI * 56}
                strokeDashoffset={
                  2 * Math.PI * 56 * (1 - scores.overall / 100)
                }
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="56"
                cx="64"
                cy="64"
                style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
              />
            </svg>
            <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl font-bold">
              {scores.overall}
            </span>
          </div>
          <div className="mt-4 text-center">
            <span className={cn('text-xl font-bold', readiness.color)}>
              {readiness.label}
            </span>
            <p className="text-sm text-gray-500 mt-1">Readiness Score</p>
          </div>
        </CardContent>
      </Card>

      {/* Individual Scores */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Score Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <ScoreBar label="Data Quality" score={scores.data} weight="25%" />
          <ScoreBar label="Field Coverage" score={scores.coverage} weight="35%" />
          <ScoreBar label="Rule Compliance" score={scores.rules} weight="30%" />
          <ScoreBar label="System Posture" score={scores.posture} weight="10%" />
        </CardContent>
      </Card>
    </div>
  );
}
```

---

### 9. RuleFindingsList
**Location:** `src/features/report/components/RuleFindingsList.tsx`
**Purpose:** Display 5 rule checks with pass/fail status

**Implementation:** See next section for full code...

---

## Shared Components

### 10. TypeBadge
**Location:** `src/components/common/TypeBadge.tsx`
**Purpose:** Display data type badges

**Props:**
```typescript
interface TypeBadgeProps {
  type: 'number' | 'date' | 'text';
}
```

**Implementation:**
```typescript
import { Badge } from '@/components/ui/badge';
import { Hash, Calendar, Type } from 'lucide-react';

export function TypeBadge({ type }: TypeBadgeProps) {
  const config = {
    number: { icon: Hash, label: 'Number', color: 'bg-blue-100 text-blue-700' },
    date: { icon: Calendar, label: 'Date', color: 'bg-purple-100 text-purple-700' },
    text: { icon: Type, label: 'Text', color: 'bg-gray-100 text-gray-700' },
  };

  const { icon: Icon, label, color } = config[type];

  return (
    <Badge variant="outline" className={color}>
      <Icon className="h-3 w-3 mr-1" />
      {label}
    </Badge>
  );
}
```

---

**Component count:** 10+ core components specified
**Total lines of code:** ~2000+ lines when fully implemented

**Next:** See `tech-stack-rationale.md` for library selection reasoning.
