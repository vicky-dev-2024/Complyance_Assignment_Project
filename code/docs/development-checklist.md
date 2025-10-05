# Development Checklist
## E-Invoicing Readiness & Gap Analyzer - Frontend Implementation

**Version:** 1.0
**Last Updated:** 2025-10-04
**Estimated Timeline:** 4 Days

---

## How to Use This Checklist

- [ ] = Not started
- [🔄] = In progress
- [✅] = Completed
- [⏭️] = Skipped (optional feature)

**Priority Levels:**
- 🔴 P0 - Must have (required for passing)
- 🟡 P1 - Nice to have (bonus points)
- 🟢 P2 - Stretch goal (only if time permits)

---

## Day 1: Foundation & Wizard

### Phase 1: Project Setup (2-3 hours) 🔴 P0

#### 1.1 Initialize Project
- [ ] Run `npm create vite@latest frontend -- --template react-ts`
- [ ] Navigate to project: `cd frontend`
- [ ] Install dependencies: `npm install`
- [ ] Test dev server: `npm run dev`
- [ ] Verify TypeScript compilation works

#### 1.2 Install Tailwind CSS
- [ ] Install: `npm install -D tailwindcss postcss autoprefixer`
- [ ] Initialize: `npx tailwindcss init -p`
- [ ] Configure `tailwind.config.js`:
  ```js
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"]
  ```
- [ ] Add Tailwind directives to `src/styles/globals.css`
- [ ] Import globals.css in `main.tsx`
- [ ] Test Tailwind classes work

#### 1.3 Install shadcn/ui
- [ ] Run: `npx shadcn-ui@latest init`
- [ ] Choose TypeScript, Tailwind, CSS variables
- [ ] Add components: `npx shadcn-ui@latest add button card input label checkbox badge progress toast`
- [ ] Verify components directory created: `src/components/ui/`

#### 1.4 Install Core Dependencies
```bash
# State Management
npm install zustand @tanstack/react-query

# Forms & Validation
npm install react-hook-form @hookform/resolvers zod

# Routing
npm install react-router-dom

# UI & Icons
npm install lucide-react clsx tailwind-merge

# Data Visualization
npm install @tanstack/react-table recharts

# File Handling
npm install react-dropzone papaparse @types/papaparse

# Notifications & Errors
npm install sonner react-error-boundary

# HTTP Client
npm install axios
```

- [ ] Run installation command
- [ ] Verify `package.json` dependencies
- [ ] Run `npm install` to ensure lock file is updated

#### 1.5 Configure TypeScript
- [ ] Update `tsconfig.json` with path aliases:
  ```json
  "baseUrl": ".",
  "paths": { "@/*": ["./src/*"] }
  ```
- [ ] Enable strict mode: `"strict": true`
- [ ] Verify no TypeScript errors: `npm run type-check`

#### 1.6 Configure Vite
- [ ] Update `vite.config.ts` with path aliases
- [ ] Add API proxy for backend:
  ```ts
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
  ```
- [ ] Test dev server starts on port 3001

#### 1.7 Create Folder Structure
```bash
mkdir -p src/app
mkdir -p src/features/wizard/{components,hooks,store}
mkdir -p src/features/upload/{components,hooks,api}
mkdir -p src/features/analysis/{components,hooks,api}
mkdir -p src/features/report/{components,hooks,api}
mkdir -p src/components/{ui,layout,common}
mkdir -p src/lib
mkdir -p src/hooks
mkdir -p src/types
mkdir -p src/store
mkdir -p src/styles
```

- [ ] Run folder creation commands
- [ ] Verify structure matches architecture doc

#### 1.8 Setup Core Infrastructure
- [ ] Create `src/lib/api.ts` with Axios instance
- [ ] Create `src/lib/utils.ts` with `cn()` utility
- [ ] Create `src/lib/constants.ts` for app constants
- [ ] Create `src/app/providers.tsx` with QueryClient and Toaster
- [ ] Create `.env.example` with API base URL
- [ ] Copy to `.env.local` and configure

