🚀 Tech Stack
Frontend
React.js with TypeScript

Vite for build tooling

shadcn/ui for component library

Zustand for state management

Tailwind CSS for styling

Backend
NestJS with TypeScript

TypeORM for database operations

PostgreSQL for data storage

Class Validator for DTO validation

Infrastructure
Docker for containerization

Render for backend deployment

Vercel for frontend deployment

📁 Project Structure
Backend Architecture

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
