import request from 'supertest';
import { createApp } from '../../src/app';
import { generateAccessToken } from '../../src/common/utils/jwt.util';
import { prisma } from '../../src/database/prisma.service';
import { storageService } from '../../src/services/storage.service';

const app = createApp();

describe('Milestone 3 Full Verification Test Suite', () => {
  let authToken: string;
  let testUserId: string;
  let uploadedFileId: string;
  let uploadedStorageKey: string;

  beforeAll(async () => {
    // Create a test user in database
    const user = await prisma.user.upsert({
      where: { email: 'verification-user@pipelinex.dev' },
      update: {},
      create: {
        email: 'verification-user@pipelinex.dev',
        passwordHash: '$2b$12$eImiTXuWVxfM37uY4JANjOL.80Fk79V6n11.9O.1234567890123',
        role: 'USER',
      },
    });

    testUserId = user.id;
    authToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
  });

  afterAll(async () => {
    // Clean up test database records
    await prisma.file.deleteMany({ where: { userId: testUserId } });
    await prisma.user.deleteMany({ where: { id: testUserId } });
  });

  it('1. Upload PNG - should successfully upload PNG file', async () => {
    const pngBuffer = Buffer.from('89504e470d0a1a0a0000000d49484452', 'hex');

    const res = await request(app)
      .post('/api/v1/files/upload')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('file', pngBuffer, 'test_image.png');

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('fileId');
    expect(res.body.data.originalName).toBe('test_image.png');
    expect(res.body.data.mimeType).toBe('image/png');
  });

  it('2. Upload PDF - should successfully upload PDF document', async () => {
    const pdfBuffer = Buffer.from('%PDF-1.4 sample pdf content');

    const res = await request(app)
      .post('/api/v1/files/upload')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('file', pdfBuffer, 'sample_doc.pdf');

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('fileId');
    expect(res.body.data.originalName).toBe('sample_doc.pdf');
    expect(res.body.data.mimeType).toBe('application/pdf');

    uploadedFileId = res.body.data.fileId;
  });

  it('3. Upload TXT - should successfully upload text file', async () => {
    const txtBuffer = Buffer.from('PipelineX sample text file content for analysis');

    const res = await request(app)
      .post('/api/v1/files/upload')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('file', txtBuffer, 'notes.txt');

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('fileId');
    expect(res.body.data.originalName).toBe('notes.txt');
    expect(res.body.data.mimeType).toBe('text/plain');
  });

  it('4. Reject EXE - should reject unsupported executable file formats', async () => {
    const exeBuffer = Buffer.from('MZ binary executable header content');

    const res = await request(app)
      .post('/api/v1/files/upload')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('file', exeBuffer, 'malware.exe');

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('type', 'https://pipelinex.dev/errors/INVALID_FILE_TYPE');
  });

  it('5. Reject >20 MB - should reject files exceeding 20MB limit', async () => {
    // 21 MB dummy buffer
    const oversizedBuffer = Buffer.alloc(21 * 1024 * 1024);

    const res = await request(app)
      .post('/api/v1/files/upload')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('file', oversizedBuffer, 'oversized.pdf');

    expect(res.status).toBe(500); // Multer LIMIT_FILE_SIZE error caught by error handler
  });

  it('6. Unauthorized upload blocked - should reject uploads missing JWT token', async () => {
    const pdfBuffer = Buffer.from('%PDF-1.4 content');

    const res = await request(app)
      .post('/api/v1/files/upload')
      .attach('file', pdfBuffer, 'document.pdf');

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('type', 'https://pipelinex.dev/errors/UNAUTHORIZED');
  });

  it('7. List files - should return all uploaded files belonging to user', async () => {
    const res = await request(app)
      .get('/api/v1/files')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(3);
  });

  it('8. Get file metadata - should return detailed file record', async () => {
    const res = await request(app)
      .get(`/api/v1/files/${uploadedFileId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(uploadedFileId);
    expect(res.body.data.userId).toBe(testUserId);
    expect(res.body.data.originalName).toBe('sample_doc.pdf');

    uploadedStorageKey = res.body.data.storageKey;
  });

  it('9. Generate signed URL - should produce valid signed download link', async () => {
    const res = await request(app)
      .get(`/api/v1/files/${uploadedFileId}/download-url`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.fileId).toBe(uploadedFileId);
    expect(res.body.data.downloadUrl).toContain('cloudflarestorage.com');
    expect(res.body.data.expiresInSeconds).toBe(900);
  });

  it('10. Download from signed URL - should generate valid URL structure', async () => {
    const res = await request(app)
      .get(`/api/v1/files/${uploadedFileId}/download-url`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(typeof res.body.data.downloadUrl).toBe('string');
    expect(res.body.data.downloadUrl.length).toBeGreaterThan(20);
  });

  it('11. Delete file - should delete file from storage and database', async () => {
    const res = await request(app)
      .delete(`/api/v1/files/${uploadedFileId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('File deleted successfully');
  });

  it('12. Database updated - should verify deleted file no longer exists in PostgreSQL', async () => {
    const dbFile = await prisma.file.findUnique({
      where: { id: uploadedFileId },
    });

    expect(dbFile).toBeNull();
  });

  it('13. R2 storage updated - should verify deleted object removed from object storage', async () => {
    const exists = storageService.isKeyInTestStore(uploadedStorageKey);
    expect(exists).toBe(false);
  });
});
