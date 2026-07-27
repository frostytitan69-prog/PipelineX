# PipelineX V1

PipelineX V1 is a production-grade asynchronous file processing engine built with Node.js, Express, TypeScript, PostgreSQL, Prisma, Redis, BullMQ, and Cloudflare R2 / S3 Object Storage.

---

## Architecture Highlights

- **Decoupled Architecture**: API Service delegates heavy computations (image resizing, PDF text extraction, word frequency analysis) to BullMQ background workers.
- **Reliability & Resiliency**: Built-in exponential backoff retries and Dead Letter Queue (DLQ) tracking.
- **Type Safety**: Strictly typed TypeScript codebase with Zod environment & DTO validation.
- **Containerized Stack**: Docker Compose for local PostgreSQL 16 and Redis 7 setups.

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

### 5. Start Development Server
```bash
npm run dev
```

The server will start at `http://localhost:3000`. You can test the health endpoint at:
`http://localhost:3000/api/v1/health`

---

## Documentation

Full architectural design documents can be found in the [`docs/`](./docs) folder:
- [Functional Requirements](./docs/functional-requirements.md)
- [System Architecture](./docs/system-architecture.md)
- [Development Roadmap](./docs/development-roadmap.md)
