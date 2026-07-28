# PipelineX V1 — Production Deployment Guide

Complete step-by-step instructions for deploying PipelineX to production using managed cloud infrastructure:
- **Backend API & BullMQ Worker**: [Render](https://render.com)
- **Frontend Client**: [Vercel](https://vercel.com)
- **Managed PostgreSQL**: [Neon](https://neon.tech)
- **Managed Redis**: [Upstash](https://upstash.com)
- **Object Storage**: [Cloudflare R2](https://www.cloudflare.com/developer-platform/r2/)

---

## 1. Managed Database & Infrastructure Setup

### A. Neon Managed PostgreSQL
1. Create a project on [Neon](https://neon.tech).
2. Obtain your pooled connection string formatted as:
   ```env
   DATABASE_URL="postgresql://user:password@ep-cool-db-123456.us-east-2.aws.neon.tech/pipelinex_db?sslmode=require"
   ```
3. Run migrations during deployment via `npx prisma db push`.

### B. Upstash Managed Redis
1. Create a serverless Redis database on [Upstash](https://upstash.com).
2. Copy endpoint credentials:
   ```env
   REDIS_HOST="bright-lion-12345.upstash.io"
   REDIS_PORT=6379
   REDIS_PASSWORD="your-upstash-redis-password"
   ```

### C. Cloudflare R2 Object Storage
1. Create a bucket on Cloudflare R2 (e.g. `pipelinex-production-uploads`).
2. Generate S3 API Token credentials (Access Key ID, Secret Access Key, and Endpoint URL).
   ```env
   R2_ACCESS_KEY_ID="your-r2-access-key-id"
   R2_SECRET_ACCESS_KEY="your-r2-secret-access-key"
   R2_BUCKET_NAME="pipelinex-production-uploads"
   R2_ENDPOINT="https://<account-id>.r2.cloudflarestorage.com"
   ```

---

## 2. Backend Deployment on Render

1. Connect your GitHub repository (`PipelineX`) to Render.
2. Select **New Web Service** and choose **Blueprint** using `render.yaml` or manual configuration:
   - **Environment**: `Node`
   - **Build Command**: `npm ci && npx prisma generate && npm run build`
   - **Start Command**: `npx prisma db push && node dist/main.js`
   - **Health Check Path**: `/api/v1/health`
3. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `3000`
   - `DATABASE_URL`: *(Neon connection string)*
   - `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`: *(Upstash credentials)*
   - `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`: *(64-char random hex)*
   - `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `R2_ENDPOINT`
   - `ALLOWED_ORIGINS`: `https://pipelinex.vercel.app`

---

## 3. Frontend Deployment on Vercel

1. Import your GitHub repository into [Vercel](https://vercel.com).
2. Configure Project Settings:
   - **Root Directory**: `web`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add Environment Variable:
   - `VITE_API_URL`: `https://pipelinex-api.onrender.com`
4. Deploy! Vercel handles SPA routing via `web/vercel.json`.

---

## 4. Local Production Verification via Docker Compose

Test the full production container stack locally:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

- **Frontend Nginx**: `http://localhost`
- **Backend API**: `http://localhost:3000`
- **Health Check**: `http://localhost:3000/api/v1/health`
