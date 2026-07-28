import React, { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Zap, Lock, Mail, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../hooks/useAuth';
import { apiClient } from '../../api/axios.client';
import type { User } from '../../types';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export interface AuthBackendData {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  message?: string;
  data: AuthBackendData;
}

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true,
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', {
        email: values.email,
        password: values.password,
      });

      const payload = response.data?.data || (response.data as unknown as AuthBackendData);
      
      if (!payload?.accessToken || !payload?.user) {
        throw new Error('Invalid backend login payload');
      }

      login(payload.accessToken, payload.refreshToken, payload.user);
      toast.success(`Welcome back, ${payload.user.email}!`);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string; message?: string } } }).response?.data?.detail ||
        (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
        (err as Error).message ||
        'Login failed. Please verify credentials.';
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] flex flex-col items-center justify-center p-4">
      <NavLink to="/" className="flex items-center gap-3 mb-8">
        <div className="p-2.5 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/20">
          <Zap className="w-6 h-6" />
        </div>
        <span className="font-bold text-2xl text-white tracking-tight">PipelineX</span>
      </NavLink>

      <Card className="w-full max-w-md p-8 border-[#27272A] shadow-2xl">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h2>
          <p className="text-sm text-zinc-400 mt-1">Sign in to access your file processing dashboard</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
              <input
                type="email"
                {...register('email')}
                className="w-full pl-9 pr-4 py-2.5 bg-[#111111] border border-[#27272A] rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                placeholder="name@example.com"
              />
            </div>
            {errors.email && <p className="text-xs text-rose-400 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
              <input
                type="password"
                {...register('password')}
                className="w-full pl-9 pr-4 py-2.5 bg-[#111111] border border-[#27272A] rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                placeholder="••••••••"
              />
            </div>
            {errors.password && <p className="text-xs text-rose-400 mt-1">{errors.password.message}</p>}
          </div>

          <Button type="submit" variant="primary" className="w-full" isLoading={isSubmitting}>
            Sign In <ArrowRight className="w-4 h-4" />
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-zinc-400">
          Don't have an account?{' '}
          <NavLink to="/register" className="text-blue-400 font-semibold hover:underline">
            Register here
          </NavLink>
        </div>
      </Card>
    </div>
  );
};
