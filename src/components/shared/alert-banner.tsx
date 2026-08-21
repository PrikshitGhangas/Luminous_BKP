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
    <div className="sticky top-16 z-40 w-full bg-gradient-to-r from-red-950 via-red-900 to-[#1C2541] border-b border-red-500/40 px-4 py-2.5 text-[#F4F1DE] shadow-xl shadow-red-950/50 transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-600/40 border border-red-400 animate-pulse">
            <AlertOctagon className="h-4 w-4 text-[#FFD700]" />
          </div>
          <div className="truncate text-xs sm:text-sm flex items-center gap-2 flex-wrap">
            {currentAlert.scope && (
              <span className="rounded bg-[#0B132B] border border-red-400/50 px-1.5 py-0.5 text-[9px] font-bold font-mono text-[#FFD700] uppercase shrink-0">
                {currentAlert.scope.replace('_', '-')}
              </span>
            )}
            <span className="font-bold uppercase tracking-wider text-[#FFD700] font-mono">{currentAlert.title}</span>
            <span className="mx-1 hidden lg:inline opacity-70">|</span>
            <span className="hidden md:inline font-normal text-[#F4F1DE] truncate">{currentAlert.message}</span>
            <span className="hidden xl:inline-block px-1.5 py-0.2 rounded bg-amber-500/20 border border-amber-500/30 text-[9px] text-amber-300 font-mono">
              [SIMULATED DISPATCH]
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/safety/emergency"
            className="inline-flex items-center gap-1 rounded-lg border border-[#D4AF37]/50 bg-[#D4AF37]/20 px-2.5 py-1 text-xs font-semibold text-[#FFD700] hover:bg-[#D4AF37]/30 transition-colors font-mono"
          >
            <Radio className="h-3 w-3 animate-pulse" />
            <span>Emergency Hub</span>
            <ChevronRight className="h-3 w-3" />
          </Link>
          <button
            onClick={() => dismissAlert(currentAlert.id)}
            className="rounded p-1 text-[#F4F1DE]/80 hover:bg-white/10 hover:text-white transition-colors"
            title="Acknowledge alert"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
