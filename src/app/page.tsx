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
  Crown,
  Landmark,
  GraduationCap,
  BookOpen,
  UserCheck,
  Shield,
  Zap,
  Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const STATS = [
  { value: '< 4s', label: 'AI Incident Triage', desc: 'Realtime Gemini response' },
  { value: '99.9%', label: 'Platform Uptime', desc: 'Continuous operations' },
  { value: '6 Roles', label: 'RBAC Governance', desc: 'Zero-trust data isolation' },
  { value: '0 PII Leak', label: 'Privacy Assured', desc: 'Strict role boundaries' },
];

const FEATURES = [
  {
    icon: Radio,
    iconClass: 'bg-[#C94C4C]/10 border-[#C94C4C]/30 text-[#C94C4C]',
    accentBorder: 'border-l-4 border-l-[#C94C4C]',
    title: 'Safety Command Center',
    description:
      'Live situational dashboard featuring real-time incident queues, active hazard broadcasts, map pin overlays, and emergency responder dispatch.',
    points: ['Sub-second realtime alerts', 'Emergency audio & broadcast banners'],
  },
  {
    icon: Sparkles,
    iconClass: 'bg-[#EAB308]/10 border-[#EAB308]/40 text-[#8a6d1a]',
    accentBorder: 'border-l-4 border-l-[#EAB308]',
    title: 'Gemini AI Safety Engine',
    description:
      'Automated incident categorization, risk-level severity scoring, recommended department routing, and actionable mitigation playbooks.',
    points: ['Strict JSON output schema validation', 'Read-only AI layer — zero DB credentials'],
  },
  {
    icon: CalendarCheck,
    iconClass: 'bg-[#2563EB]/10 border-[#2563EB]/30 text-[#2563EB]',
    accentBorder: 'border-l-4 border-l-[#2563EB]',
    title: 'Unified Academic ERP',
    description:
      'Full-featured academic ecosystem supporting daily attendance records, interactive timetables, courses catalog, exams, and grievance tickets.',
    points: ['Granular Row-Level-Security (RLS)', 'Dedicated parent and student portals'],
  },
];

const ROLE_ICONS: Record<string, React.ElementType> = {
  super_admin: Crown,
  warden: Building2,
  security: ShieldCheck,
  faculty: GraduationCap,
  student: BookOpen,
  parent: UserCheck,
};

