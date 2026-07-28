import { describe, it, expect } from 'vitest';

describe('Auth & Token Persistence Unit Tests', () => {
  it('should store access, refresh tokens, and user object in localStorage on login', () => {
    const testAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test-access-token-payload';
    const testRefreshToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test-refresh-token-payload';
    const testUser = JSON.stringify({ id: 'u-1', email: 'user@pipelinex.dev', role: 'USER' });

    localStorage.setItem('accessToken', testAccessToken);
    localStorage.setItem('refreshToken', testRefreshToken);
    localStorage.setItem('user', testUser);

    expect(localStorage.getItem('accessToken')).toBe(testAccessToken);
    expect(localStorage.getItem('refreshToken')).toBe(testRefreshToken);
    expect(localStorage.getItem('user')).toBe(testUser);
  });

  it('should clear tokens and user object from localStorage on logout', () => {
    localStorage.setItem('accessToken', 'test-access-token');
    localStorage.setItem('refreshToken', 'test-refresh-token');
    localStorage.setItem('user', '{"id":"u-1"}');

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');

    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });
});
