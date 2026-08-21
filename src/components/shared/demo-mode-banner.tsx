'use client';

import React from 'react';
import Link from 'next/link';
import { FlaskConical } from 'lucide-react';

/** Shown when a user is browsing the demo sandbox (not a real account). */
export function DemoModeBanner() {
  return (
    <div className="sticky top-16 z-40 w-full bg-[#B7791F]/10 border-b border-[#B7791F]/30 px-4 py-2 text-[#8a5a14]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold">
          <FlaskConical className="h-4 w-4 shrink-0" />
          <span>
            Demo mode — this is a simulated account, not a real Luminous AI login.
          </span>
        </div>
        <Link
          href="/login"
          className="shrink-0 rounded-md border border-[#B7791F]/40 bg-white px-2.5 py-1 text-[11px] font-semibold text-[#8a5a14] hover:bg-[#B7791F]/10 transition-colors"
        >
          Sign in for real access
        </Link>
      </div>
    </div>
  );
}