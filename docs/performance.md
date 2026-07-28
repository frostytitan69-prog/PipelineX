# Security, Protection, Caching & Performance Optimization — PipelineX V1

PipelineX V1 incorporates enterprise-grade rate limiting, Redis caching, Gzip compression, database indexing, and security hardening.

---

## 1. Rate Limiting Strategy (`express-rate-limit`)

- **Auth APIs (`/api/v1/auth/*`)**:
  - `5` requests per minute per IP.
  - HTTP 429 response when exceeded.
- **Upload APIs (`/api/v1/files/upload`)**:
  - `20` requests per minute per authenticated user/IP.
  - HTTP 429 response when exceeded.
- **Admin APIs (`/api/v1/admin/*`)**:
  - `60` requests per minute.
  - HTTP 429 response when exceeded.
- **Violation Logging**: All rate limit breaches are logged to `logs/app.log` via Winston with level `warn`.

---

## 2. Redis Caching Architecture

- **Cached Endpoints**:
  - `GET /api/v1/files`
  - `GET /api/v1/files/:id`
  - `GET /api/v1/files/:id/result`
- **TTL**: 300 seconds (5 minutes).
- **Cache Invalidation**:
  - Automatically purges all `cache:*:{userId}*` keys when a file is uploaded (`POST /upload`), deleted (`DELETE /:id`), or when background worker completes processing.
- **Telemetry**: Logs `⚡ [CACHE HIT]` and `🔍 [CACHE MISS]` with Winston.

---

## 3. Database Indexing & Query Optimization

Added performance indexes in `prisma/schema.prisma`:
- Composite index `(user_id, created_at)` for paginated user timeline queries.
- Composite index `(user_id, status)` for status filtering.
- Composite index `(user_id, mime_type)` for MIME type filtering.
- Index `(original_name)` for text search.

---

## 4. Response Compression & Security Headers

- **Gzip Compression**: `compression` middleware compresses JSON payloads $> 1024$ bytes.
- **Helmet Security**:
  - Content Security Policy (CSP)
  - Strict-Transport-Security (HSTS 1 year max-age)
  - X-Frame-Options: `DENY`
  - X-Content-Type-Options: `nosniff`
  - X-XSS-Protection enabled
