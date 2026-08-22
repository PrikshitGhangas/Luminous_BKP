'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/context/auth-context';
import { ROLE_DETAILS } from '@/lib/constants/roles';
import { UserRole } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Sparkles,
} from 'lucide-react';

// Only non-privileged roles are offered at registration.
// Super Admin can never be self-assigned (enforced server-side by the DB trigger).
const REGISTRATION_ROLES = [
  { value: 'student', label: 'Student' },
  { value: 'faculty', label: 'Faculty' },
  { value: 'other', label: 'Other' },
] as const;

export default function RegisterPage() {
  const router = useRouter();
  const { signUp, user, isLoading } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<string>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(ROLE_DETAILS[user.role]?.defaultPath || '/student');
    }
  }, [user, isLoading, router]);

  const validate = (): string | null => {
    if (!fullName.trim()) return 'Please enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address.';
    if (password.length < 8) return 'Password must be at least 8 characters.';
    if (password !== confirmPassword) return 'Passwords do not match.';
    return null;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const validationError = validate();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }
    setIsSubmitting(true);
    try {
      const { error, needsEmailVerification, defaultPath } = await signUp({
        email,
        password,
        fullName,
        role: role as 'student' | 'faculty' | 'other',
        department,
      });
      if (error) {
        setErrorMessage(error);
        return;
      }
      if (needsEmailVerification) {
        setNeedsVerification(true);
        return;
      }
      const target = defaultPath || ROLE_DETAILS[role as UserRole]?.defaultPath || '/student';
      router.push(target);
      router.refresh();
    } catch {
      setErrorMessage('Unable to create account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (needsVerification) {
    return (
      <div className="w-full max-w-lg rounded-2xl border border-[#D6D8D5] bg-white p-6 sm:p-8 shadow-sm space-y-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#3F8F68]/10 border border-[#3F8F68]/30 text-[#3F8F68]">
          <Mail className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h1 className="text-lg font-bold text-[#1F2933]">Check your email</h1>
          <p className="text-sm text-[#667085]">
            We sent a confirmation link to <strong>{email}</strong>. Please confirm your
            email address to activate your account.
          </p>
        </div>
        <div className="flex items-center justify-center gap-2 text-xs text-[#3F8F68]">
          <CheckCircle2 className="h-4 w-4" />
          <span>Once confirmed, you can sign in.</span>
        </div>
        <Link
          href="/login"
          className="inline-block text-sm font-semibold text-[#8a6d1a] hover:underline"
        >
          Return to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg rounded-2xl border border-[#D6D8D5] bg-white p-6 sm:p-8 shadow-sm space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#F4C430] via-[#EAB308] to-[#D4AF37] text-[#111827] shadow-sm shadow-[#D4AF37]/30">
          <Sparkles className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#1F2933]">
          Create your account
        </h1>
        <p className="text-sm text-[#667085]">
          Join the institution&apos;s campus safety &amp; ERP platform
        </p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4" noValidate>
        {errorMessage && (
          <div
            role="alert"
            className="rounded-lg bg-[#C94C4C]/10 border border-[#C94C4C]/30 p-2.5 text-xs text-[#C94C4C]"
          >
            {errorMessage}
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#1F2933]" htmlFor="fullName">
            Full Name
          </label>
          <Input
            id="fullName"
            type="text"
            autoComplete="name"
            placeholder="Your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#1F2933]" htmlFor="email">
            Email
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

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#1F2933]" htmlFor="role">
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="h-10 w-full rounded-lg border border-[#D6D8D5] bg-white px-3 text-sm text-[#1F2933] focus:outline-none focus:border-[#EAB308] focus:ring-1 focus:ring-[#EAB308]"
            >
              {REGISTRATION_ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#1F2933]" htmlFor="department">
              Department (optional)
            </label>
            <Input
              id="department"
              type="text"
              placeholder="e.g. Engineering"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#1F2933]" htmlFor="password">
            Password
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
            Confirm Password
          </label>
          <Input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <Button type="submit" className="w-full py-2.5 gap-2" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Creating account...</span>
            </>
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight className="h-4 w-4 text-[#111827]" />
            </>
          )}
        </Button>
      </form>

      <div className="text-center text-xs text-[#667085]">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-[#8a6d1a] hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}