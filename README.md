
# E-Invoicing Readiness & Gap Analyzer
A comprehensive tool for analyzing data readiness against GETS v0.1 schema compliance with automated field mapping, validation rules, and scoring system.




## 🚀 Live Demo

Frontend: https://complyance-assignment-project-vigneshwaran.vercel.app/

Backend API: https://complyance-assignment-project.onrender.com/




## 📋 Table of Contents

[](https://linktodocumentation)

[Features]()

[Tech Stack]()

[Quick Start]()

[Project Structure]()

[API Documentation]()

[Development Setup]()

[Deployment]()
## ✨Features

- Smart File Upload: Support for CSV/JSON files with automatic parsing

- Field Mapping: Intelligent detection and mapping to GETS v0.1 schema

- Validation Rules: 5 comprehensive compliance checks

- Scoring System: Quantitative readiness assessment

- Interactive Reports: Detailed analysis with visual indicators

- 3-Step Wizard: Simplified user workflow

## 🛠Tech Stack

**Client:** React, Redux, TailwindCSS,Typescript,Zustand

**Server:** Nest.js,PostgreSQL,Docker,jest for testing


## 🚀Installation

1.Clone the repository

```bash
 git clone https://github.com/vicky-dev-2024/Complyance_Assignment_Project.git
 cd readiness-analyzer
```
2.npm install
```bash
   
   npm install ->for backend
   npm install ->for frontend
```
3.Docker Run
```bash
# Start all services
docker-compose up -d

# Stop services
docker-compose down
```
## Manual Setup Backend Setup
1.Navigate to backend directory
```bash
cd backend
 ```
2.Create environment file and setup env
```bash
#.env file
# Database Configuration
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=readiness_analyzer

# Application
PORT=3000
NODE_ENV=development

# File Upload (5MB)
MAX_FILE_SIZE=5242880
 ```
3.Install dependencies and start
```bash 
npm install
npm run start:dev
```
## Manual Setup Frontend Setup
1.Navigate to frontend directory
```bash 
cd frontend
```
2.Create environment file
```bash 
#.env file
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_VERSION=1.0.0

```
3.For Production
```bash 
VITE_API_BASE_URL=https://complyance-assignment-project.onrender.com/
VITE_APP_VERSION=1.0.0
```
4.Install dependencies and start
```bash 
npm install
npm run dev
```
## 📁 Project Structure
Backend Architecture
```bash 

backend/src/
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
Frontend Architecture

```bash
frontend/src/
├── app/              # App configuration & providers
├── features/         # Feature modules (vertical slices)
│   ├── wizard/       # 3-step wizard flow
│   ├── upload/       # File upload functionality
│   ├── analysis/     # Analysis logic
│   └── report/       # Results dashboard
├── components/       # Shared components
│   ├── ui/           # shadcn/ui components
│   ├── layout/       # Layout components
│   └── common/       # Common reusable components
├── lib/              # Utilities & API client
├── hooks/            # Custom React hooks
├── types/            # TypeScript type definitions
└── store/            # Global Zustand stores

```
## 🌐Deployment

## Backend Deployment (Render)
Connect GitHub repository to Render

Set environment variables in Render dashboard

Auto-deploy on push to main branch

## Frontend Deployment (Vercel)
Connect GitHub repository to Vercel

Set environment variables

Auto-deploy on push to main branch


## 📝 License

[This project is licensed under the MIT License - see the LICENSE file for details.](https://choosealicense.com/licenses/mit/)


## 📞Support

For support, email vigneshcs2024@gmail.com or create an issue in the repository.


## 🔗 Access Points
Frontend Development: http://localhost:3001

Backend Development: http://localhost:3000

Production Frontend: https://complyance-assignment-project-vigneshwaran.vercel.app/

Production Backend: https://complyance-assignment-project.onrender.com/
## 📊 Validation Rules

The system implements 5 core validation rules:

1.Required Fields Check - Verifies mandatory GETS fields

2.Data Type Validation - Ensures correct data formats

3.Value Range Checks - Validates numerical boundaries

4.Pattern Matching - Checks string formats and patterns

5.Cross-field Validation - Ensures logical consistency between fields
