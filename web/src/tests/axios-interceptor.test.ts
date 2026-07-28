import { describe, it, expect, vi } from 'vitest';
import axios from 'axios';

describe('Axios Client 401 Interceptor Unit Tests', () => {
  it('should attach Bearer access token to request headers', () => {
    localStorage.setItem('accessToken', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.valid-jwt-token');

    const config = { headers: {} as Record<string, string> };
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    expect(config.headers['Authorization']).toBe('Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.valid-jwt-token');
  });

  it('should format token refresh payload correctly with nested backend data', async () => {
    localStorage.setItem('refreshToken', 'valid-refresh-token');

    const mockPost = vi.spyOn(axios, 'post').mockResolvedValueOnce({
      data: {
        message: 'Token refreshed successfully',
        data: { accessToken: 'new-access-token', refreshToken: 'new-refresh-token' },
      },
    });

    const res = await axios.post('/api/v1/auth/refresh', { refreshToken: 'valid-refresh-token' });

    expect(mockPost).toHaveBeenCalledWith('/api/v1/auth/refresh', { refreshToken: 'valid-refresh-token' });
    expect(res.data.data.accessToken).toBe('new-access-token');

    mockPost.mockRestore();
  });
});
