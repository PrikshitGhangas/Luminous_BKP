'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/context/auth-context';
import { ROLE_DETAILS } from '@/lib/constants/roles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Eye, EyeOff, Loader2, Sparkles } from 'lucide-react';

const OAUTH_PROVIDERS = [
  { id: 'google', label: 'Google' },
  { id: 'github', label: 'GitHub' },
  { id: 'azure', label: 'Microsoft' },
] as const;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextParam = searchParams.get('next');
  const { signIn, signInWithProvider, launchDemo, user, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [oauthProvider, setOauthProvider] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const demoRoles: (keyof typeof ROLE_DETAILS)[] = [
    'student',
    'faculty',
    'admin',
    'security',
    'parent',
    'super_admin',
  ];

  const handleQuickDemo = (role: keyof typeof ROLE_DETAILS) => {
    launchDemo(role);
    const target = nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//')
      ? nextParam
      : (ROLE_DETAILS[role]?.defaultPath || '/student');
    window.location.assign(target);
  };

  // If already logged in, redirect straight to their dashboard or requested page
  useEffect(() => {
    if (!isLoading && user) {
      const target = nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//')
        ? nextParam
        : (ROLE_DETAILS[user.role]?.defaultPath || '/student');
      router.replace(target);
    }
  }, [user, isLoading, nextParam, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter your email and password.');
      return;
    }
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const result = await signIn(email, password);
      if (result.error) {
        setErrorMessage(result.error);
        return;
      }
      const target = nextParam && nextParam.startsWith('/') && !nextParam.startsWith('//')
        ? nextParam
        : (result.defaultPath || '/student');
      window.location.assign(target);
    } catch {
      setErrorMessage('Unable to sign in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuth = async (provider: string) => {
    setErrorMessage(null);
    setOauthProvider(provider);
    try {
      const { error } = await signInWithProvider(provider);
      if (error) setErrorMessage(error);
    } finally {
      setOauthProvider(null);
    }
  };

  return (
    <div className="w-full max-w-lg rounded-2xl border border-[#D6D8D5] bg-white p-6 sm:p-8 shadow-xs space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#F4C430] via-[#EAB308] to-[#D4AF37] text-[#111827] shadow-sm shadow-[#D4AF37]/30">
          <Sparkles className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#1F2933]">
          Sign in to Luminous AI
        </h1>
        <p className="text-sm text-[#667085]">
          Access your campus safety and ERP dashboard
        </p>
      </div>

      {/* Quick 1-Click Demo Personas */}
      <div className="rounded-xl border border-[#EAB308]/40 bg-[#FDFBF7] p-3 space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-[#8a6d1a]">
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" /> Instant Demo Mode (1-Click)
          </span>
          <span className="text-[10px] font-normal text-[#667085]">No password needed</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {demoRoles.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => handleQuickDemo(r)}
              className="px-2.5 py-2 text-[11px] font-semibold rounded-lg border border-[#D6D8D5] bg-white hover:border-[#1F2933] hover:bg-[#F0F1EF] text-[#1F2933] transition-all text-center truncate cursor-pointer shadow-2xs"
            >
              {ROLE_DETAILS[r]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* OAuth / social sign-in */}
      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-2">
          {OAUTH_PROVIDERS.map((p) => (
            <Button
              key={p.id}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleOAuth(p.id)}
              disabled={!!oauthProvider}
              className="gap-1.5 text-xs"
            >
              {oauthProvider === p.id && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              <span>{p.label}</span>
            </Button>
          ))}
        </div>
        <p className="text-center text-[10px] text-[#8A9199]">
          Social sign-in uses Supabase Auth and requires the provider to be enabled in the project.
        </p>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#D0D1D6]" />
          </div>
          <div className="relative flex justify-center text-[11px] uppercase tracking-wide">
            <span className="bg-white px-2 text-[#8A9199]">or continue with email</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {errorMessage && (
          <div
            role="alert"
            className="rounded-lg bg-[#C94C4C]/10 border border-[#C94C4C]/30 p-2.5 text-xs text-[#C94C4C]"
          >
            {errorMessage}
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#1F2933]" htmlFor="email">
            Email address
          </label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="name@luminous.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-[#1F2933]" htmlFor="password">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-[11px] text-[#8a6d1a] hover:text-[#B45309] hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8A9199] hover:text-[#1F2933]"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button type="submit" className="w-full py-2.5 gap-2" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="h-4 w-4 text-[#111827]" />
            </>
          )}
        </Button>
      </form>

      <div className="text-center text-xs text-[#667085]">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-semibold text-[#8a6d1a] hover:underline">
          Create Account
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#8a6d1a]" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}