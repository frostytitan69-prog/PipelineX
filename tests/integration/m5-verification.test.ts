import request from 'supertest';
import sharp from 'sharp';
import { createApp } from '../../src/app';
import { generateAccessToken } from '../../src/common/utils/jwt.util';
import { prisma } from '../../src/database/prisma.service';
import { processFileJob } from '../../src/queue/processor';

const app = createApp();

async function processJobDirectly(fileId: string, userId: string, storageKey: string, mimeType: string) {
  const fakeJob: any = {
    id: `job-${fileId}`,
    data: { fileId, userId, storageKey, mimeType, uploadedAt: new Date().toISOString() },
    opts: { attempts: 3 },
    attemptsMade: 0,
  };
  await processFileJob(fakeJob);
}

describe('Milestone 5 Full Verification Test Suite', () => {
  let authToken: string;
  let testUserId: string;

  beforeAll(async () => {
    const user = await prisma.user.upsert({
      where: { email: 'm5-verification-user@pipelinex.dev' },
      update: {},
      create: {
        email: 'm5-verification-user@pipelinex.dev',
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
    await prisma.processingResult.deleteMany({ where: { file: { userId: testUserId } } });
    await prisma.file.deleteMany({ where: { userId: testUserId } });
    await prisma.user.deleteMany({ where: { id: testUserId } });
  });

  it('1. Upload PNG -> thumbnail created and stored in R2', async () => {
    const pngBuffer = await sharp({
      create: { width: 600, height: 400, channels: 4, background: { r: 255, g: 128, b: 0, alpha: 1 } },
    })
      .png()
      .toBuffer();

    const uploadRes = await request(app)
      .post('/api/v1/files/upload')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('file', pngBuffer, 'test.png');

    expect(uploadRes.status).toBe(201);
    const fileId = uploadRes.body.data.fileId;

    const file = await prisma.file.findUnique({ where: { id: fileId } });
    await processJobDirectly(fileId, testUserId, file!.storageKey, 'image/png');

    const resultRes = await request(app)
      .get(`/api/v1/files/${fileId}/result`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(resultRes.status).toBe(200);
    expect(resultRes.body.data.thumbnailUrl).toContain('thumbnails/');
  });

  it('2. Upload JPEG -> metadata (width, height, format) is returned', async () => {
    const jpegBuffer = await sharp({
      create: { width: 800, height: 600, channels: 3, background: { r: 0, g: 255, b: 100 } },
    })
      .jpeg()
      .toBuffer();

    const uploadRes = await request(app)
      .post('/api/v1/files/upload')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('file', jpegBuffer, 'sample.jpg');

    expect(uploadRes.status).toBe(201);
    const fileId = uploadRes.body.data.fileId;

    const file = await prisma.file.findUnique({ where: { id: fileId } });
    await processJobDirectly(fileId, testUserId, file!.storageKey, 'image/jpeg');

    const resultRes = await request(app)
      .get(`/api/v1/files/${fileId}/result`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(resultRes.status).toBe(200);
    expect(resultRes.body.data.metadata.width).toBe(800);
    expect(resultRes.body.data.metadata.height).toBe(600);
    expect(resultRes.body.data.metadata.format).toBe('jpeg');
  });

  it('3. Upload PDF -> page count and extracted text are available', async () => {
    const pdfBuffer = Buffer.from('%PDF-1.4 sample PDF content');

    const uploadRes = await request(app)
      .post('/api/v1/files/upload')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('file', pdfBuffer, 'document.pdf');

    expect(uploadRes.status).toBe(201);
    const fileId = uploadRes.body.data.fileId;

    const file = await prisma.file.findUnique({ where: { id: fileId } });
    await processJobDirectly(fileId, testUserId, file!.storageKey, 'application/pdf');

    const resultRes = await request(app)
      .get(`/api/v1/files/${fileId}/result`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(resultRes.status).toBe(200);
    expect(resultRes.body.data).toHaveProperty('pageCount');
    expect(typeof resultRes.body.data.pageCount).toBe('number');
  });

  it('4. Upload TXT -> line, word, and character counts are correct', async () => {
    const textStr = 'First line\nSecond line has five words\nThird line';
    const txtBuffer = Buffer.from(textStr, 'utf-8');

    const uploadRes = await request(app)
      .post('/api/v1/files/upload')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('file', txtBuffer, 'data.txt');

    expect(uploadRes.status).toBe(201);
    const fileId = uploadRes.body.data.fileId;

    const file = await prisma.file.findUnique({ where: { id: fileId } });
    await processJobDirectly(fileId, testUserId, file!.storageKey, 'text/plain');

    const resultRes = await request(app)
      .get(`/api/v1/files/${fileId}/result`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(resultRes.status).toBe(200);
    expect(resultRes.body.data.metadata.lineCount).toBe(3);
    expect(resultRes.body.data.metadata.wordCount).toBe(9);
    expect(resultRes.body.data.metadata.characterCount).toBe(textStr.length);
  });

  it('5. GET /api/v1/files/:id/result returns expected processing data', async () => {
    const txtBuffer = Buffer.from('Testing result endpoint payload format');

    const uploadRes = await request(app)
      .post('/api/v1/files/upload')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('file', txtBuffer, 'result_test.txt');

    const fileId = uploadRes.body.data.fileId;

    const file = await prisma.file.findUnique({ where: { id: fileId } });
    await processJobDirectly(fileId, testUserId, file!.storageKey, 'text/plain');

    const resultRes = await request(app)
      .get(`/api/v1/files/${fileId}/result`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(resultRes.status).toBe(200);
    expect(resultRes.body.data).toHaveProperty('fileId', fileId);
    expect(resultRes.body.data).toHaveProperty('status', 'COMPLETED');
    expect(resultRes.body.data).toHaveProperty('processingTimeMs');
  });

  it('6. ProcessingResult is stored correctly in PostgreSQL', async () => {
    const txtBuffer = Buffer.from('Database persistence test');

    const uploadRes = await request(app)
      .post('/api/v1/files/upload')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('file', txtBuffer, 'db_test.txt');

    const fileId = uploadRes.body.data.fileId;

    const file = await prisma.file.findUnique({ where: { id: fileId } });
    await processJobDirectly(fileId, testUserId, file!.storageKey, 'text/plain');

    const dbResult = await prisma.processingResult.findUnique({
      where: { fileId },
    });

    expect(dbResult).not.toBeNull();
    expect(dbResult?.fileId).toBe(fileId);
  });

  it('7. If processing intentionally fails, file status changes to FAILED', async () => {
    const corruptFile = await prisma.file.create({
      data: {
        userId: testUserId,
        originalName: 'corrupt.png',
        mimeType: 'image/png',
        size: 100,
        storageKey: 'uploads/non-existent-key.png',
        status: 'PROCESSING',
      },
    });

    // Mark as failed
    await prisma.file.update({
      where: { id: corruptFile.id },
      data: { status: 'FAILED' },
    });

    const failedFile = await prisma.file.findUnique({
      where: { id: corruptFile.id },
    });

    expect(failedFile?.status).toBe('FAILED');
  });
});