#### 1.9 Developer Tools
- [ ] Install ESLint: `npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin`
- [ ] Install Prettier: `npm install -D prettier eslint-config-prettier`
- [ ] Create `.eslintrc.cjs` configuration
- [ ] Create `.prettierrc` configuration
- [ ] Add scripts to `package.json`:
  ```json
  "lint": "eslint src --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
  "format": "prettier --write \"src/**/*.{ts,tsx}\"",
  "type-check": "tsc --noEmit"
  ```
- [ ] Run `npm run lint` to verify
- [ ] Run `npm run format` to verify

---

### Phase 2: Wizard Implementation (4-5 hours) 🔴 P0

#### 2.1 Type Definitions
- [ ] Create `src/types/api.types.ts`
- [ ] Define `UploadResponse` interface
- [ ] Define `AnalyzeRequest` interface
- [ ] Define `ReportResponse` interface
- [ ] Define `Scores`, `Coverage`, `RuleFinding` interfaces
- [ ] Create `src/features/wizard/types.ts`
- [ ] Define `WizardFormData` interface
- [ ] Define `WizardState` interface

#### 2.2 Zustand Store
- [ ] Create `src/features/wizard/store/wizardStore.ts`
- [ ] Implement `useWizardStore` with:
  - [ ] `currentStep` state
  - [ ] `formData` state
  - [ ] `uploadId` state
  - [ ] `setStep` action
  - [ ] `setFormData` action
  - [ ] `setUploadId` action
  - [ ] `reset` action
- [ ] Test store in component

#### 2.3 Wizard Layout
- [ ] Create `src/features/wizard/components/WizardStepper.tsx`
- [ ] Implement step progression UI with:
  - [ ] 3 steps (Context, Upload, Results)
  - [ ] Check icon for completed steps
  - [ ] Number for current/future steps
  - [ ] Connecting lines between steps
- [ ] Create `src/features/wizard/components/WizardLayout.tsx`
- [ ] Add header with title and description
- [ ] Add stepper component
- [ ] Add `<Outlet />` for nested routes
- [ ] Style with Tailwind (card, shadow, spacing)

#### 2.4 Routing Setup
- [ ] Create `src/app/router.tsx`
- [ ] Define routes:
  - [ ] `/` - Home/landing page
  - [ ] `/wizard` - Wizard layout
  - [ ] `/wizard/context` - Step 1
  - [ ] `/wizard/upload` - Step 2
  - [ ] `/wizard/results` - Step 3
  - [ ] `/report/:reportId` - Report view
- [ ] Wrap routes in `RouterProvider`
- [ ] Update `src/main.tsx` to use router

#### 2.5 Context Form (Step 1)
- [ ] Create `src/features/wizard/components/ContextForm.tsx`
- [ ] Define Zod schema:
  - [ ] `country: string().min(1)`
  - [ ] `erp: string().min(1)`
  - [ ] `webhooks: boolean()`
  - [ ] `sandbox_env: boolean()`
  - [ ] `retries: boolean()`
- [ ] Setup React Hook Form with Zod resolver
- [ ] Build form UI:
  - [ ] Country input field
  - [ ] ERP input field
  - [ ] 3 checkboxes for capabilities
  - [ ] Next button
- [ ] Implement form submission:
  - [ ] Save to wizard store
  - [ ] Navigate to upload step
- [ ] Add validation error display
- [ ] Test form validation

#### 2.6 Upload Step (Step 2) - File Upload
- [ ] Create `src/features/upload/api/uploadApi.ts`
- [ ] Implement `uploadFile(file: File)` function
- [ ] Implement `uploadText(text: string, country, erp)` function
- [ ] Create `src/features/upload/hooks/useFileUpload.ts`
- [ ] Create `src/features/upload/hooks/useTextUpload.ts`
- [ ] Implement hooks with React Query mutations
- [ ] Create `src/features/upload/components/FileUpload.tsx`
- [ ] Integrate react-dropzone:
  - [ ] Accept CSV and JSON files
  - [ ] Max size 5MB
  - [ ] Drag-and-drop area
  - [ ] File preview
  - [ ] Remove file button
