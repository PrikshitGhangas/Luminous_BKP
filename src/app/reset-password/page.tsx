'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle2, Eye, EyeOff, Loader2, Lock, AlertTriangle } from 'lucide-react';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordLoading />}>
      <ResetPasswordInner />
    </Suspense>
  );
}

function ResetPasswordLoading() {
  return (
    <div className="space-y-6 text-center">
      <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#B45309]" />
      <p className="text-sm text-[#667085]">Checking recovery link...</p>
    </div>
  );
}

function ResetPasswordInner() {
  const searchParams = useSearchParams();
  const { updatePassword } = useAuth();

  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [statusMessage, setStatusMessage] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // Verify the recovery code on mount (exchange code for a session).
  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) {
      setStatus('error');
      setStatusMessage('This recovery link is invalid or has expired. Please request a new one.');
      return;
    }
    (async () => {
      try {
        // dynamic import to avoid bundling server-only concerns
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setStatus('error');
          setStatusMessage('This recovery link is invalid or has expired. Please request a new one.');
        } else {
          setStatus('ready');
        }
      } catch {
        setStatus('error');
        setStatusMessage('Unable to verify this recovery link. Please try again.');
      }
    })();
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const { error } = await updatePassword(password);
      if (error) {
        setErrorMessage(error);
        return;
      }
      setDone(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAB308]/15 text-[#B45309]">
          <Lock className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#1F2933]">Set a new password</h1>
        <p className="text-sm text-[#667085]">Choose a strong password for your account.</p>
      </div>

      {status === 'loading' && (
        <div className="flex items-center justify-center gap-2 text-sm text-[#8A9199]">
          <Loader2 className="h-4 w-4 animate-spin" />
          Verifying recovery link...
        </div>
      )}

      {status === 'error' && (
        <div className="space-y-4 text-center">
          <div className="rounded-lg bg-[#C94C4C]/10 border border-[#C94C4C]/30 p-3.5 text-sm text-[#C94C4C] flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            {statusMessage}
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/forgot-password">Request a new link</Link>
          </Button>
        </div>
      )}

      {status === 'ready' && !done && (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {errorMessage && (
            <div role="alert" className="rounded-lg bg-[#C94C4C]/10 border border-[#C94C4C]/30 p-2.5 text-xs text-[#C94C4C]">
              {errorMessage}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#1F2933]" htmlFor="password">
              New password
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="At least 8 characters"
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

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#1F2933]" htmlFor="confirmPassword">
              Confirm new password
            </label>
            <Input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full py-2.5 gap-2" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating password...
              </>
            ) : (
              'Update password'
            )}
          </Button>
        </form>
      )}

      {done && (
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#ECFDF5] border-2 border-[#10B981] text-[#10B981]">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <p className="text-sm text-[#667085]">Your password has been updated successfully.</p>
          <Button asChild size="sm">
            <Link href="/login">Back to Sign In</Link>
          </Button>
        </div>
      )}
    </div>
  );
}