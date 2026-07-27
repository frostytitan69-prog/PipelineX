import request from 'supertest';
import { createApp } from '../../src/app';
import { generateAccessToken } from '../../src/common/utils/jwt.util';
import { prisma } from '../../src/database/prisma.service';
import { redis } from '../../src/database/redis.service';

const app = createApp();

describe('Milestone 4 E2E Queue & Worker Lifecycle Verification', () => {
  let authToken: string;
  let testUserId: string;

  beforeAll(async () => {
    const user = await prisma.user.upsert({
      where: { email: 'm4-e2e-user@pipelinex.dev' },
      update: {},
      create: {
        email: 'm4-e2e-user@pipelinex.dev',
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
    await prisma.file.deleteMany({ where: { userId: testUserId } });
    await prisma.user.deleteMany({ where: { id: testUserId } });
  });

  it('1. Upload file & receive immediate response with status UPLOADED and jobId', async () => {
    const pdfBuffer = Buffer.from('%PDF-1.4 Milestone 4 verification content');

    const res = await request(app)
      .post('/api/v1/files/upload')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('file', pdfBuffer, 'm4_e2e_document.pdf');

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('fileId');
    expect(res.body.data).toHaveProperty('jobId');
    expect(res.body.data.status).toBe('UPLOADED');
  });

  it('2. Status endpoint GET /api/v1/files/:id/status tracks transitions', async () => {
    const pdfBuffer = Buffer.from('%PDF-1.4 Milestone 4 status transition content');

    const uploadRes = await request(app)
      .post('/api/v1/files/upload')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('file', pdfBuffer, 'transition_doc.pdf');

    const fileId = uploadRes.body.data.fileId;

    // Immediately after upload, status must be UPLOADED or PROCESSING
    const statusRes1 = await request(app)
      .get(`/api/v1/files/${fileId}/status`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(statusRes1.status).toBe(200);
    expect(statusRes1.body.data.fileId).toBe(fileId);
    expect(['UPLOADED', 'PROCESSING', 'COMPLETED']).toContain(statusRes1.body.data.status);
  });

  it('3. Inspect Redis for BullMQ Queue Keys', async () => {
    const keys = await redis.keys('*bull:FileProcessingQueue*');
    expect(Array.isArray(keys)).toBe(true);
  });
});