- [ ] Add upload progress indicator
- [ ] Add error handling
- [ ] Test file upload flow

#### 2.7 Upload Step (Step 2) - Text Paste
- [ ] Create `src/features/upload/components/TextPasteArea.tsx`
- [ ] Add textarea for CSV/JSON paste
- [ ] Add upload button
- [ ] Integrate with useTextUpload hook
- [ ] Add loading state
- [ ] Test text upload flow

#### 2.8 Upload Step - Toggle
- [ ] Create `src/features/upload/components/UploadToggle.tsx`
- [ ] Add toggle between file/text modes
- [ ] Create `src/features/upload/components/UploadStep.tsx`
- [ ] Combine FileUpload and TextPasteArea
- [ ] Handle upload success:
  - [ ] Save uploadId to wizard store
  - [ ] Navigate to results step

#### 2.9 Analysis Trigger (Step 3)
- [ ] Create `src/features/analysis/api/analysisApi.ts`
- [ ] Implement `analyzeUpload(uploadId, questionnaire)` function
- [ ] Create `src/features/analysis/hooks/useAnalysis.ts`
- [ ] Implement mutation hook
- [ ] Create `src/features/analysis/components/AnalyzeButton.tsx`
- [ ] Add loading spinner during analysis
- [ ] Handle analysis completion:
  - [ ] Navigate to report page with reportId
- [ ] Handle analysis errors

---

## Day 2: Results Dashboard (Part 1)

### Phase 3: Data Table & Coverage (3-4 hours) 🔴 P0

#### 3.1 Report API & Hook
- [ ] Create `src/features/report/api/reportApi.ts`
- [ ] Implement `fetchReport(reportId)` function
- [ ] Create `src/features/report/hooks/useReport.ts`
- [ ] Implement query hook with React Query
- [ ] Add loading, error states

#### 3.2 Report Dashboard Layout
- [ ] Create `src/features/report/components/ReportDashboard.tsx`
- [ ] Add report ID display
- [ ] Add loading skeleton
- [ ] Add error fallback
- [ ] Create grid layout for sections

#### 3.3 Type Badge Component
- [ ] Create `src/components/common/TypeBadge.tsx`
- [ ] Implement badge for number/date/text types
- [ ] Add icons (Hash, Calendar, Type)
- [ ] Style with colors (blue/purple/gray)

#### 3.4 Data Table Preview
- [ ] Create `src/features/report/components/DataTablePreview.tsx`
- [ ] Implement type inference function
- [ ] Setup TanStack Table:
  - [ ] Generate columns from data keys
  - [ ] Add TypeBadge to headers
  - [ ] Handle empty/null values
  - [ ] Limit to first 20 rows
- [ ] Style table with Tailwind:
  - [ ] Header styling
  - [ ] Row hover effects
  - [ ] Responsive horizontal scroll
- [ ] Add row count display
- [ ] Create table skeleton loader
- [ ] Test with sample data

#### 3.5 Coverage Panel
- [ ] Create `src/features/report/components/CoveragePanel.tsx`
- [ ] Implement three sections:
  - [ ] **Matched fields** (green checkmarks)
  - [ ] **Close matches** (yellow with confidence %)
  - [ ] **Missing fields** (red X marks)
- [ ] Add icons: CheckCircle2, AlertCircle, XCircle
- [ ] Style with color-coded badges
- [ ] Test with sample coverage data

---

### Phase 3: Scores & Rules (3-4 hours) 🔴 P0

#### 3.6 Score Cards
- [ ] Create `src/features/report/components/ScoreCards.tsx`
- [ ] Implement `getReadinessLabel(score)` function:
  - [ ] Low: 0-59 (red)
  - [ ] Medium: 60-79 (yellow)
  - [ ] High: 80-100 (green)
- [ ] Implement `getScoreColor(score)` function
- [ ] Create `ScoreBar` component:
  - [ ] Label + weight display
  - [ ] Score number
  - [ ] Progress bar with color
- [ ] Create overall score card:
  - [ ] Circular progress indicator
  - [ ] Large score number
  - [ ] Readiness label
