'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 text-center text-slate-100">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-950/60 border border-red-800 text-red-500 mb-6">
        <ShieldAlert className="h-8 w-8" />
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl font-mono text-white">404</h1>
      <h2 className="mt-2 text-lg font-semibold text-slate-300">Resource or Page Not Found</h2>
      <p className="mt-2 max-w-md text-sm text-slate-400">
        The requested campus portal page, incident log, or telemetry endpoint does not exist or has been relocated.
      </p>
      <div className="mt-6 flex gap-3">
        <Button asChild variant="default">
          <Link href="/" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Safety Dashboard</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
