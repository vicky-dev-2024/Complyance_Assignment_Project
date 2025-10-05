# E-Invoicing Readiness & Gap Analyzer - Backend

A NestJS-based backend service that analyzes invoice data for compliance with the GETS v0.1 standard, providing comprehensive readiness scoring and gap identification.

## Tech Stack

- **Framework:** NestJS 11 (TypeScript-first)
- **Database:** PostgreSQL 15 with TypeORM
- **Runtime:** Node.js 23+
- **Key Libraries:**
  - `papaparse` - CSV parsing
  - `class-validator` - Input validation
  - `levenshtein-edit-distance` - Field similarity matching

## Database Choice: PostgreSQL

**Why PostgreSQL?**
- **JSONB support:** Efficiently stores and queries complex report structures
- **ACID compliance:** Ensures data integrity for persistent reports
- **Scalability:** Production-ready with excellent performance
- **Developer experience:** Easy setup via Docker, widely supported

## Project Structure

```
src/
├── config/
│   ├── database.config.ts       # TypeORM configuration
│   └── gets-schema.config.ts    # GETS v0.1 schema definition
├── controllers/
│   └── analyzer.controller.ts   # API endpoints
├── dto/
│   ├── upload.dto.ts            # Upload request/response types
│   ├── analyze.dto.ts           # Analyze request types
│   └── report.dto.ts            # Report response types
├── entities/
│   ├── upload.entity.ts         # Upload data model
│   └── report.entity.ts         # Report data model
├── services/
│   ├── upload.service.ts        # CSV/JSON parsing
│   ├── field-mapper.service.ts  # Field detection & mapping
│   ├── validation.service.ts    # 5 rule checks
│   └── scoring.service.ts       # Score calculation
└── main.ts                      # Application entry point
```

## Quick Start

### 1. Prerequisites

- Node.js 23+ and npm
- Docker and Docker Compose (for PostgreSQL)

### 2. Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

### 3. Start Database

```bash
# Start PostgreSQL using Docker Compose
docker-compose up -d

# Verify database is running
docker ps
```

### 4. Run Application

```bash
# Development mode
npm run start:dev

# Production build
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000`

## API Endpoints

### 1. Upload Invoice Data

**POST `/upload`**

Upload invoice data as multipart file or JSON text.

**Request (Multipart):**
```bash
curl -X POST http://localhost:3000/upload \
  -F "file=@sample_clean.json" \
  -F "country=UAE" \
  -F "erp=SAP"
```

**Request (JSON):**
```bash
curl -X POST http://localhost:3000/upload \
  -H "Content-Type: application/json" \
  -d '{
    "text": "[{\"inv_id\": \"INV-1001\", ...}]",
    "country": "UAE",
    "erp": "SAP"
  }'
```

**Response:**
```json
{
  "uploadId": "u_abc123"
}
```

### 2. Analyze Upload

**POST `/analyze`**

Analyze uploaded data and generate readiness report.

**Request:**
```bash
curl -X POST http://localhost:3000/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "uploadId": "u_abc123",
    "questionnaire": {
      "webhooks": true,
      "sandbox_env": true,
      "retries": false
    }
  }'
```

**Response:**
```json
{
  "reportId": "r_xyz789",
  "scores": {
    "data": 100,
    "coverage": 85,
    "rules": 80,
    "posture": 67,
    "overall": 84
  },
  "coverage": {
    "matched": ["invoice.id", "invoice.issue_date", ...],
    "close": [
      {
        "target": "seller.trn",
        "candidate": "seller_tax_id",
        "confidence": 0.86
      }
    ],
    "missing": ["invoice.currency"]
  },
  "ruleFindings": [
    { "rule": "TOTALS_BALANCE", "ok": true },
    { "rule": "LINE_MATH", "ok": false, "exampleLine": 2, "expected": 120, "got": 118 },
    { "rule": "DATE_ISO", "ok": true },
    { "rule": "CURRENCY_ALLOWED", "ok": false, "value": "EURO" },
    { "rule": "TRN_PRESENT", "ok": true }
  ],
  "gaps": [
    "Line math error: line_total should equal qty * unit_price",
    "Invalid currency EURO. Allowed: AED, SAR, MYR, USD"
  ],
  "meta": {
    "rowsParsed": 120,
    "linesTotal": 320,
    "country": "UAE",
    "erp": "SAP",
    "db": "postgres"
  }
}
```

### 3. Get Report

**GET `/report/:reportId`**

Retrieve a previously generated report.

```bash
curl http://localhost:3000/report/r_xyz789
```

### 4. List Recent Reports (P1)

**GET `/reports?limit=10`**

```bash
curl http://localhost:3000/reports?limit=10
```

**Response:**
```json
[
  {
    "id": "r_xyz789",
    "uploadId": "u_abc123",
    "createdAt": "2025-10-04T01:30:00Z",
    "overallScore": 84,
    "expiresAt": "2025-10-11T01:30:00Z"
  }
]
```

### 5. Health Check

**GET `/health`**

```bash
curl http://localhost:3000/health
```

## Scoring System

The scoring system uses weighted components to calculate an overall readiness score (0-100):

### Score Components & Weights

| Component | Weight | Description |
|-----------|--------|-------------|
| **Data Score** | 25% | Percentage of rows successfully parsed |
| **Coverage Score** | 35% | Matched + close fields vs required GETS fields |
| **Rules Score** | 30% | Passed validation rules (5 checks) |
| **Posture Score** | 10% | Questionnaire responses (webhooks, sandbox, retries) |

### Calculation Details

#### 1. Data Score (25%)
```typescript
dataScore = (rowsParsed / totalRows) * 100
```

