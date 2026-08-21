'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Luminous runtime error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 text-center text-slate-100">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-950/60 border border-amber-800 text-amber-500 mb-6">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-white">System Exception Encountered</h1>
      <p className="mt-2 max-w-md text-sm text-slate-400">
        An error interrupted this operation. The incident has been recorded in the platform audit log.
      </p>
      {error.message && (
        <div className="mt-4 max-w-md rounded-lg bg-slate-900 border border-slate-800 p-3 font-mono text-xs text-red-400 text-left overflow-x-auto">
          {error.message}
        </div>
      )}
      <div className="mt-6">
        <Button onClick={() => reset()} variant="default" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          <span>Retry Operation</span>
        </Button>
      </div>
    </div>
  );
}
