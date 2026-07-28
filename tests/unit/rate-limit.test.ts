import rateLimit from 'express-rate-limit';
import request from 'supertest';
import express from 'express';

describe('Rate Limiter Middleware Unit Tests', () => {
  it('should enforce rate limits and return 429 when max requests are exceeded', async () => {
    const testApp = express();

    const limiter = rateLimit({
      windowMs: 60 * 1000,
      max: 2,
      handler: (_req, res) => {
        res.status(429).json({ message: 'Rate limit exceeded' });
      },
    });

    testApp.get('/test-limit', limiter, (_req, res) => {
      res.status(200).json({ success: true });
    });

    const res1 = await request(testApp).get('/test-limit');
    const res2 = await request(testApp).get('/test-limit');
    const res3 = await request(testApp).get('/test-limit');

    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);
    expect(res3.status).toBe(429);
    expect(res3.body.message).toBe('Rate limit exceeded');
  });
});
