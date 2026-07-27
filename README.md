# PipelineX V1

PipelineX V1 is a production-grade asynchronous file processing engine built with Node.js, Express, TypeScript, PostgreSQL, Prisma, Redis, BullMQ, and Cloudflare R2 / S3 Object Storage.

---

## Features (Milestone 1 & 2)

- **Authentication & Security**: JWT Access & Refresh Token workflow, salted bcrypt password hashing (cost factor 12), Zod input validation, rate-limiting (`express-rate-limit`), and RBAC middleware.
- **Swagger Documentation**: Interactive OpenAPI 3.0 UI served directly at `/api/docs`.
- **Decoupled Infrastructure**: Clean Express + TypeScript layer with singleton PostgreSQL (Prisma) and Redis (ioredis) integration.
- **Resilient Error Handling**: RFC-7807 problem details error format and graceful server shutdown logic (`SIGTERM`/`SIGINT`).

---

## Getting Started

### 1. Prerequisites
- Node.js >= 20.x
- Docker & Docker Compose

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Local Database & Redis Services
```bash
docker-compose up -d
```

### 4. Run Prisma Migrations
```bash
npm run prisma:generate
```

### 5. Run Tests
```bash
npm test
```

### 6. Start Development Server
```bash
npm run dev
```

- API Server: `http://localhost:3000`
- Swagger UI Documentation: `http://localhost:3000/api/docs`
- Health Endpoint: `http://localhost:3000/api/v1/health`

---

## Documentation

Full architectural design documents can be found in the [`docs/`](./docs) folder:
- [Functional Requirements](./docs/functional-requirements.md)
- [System Architecture](./docs/system-architecture.md)
- [Authentication Specification](./docs/authentication.md)
- [Development Roadmap](./docs/development-roadmap.md)
