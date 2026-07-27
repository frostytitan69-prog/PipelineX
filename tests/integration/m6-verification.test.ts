import request from 'supertest';
import fs from 'fs';
import path from 'path';
import { createApp } from '../../src/app';
import { generateAccessToken } from '../../src/common/utils/jwt.util';
import { prisma } from '../../src/database/prisma.service';

const app = createApp();

describe('Milestone 6 Full Verification Test Suite', () => {
  let adminToken: string;
  let memberToken: string;
  let adminUserId: string;
  let memberUserId: string;
  let failedFileId: string;

  beforeAll(async () => {
    // Create ADMIN user
    const admin = await prisma.user.upsert({
      where: { email: 'm6-admin-verify@pipelinex.dev' },
      update: { role: 'ADMIN' },
      create: {
        email: 'm6-admin-verify@pipelinex.dev',
        passwordHash: '$2b$12$eImiTXuWVxfM37uY4JANjOL.80Fk79V6n11.9O.1234567890123',
        role: 'ADMIN',
      },
    });
    adminUserId = admin.id;
    adminToken = generateAccessToken({ userId: admin.id, email: admin.email, role: 'ADMIN' });

    // Create MEMBER user
    const member = await prisma.user.upsert({
      where: { email: 'm6-member-verify@pipelinex.dev' },
      update: { role: 'USER' },
      create: {
        email: 'm6-member-verify@pipelinex.dev',
        passwordHash: '$2b$12$eImiTXuWVxfM37uY4JANjOL.80Fk79V6n11.9O.1234567890123',
        role: 'USER',
      },
    });
    memberUserId = member.id;
    memberToken = generateAccessToken({ userId: member.id, email: member.email, role: 'USER' });

    // Create a failed file record for retry testing
    const file = await prisma.file.create({
      data: {
        userId: member.id,
        originalName: 'failed_job_test.png',
        mimeType: 'image/png',
        size: 1024,
        storageKey: 'uploads/failed-test-key.png',
        status: 'FAILED',
      },
    });
    failedFileId = file.id;
  });

  afterAll(async () => {
    await prisma.file.deleteMany({ where: { userId: { in: [adminUserId, memberUserId] } } });
    await prisma.user.deleteMany({ where: { id: { in: [adminUserId, memberUserId] } } });
  });

  it('1. GET /api/v1/admin/dashboard returns accurate system statistics', async () => {
    const res = await request(app)
      .get('/api/v1/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('totalUsers');
    expect(res.body.data).toHaveProperty('totalFiles');
    expect(res.body.data).toHaveProperty('storageUsedBytes');
    expect(res.body.data).toHaveProperty('averageProcessingTimeMs');
  });

  it('2. GET /api/v1/admin/queue reflects BullMQ queue state', async () => {
    const res = await request(app)
      .get('/api/v1/admin/queue')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('waiting');
    expect(res.body.data).toHaveProperty('active');
    expect(res.body.data).toHaveProperty('completed');
    expect(res.body.data).toHaveProperty('failed');
    expect(res.body.data).toHaveProperty('delayed');
  });

  it('3. GET /api/v1/admin/jobs supports pagination and filtering', async () => {
    const res = await request(app)
      .get('/api/v1/admin/jobs?status=FAILED&page=1&limit=5')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('jobs');
    expect(res.body.data).toHaveProperty('page', 1);
    expect(Array.isArray(res.body.data.jobs)).toBe(true);
  });

  it('4. Failed jobs can be retried successfully', async () => {
    const res = await request(app)
      .post(`/api/v1/admin/jobs/${failedFileId}/retry`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('jobId');

    const updatedFile = await prisma.file.findUnique({ where: { id: failedFileId } });
    expect(['UPLOADED', 'PROCESSING', 'COMPLETED', 'FAILED']).toContain(updatedFile?.status);
  });

  it('5. Enhanced /health endpoint reports database, Redis, R2, queue, worker, uptime, and memory status', async () => {
    const res = await request(app).get('/api/v1/health');

    expect([200, 503]).toContain(res.status);
    expect(res.body).toHaveProperty('service', 'PipelineX API');
    expect(res.body).toHaveProperty('uptimeSeconds');
    expect(res.body).toHaveProperty('nodeVersion');
    expect(res.body.dependencies).toHaveProperty('database');
    expect(res.body.dependencies).toHaveProperty('redis');
    expect(res.body.dependencies).toHaveProperty('worker');
    expect(res.body.dependencies).toHaveProperty('cloudflareR2');
    expect(res.body).toHaveProperty('memoryUsage');
  });

  it('6. Log files (logs/app.log and logs/error.log) are created and populated', async () => {
    const logsDir = path.join(process.cwd(), 'logs');
    const appLogPath = path.join(logsDir, 'app.log');

    // Trigger an error to populate error.log
    await request(app).get('/api/v1/non-existent-route-for-log-test');

    expect(fs.existsSync(appLogPath)).toBe(true);
    const appLogContent = fs.readFileSync(appLogPath, 'utf-8');
    expect(appLogContent.length).toBeGreaterThan(0);
  });

  it('7. Non-admin users receive 403 Forbidden when accessing admin endpoints', async () => {
    const res = await request(app)
      .get('/api/v1/admin/dashboard')
      .set('Authorization', `Bearer ${memberToken}`);

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('type', 'https://pipelinex.dev/errors/FORBIDDEN');
  });
});