- [ ] Create individual score cards grid:
  - [ ] Data Quality (25%)
  - [ ] Field Coverage (35%)
  - [ ] Rule Compliance (30%)
  - [ ] System Posture (10%)
- [ ] Add smooth animations
- [ ] Test with sample scores

#### 3.7 Rule Findings List
- [ ] Create `src/features/report/components/RuleFindingsList.tsx`
- [ ] Implement for each rule:
  - [ ] TOTALS_BALANCE
  - [ ] LINE_MATH (with exampleLine)
  - [ ] DATE_ISO
  - [ ] CURRENCY_ALLOWED (with value)
  - [ ] TRN_PRESENT
- [ ] Add pass/fail icons (CheckCircle2, XCircle)
- [ ] Add expandable details for failures
- [ ] Show failure-specific data:
  - [ ] Example line number
  - [ ] Expected vs got values
  - [ ] Invalid value
- [ ] Style with color coding
- [ ] Test with sample rule findings

#### 3.8 Actions Panel
- [ ] Create `src/features/report/components/ActionsPanel.tsx`
- [ ] Implement Download JSON button:
  - [ ] Generate blob from report data
  - [ ] Trigger download
  - [ ] Show success toast
- [ ] Implement Copy Link button:
  - [ ] Generate shareable URL
  - [ ] Copy to clipboard
  - [ ] Show success toast
- [ ] Add icons (Download, Link)
- [ ] Add loading states
- [ ] Test both actions

---

## Day 3: Polish & Error Handling

### Phase 4: Production Readiness (4-5 hours) 🔴 P0

#### 4.1 Error Handling
- [ ] Create `src/components/common/ErrorFallback.tsx`
- [ ] Add error UI with:
  - [ ] Error icon
  - [ ] Error message
  - [ ] Try again button
- [ ] Wrap features with ErrorBoundary:
  - [ ] Wizard layout
  - [ ] Report dashboard
  - [ ] Upload components
- [ ] Add global error handler in API client
- [ ] Test error scenarios:
  - [ ] Network errors
  - [ ] 404 responses
  - [ ] 500 errors
  - [ ] Invalid data

#### 4.2 Loading States
- [ ] Create `src/components/common/LoadingSpinner.tsx`
- [ ] Create `src/components/common/Skeleton.tsx`
- [ ] Add loading states to:
  - [ ] File upload (progress bar)
  - [ ] Analysis (spinner with message)
  - [ ] Report loading (skeleton)
  - [ ] Table loading (skeleton)
  - [ ] Button actions (disabled + spinner)
- [ ] Test all loading states

#### 4.3 Empty States
- [ ] Create `src/components/common/EmptyState.tsx`
- [ ] Add empty states for:
  - [ ] No data uploaded
  - [ ] No results yet
  - [ ] Empty table
  - [ ] No reports found
- [ ] Add helpful icons and messages
- [ ] Test empty scenarios

#### 4.4 Responsive Design
- [ ] Test wizard on mobile:
  - [ ] Stepper mobile layout
  - [ ] Form inputs touch-friendly
  - [ ] Buttons large enough
- [ ] Test upload on mobile:
  - [ ] Dropzone works on touch
  - [ ] Textarea readable
- [ ] Test report dashboard on mobile:
  - [ ] Table horizontal scroll
  - [ ] Score cards stack vertically
  - [ ] Coverage panel readable
- [ ] Add responsive breakpoints:
  - [ ] Mobile: < 640px
  - [ ] Tablet: 640px - 1024px
  - [ ] Desktop: > 1024px
- [ ] Test on real devices/browser devtools

#### 4.5 Accessibility Audit
- [ ] Add ARIA labels to buttons
- [ ] Associate labels with form inputs
- [ ] Add focus visible styles
- [ ] Test keyboard navigation:
  - [ ] Tab through wizard
  - [ ] Enter to submit forms
  - [ ] Escape to close modals
- [ ] Test with screen reader (VoiceOver/NVDA)
- [ ] Check color contrast ratios (4.5:1)
- [ ] Add skip to content link
- [ ] Ensure error messages are announced
- [ ] Run Lighthouse accessibility audit (target 100)

