import rateLimit from 'express-rate-limit';

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 20, // Max 20 requests per IP per window for auth routes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    type: 'https://pipelinex.dev/errors/TOO_MANY_REQUESTS',
    title: 'Too Many Requests',
    status: 429,
    detail: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
    timestamp: new Date().toISOString(),
  },
});
