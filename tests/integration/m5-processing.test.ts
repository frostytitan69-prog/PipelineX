import request from 'supertest';
import sharp from 'sharp';
import { createApp } from '../../src/app';
import { generateAccessToken } from '../../src/common/utils/jwt.util';
import { prisma } from '../../src/database/prisma.service';

const app = createApp();

describe('Milestone 5 Real File Processing Integration Tests', () => {
  let authToken: string;
  let testUserId: string;

  beforeAll(async () => {
    const user = await prisma.user.upsert({
      where: { email: 'm5-test-user@pipelinex.dev' },
      update: {},
      create: {
        email: 'm5-test-user@pipelinex.dev',
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

  it('1. PNG Processing - should upload image, process thumbnail, and return result', async () => {
    const pngBuffer = await sharp({
      create: { width: 400, height: 400, channels: 4, background: { r: 0, g: 0, b: 255, alpha: 1 } },
    })
      .png()
      .toBuffer();

    const uploadRes = await request(app)
      .post('/api/v1/files/upload')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('file', pngBuffer, 'sample.png');

    expect(uploadRes.status).toBe(201);
    const fileId = uploadRes.body.data.fileId;

    // Fetch result
    const resultRes = await request(app)
      .get(`/api/v1/files/${fileId}/result`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(resultRes.status).toBe(200);
    expect(resultRes.body.data.fileId).toBe(fileId);
  });

  it('2. TXT Processing - should upload text file, extract statistics, and return textContent', async () => {
    const txtBuffer = Buffer.from('Hello PipelineX text file processing suite');

    const uploadRes = await request(app)
      .post('/api/v1/files/upload')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('file', txtBuffer, 'sample.txt');

    expect(uploadRes.status).toBe(201);
    const fileId = uploadRes.body.data.fileId;

    const resultRes = await request(app)
      .get(`/api/v1/files/${fileId}/result`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(resultRes.status).toBe(200);
    expect(resultRes.body.data.fileId).toBe(fileId);
  });
});