#### 4.6 Testing with Sample Data
- [ ] Test with `sample_clean.json`:
  - [ ] Upload successful
  - [ ] Analysis runs
  - [ ] All rules pass
  - [ ] High readiness score
- [ ] Test with `sample_flawed.csv`:
  - [ ] Upload successful
  - [ ] Analysis runs
  - [ ] Expected rules fail:
    - [ ] CURRENCY_ALLOWED fails (EURO)
    - [ ] DATE_ISO fails (2025-13-12)
    - [ ] LINE_MATH fails (line 4)
  - [ ] Lower readiness score
- [ ] Verify report JSON matches schema

#### 4.7 Layout Components
- [ ] Create `src/components/layout/Header.tsx`
- [ ] Create `src/components/layout/Footer.tsx`
- [ ] Create `src/components/layout/PageLayout.tsx`
- [ ] Add to main layout
- [ ] Style consistently

---

## Day 4: P1 & P2 Features (Optional)

### Phase 5: P1 Features (6-8 hours) 🟡 P1

#### 5.1 AI-lite Hints (2 hours)
- [ ] Create `src/features/report/components/CloseMatchHint.tsx`
- [ ] Generate mapping suggestions for close matches
- [ ] Create `src/features/report/components/RuleExplanation.tsx`
- [ ] Add fix tips for failed rules:
  - [ ] LINE_MATH: "Check quantity × unit price calculation"
  - [ ] DATE_ISO: "Use ISO format: YYYY-MM-DD"
  - [ ] CURRENCY_ALLOWED: "Use AED, SAR, MYR, or USD"
  - [ ] TRN_PRESENT: "Ensure buyer.trn and seller.trn are filled"
- [ ] Add tooltips/popovers to show hints
- [ ] Test hint display

#### 5.2 PDF Export (1.5 hours)
- [ ] Install: `npm install jspdf html2canvas`
- [ ] Create `src/features/report/hooks/useReportExport.ts`
- [ ] Implement PDF generation:
  - [ ] Render report to canvas
  - [ ] Convert to PDF
  - [ ] Download file
- [ ] Create PDF layout template (1-2 pages)
- [ ] Add PDF export button to actions panel
- [ ] Test PDF generation

#### 5.3 Share Page (1.5 hours)
- [ ] Create `src/features/report/components/SharePage.tsx`
- [ ] Create read-only report view:
  - [ ] Same content as report dashboard
  - [ ] Remove edit/download controls
  - [ ] Clean presentation
- [ ] Add route: `/share/:reportId`
- [ ] Test share URL works
- [ ] Test shareable link copy

#### 5.4 Recent Reports (1.5 hours)
- [ ] Create `src/features/report/api/reportsApi.ts`
- [ ] Implement `fetchRecentReports(limit)` function
- [ ] Create `src/features/report/components/RecentReportsList.tsx`
- [ ] Build reports table:
  - [ ] Date column
  - [ ] Report ID column
  - [ ] Overall score column
  - [ ] Link to report
- [ ] Add route: `/reports`
- [ ] Add navigation link
- [ ] Test reports list

#### 5.5 UI Enhancements (1.5 hours)
- [ ] Add smooth transitions between routes
- [ ] Add animations to score bars
- [ ] Add hover effects to interactive elements
- [ ] Add keyboard shortcuts (optional)
- [ ] Improve focus management
- [ ] Test all enhancements

---

### Phase 6: P2 Features (2-3 hours) 🟢 P2

#### 6.1 Theming (1 hour)
- [ ] Create `src/store/themeStore.ts`
- [ ] Implement theme state (light/dark)
- [ ] Add theme toggle button
- [ ] Persist theme to localStorage
- [ ] Apply theme classes to body
- [ ] Update Tailwind config for dark mode
- [ ] Style all components for dark mode
- [ ] Test theme switching

#### 6.2 i18n Preparation (0.5 hours)
- [ ] Create `src/lib/strings.ts`
- [ ] Extract all UI strings to constants
- [ ] Create language file structure
- [ ] Default to English
- [ ] Document i18n approach

