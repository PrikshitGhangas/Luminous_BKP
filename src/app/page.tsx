'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/auth-context';
import { useRole } from '@/lib/hooks/use-role';
import { UserRole } from '@/lib/types';
import { ROLE_DETAILS } from '@/lib/constants/roles';
import {
  Sparkles,
  Radio,
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  Activity,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const STATS = [
  { value: '< 4s', label: 'AI Incident Triage' },
  { value: '99.9%', label: 'Realtime Uptime' },
  { value: '8 Roles', label: 'RBAC Governance' },
  { value: '0 PII Leak', label: 'Zero-Trust Privacy' },
];

const FEATURES = [
  {
    icon: Radio,
    iconClass: 'bg-[#C94C4C]/10 border-[#C94C4C]/30 text-[#C94C4C]',
    title: 'Safety Command Center',
    description:
      'Live situational dashboard featuring real-time incident queues, active hazard broadcasts, map pin overlays, and emergency responder dispatch.',
    points: ['Sub-second realtime alerts', 'Emergency audio & broadcast banners'],
  },
  {
    icon: Sparkles,
    iconClass: 'bg-[#EAB308]/10 border-[#EAB308]/40 text-[#8a6d1a]',
    title: 'Gemini AI Safety Engine',
    description:
      'Automated incident categorization, risk-level severity scoring, recommended department routing, and actionable mitigation playbooks.',
    points: ['Strict JSON output schema validation', 'Read-only AI layer — zero DB credentials'],
  },
  {
    icon: CalendarCheck,
    iconClass: 'bg-[#2563EB]/10 border-[#2563EB]/30 text-[#2563EB]',
    title: 'Unified Academic ERP',
    description:
      'Full-featured academic ecosystem supporting daily attendance records, interactive timetables, hostel room assignments, exams, and grievance tickets.',
    points: ['Granular Row-Level-Security (RLS)', 'Dedicated parent and warden portals'],
  },
];

export default function LandingPage() {
  const router = useRouter();
  const { launchDemo, user, logout } = useAuth();
  const { roleMeta } = useRole();

  const handleLaunchRole = (role: UserRole) => {
    launchDemo(role);
    const targetPath = ROLE_DETAILS[role].defaultPath;
    router.push(targetPath);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
    router.refresh();
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
    <div className="min-h-screen bg-[#F1F2F0] text-[#1F2933] flex flex-col selection:bg-[#EAB308] selection:text-[#111827]">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-[#D6D8D5] bg-white/90 backdrop-blur-md px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#F4C430] via-[#EAB308] to-[#D4AF37] text-[#111827] shadow-sm shadow-[#D4AF37]/30">
              <Sparkles className="h-6 w-6 font-bold" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-[#1F2933] flex items-center gap-2">
                Luminous <span className="text-[#8a6d1a] font-bold text-sm">AI</span>
              </span>
              <span className="text-[10px] text-[#667085] uppercase tracking-widest block">
                Next-Gen Campus Safety &amp; ERP
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="hidden md:inline-flex px-2.5 py-1 rounded text-[10px] font-bold text-[#8a6d1a] bg-[#EAB308]/15 border border-[#EAB308]/30">
                  {roleMeta?.label}
                </span>
                <Link
                  href={roleMeta?.defaultPath || '/'}
                  className="text-xs font-semibold text-[#667085] hover:text-[#1F2933] px-3 py-2 transition-colors"
                >
                  Dashboard
                </Link>
                <Button variant="outline" size="sm" onClick={handleLogout} className="gap-1.5">
                  <span>Sign Out</span>
                </Button>
              </>
            ) : (
              <>
                <Link
                  href="/register"
                  className="text-xs font-semibold text-[#667085] hover:text-[#1F2933] px-3 py-2 transition-colors"
                >
                  Sign Up
                </Link>
                <Link
                  href="/login"
                  className="text-xs font-semibold text-[#667085] hover:text-[#1F2933] px-3 py-2 transition-colors"
                >
                  Sign In
                </Link>
                <Button
                  onClick={() => handleLaunchRole('super_admin')}
                  size="sm"
                  className="gap-1.5"
                >
                  <span>Launch Demo Console</span>
                  <ArrowRight className="h-3.5 w-3.5 text-[#111827]" />
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="light-grid-texture relative overflow-hidden py-16 sm:py-24 px-6 border-b border-[#D6D8D5]">
        <div className="mx-auto max-w-5xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#EAB308]/40 bg-white px-4 py-1 text-xs font-bold text-[#8a6d1a] shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" />
            <span>AI-POWERED REAL-TIME CAMPUS INTELLIGENCE</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#1F2933] leading-tight">
            Institutional Campus Safety &amp; <br />
            <span className="gold-gradient-text">Unified Smart ERP</span>
          </h1>

          <p className="mx-auto max-w-2xl text-sm sm:text-base text-[#667085] leading-relaxed">
            AI-powered campus intelligence, real-time incident response, secure institutional
            operations, and role-based governance in one unified platform.
          </p>

          {/* Quick Metrics Bar */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-[#D6D8D5] bg-white p-4 text-center shadow-sm transition-all hover:border-[#EAB308]/50 hover:shadow-md"
              >
                <div className="text-xl font-bold text-[#8a6d1a]">{stat.value}</div>
                <div className="text-[11px] text-[#667085] mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role-Based One-Click Demo Launch Section */}
      <section className="py-16 px-6 bg-white border-b border-[#D6D8D5]">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1F2933]">
              Instant One-Click Demo Mode
            </h2>
            <p className="text-sm text-[#667085] max-w-lg mx-auto">
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
                  className="group relative rounded-xl border border-[#D6D8D5] bg-white p-5 hover:border-[#EAB308] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="rounded px-2 py-0.5 text-[10px] font-bold uppercase bg-[#EAB308]/15 text-[#8a6d1a] border border-[#EAB308]/40">
                        {meta.label}
                      </span>
                      <ArrowRight className="h-4 w-4 text-[#8a9199] group-hover:text-[#D4AF37] group-hover:translate-x-1 transition-all" />
                    </div>

                    <h3 className="font-semibold text-base text-[#1F2933] group-hover:text-[#8a6d1a] transition-colors">
                      {meta.name}
                    </h3>
                    <p className="text-xs text-[#667085] leading-relaxed">
                      {meta.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#D6D8D5] flex items-center justify-between text-xs text-[#8a9199]">
                    <span>Default: {meta.defaultPath}</span>
                    <span className="text-[#8a6d1a] font-semibold group-hover:underline">Launch →</span>
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
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1F2933]">
              Engineered for Critical Response &amp; Smart Operations
            </h2>
            <p className="text-sm text-[#667085]">
              Complete end-to-end integration between safety dispatch and daily campus ERP.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-xl border border-[#D6D8D5] bg-white p-6 space-y-4 shadow-sm hover:border-[#EAB308]/50 hover:shadow-md transition-all"
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${feature.iconClass}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1F2933]">{feature.title}</h3>
                  <p className="text-xs text-[#667085] leading-relaxed">
                    {feature.description}
                  </p>
                  <ul className="text-xs text-[#667085] space-y-2 pt-2">
                    {feature.points.map((point) => (
                      <li key={point} className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#D4AF37]" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Trust strip */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-[#667085]">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-[#3F8F68]" /> Role-Based Access Control
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-[#3F8F68]" /> Realtime Incident Telemetry
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-[#3F8F68]" /> Row-Level Security
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-[#D6D8D5] bg-white py-8 px-6 text-center text-xs text-[#667085]">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#D4AF37]" />
            <span className="font-semibold text-[#1F2933]">Luminous AI Platform</span>
          </div>
          <p>© 2026 Luminous AI. Built for Smart Education &amp; Student Safety.</p>
        </div>
      </footer>
    </div>
  );
}