# PipelineX V1 — Production-Grade Asynchronous File Processing Engine

PipelineX V1 is an enterprise-ready, asynchronous file processing system built with Node.js, Express, TypeScript, Prisma, PostgreSQL 16, Redis 7, BullMQ, Cloudflare R2 / S3 Object Storage, Sharp image processing, and pdf-parse text extraction.

---

## 🚀 Key Features & Milestones

- **Milestone 1: Project Setup & Core Infrastructure**
  - Node.js + TypeScript strict ESM layout.
  - PostgreSQL & Redis containerized database setup.
  - RFC-7807 structured problem details error handling.

- **Milestone 2: Authentication & User Management**
  - User registration & login with `bcrypt` password hashing.
  - Short-lived JWT Access Tokens & Refresh Tokens.
  - Role-Based Access Control (`USER` & `ADMIN` roles).
  - Rate limiting on authentication routes.

- **Milestone 3: File Ingestion & Object Storage Layer**
  - Multer multipart file upload validation (PNG, JPEG, WEBP, PDF, TXT up to 20MB).
  - Storage abstraction supporting Cloudflare R2 / S3 bucket storage.
  - Secure signed download URL generation (15 min expiration).

- **Milestone 4: Async Queue & BullMQ Background Workers**
  - Event-driven background worker architecture powered by BullMQ & Redis.
  - Exponential backoff retry policies (3 attempts).
  - Non-blocking immediate file upload HTTP response.

- **Milestone 5: Pipeline Processing Handlers**
  - **Image Handler (`sharp`)**: Extracts width, height, format, color space, raw size, and generates 300x300 JPEG thumbnails stored under `thumbnails/{userId}/{uuid}.jpg`.
  - **PDF Handler (`pdf-parse`)**: Extracts total page count, document info metadata, and text content (first 10k chars).
  - **Text Handler**: Computes line count, word count, character count, and stores UTF-8 content.
  - **ProcessingResult API**: `GET /api/v1/files/:id/result` returns processed metadata & presigned thumbnail link.

- **Milestone 6: Admin Dashboard, Queue Monitoring & System Observability**
  - **Admin Dashboard**: `GET /api/v1/admin/dashboard` (aggregated users, files, storage consumption, average processing time).
  - **Queue Telemetry**: `GET /api/v1/admin/queue` (waiting, active, completed, failed, delayed job metrics).
  - **Job Inspection & Manual Retry**: `GET /api/v1/admin/jobs` & `POST /api/v1/admin/jobs/:jobId/retry`.
  - **Structured Logging**: Winston logger outputting to `logs/app.log` and `logs/error.log`.
  - **Enhanced Health Check**: `GET /health` inspecting DB, Redis, Cloudflare R2, BullMQ worker status, memory usage, and Node version.

---

## 🛠️ Tech Stack

- **Runtime**: Node.js v20+, TypeScript
- **Web Framework**: Express v4
- **Database & ORM**: PostgreSQL 16, Prisma ORM
- **Queue & Cache**: Redis 7, BullMQ, ioredis
- **Object Storage**: Cloudflare R2 / S3 (`@aws-sdk/client-s3`)
- **Processing Engines**: Sharp, pdf-parse
- **Logging & Security**: Winston, Helmet, CORS, bcrypt, jsonwebtoken, Zod
- **Documentation**: Swagger UI (`/api/docs`)
- **Testing**: Jest, Supertest

---

## 📖 API Documentation & Swagger UI

Interactive OpenAPI 3.0 documentation is available at:
`http://localhost:3000/api/docs`

---

## 🧪 Running Tests

```bash
npm test
```
- **Test Suites**: 12/12 Passed
- **Total Tests**: 48/48 Passed
