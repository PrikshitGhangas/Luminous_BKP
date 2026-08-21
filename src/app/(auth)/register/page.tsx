'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/auth-context';
import { UserRole } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [department, setDepartment] = useState('Computer Science & Engineering');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !fullName) return;
    await login(email);
    router.push('/sos');
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-[#F4F1DE] font-mono">
          Create Luminous AI Profile
        </h1>
        <p className="text-xs text-[#B8B5A3]">
          Enrolls into Luminous AI verification &amp; emergency roster
        </p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#F4F1DE]" htmlFor="fullName">
            Full Legal Name
          </label>
          <Input
            id="fullName"
            type="text"
            placeholder="Johnathan Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-[#F4F1DE]" htmlFor="email">
            University / School Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="jdoe@luminous.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#F4F1DE]" htmlFor="role">
              Institutional Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="h-10 w-full rounded-md border border-[#243356] bg-[#0F1026] px-3 text-xs text-[#F4F1DE] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
            >
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="parent">Parent</option>
              <option value="warden">Hostel Warden</option>
              <option value="security">Security Officer</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#F4F1DE]" htmlFor="department">
              Department
            </label>
            <Input
              id="department"
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#C5A059] text-[#0B132B] font-bold py-2.5 gap-2 shadow-lg shadow-[#D4AF37]/20"
        >
          <span>Complete Registration</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>

      <div className="text-center text-xs text-[#B8B5A3]">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-[#FFD700] hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}
