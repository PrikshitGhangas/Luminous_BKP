'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, CheckCircle2, Loader2, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const { error } = await resetPassword(email);
      if (error) {
        setErrorMessage(error);
        return;
      }
      setSent(true);
    } catch {
      setErrorMessage('Unable to send reset link. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="w-full max-w-lg rounded-2xl border border-[#D6D8D5] bg-white p-6 sm:p-8 shadow-sm space-y-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#3F8F68]/10 border border-[#3F8F68]/30 text-[#3F8F68]">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h1 className="text-lg font-bold text-[#1F2933]">Reset link sent</h1>
          <p className="text-sm text-[#667085]">
            Check <strong>{email}</strong> for a link to reset your password.
          </p>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#8a6d1a] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg rounded-2xl border border-[#D6D8D5] bg-white p-6 sm:p-8 shadow-sm space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-[#EAB308]/15 text-[#8a6d1a]">
          <Mail className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#1F2933]">
          Reset your password
        </h1>
        <p className="text-sm text-[#667085]">
          Enter your email and we&apos;ll send you a reset link.
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

        <Button type="submit" className="w-full py-2.5 gap-2" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Sending reset link...</span>
            </>
          ) : (
            <span>Send Reset Link</span>
          )}
        </Button>
      </form>

      <div className="text-center text-xs text-[#667085]">
        <Link href="/login" className="inline-flex items-center gap-1 font-semibold text-[#8a6d1a] hover:underline">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}