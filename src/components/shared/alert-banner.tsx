'use client';

import React from 'react';
import { useSafety } from '@/lib/context/safety-context';
import { AlertOctagon, X, ChevronRight, Radio } from 'lucide-react';
import Link from 'next/link';

export function AlertBanner() {
  const { alerts, dismissAlert } = useSafety();
  const activeAlerts = alerts.filter((a) => a.is_active);

  if (!activeAlerts || activeAlerts.length === 0) return null;

  const currentAlert = activeAlerts[0];

  return (
    <div className="sticky top-16 z-40 w-full bg-[#C94C4C] border-b border-[#C94C4C] px-4 py-2.5 text-white shadow-md transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 border border-white/40 animate-pulse">
            <AlertOctagon className="h-4 w-4 text-white" />
          </div>
          <div className="truncate text-xs sm:text-sm flex items-center gap-2 flex-wrap">
            {currentAlert.scope && (
              <span className="rounded bg-[#111827]/30 border border-white/40 px-1.5 py-0.5 text-[9px] font-bold uppercase shrink-0">
                {currentAlert.scope.replace('_', '-')}
              </span>
            )}
            <span className="font-bold uppercase tracking-wider">{currentAlert.title}</span>
            <span className="mx-1 hidden lg:inline opacity-70">|</span>
            <span className="hidden md:inline font-normal text-white/90 truncate">{currentAlert.message}</span>
            <span className="hidden xl:inline-block px-1.5 py-0.2 rounded bg-white/15 border border-white/30 text-[9px] text-white font-mono">
              [SIMULATED DISPATCH]
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/safety/emergency"
            className="inline-flex items-center gap-1 rounded-lg border border-white/50 bg-white/20 px-2.5 py-1 text-xs font-semibold text-white hover:bg-white/30 transition-colors"
          >
            <Radio className="h-3 w-3 animate-pulse" />
            <span>Emergency Hub</span>
            <ChevronRight className="h-3 w-3" />
          </Link>
          <button
            onClick={() => dismissAlert(currentAlert.id)}
            className="rounded p-1 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
            title="Acknowledge alert"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
