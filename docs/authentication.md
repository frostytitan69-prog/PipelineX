# Authentication & User Management - PipelineX V1

PipelineX V1 uses JWT (JSON Web Tokens) for statelessly authenticating API requests alongside salted `bcrypt` password hashing for secure credential storage.

---

## 1. Data Models

### User Entity
```prisma
model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String   @map("password_hash")
  role         Role     @default(USER)
  refreshToken String?  @map("refresh_token")
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  @@map("users")
}

enum Role {
  USER
  ADMIN
}
```

---

## 2. Authentication Flow

1. **User Registration (`POST /api/v1/auth/register`)**:
   - Accepts `email` (validated via Zod) and `password` ($\ge 8$ chars).
   - Hashes password using `bcrypt` with salt rounds = 12.
   - Generates JWT Access Token (15m expiry) & Refresh Token (7d expiry).
   - Stores hashed refresh token in database for session tracking.

2. **User Login (`POST /api/v1/auth/login`)**:
   - Verifies user email and matches candidate password via `bcrypt.compare`.
   - Returns sanitized user DTO along with access and refresh tokens.

3. **Token Refresh (`POST /api/v1/auth/refresh`)**:
   - Verifies signed JWT refresh token signature.
   - Matches against stored refresh token in PostgreSQL to prevent revoked token reuse.
   - Issues new 15-minute access token.

4. **Logout (`POST /api/v1/auth/logout`)**:
   - Requires valid JWT Authorization Bearer header.
   - Invalidates stored refresh token in database.

5. **Profile Retrieval (`GET /api/v1/auth/me`)**:
   - Returns currently authenticated user context (`id`, `email`, `role`, `createdAt`).

---

## 3. Security Provisions

- **Password Hashing**: `bcrypt` (12 cost factor). Password hashes are never returned in API payloads.
- **Input Sanitization**: Zod validation schemas automatically convert email to lowercase and trim whitespace.
- **Rate Limiting**: Rate limited via `express-rate-limit` (20 requests / 15 minutes per IP).
- **Role-Based Authorization**: Support for `USER` and `ADMIN` role checks via `authorizeRoles()` middleware.

---

## 4. Swagger Documentation

Interactive OpenAPI 3.0 API documentation UI is served at `/api/docs`.