export default function LandingPage() {
  const router = useRouter();
  const { launchDemo, user, logout } = useAuth();
  const { roleMeta } = useRole();

  const handleLaunchRole = (role: UserRole) => {
    launchDemo(role);
    const targetPath = ROLE_DETAILS[role].defaultPath;
    window.location.assign(targetPath);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
    router.refresh();
  };

  // 6 Core Roles (Including Hostel Warden)
  const demoRoles: UserRole[] = [
    'super_admin',
    'warden',
    'security',
    'faculty',
    'student',
    'parent',
  ];

  return (
    <div className="min-h-screen bg-[#F1F2F0] text-[#1F2933] flex flex-col selection:bg-[#EAB308] selection:text-[#111827]">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b border-[#D6D8D5] bg-white/90 backdrop-blur-md px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F4C430] via-[#EAB308] to-[#D4AF37] text-[#111827] shadow-sm shadow-[#D4AF37]/30">
              <Sparkles className="h-5 w-5 font-bold" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-[#1F2933] flex items-center gap-2">
                Luminous <span className="text-[#8a6d1a] font-bold text-sm">AI</span>
              </span>
              <span className="text-[10px] text-[#667085] uppercase tracking-widest block">
                Campus Safety &amp; Unified ERP
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="hidden md:inline-flex px-3 py-1 rounded-full text-[10px] font-bold text-[#8a6d1a] bg-[#EAB308]/15 border border-[#EAB308]/30">
                  {roleMeta?.label}
                </span>
                <Button
                  size="sm"
                  onClick={() => router.push(roleMeta?.defaultPath || '/student')}
                  className="gap-1.5 rounded-full px-4"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="h-3.5 w-3.5 text-[#111827]" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleLogout} className="rounded-full px-4">
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
                  className="gap-1.5 rounded-full px-4"
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
      <section className="overflow-hidden py-16 sm:py-24 px-6 border-b border-[#D6D8D5] bg-gradient-to-b from-[#F7F8F6] via-white to-[#F7F8F6]">
        <div className="mx-auto max-w-5xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D6D8D5] bg-white px-4 py-1.5 text-xs font-semibold text-[#1F2933] shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" />
            <span>Autonomous Campus Safety &amp; Intelligence</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#1F2933] leading-[1.15]">
            Institutional Campus Safety &amp; <br />
            <span className="text-[#1F2933]">Unified Smart ERP</span>
          </h1>

          <p className="mx-auto max-w-2xl text-sm sm:text-base text-[#667085] leading-relaxed">
            AI-powered campus intelligence, real-time incident response, secure institutional
            operations, and role-based governance in one unified platform.
          </p>

          {/* Clean Uniform Metrics Bar */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-[#D6D8D5] bg-white p-4 text-center shadow-xs transition-all hover:border-[#1F2933] hover:shadow-md"
              >
                <div className="text-2xl font-bold text-[#1F2933] tracking-tight">{stat.value}</div>
                <div className="text-xs font-semibold text-[#1F2933] mt-1">{stat.label}</div>
                <div className="text-[11px] text-[#8A9199] mt-0.5">{stat.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role-Based One-Click Demo Launch Section (6 Core Roles, Varied Dynamic Layout) */}
      <section className="py-16 px-6 bg-white border-b border-[#D6D8D5]">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0F1EF] border border-[#D6D8D5] text-[11px] font-semibold text-[#667085]">
              <Zap className="h-3.5 w-3.5 text-[#8a6d1a]" />
              <span>Interactive Role Explorer</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1F2933]">
              Instant One-Click Demo Mode
            </h2>
            <p className="text-sm text-[#667085] max-w-lg mx-auto">
              Select any core institutional role to explore tailored dashboards, permissions, and specialized workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {demoRoles.map((r) => {
              const meta = ROLE_DETAILS[r];
              const Icon = ROLE_ICONS[r] || Shield;

              return (
                <div
                  key={r}
                  onClick={() => handleLaunchRole(r)}
                  className="group relative rounded-2xl border border-[#D6D8D5] bg-white p-6 hover:border-[#1F2933] hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden shadow-xs"
                >
                  <div className="space-y-4">
                    {/* Top Row: Icon Capsule + Role Pill */}
                    <div className="flex items-center justify-between">
                      <div className="h-10 w-10 rounded-xl bg-[#F0F1EF] border border-[#D6D8D5] flex items-center justify-center text-[#1F2933] group-hover:bg-[#1F2933] group-hover:text-white transition-colors">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#F7F8F6] text-[#667085] border border-[#D6D8D5]">
                        {meta.label}
                      </span>
                    </div>

                    {/* Role Title & Description */}
                    <div>
                      <h3 className="font-bold text-base text-[#1F2933] group-hover:text-[#8a6d1a] transition-colors">
                        {meta.name}
                      </h3>
                      <p className="text-xs text-[#667085] leading-relaxed mt-1.5">
                        {meta.description}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Action Footer with Clean Button */}
                  <div className="mt-6 pt-4 border-t border-[#D6D8D5]/60 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-[#8a9199] font-mono">{meta.defaultPath}</span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#F7F8F6] border border-[#D6D8D5] text-[#1F2933] font-semibold text-xs group-hover:bg-[#1F2933] group-hover:text-white group-hover:border-[#1F2933] transition-all shadow-2xs">
                      <span>Launch</span>
                      <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
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
                  className={`rounded-2xl border border-[#D6D8D5] ${feature.accentBorder} bg-white p-6 space-y-4 shadow-xs hover:shadow-md transition-all`}
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${feature.iconClass}`}>
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
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#D6D8D5] shadow-2xs">
              <ShieldCheck className="h-4 w-4 text-[#3F8F68]" /> Role-Based Access Control
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#D6D8D5] shadow-2xs">
              <Activity className="h-4 w-4 text-[#3F8F68]" /> Realtime Incident Telemetry
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#D6D8D5] shadow-2xs">
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