#### 2. Coverage Score (35%)
```typescript
matchedCount = fully matched fields
closeCount = close matches * 0.8 (80% weight)
coverageScore = ((matchedCount + closeCount) / requiredFieldsCount) * 100
```

#### 3. Rules Score (30%)
```typescript
rulesScore = (passedRules / totalRules) * 100
```
Equal weight for all 5 rules:
- TOTALS_BALANCE (20%)
- LINE_MATH (20%)
- DATE_ISO (20%)
- CURRENCY_ALLOWED (20%)
- TRN_PRESENT (20%)

#### 4. Posture Score (10%)
```typescript
postureScore = (trueAnswers / 3) * 100
```

### Overall Score
```typescript
overall = (data * 0.25) + (coverage * 0.35) + (rules * 0.30) + (posture * 0.10)
```

### Readiness Labels
- **High:** ≥80
- **Medium:** 50-79
- **Low:** <50

## Validation Rules

### 1. TOTALS_BALANCE
Validates: `total_excl_vat + vat_amount = total_incl_vat` (±0.01 tolerance)

### 2. LINE_MATH
Validates: `line_total = qty * unit_price` (±0.01 tolerance)
Returns example line number on failure.

### 3. DATE_ISO
Validates: `invoice.issue_date` matches `YYYY-MM-DD` format
Rejects invalid dates like `2025-13-12`.

### 4. CURRENCY_ALLOWED
Validates: Currency must be in `[AED, SAR, MYR, USD]`
Returns invalid currency value on failure.

### 5. TRN_PRESENT
Validates: Both `buyer.trn` and `seller.trn` are non-empty
Returns which TRN is missing on failure.

## Field Mapping Algorithm

The field mapper uses a multi-step approach:

1. **Normalization:** Convert to lowercase, remove underscores/spaces
2. **Exact Match:** Check schema path and aliases
3. **Similarity Matching:**
   - Contains check (85% confidence)
   - StartsWith check (75% confidence)
   - Levenshtein distance (calculated confidence)
4. **Type Compatibility:** Verify data type matches expected type
5. **Threshold:** Minimum 65% confidence for "close" matches

## Data Persistence

### Retention Policy
- Reports stored for **≥7 days** with automatic expiry tracking
- Upload data retained with reports for analysis history

### Database Schema

**uploads table:**
```sql
CREATE TABLE uploads (
  id VARCHAR PRIMARY KEY,
  created_at TIMESTAMP NOT NULL,
  country VARCHAR,
  erp VARCHAR,
  rows_parsed INT DEFAULT 0,
  file_data JSONB NOT NULL,
  file_type VARCHAR(50) NOT NULL
);
```

**reports table:**
```sql
CREATE TABLE reports (
  id VARCHAR PRIMARY KEY,
  upload_id VARCHAR REFERENCES uploads(id),
  created_at TIMESTAMP NOT NULL,
  scores_overall INT DEFAULT 0,
  report_json JSONB NOT NULL,
  expires_at TIMESTAMP
);
```

## Testing

### Run with Sample Data

```bash
# Test with clean sample (should pass most rules)
curl -X POST http://localhost:3000/upload \
  -F "file=@sample_clean.json" \
  | jq -r '.uploadId' \
  | xargs -I {} curl -X POST http://localhost:3000/analyze \
    -H "Content-Type: application/json" \
    -d '{"uploadId":"{}","questionnaire":{"webhooks":true,"sandbox_env":true,"retries":false}}'

# Test with flawed sample (should fail: currency, date, line math)
curl -X POST http://localhost:3000/upload \
  -F "file=@sample_flawed.csv" \
  | jq -r '.uploadId' \
  | xargs -I {} curl -X POST http://localhost:3000/analyze \
    -H "Content-Type: application/json" \
    -d '{"uploadId":"{}","questionnaire":{"webhooks":true,"sandbox_env":true,"retries":false}}'
```

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

## Environment Configuration

```env
# Database
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=readiness_analyzer

# Application
PORT=3000
NODE_ENV=development

# File Upload (5MB limit)
MAX_FILE_SIZE=5242880
```

## Performance

- **Processing Limit:** 200 rows per upload
- **Target:** <5s analysis time for provided samples
- **Concurrent Requests:** Supported via NestJS async architecture
- **Database:** Connection pooling via TypeORM

## Error Handling

All errors return consistent JSON format:

```json
{
  "statusCode": 400,
  "message": "Upload failed: Invalid JSON format",
  "error": "Bad Request"
}
```

## Development Commands

```bash
# Development
npm run start:dev          # Hot-reload development mode

# Build
npm run build              # Compile TypeScript

# Production
npm run start:prod         # Run production build

# Testing
npm run test               # Unit tests
npm run test:e2e           # End-to-end tests
npm run test:cov           # Test coverage

# Linting
npm run lint               # ESLint
npm run format             # Prettier
```

## Deployment Notes

### Database Migration
The application uses TypeORM with `synchronize: true` in development. For production:

1. Set `synchronize: false` in production
2. Generate and run migrations:
   ```bash
   npm run typeorm migration:generate -- -n InitialSchema
   npm run typeorm migration:run
   ```

### Environment Variables
Ensure all environment variables are properly configured in production.

### Scaling Considerations
- Add Redis for caching frequently accessed reports
- Use connection pooling (already configured in TypeORM)
- Consider read replicas for report retrieval

## Support

For questions or issues, please check:
- API documentation at `/health` endpoint
- Sample files: `sample_clean.json`, `sample_flawed.csv`
- Postman collection in parent directory

---

**Built with NestJS + TypeScript + PostgreSQL**
