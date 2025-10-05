Project Documentation
Tech Stack
Frontend: React.js with TypeScript

Backend: NestJS with TypeScript

Database: PostgreSQL

Containerization: Docker

Backend Setup
Quick Start with Docker (Recommended)
bash
# Start all services
docker-compose up

# Stop and remove containers
docker-compose down
Manual Setup
Environment Configuration
Create a .env file in the backend root directory with:

env
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
Install Dependencies

bash
npm install
Start Development Server

bash
npm run start:dev
Backend Deployment
Live URL: https://complyance-assignment-project.onrender.com/

Platform: Deployed on Render

Frontend Setup
Environment Configuration
Create a .env file in the frontend root directory:

For Development:

env
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_VERSION=1.0.0
For Production:

env
VITE_API_BASE_URL=https://complyance-assignment-project.onrender.com/
VITE_APP_VERSION=1.0.0
Development Commands
bash
# Install dependencies
npm install

# Start development server
npm run dev
Access Points
Frontend: http://localhost:3001

Backend: http://localhost:3000 (development)

Production API: https://complyance-assignment-project.onrender.com/

Project Structure for Backend 
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
Project Structure for Frontend
src/
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
Notes
Ensure all environment variables are properly configured before starting the application

Docker setup includes database configuration automatically

Frontend will run on port 3001 by default in development mode

Backend API is accessible at the configured PORT (3000 by default)