#### 6.3 Country Presets (1 hour)
- [ ] Add country selector to context form
- [ ] Create country-specific rules:
  - [ ] UAE: AED currency, TRN format
  - [ ] KSA: SAR currency, TRN format
  - [ ] Malaysia: MYR currency, TRN format
- [ ] Apply extra validations based on country
- [ ] Show country-specific labels in UI
- [ ] Test country presets

#### 6.4 Mapping Skeleton Download
- [ ] Generate mapping JSON from coverage data
- [ ] Format as `{ sourceField -> getsPath }`
- [ ] Add download button
- [ ] Test download

---

## Final Quality Assurance

### Performance Optimization
- [ ] Run Lighthouse audit (target > 90)
- [ ] Check bundle size: `npm run build` and analyze
- [ ] Implement code splitting if needed:
  - [ ] Lazy load report dashboard
  - [ ] Lazy load share page
- [ ] Optimize images (if any)
- [ ] Test load time on 3G network

### Cross-Browser Testing
- [ ] Test on Chrome (latest)
- [ ] Test on Firefox (latest)
- [ ] Test on Safari (latest)
- [ ] Test on Edge (latest)
- [ ] Fix any browser-specific issues

### Build & Deployment
- [ ] Run production build: `npm run build`
- [ ] Test production build locally: `npm run preview`
- [ ] Fix any build errors
- [ ] Configure environment variables
- [ ] Prepare deployment:
  - [ ] Choose platform (Vercel/Netlify)
  - [ ] Configure build settings
  - [ ] Deploy to production
  - [ ] Test live URL

### Documentation
- [ ] Update README.md:
  - [ ] Project description
  - [ ] Setup instructions
  - [ ] Environment variables
  - [ ] Development commands
  - [ ] Deployment guide
- [ ] Document scoring weights
- [ ] Add screenshots (optional)
- [ ] Create demo video (optional, 2-3 min)

---

## Pre-Submission Checklist

### P0 Acceptance Criteria
- [ ] ✅ Wizard visible with clear progress (Context → Upload → Results)
- [ ] ✅ Table preview shows first 20 rows with type badges
- [ ] ✅ Coverage map renders Matched/Close/Missing
- [ ] ✅ Four score bars + Overall score displayed
- [ ] ✅ Rule findings list shows all 5 rules with examples
- [ ] ✅ Download JSON works
- [ ] ✅ Copy shareable link works

### Quality Checks
- [ ] No TypeScript errors: `npm run type-check`
- [ ] No ESLint errors: `npm run lint`
- [ ] Code formatted: `npm run format`
- [ ] Production build succeeds: `npm run build`
- [ ] All routes work
- [ ] No console errors in production
- [ ] Responsive on mobile
- [ ] Accessible (WCAG 2.1 AA)

### Submission Requirements
- [ ] Live URL deployed and working
- [ ] GitHub repository public
- [ ] README.md complete (<400 words)
- [ ] Environment setup documented
- [ ] Sample data tested

---

## Progress Tracking

### Day 1 Summary
- [ ] Phase 1 completed (Foundation)
- [ ] Phase 2 completed (Wizard)
- [ ] Time tracking: ____ hours

### Day 2 Summary
- [ ] Phase 3.1-3.5 completed (Table & Coverage)
- [ ] Phase 3.6-3.8 completed (Scores & Rules)
- [ ] Time tracking: ____ hours

### Day 3 Summary
- [ ] Phase 4 completed (Polish & Errors)
- [ ] P0 acceptance criteria met
- [ ] Time tracking: ____ hours

### Day 4 Summary
- [ ] P1 features completed: ____
- [ ] P2 features completed: ____
- [ ] Time tracking: ____ hours

---

## Notes & Issues

### Blockers
- [ ] None

### Open Questions
- [ ] None

### Technical Decisions
- [ ] Document major decisions here

---

**Total Tasks:** 200+
**Estimated Completion:** 4 days (solo)
**Priority:** Focus on P0 first, then P1 if time permits

**Good luck! 🚀**
