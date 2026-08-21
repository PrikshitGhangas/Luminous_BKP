'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/auth-context';
import { UserRole } from '@/lib/types';
import { ROLE_DETAILS } from '@/lib/constants/roles';
import {
  Sparkles,
  Radio,
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  const router = useRouter();
  const { loginAsRole } = useAuth();

  const handleLaunchRole = (role: UserRole) => {
    loginAsRole(role);
    const targetPath = ROLE_DETAILS[role].defaultPath;
    router.push(targetPath);
  };

  const demoRoles: UserRole[] = [
    'super_admin',
    'admin',
    'security',
    'faculty',
    'student',
    'parent',
    'warden',
    'placement_officer',
  ];

  return (
    <div className="min-h-screen bg-[#0B132B] text-[#F4F1DE] flex flex-col selection:bg-[#D4AF37] selection:text-[#0B132B]">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-[#243356] bg-[#0B132B]/85 backdrop-blur-md px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#FFD700] via-[#D4AF37] to-[#C5A059] shadow-lg shadow-[#D4AF37]/25 text-[#0B132B]">
              <Sparkles className="h-6 w-6 font-bold" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-[#F4F1DE] flex items-center gap-2 font-mono">
                Luminous <span className="text-[#FFD700] font-bold text-sm">AI</span>
              </span>
              <span className="text-[10px] text-[#C5A059] font-mono uppercase tracking-widest block">
                Next-Gen Campus Safety &amp; ERP
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-semibold text-[#B8B5A3] hover:text-[#FFD700] px-3 py-2 transition-colors font-mono"
            >
              Sign In
            </Link>
            <Button
              onClick={() => handleLaunchRole('super_admin')}
              size="sm"
              className="bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#C5A059] text-[#0B132B] hover:brightness-110 font-bold shadow-lg shadow-[#D4AF37]/20 gap-1.5"
            >
              <span>Launch Demo Console</span>
              <ArrowRight className="h-3.5 w-3.5 text-[#0B132B]" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 px-6 border-b border-[#243356] bg-radial-[at_top_center] from-[#1C2541] via-[#0B132B] to-[#0F1026]">
        <div className="mx-auto max-w-5xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-4 py-1 text-xs font-bold text-[#FFD700] shadow-inner font-mono">
            <Sparkles className="h-3.5 w-3.5 text-[#FFD700]" />
            <span>AI-POWERED REAL-TIME CAMPUS INTELLIGENCE</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#F4F1DE] leading-tight">
            Institutional Campus Safety &amp; <br />
            <span className="bg-gradient-to-r from-[#FFD700] via-[#D4AF37] to-[#C5A059] bg-clip-text text-transparent">
              Unified Smart ERP
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-sm sm:text-base text-[#B8B5A3] leading-relaxed">
            Instant AI incident triage with Gemini 2.0, high-urgency SOS panic beacons, live SVG campus telemetry, and comprehensive role-based governance across 8 institutional stakeholders.
          </p>

          {/* Quick Metrics Bar */}
          <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
            <div className="rounded-xl border border-[#243356] bg-[#131C38]/80 p-3 text-center hover:border-[#D4AF37]/40 transition-colors">
              <div className="text-xl font-bold font-mono text-[#FFD700]">&lt; 4s</div>
              <div className="text-[11px] text-[#B8B5A3]">AI Incident Triage</div>
            </div>
            <div className="rounded-xl border border-[#243356] bg-[#131C38]/80 p-3 text-center hover:border-[#D4AF37]/40 transition-colors">
              <div className="text-xl font-bold font-mono text-emerald-400">99.9%</div>
              <div className="text-[11px] text-[#B8B5A3]">Realtime Uptime</div>
            </div>
            <div className="rounded-xl border border-[#243356] bg-[#131C38]/80 p-3 text-center hover:border-[#D4AF37]/40 transition-colors">
              <div className="text-xl font-bold font-mono text-[#D4AF37]">8 Roles</div>
              <div className="text-[11px] text-[#B8B5A3]">RBAC Governance</div>
            </div>
            <div className="rounded-xl border border-[#243356] bg-[#131C38]/80 p-3 text-center hover:border-[#D4AF37]/40 transition-colors">
              <div className="text-xl font-bold font-mono text-[#C5A059]">0 PII Leak</div>
              <div className="text-[11px] text-[#B8B5A3]">Zero-Trust Privacy</div>
            </div>
          </div>
        </div>
      </section>

      {/* Role-Based One-Click Demo Launch Section */}
      <section className="py-16 px-6 bg-[#0F1026]/70 border-b border-[#243356]">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F4F1DE]">
              Instant One-Click Demo Mode
            </h2>
            <p className="text-sm text-[#B8B5A3] max-w-lg mx-auto">
              Select any institutional role to explore tailored dashboards, permissions, and specialized workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {demoRoles.map((r) => {
              const meta = ROLE_DETAILS[r];
              return (
                <div
                  key={r}
                  onClick={() => handleLaunchRole(r)}
                  className="group relative rounded-xl border border-[#243356] bg-[#131C38]/90 p-5 hover:border-[#D4AF37] hover:shadow-xl hover:shadow-[#D4AF37]/10 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="rounded px-2 py-0.5 text-[10px] font-bold font-mono uppercase bg-[#D4AF37]/15 text-[#FFD700] border border-[#D4AF37]/40">
                        {meta.label}
                      </span>
                      <ArrowRight className="h-4 w-4 text-[#C5A059] group-hover:text-[#FFD700] group-hover:translate-x-1 transition-all" />
                    </div>

                    <h3 className="font-semibold text-base text-[#F4F1DE] group-hover:text-[#FFD700] transition-colors">
                      {meta.name}
                    </h3>
                    <p className="text-xs text-[#B8B5A3] leading-relaxed">
                      {meta.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#243356] flex items-center justify-between text-xs text-[#C5A059] font-mono">
                    <span>Default: {meta.defaultPath}</span>
                    <span className="text-[#FFD700] font-semibold group-hover:underline">Launch →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature Pillar Highlights */}
      <section className="py-16 px-6">
        <div className="mx-auto max-w-7xl space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F4F1DE]">
              Engineered for Critical Response &amp; Smart Operations
            </h2>
            <p className="text-sm text-[#B8B5A3]">
              Complete end-to-end integration between safety dispatch and daily campus ERP.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-[#243356] bg-[#131C38]/70 p-6 space-y-4 hover:border-[#D4AF37]/40 transition-colors">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-950/60 border border-red-800 text-red-400">
                <Radio className="h-6 w-6 text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-[#F4F1DE]">Safety Command Center</h3>
              <p className="text-xs text-[#B8B5A3] leading-relaxed">
                Live situational dashboard featuring real-time incident queues, active hazard broadcasts, map pin overlays, and emergency responder dispatch.
              </p>
              <ul className="text-xs text-[#B8B5A3] space-y-2 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#FFD700]" />
                  <span>Sub-second Supabase Realtime alerts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#FFD700]" />
                  <span>Emergency audio &amp; broadcast banners</span>
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-[#243356] bg-[#131C38]/70 p-6 space-y-4 hover:border-[#D4AF37]/40 transition-colors">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#FFD700]">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-[#F4F1DE]">Gemini AI Safety Engine</h3>
              <p className="text-xs text-[#B8B5A3] leading-relaxed">
                Automated incident categorization, risk-level severity scoring, recommended department routing, and actionable mitigation playbooks.
              </p>
              <ul className="text-xs text-[#B8B5A3] space-y-2 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#FFD700]" />
                  <span>Strict Zod JSON output schema validation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#FFD700]" />
                  <span>Read-only AI layer — zero DB credentials</span>
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-[#243356] bg-[#131C38]/70 p-6 space-y-4 hover:border-[#D4AF37]/40 transition-colors">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1C2541] border border-[#243356] text-[#C5A059]">
                <CalendarCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-[#F4F1DE]">Unified Academic ERP</h3>
              <p className="text-xs text-[#B8B5A3] leading-relaxed">
                Full-featured academic ecosystem supporting daily attendance records, interactive timetables, hostel room assignments, exams, and grievance tickets.
              </p>
              <ul className="text-xs text-[#B8B5A3] space-y-2 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#FFD700]" />
                  <span>Granular Row-Level-Security (RLS)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#FFD700]" />
                  <span>Dedicated parent and warden portals</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#243356] bg-[#0B132B] py-8 px-6 text-center text-xs text-[#B8B5A3]">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#FFD700]" />
            <span className="font-semibold text-[#F4F1DE] font-mono">Luminous AI Platform</span>
          </div>
          <p>© 2026 Luminous AI. Built for Smart Education &amp; Student Safety.</p>
        </div>
      </footer>
    </div>
  );
}
