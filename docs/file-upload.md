# File Ingestion Layer - PipelineX V1

The file ingestion layer handles secure file uploads, metadata extraction, validation, and object storage integration with Cloudflare R2 / AWS S3.

---

## 1. Supported File Formats & Constraints

| File Category | Allowed MIME Types | Allowed Extensions | Max File Size |
| :--- | :--- | :--- | :--- |
| **Images** | `image/png`, `image/jpeg`, `image/jpg`, `image/webp` | `.png`, `.jpg`, `.jpeg`, `.webp` | 20 MB |
| **Documents** | `application/pdf`, `text/plain` | `.pdf`, `.txt` | 20 MB |

*Note: All unsupported MIME types and oversized files are rejected prior to buffer processing or storage allocation.*

---

## 2. Object Storage Design & File Key Naming

Files are stored in Cloudflare R2 / AWS S3 buckets using randomized UUID-based key paths to prevent file name collisions, path traversal attacks, and bucket enumeration.

### Storage Key Format:
```
uploads/{userId}/{uuid}.{ext}
```

Example: `uploads/80633852-455d-4b14-8aec-8bec704f968e/d3b07384-d113-40a4-8093-5c080036ce92.pdf`

---

## 3. Database Schema (`files` table)

```prisma
model File {
  id           String   @id @default(uuid())
  userId       String   @map("user_id")
  originalName String   @map("original_name")
  mimeType     String   @map("mime_type")
  size         Int
  storageKey   String   @map("storage_key")
  fileHash     String?  @map("file_hash")
  createdAt    DateTime @default(now()) @map("created_at")

  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("files")
}
```

---

## 4. API Endpoint Specifications

### 1. Upload File
- **Endpoint**: `POST /api/v1/files/upload`
- **Auth**: Required (`Bearer <access_token>`)
- **Content-Type**: `multipart/form-data` (field: `file`)
- **Response**: `201 Created`
  ```json
  {
    "message": "File uploaded successfully",
    "data": {
      "fileId": "d3b07384-d113-40a4-8093-5c080036ce92",
      "originalName": "invoice.pdf",
      "mimeType": "application/pdf",
      "size": 524288,
      "uploadedAt": "2026-07-27T21:20:00.000Z"
    }
  }
  ```

### 2. List User Files
- **Endpoint**: `GET /api/v1/files`
- **Auth**: Required
- **Response**: `200 OK` (Array of file metadata objects)

### 3. Get File Metadata
- **Endpoint**: `GET /api/v1/files/:id`
- **Auth**: Required
- **Response**: `200 OK` (File metadata object)

### 4. Generate Download Presigned URL
- **Endpoint**: `GET /api/v1/files/:id/download-url`
- **Auth**: Required
- **Response**: `200 OK` (Signed R2/S3 download URL valid for 15 minutes)

### 5. Delete File
- **Endpoint**: `DELETE /api/v1/files/:id`
- **Auth**: Required
- **Response**: `200 OK` (Deletes object from R2 bucket and removes database record)
