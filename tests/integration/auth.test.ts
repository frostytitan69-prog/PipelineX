import request from 'supertest';
import { createApp } from '../../src/app';

const app = createApp();

describe('Auth Integration Tests', () => {
  it('GET /api/v1/health should return status OK or DEGRADED', async () => {
    const res = await request(app).get('/api/v1/health');
    expect([200, 503]).toContain(res.status);
    expect(res.body).toHaveProperty('service', 'PipelineX API');
  }, 10000);

  it('POST /api/v1/auth/register with invalid email should return 400 Validation Error', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      email: 'not-an-email',
      password: 'short',
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('type', 'https://pipelinex.dev/errors/VALIDATION_ERROR');
  });

  it('GET /api/v1/auth/me without token should return 401 Unauthorized', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('type', 'https://pipelinex.dev/errors/UNAUTHORIZED');
  });
});
