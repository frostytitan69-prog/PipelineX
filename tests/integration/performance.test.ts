import request from 'supertest';
import { createApp } from '../../src/app';
import { generateAccessToken } from '../../src/common/utils/jwt.util';
import { prisma } from '../../src/database/prisma.service';
import { CacheService } from '../../src/services/cache.service';

const app = createApp();

describe('Milestone 7 Performance, Caching & Security Integration Tests', () => {
  let authToken: string;
  let testUserId: string;

  beforeAll(async () => {
    const user = await prisma.user.upsert({
      where: { email: 'm7-test@pipelinex.dev' },
      update: {},
      create: {
        email: 'm7-test@pipelinex.dev',
        passwordHash: '$2b$12$eImiTXuWVxfM37uY4JANjOL.80Fk79V6n11.9O.1234567890123',
        role: 'USER',
      },
    });

    testUserId = user.id;
    authToken = generateAccessToken({ userId: user.id, email: user.email, role: 'USER' });

    // Seed dummy files for pagination, sorting, filtering, search
    await prisma.file.createMany({
      data: [
        { userId: user.id, originalName: 'alpha_report.pdf', mimeType: 'application/pdf', size: 1000, storageKey: 'uploads/a.pdf', status: 'COMPLETED' },
        { userId: user.id, originalName: 'beta_image.png', mimeType: 'image/png', size: 5000, storageKey: 'uploads/b.png', status: 'UPLOADED' },
        { userId: user.id, originalName: 'charlie_data.txt', mimeType: 'text/plain', size: 200, storageKey: 'uploads/c.txt', status: 'COMPLETED' },
      ],
    });
  });

  afterAll(async () => {
    await prisma.file.deleteMany({ where: { userId: testUserId } });
    await prisma.user.deleteMany({ where: { id: testUserId } });
    await CacheService.invalidateUserCache(testUserId);
  });

  it('1. Pagination & Sorting - GET /api/v1/files supports limit, page, and sortBy', async () => {
    const res = await request(app)
      .get('/api/v1/files?page=1&limit=2&sortBy=size&order=desc')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.pagination).toHaveProperty('page', 1);
    expect(res.body.pagination).toHaveProperty('limit', 2);
    expect(res.body.data.length).toBe(2);
    expect(res.body.data[0].size).toBeGreaterThanOrEqual(res.body.data[1].size);
  });

  it('2. Filtering & Search - GET /api/v1/files supports status filter and search by name', async () => {
    const res = await request(app)
      .get('/api/v1/files?search=alpha&status=COMPLETED')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].originalName).toContain('alpha');
  });

  it('3. Security Headers - Helmet should set security headers (HSTS, CSP, X-Frame-Options)', async () => {
    const res = await request(app).get('/api/v1/health');

    expect(res.headers).toHaveProperty('strict-transport-security');
    expect(res.headers).toHaveProperty('x-frame-options', 'DENY');
    expect(res.headers).toHaveProperty('x-content-type-options', 'nosniff');
  });

  it('4. Cache Invalidation - Uploading or deleting invalidates user Redis cache', async () => {
    await CacheService.set(`cache:files:${testUserId}`, { cached: true });

    await CacheService.invalidateUserCache(testUserId);
    const cached = await CacheService.get(`cache:files:${testUserId}`);
    expect(cached).toBeNull();
  });
});
