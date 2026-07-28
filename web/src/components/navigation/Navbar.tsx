import React, { useState } from 'react';
import { Bell, Sun, Moon, User as UserIcon, Shield, LogOut } from 'lucide-react';
import { SearchInput } from '../ui/SearchInput';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

export const Navbar: React.FC = () => {
  const [search, setSearch] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    setShowProfileMenu(false);
    await logout();
    queryClient.clear();
    navigate('/login');
  };

  const getInitials = (email?: string) => {
    if (!email) return 'PX';
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <header className="flex items-center justify-between h-16 px-6 bg-[#09090B] border-b border-[#27272A] z-30">
      {/* Search Input */}
      <SearchInput
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onClear={() => setSearch('')}
        placeholder="Search files, jobs, or pipeline telemetry..."
      />

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Notification button */}
        <button
          type="button"
          className="relative p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />
        </button>

        {/* Theme toggle */}
        <button
          type="button"
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer"
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* User avatar & profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg border border-[#27272A] bg-[#18181B] hover:border-zinc-700 transition-all cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
              {getInitials(user?.email)}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-white leading-tight max-w-[120px] truncate">
                {user?.email || 'User'}
              </span>
              <span className="text-[10px] text-zinc-400 leading-none">{user?.role || 'USER'}</span>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-[#18181B] border border-[#27272A] rounded-xl shadow-2xl py-1 z-50">
              <div className="px-4 py-2 border-b border-[#27272A]">
                <p className="text-xs font-semibold text-white truncate">{user?.email}</p>
                <p className="text-[10px] text-zinc-400 mt-0.5">Role: {user?.role}</p>
              </div>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate('/settings');
                }}
                className="flex items-center gap-2 w-full px-4 py-2 text-xs text-zinc-300 hover:bg-zinc-800 text-left cursor-pointer"
              >
                <UserIcon className="w-4 h-4" /> Profile & Settings
              </button>
              {user?.role === 'ADMIN' && (
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/admin');
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-xs text-purple-400 hover:bg-purple-500/10 text-left cursor-pointer"
                >
                  <Shield className="w-4 h-4" /> Admin Console
                </button>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-2 text-xs text-rose-400 hover:bg-rose-500/10 text-left cursor-pointer border-t border-[#27272A]"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
