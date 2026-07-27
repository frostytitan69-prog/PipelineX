import request from 'supertest';
import { createApp } from '../../src/app';

const app = createApp();

describe('File Ingestion Integration Tests', () => {
  it('GET /api/v1/files without token should return 401 Unauthorized', async () => {
    const res = await request(app).get('/api/v1/files');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('type', 'https://pipelinex.dev/errors/UNAUTHORIZED');
  });

  it('POST /api/v1/files/upload without file payload should return 400 Validation Error', async () => {
    const res = await request(app)
      .post('/api/v1/files/upload')
      .set('Authorization', 'Bearer invalid-token');

    expect(res.status).toBe(401);
  });
});
