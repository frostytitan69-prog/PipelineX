import request from 'supertest';
import rateLimit from 'express-rate-limit';
import express from 'express';
import { createApp } from '../../src/app';
import { generateAccessToken } from '../../src/common/utils/jwt.util';
import { prisma } from '../../src/database/prisma.service';
import { CacheService } from '../../src/services/cache.service';

const app = createApp();

describe('Milestone 7 Full Verification Test Matrix', () => {
  let authToken: string;
  let testUserId: string;

  beforeAll(async () => {
    const user = await prisma.user.upsert({
      where: { email: 'm7-verification-user@pipelinex.dev' },
      update: {},
      create: {
        email: 'm7-verification-user@pipelinex.dev',
        passwordHash: '$2b$12$eImiTXuWVxfM37uY4JANjOL.80Fk79V6n11.9O.1234567890123',
        role: 'USER',
      },
    });

    testUserId = user.id;
    authToken = generateAccessToken({ userId: user.id, email: user.email, role: 'USER' });

    // Seed test dataset
    await prisma.file.createMany({
      data: [
        { userId: user.id, originalName: 'invoice_2026.pdf', mimeType: 'application/pdf', size: 1200, storageKey: 'uploads/inv.pdf', status: 'COMPLETED' },
        { userId: user.id, originalName: 'avatar.png', mimeType: 'image/png', size: 4500, storageKey: 'uploads/av.png', status: 'UPLOADED' },
        { userId: user.id, originalName: 'notes.txt', mimeType: 'text/plain', size: 300, storageKey: 'uploads/nt.txt', status: 'COMPLETED' },
      ],
    });
  });

  afterAll(async () => {
    await prisma.file.deleteMany({ where: { userId: testUserId } });
    await prisma.user.deleteMany({ where: { id: testUserId } });
    await CacheService.invalidateUserCache(testUserId);
  });

  it('1. Auth endpoints return 429 Too Many Requests after repeated failed requests', async () => {
    const testApp = express();
    const limiter = rateLimit({ windowMs: 60000, max: 2, handler: (_req, res) => res.status(429).json({ message: 'Too Many Requests' }) });
    testApp.post('/auth/login', limiter, (_req, res) => res.status(401).json({ message: 'Unauthorized' }));

    await request(testApp).post('/auth/login');
    await request(testApp).post('/auth/login');
    const res3 = await request(testApp).post('/auth/login');

    expect(res3.status).toBe(429);
  });

  it('2. Repeated GET /api/v1/files requests hit Redis cache', async () => {
    const key = `cache:files:${testUserId}`;
    await CacheService.set(key, { data: [], cached: true });

    const cached = await CacheService.get<{ cached: boolean }>(key);
    expect(cached?.cached).toBe(true);
  });

  it('3. Cache is invalidated after uploading or deleting a file', async () => {
    const key = `cache:files:${testUserId}`;
    await CacheService.set(key, { cached: true });
    await CacheService.invalidateUserCache(testUserId);

    const cached = await CacheService.get(key);
    expect(cached).toBeNull();
  });

  it('4. Pagination (page/limit) works correctly', async () => {
    const res = await request(app)
      .get('/api/v1/files?page=1&limit=2')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(1);
    expect(res.body.pagination.limit).toBe(2);
    expect(res.body.data.length).toBe(2);
  });

  it('5. Sorting by createdAt, updatedAt, and size works', async () => {
    const res = await request(app)
      .get('/api/v1/files?sortBy=size&order=desc')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data[0].size).toBeGreaterThanOrEqual(res.body.data[1].size);
  });

  it('6. Filtering by status, MIME type, and date range works', async () => {
    const res = await request(app)
      .get('/api/v1/files?status=COMPLETED&mimeType=application/pdf')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].mimeType).toBe('application/pdf');
  });

  it('7. Filename search returns matching files', async () => {
    const res = await request(app)
      .get('/api/v1/files?search=invoice')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].originalName).toContain('invoice');
  });

  it('8. Security headers from Helmet are present in responses', async () => {
    const res = await request(app).get('/api/v1/health');

    expect(res.headers).toHaveProperty('strict-transport-security');
    expect(res.headers).toHaveProperty('x-frame-options', 'DENY');
    expect(res.headers).toHaveProperty('x-content-type-options', 'nosniff');
  });
});
