import request from 'supertest';
import { createApp } from '../../src/app';
import { generateAccessToken } from '../../src/common/utils/jwt.util';
import { prisma } from '../../src/database/prisma.service';

const app = createApp();

describe('Milestone 4 BullMQ Queue Integration Tests', () => {
  let authToken: string;
  let testUserId: string;
  let uploadedFileId: string;

  beforeAll(async () => {
    const user = await prisma.user.upsert({
      where: { email: 'queue-test-user@pipelinex.dev' },
      update: {},
      create: {
        email: 'queue-test-user@pipelinex.dev',
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

  it('POST /api/v1/files/upload - should return 201 with status UPLOADED and jobId', async () => {
    const pdfBuffer = Buffer.from('%PDF-1.4 queue test file content');

    const res = await request(app)
      .post('/api/v1/files/upload')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('file', pdfBuffer, 'queue_test.pdf');

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('fileId');
    expect(res.body.data.status).toBe('UPLOADED');
    expect(res.body.data).toHaveProperty('jobId');

    uploadedFileId = res.body.data.fileId;
  });

  it('GET /api/v1/files/:id/status - should return current file status', async () => {
    const res = await request(app)
      .get(`/api/v1/files/${uploadedFileId}/status`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.fileId).toBe(uploadedFileId);
    expect(['UPLOADED', 'PROCESSING', 'COMPLETED', 'FAILED']).toContain(res.body.data.status);
  });
});
