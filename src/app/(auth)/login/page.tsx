'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Eye, EyeOff, Loader2, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter your email and password.');
      return;
    }
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        setErrorMessage(error);
        return;
      }
      router.push('/');
      router.refresh();
    } catch {
      setErrorMessage('Unable to sign in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
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