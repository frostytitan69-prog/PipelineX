# PipelineX V1 — SaaS Dashboard Frontend Client

Modern, dark-mode-first SaaS dashboard client built with React 19, TypeScript, Vite, Tailwind CSS v4, TanStack Query v5, Framer Motion, and Lucide React.

---

## 🔒 Authentication & Token Management Architecture

1. **AuthProvider Context (`src/context/AuthContext.tsx`)**:
   - Manages global `user`, `isAuthenticated`, and `isLoading` states.
   - Automatically restores user session on mount via `GET /api/v1/auth/me`.
   - Persists JWT tokens (`accessToken`, `refreshToken`) in `localStorage`.

2. **Centralized Axios Client (`src/api/axios.client.ts`)**:
   - Automatic `Authorization: Bearer <accessToken>` header injection.
   - Response interceptor for automatic `401 Unauthorized` token refresh (`POST /api/v1/auth/refresh`).
   - Retries original failed request seamlessly on token refresh success.
   - Clears session and redirects to `/login` if token refresh fails.

3. **Protected Routes & RBAC (`src/routes/ProtectedRoute.tsx`)**:
   - Redirects unauthenticated visitors to `/login`.
   - Restricts `/admin` console to users with `ADMIN` role.
   - Renders a clean **403 Access Forbidden** view for unauthorized roles.

---

## ⚡ React Query Layer (`src/hooks/useApiQueries.ts`)

- `useCurrentUser`: Fetches `/api/v1/auth/me` profile data.
- `useFiles`: Fetches paginated, sorted, filtered, and searched files list (`GET /api/v1/files`).
- `useAdminDashboard`: Fetches system metrics (`GET /api/v1/admin/dashboard`).
- `useQueue`: Fetches BullMQ worker queue telemetry (`GET /api/v1/admin/queue`).
- `useHealth`: Fetches system health & dependencies (`GET /api/v1/health`).
- `useRetryJob` / `useDeleteFile`: React Query mutations with automatic cache invalidation.

---

## 📁 Project Folder Architecture

```text
web/src/
├── api/          # Centralized Axios client & 401 refresh interceptors
├── app/          # AppProvider (QueryClientProvider, AuthProvider, Toaster, BrowserRouter)
├── components/   # Reusable UI components & Skeleton loaders
│   ├── navigation/ (Sidebar, Navbar)
│   └── ui/         (Button, Card, StatCard, Table, Badge, Loader, EmptyState, SearchInput, ConfirmDialog, PageHeader, Skeletons)
├── context/      # AuthContext & AuthProvider implementation
├── features/     # Feature views connected to real backend APIs
│   ├── admin/      # Admin Control Center (useAdminDashboard, useQueue, useRetryJob)
│   ├── auth/       # Login & Register views (POST /auth/login, POST /auth/register)
│   ├── dashboard/  # Dashboard Home (useAdminDashboard, useHealth, useQueue, useFiles)
│   ├── files/      # My Files (useFiles, useDeleteFile, presigned downloads)
│   └── upload/     # File Ingestion Pipeline (POST /files/upload)
├── hooks/        # React Query hooks (useApiQueries.ts) & useAuth.ts
├── layouts/      # DashboardLayout & PublicLayout
├── pages/        # Top-level views (Landing, Processing, Analytics, Settings, NotFound)
├── routes/       # AppRoutes & ProtectedRoute (RBAC role guards)
├── tests/        # Vitest unit & integration test suites
└── types/        # TypeScript interfaces & DTOs
```

---

## 🛠️ Scripts & Running Tests

- Development server: `npm run dev`
- Production build: `npm run build`
- Run test suite: `npm test`
