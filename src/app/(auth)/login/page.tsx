'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/auth-context';
import { UserRole } from '@/lib/types';
import { DEMO_USERS } from '@/lib/constants/demo-data';
import { ROLE_DETAILS } from '@/lib/constants/roles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Sparkles, Check } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { login, loginAsRole, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('super_admin');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage('Please enter an institutional email');
      return;
    }
    setErrorMessage(null);
    try {
      await login(email, password);
      router.push('/command-center');
    } catch {
      setErrorMessage('Login failed. Please verify credentials.');
    }
  };

  const handleQuickDemoLogin = (role: UserRole) => {
    setSelectedRole(role);
    loginAsRole(role);
    const targetPath = ROLE_DETAILS[role].defaultPath;
    router.push(targetPath);
  };

  const demoRoles: UserRole[] = [
    'super_admin',
    'admin',
    'security',
    'faculty',
    'student',
    'parent',
    'warden',
    'placement_officer',
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-[#F4F1DE] font-mono">
          Luminous AI Portal Login
        </h1>
        <p className="text-xs text-[#B8B5A3]">
          Access campus safety command center, emergency beacons, and smart ERP
        </p>
      </div>

      {/* Quick Demo Role Selector Panel */}
      <div className="rounded-xl border border-[#D4AF37]/30 bg-[#131C38]/90 p-4 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#FFD700] font-mono">
            <Sparkles className="h-3.5 w-3.5 text-[#FFD700]" />
            <span>1-CLICK DEMO PERSONAS</span>
          </div>
          <span className="text-[10px] text-[#C5A059] font-mono">Select any role to test</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {demoRoles.map((r) => {
            const user = DEMO_USERS[r];
            const meta = ROLE_DETAILS[r];
            const isSelected = selectedRole === r;

            return (
              <button
                key={r}
                type="button"
                onClick={() => handleQuickDemoLogin(r)}
                className={`flex items-center gap-2.5 rounded-lg border p-2 text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#D4AF37] bg-[#D4AF37]/15 ring-1 ring-[#D4AF37]'
                    : 'border-[#243356] bg-[#0F1026] hover:border-[#D4AF37]/50 hover:bg-[#1C2541]'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={user.full_name}
                  className="h-7 w-7 rounded-full object-cover shrink-0 border border-[#D4AF37]/40"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold text-[#F4F1DE] truncate font-mono">{meta.label}</p>
                    {isSelected && <Check className="h-3 w-3 text-[#FFD700]" />}
                  </div>
                  <p className="text-[10px] text-[#B8B5A3] truncate">{user.full_name}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#243356]" />
        </div>
        <div className="relative flex justify-center text-xs uppercase font-mono">
          <span className="bg-[#0B132B] px-2 text-[#C5A059]">Or authenticate with credentials</span>
        </div>
      </div>

      {/* Standard Email/Password Form */}
      <form onSubmit={handleStandardLogin} className="space-y-4">
        {errorMessage && (
          <div className="rounded-lg bg-red-950/70 border border-red-800 p-2.5 text-xs text-red-300">
            {errorMessage}
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#F4F1DE]" htmlFor="email">
            Institutional Email Address
          </label>
          <Input
            id="email"
            type="email"
            placeholder="name@luminous.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-[#F4F1DE]" htmlFor="password">
              Password
            </label>
            <span className="text-[11px] text-[#C5A059] hover:text-[#FFD700] cursor-pointer">
              Forgot?
            </span>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#C5A059] text-[#0B132B] font-bold py-2.5 gap-2 shadow-lg shadow-[#D4AF37]/20"
          disabled={isLoading}
        >
          <span>Authenticate Session</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>

      {/* Registration link */}
      <div className="text-center text-xs text-[#B8B5A3]">
        Need to register a new student or faculty profile?{' '}
        <Link href="/register" className="font-semibold text-[#FFD700] hover:underline">
          Create Account
        </Link>
      </div>
    </div>
  );
}
