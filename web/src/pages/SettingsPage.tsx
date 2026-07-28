import React from 'react';
import { Key, User as UserIcon } from 'lucide-react';
import { PageHeader } from '../components/ui/PageHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const token = localStorage.getItem('accessToken') || '';

  const handleCopyToken = () => {
    if (!token) return;
    navigator.clipboard.writeText(token);
    toast.success('JWT Access Token copied to clipboard!');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Account & Engine Settings"
        description="Manage account credentials, JWT tokens, and object storage configurations."
      />

      <Card className="space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-[#27272A]">
          <UserIcon className="w-5 h-5 text-blue-400" />
          <h3 className="text-base font-bold text-white">User Profile Information</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">Email Address</label>
            <input
              type="text"
              readOnly
              value={user?.email || 'N/A'}
              className="w-full px-3 py-2 bg-[#111111] border border-[#27272A] rounded-lg text-sm text-zinc-300"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-zinc-400 mb-1">Account Role</label>
            <input
              type="text"
              readOnly
              value={user?.role || 'USER'}
              className="w-full px-3 py-2 bg-[#111111] border border-[#27272A] rounded-lg text-sm text-zinc-300 font-bold"
            />
          </div>
        </div>
      </Card>

      <Card className="space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-[#27272A]">
          <Key className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold text-white">API Authentication Keys</h3>
        </div>
        <p className="text-xs text-zinc-400">Use your active Bearer Access Token for REST API integration.</p>
        <div className="flex items-center gap-2">
          <input
            type="password"
            readOnly
            value={token}
            className="flex-1 px-3 py-2 bg-[#111111] border border-[#27272A] rounded-lg text-xs font-mono text-zinc-400"
          />
          <Button variant="secondary" size="sm" onClick={handleCopyToken}>
            Copy Token
          </Button>
        </div>
      </Card>
    </div>
  );
};
