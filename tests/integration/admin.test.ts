import request from 'supertest';
import { createApp } from '../../src/app';
import { generateAccessToken } from '../../src/common/utils/jwt.util';
import { prisma } from '../../src/database/prisma.service';

const app = createApp();

describe('Milestone 6 Admin Dashboard & Observability Integration Tests', () => {
  let adminToken: string;
  let memberToken: string;
  let adminUserId: string;
  let memberUserId: string;
  let testFileId: string;

  beforeAll(async () => {
    // Create ADMIN user
    const admin = await prisma.user.upsert({
      where: { email: 'admin-test@pipelinex.dev' },
      update: { role: 'ADMIN' },
      create: {
        email: 'admin-test@pipelinex.dev',
        passwordHash: '$2b$12$eImiTXuWVxfM37uY4JANjOL.80Fk79V6n11.9O.1234567890123',
        role: 'ADMIN',
      },
    });
    adminUserId = admin.id;
    adminToken = generateAccessToken({ userId: admin.id, email: admin.email, role: 'ADMIN' });

    // Create regular MEMBER user
    const member = await prisma.user.upsert({
      where: { email: 'member-test@pipelinex.dev' },
      update: { role: 'USER' },
      create: {
        email: 'member-test@pipelinex.dev',
        passwordHash: '$2b$12$eImiTXuWVxfM37uY4JANjOL.80Fk79V6n11.9O.1234567890123',
        role: 'USER',
      },
    });
    memberUserId = member.id;
    memberToken = generateAccessToken({ userId: member.id, email: member.email, role: 'USER' });

    // Create a dummy file for job inspection & retry
    const file = await prisma.file.create({
      data: {
        userId: member.id,
        originalName: 'retry_test.png',
        mimeType: 'image/png',
        size: 512,
        storageKey: 'uploads/dummy-key.png',
        status: 'FAILED',
      },
    });
    testFileId = file.id;
  });

  afterAll(async () => {
    await prisma.file.deleteMany({ where: { userId: { in: [adminUserId, memberUserId] } } });
    await prisma.user.deleteMany({ where: { id: { in: [adminUserId, memberUserId] } } });
  });

  it('1. GET /api/v1/admin/dashboard - non-admin USER should be rejected with 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/v1/admin/dashboard')
      .set('Authorization', `Bearer ${memberToken}`);

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('type', 'https://pipelinex.dev/errors/FORBIDDEN');
  });

  it('2. GET /api/v1/admin/dashboard - ADMIN user should receive 200 OK with dashboard stats', async () => {
    const res = await request(app)
      .get('/api/v1/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('totalUsers');
    expect(res.body.data).toHaveProperty('totalFiles');
    expect(res.body.data).toHaveProperty('storageUsedBytes');
  });

  it('3. GET /api/v1/admin/queue - ADMIN user should receive BullMQ queue metrics', async () => {
    const res = await request(app)
      .get('/api/v1/admin/queue')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('waiting');
    expect(res.body.data).toHaveProperty('active');
    expect(res.body.data).toHaveProperty('completed');
  });

  it('4. GET /api/v1/admin/jobs - ADMIN user should get paginated list of jobs', async () => {
    const res = await request(app)
      .get('/api/v1/admin/jobs?page=1&limit=10')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.jobs)).toBe(true);
  });

  it('5. POST /api/v1/admin/jobs/:jobId/retry - ADMIN user can trigger job retry', async () => {
    const res = await request(app)
      .post(`/api/v1/admin/jobs/${testFileId}/retry`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('jobId');

    const updatedFile = await prisma.file.findUnique({ where: { id: testFileId } });
    expect(['UPLOADED', 'PROCESSING', 'COMPLETED', 'FAILED']).toContain(updatedFile?.status);
  });

  it('6. Enhanced GET /api/v1/health - should report database, redis, worker, queue, memory & uptime', async () => {
    const res = await request(app).get('/api/v1/health');

    expect([200, 503]).toContain(res.status);
    expect(res.body).toHaveProperty('uptimeSeconds');
    expect(res.body).toHaveProperty('memoryUsage');
    expect(res.body.dependencies).toHaveProperty('database');
  });
});
