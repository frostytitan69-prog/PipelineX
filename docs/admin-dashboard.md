# Admin Dashboard, Queue Monitoring & System Observability - PipelineX V1

PipelineX V1 provides production-grade monitoring, administrative controls, and system observability.

---

## 1. Role-Based Access Control (RBAC)

All endpoints under `/api/v1/admin/*` are strictly protected:
- **Authentication**: Valid Bearer JWT Access Token.
- **Authorization**: `ADMIN` role required. Non-admin users receive a `403 Forbidden` RFC-7807 error.

---

## 2. Admin Endpoints

### 1. Dashboard Statistics
- **Endpoint**: `GET /api/v1/admin/dashboard`
- **Response**: `200 OK`
  ```json
  {
    "data": {
      "totalUsers": 42,
      "totalFiles": 128,
      "totalJobs": 128,
      "completedJobs": 120,
      "failedJobs": 2,
      "processingJobs": 6,
      "storageUsedBytes": 104857600,
      "averageProcessingTimeMs": 345
    }
  }
  ```

### 2. Queue Telemetry
- **Endpoint**: `GET /api/v1/admin/queue`
- **Response**: `200 OK`
  ```json
  {
    "data": {
      "waiting": 0,
      "active": 1,
      "completed": 120,
      "failed": 2,
      "delayed": 0
    }
  }
  ```

### 3. Job Inspection
- **Endpoint**: `GET /api/v1/admin/jobs?status=FAILED&page=1&limit=10`
- **Endpoint**: `GET /api/v1/admin/jobs/:jobId`

### 4. Job Retry Endpoint
- **Endpoint**: `POST /api/v1/admin/jobs/:jobId/retry`
- **Action**: Resets file status to `UPLOADED` in PostgreSQL and re-enqueues job into BullMQ.

---

## 3. Enhanced System Health Endpoint

- **Endpoint**: `GET /api/v1/health`
- **Response**: `200 OK`
  ```json
  {
    "status": "OK",
    "service": "PipelineX API",
    "timestamp": "2026-07-27T21:48:00.000Z",
    "uptimeSeconds": 1240,
    "environment": "development",
    "nodeVersion": "v20.11.0",
    "dependencies": {
      "database": "UP",
      "redis": "UP",
      "worker": "UP",
      "cloudflareR2": "UP"
    },
    "queue": {
      "waiting": 0,
      "active": 0,
      "completed": 120,
      "failed": 2,
      "delayed": 0
    },
    "memoryUsage": {
      "heapUsedMb": 45.2,
      "heapTotalMb": 62.5,
      "rssMb": 110.4
    }
  }
  ```

---

## 4. Structured File Logging with Winston

- **Transports**:
  - `Console`: Formatted colorized output for developer debugging.
  - `logs/app.log`: Persistent JSON logs for all application activities.
  - `logs/error.log`: Structured error logs with full stack trace.
