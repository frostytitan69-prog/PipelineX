import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../routes/ProtectedRoute';
import * as AuthContextModule from '../context/AuthContext';
import type { User } from '../types';

const testUser: User = {
  id: 'u-1',
  email: 'test@pipelinex.dev',
  role: 'USER',
  createdAt: new Date().toISOString(),
};

describe('ProtectedRoute & RBAC Integration Tests', () => {
  it('should render protected content when user is authenticated', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: testUser,
      accessToken: 'test-token',
      refreshToken: 'test-refresh',
      isAuthenticated: true,
      isLoading: false,
      login: () => {},
      register: () => {},
      logout: async () => {},
      setUser: () => {},
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<div>Dashboard Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
  });

  it('should render 403 Forbidden when non-admin user accesses /admin route', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      user: testUser,
      accessToken: 'test-token',
      refreshToken: 'test-refresh',
      isAuthenticated: true,
      isLoading: false,
      login: () => {},
      register: () => {},
      logout: async () => {},
      setUser: () => {},
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
            <Route path="/admin" element={<div>Admin Console</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Access Forbidden')).toBeInTheDocument();
  });
});
