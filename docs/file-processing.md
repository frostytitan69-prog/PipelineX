# Pipeline Processing Handlers - PipelineX V1

PipelineX V1 processes uploaded files asynchronously via dedicated handlers for images, PDFs, and text documents.

---

## 1. Supported Processing Handlers

### 1. Image Handler (`image/png`, `image/jpeg`, `image/jpg`, `image/webp`)
- **Engine**: `sharp`
- **Metadata Extraction**: Width, height, format, color space, raw byte size.
- **Thumbnail Generation**:
  - Resized to `300x300` preserving aspect ratio (`fit: 'inside'`).
  - Encoded to JPEG (80% quality).
  - Stored in Cloudflare R2 / S3 under `thumbnails/{userId}/{uuid}.jpg`.

### 2. PDF Handler (`application/pdf`)
- **Engine**: `pdf-parse`
- **Metadata Extraction**: Total page count, title, author, subject, creation date.
- **Text Content**: Extracted text limited to the first **10,000 characters**.

### 3. Text Handler (`text/plain`)
- **Engine**: Native UTF-8 parsing.
- **Statistics**: Line count, word count, character count.
- **Text Content**: Full text content persisted in database.

---

## 2. Database Schema (`processing_results` table)

```prisma
model ProcessingResult {
  id                  String   @id @default(uuid())
  fileId              String   @unique @map("file_id")
  processingTimeMs    Int      @map("processing_time_ms")
  thumbnailStorageKey String?  @map("thumbnail_storage_key")
  metadata            Json?
  pageCount           Int?     @map("page_count")
  textContent         String?  @map("text_content")
  createdAt           DateTime @default(now()) @map("created_at")
  updatedAt           DateTime @updatedAt @map("updated_at")

  file                File     @relation(fields: [fileId], references: [id], onDelete: Cascade)

  @@map("processing_results")
}
```

---

## 3. Result Retrieval API

- **Endpoint**: `GET /api/v1/files/:id/result`
- **Auth**: Bearer JWT token required
- **Response**: `200 OK`
  ```json
  {
    "data": {
      "fileId": "d3b07384-d113-40a4-8093-5c080036ce92",
      "status": "COMPLETED",
      "processingTimeMs": 142,
      "metadata": {
        "width": 1920,
        "height": 1080,
        "format": "png",
        "space": "srgb",
        "size": 524288
      },
      "pageCount": null,
      "thumbnailUrl": "https://pipelinex-uploads.r2.cloudflarestorage.com/thumbnails/...",
      "textContent": null
    }
  }
  ```
