'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSafety } from '@/lib/context/safety-context';
import { useAuth } from '@/lib/hooks/use-auth';
import { useRole } from '@/lib/hooks/use-role';
import { DEMO_USERS } from '@/lib/constants/demo-data';
import { UserRole, Incident, IncidentSeverity, AIIncidentClassification } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SeverityBadge } from '@/components/shared/severity-badge';
import {
  Sparkles,
  Radio,
  MapPin,
  Bell,
  Flame,
  CheckCircle2,
  ArrowRight,
  UserCheck,
  Play,
  Cpu,
  RotateCcw,
  Check,
  Send,
  ShieldAlert,
} from 'lucide-react';

const PRESET_TEST_CASES = [
  {
    id: 'hero',
    name: 'Hero Incident: Block D Fumes & Arcing',
    title: 'Smoke & Burning Odor near Block D Electrical Room',
    description: 'There is dense smoke coming from the electrical room near Block D. I can also smell something burning and hear sparking sounds.',
    location: 'Engineering Block',
    category: 'fire',
    expectedSeverity: 'CRITICAL',
  },
  {
    id: 'medical',
    name: 'Medical: Collapsed Student in Library',
    title: 'Student Unconscious near Library Level 2 Study Pods',
    description: 'A student fainted and is unresponsive near Level 2 study pods. Immediate paramedic help required.',
    location: 'Library',
    category: 'medical',
    expectedSeverity: 'CRITICAL',
  },
  {
    id: 'security',
    name: 'Security Breach: Server Room B',
    title: 'Unauthorized Entry Attempt at Server Room B',
    description: 'Access badge reader repeatedly rejected unverified credential attempt at 02:15 AM near main server core.',
    location: 'Administrative Block',
    category: 'suspicious_activity',
    expectedSeverity: 'HIGH',
  },
  {
    id: 'infra',
    name: 'Facilities: Water Main Leak',
    title: 'Water Main Valve Leak near Hostel B Courtyard',
    description: 'Substantial pressure leak flooding outer pedestrian walkway. Slip hazard for residents.',
    location: 'Hostel B',
    category: 'infrastructure',
    expectedSeverity: 'MEDIUM',
  },
];

export default function HackathonDemoPage() {
  const {
    incidents,
    alerts,
    threatLevel,
    createIncident,
    acknowledgeIncident,
    dispatchResponder,
    resetDemoData,
    applyInsightAction,
  } = useSafety();

  const { user, isDemoMode } = useAuth();
  const { role, switchRole } = useRole();

  // Demo Control State
  const [activeStep, setActiveStep] = useState<number>(1);
  const [lastCreatedIncident, setLastCreatedIncident] = useState<Incident | null>(null);
  const [isSubmittingHero, setIsSubmittingHero] = useState<boolean>(false);
  const [demoMessage, setDemoMessage] = useState<string | null>(null);

  // AI Sandbox State
  const [sandboxPrompt, setSandboxPrompt] = useState<string>(PRESET_TEST_CASES[0].description);
  const [sandboxLocation, setSandboxLocation] = useState<string>('Engineering Block');
  const [sandboxCategory, setSandboxCategory] = useState<string>('fire');
  const [sandboxResult, setSandboxResult] = useState<AIIncidentClassification | null>(null);
  const [sandboxLatency, setSandboxLatency] = useState<number | null>(null);
  const [isSandboxLoading, setIsSandboxLoading] = useState<boolean>(false);
  const [sandboxUsedFallback, setSandboxUsedFallback] = useState<boolean>(false);

  // Quick Notification Helper
  const showToast = (msg: string) => {
    setDemoMessage(msg);
    setTimeout(() => setDemoMessage(null), 4000);
  };

  // 1. Trigger Hero Incident (Step 1 -> 2)
  const handleTriggerHeroIncident = async () => {
    setIsSubmittingHero(true);
    try {
      const heroCase = PRESET_TEST_CASES[0];
      const created = await createIncident({
        title: heroCase.title,
        description: heroCase.description,
        location_name: heroCase.location,
        category: heroCase.category,
        severity: 'critical',
        is_emergency: true,
        reporter_name: 'Aanya Patel',
        ai_analysis: {
          category: 'fire',
          severity: 'CRITICAL',
          confidence: 0.98,
          summary: 'Active smoke and potential electrical fire hazard detected near Block D. Immediate containment, evacuation, and circuit isolation required.',
          location: 'Block D / Engineering Block',
          recommended_actions: [
            'Dispatch Campus Rapid Security & Hazmat Team immediately',
            'Isolate local electrical main distribution breakers',
            'Initiate Level 1 localized building evacuation',
            'Notify Facility & Maintenance and Campus Executive Administration',
          ],
          departments: ['Security', 'Maintenance', 'Administration'],
          emergency_required: true,
        },
      });

      setLastCreatedIncident(created);
      setActiveStep(2);
      showToast(`Hero Incident Created: ${created.incident_number} — Gemini Triage Active`);
    } catch (err) {
      console.error('Failed to trigger hero incident:', err);
    } finally {
      setIsSubmittingHero(false);
    }
  };

  // 2. Acknowledge & Dispatch as Security (Step 3)
  const handleSecurityAction = () => {
    switchRole('security');
    if (lastCreatedIncident) {
      acknowledgeIncident(lastCreatedIncident.id, 'Officer Vikram Sharma (Security)');
      dispatchResponder(
        lastCreatedIncident.id,
        'Rapid Reaction Patrol Alpha',
        'Officer Vikram Sharma',
        'UNIT-A1',
        'Sirens active, en-route to Engineering Block'
      );
    }
    setActiveStep(4);
    showToast('Switched to Security Officer persona — Incident Acknowledged & Unit Alpha Dispatched');
  };

  // 3. Switch to Admin & Execute Directive (Step 5)
  const handleAdminAction = () => {
    switchRole('admin');
    applyInsightAction('insight-1');
    setActiveStep(5);
    showToast('Switched to Campus Admin persona — Block D Electrical SOP Directive Executed');
  };

  // Run Full Automated Demo Flow
  const handleRunFullDemoFlow = async () => {
    switchRole('student');
    await handleTriggerHeroIncident();
    setTimeout(() => {
      switchRole('security');
      setActiveStep(3);
      if (lastCreatedIncident) {
        acknowledgeIncident(lastCreatedIncident.id);
        dispatchResponder(lastCreatedIncident.id);
      }
    }, 1200);
    setTimeout(() => {
      setActiveStep(4);
    }, 2400);
    setTimeout(() => {
      switchRole('admin');
      setActiveStep(5);
      applyInsightAction('insight-1');
      showToast('🎉 Full 5-Step Hackathon Story Flow Executed Successfully!');
    }, 3600);
  };

  // Handle Demo Reset
  const handleReset = () => {
    resetDemoData();
    switchRole('student');
    setActiveStep(1);
    setLastCreatedIncident(null);
    setSandboxResult(null);
    showToast('Demo environment reset to clean seeded state.');
  };

  // Run Sandbox AI Classification
  const handleRunSandbox = async () => {
    setIsSandboxLoading(true);
    setSandboxResult(null);
    setSandboxUsedFallback(false);
    const start = performance.now();

    try {
      const res = await fetch('/api/ai/classify-incident', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: sandboxPrompt,
          location: sandboxLocation,
          category: sandboxCategory,
        }),
      });

      const end = performance.now();
      setSandboxLatency(Math.round(end - start));

      if (res.ok) {
        const json = await res.json();
        setSandboxResult(json.data as AIIncidentClassification);
        setSandboxUsedFallback(!!json.is_fallback);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSandboxLoading(false);
    }
  };

  const activeIncidentsCount = incidents.filter(
    (i) => i.status !== 'resolved' && i.status !== 'closed'
  ).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification Notification */}
      {demoMessage && (
        <div className="fixed top-20 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex items-center gap-2.5 rounded-xl border border-[#EAB308] bg-white px-4 py-3 text-xs font-mono text-[#202226] shadow-2xl shadow-black">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{demoMessage}</span>
          </div>
        </div>
      )}

      {/* Demo Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Demo Control Hub
          </h1>
        </div>

        {/* Quick Hub Controls */}
        <div className="flex items-center gap-2">
          <Button
            onClick={handleRunFullDemoFlow}
            disabled={isSubmittingHero}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            <Play className="h-4 w-4 mr-2" />
            Auto-Run Demo
          </Button>

          <Button
            onClick={handleReset}
            variant="outline"
            className="text-gray-600"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset State
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-4">
        {/* Active Persona & Threat Level Bar */}
        <div className="pt-3 border-t border-[#D0D1D6] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-[#555960]">
            <span>Active Persona:</span>
            <span className="font-bold text-[#B45309] bg-white px-2 py-0.5 rounded border border-[#D0D1D6]">
              {user?.full_name || 'Active User'} ({role?.toUpperCase()})
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[#555960]">
              Active Incidents: <strong className="text-[#B45309]">{activeIncidentsCount}</strong>
            </span>
            <span className="text-[#555960]">
              Threat Level: <strong className="text-amber-400">{threatLevel}</strong>
            </span>
            <span className="text-[#555960]">
              Alerts: <strong className="text-red-400">{alerts.filter((a) => a.is_active).length} Active</strong>
            </span>
          </div>
        </div>
      </div>

      {/* CORE 5-STEP HACKATHON STORY STEPPER */}
      <Card className="border-[#D0D1D6] bg-[#F4F5F6] text-[#202226] shadow-2xl">
        <CardHeader className="p-5 pb-3 border-b border-[#D0D1D6] bg-white flex flex-row items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-5 w-5 text-[#B45309]" />
            <CardTitle className="text-sm font-mono font-bold uppercase text-[#202226]">
              CORE STORY DEMONSTRATION WORKFLOW (5 STAGES)
            </CardTitle>
          </div>
          <span className="text-[10px] font-mono text-[#B45309]">
            Click any step to inspect or execute persona action
          </span>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Stepper Tabs Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            {[
              { num: 1, title: '1. Student Report', role: 'student', desc: 'Aanya Patel files hazard' },
              { num: 2, title: '2. Gemini AI Triage', role: 'system', desc: 'Classifies CRITICAL fire' },
              { num: 3, title: '3. Security Dispatch', role: 'security', desc: 'Officer Vikram dispatches' },
              { num: 4, title: '4. Command & Map', role: 'all', desc: 'Threat level & map pulse' },
              { num: 5, title: '5. Admin Intelligence', role: 'admin', desc: 'Pattern SOP executed' },
            ].map((st) => (
              <button
                key={st.num}
                onClick={() => setActiveStep(st.num)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer font-mono ${
                  activeStep === st.num
                    ? 'bg-gradient-to-br from-[#EAB308] to-[#D4AF37] text-[#0B132B] font-bold border-[#EAB308] shadow-md shadow-[#D4AF37]/20'
                    : activeStep > st.num
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                    : 'bg-white border-[#D0D1D6] text-[#555960] hover:text-[#B45309]'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold">{st.title}</span>
                  {activeStep > st.num && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />}
                </div>
                <p className="text-[10px] opacity-80 mt-1 truncate">{st.desc}</p>
              </button>
            ))}
          </div>

          {/* STEP 1 DETAILS: Student Incident Report */}
          {activeStep === 1 && (
            <div className="p-5 rounded-xl border border-[#D0D1D6] bg-white space-y-4 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-mono font-bold mb-1">
                    <span>STAGE 1: STUDENT PERSONA (AANYA PATEL)</span>
                  </div>
                  <h3 className="text-base font-bold text-[#202226] font-mono">
                    Step 1: Student Reports Dangerous Incident
                  </h3>
                  <p className="text-xs text-[#555960]">
                    The student observes active smoke and electrical arcing near Block D and files a high-urgency report.
                  </p>
                </div>

                <Button
                  onClick={handleTriggerHeroIncident}
                  disabled={isSubmittingHero}
                  className="bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs font-mono gap-1.5 shrink-0"
                >
                  <Flame className="h-4 w-4" />
                  <span>{isSubmittingHero ? 'Transmitting...' : 'Trigger Hero Test Case'}</span>
                </Button>
              </div>

              {/* Sample Incident Card Preview */}
              <div className="p-4 rounded-lg bg-[#F4F5F6] border border-[#D0D1D6] space-y-2 text-xs font-mono">
                <div className="flex justify-between border-b border-[#D0D1D6] pb-1.5 text-[#B45309]">
                  <span>Reporter: Aanya Patel (Student ID: 2023-CSE-042)</span>
                  <span>Location: Engineering Block (Block D)</span>
                </div>
                <div className="font-bold text-[#B45309]">
                  Headline: Smoke &amp; Burning Odor near Block D Electrical Room
                </div>
                <p className="text-[#555960] font-sans text-xs">
                  &ldquo;There is smoke coming from the electrical room near Block D. I can also smell something burning.&rdquo;
                </p>
              </div>

              {lastCreatedIncident && (
                <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/50 flex items-center justify-between text-xs font-mono text-emerald-300">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span>Incident active in system: <strong>{lastCreatedIncident.incident_number}</strong></span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setActiveStep(2)}
                    className="h-7 bg-emerald-600 text-black font-bold text-[11px]"
                  >
                    Proceed to Step 2: AI Triage →
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* STEP 2 DETAILS: Gemini AI Triage */}
          {activeStep === 2 && (
            <div className="p-5 rounded-xl border border-[#EAB308]/40 bg-gradient-to-br from-[#131C38] to-[#0F1026] space-y-4 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#EAB308]/20 text-[#B45309] text-[10px] font-mono font-bold mb-1">
                    <span>STAGE 2: GEMINI 3.7 FLASH AUTONOMOUS ANALYSIS</span>
                  </div>
                  <h3 className="text-base font-bold text-[#202226] font-mono">
                    Step 2: Gemini Analyzes Incident &amp; Escalates to CRITICAL
                  </h3>
                  <p className="text-xs text-[#555960]">
                    Gemini evaluates hazard indicators, classifies severity as CRITICAL (98% confidence), and attaches Hazmat SOP directives.
                  </p>
                </div>

                <Button
                  size="sm"
                  onClick={() => setActiveStep(3)}
                  className="bg-[#EAB308] hover:bg-[#D4AF37] text-[#0B132B] font-bold text-xs font-mono gap-1.5 shrink-0"
                >
                  <span>Proceed to Step 3: Security Dispatch</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Gemini Output Visualization Card */}
              <div className="rounded-xl border border-[#EAB308] bg-[#F4F5F6] p-4 space-y-3 shadow-xl">
                <div className="flex items-center justify-between border-b border-[#D0D1D6] pb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#B45309]" />
                    <span className="font-bold font-mono text-xs text-[#B45309]">
                      Gemini 3.7 Flash Triage Card
                    </span>
                  </div>
                  <SeverityBadge severity="critical" size="md" isAiClassified />
                </div>

                <p className="text-xs text-[#202226] leading-relaxed font-sans">
                  Active smoke and potential electrical fire hazard detected near Block D. Immediate containment, evacuation, and circuit isolation required.
                </p>

                <div className="space-y-1 font-mono text-xs">
                  <span className="text-[#B45309] font-bold block uppercase text-[10px]">
                    Recommended Action Directives:
                  </span>
                  <ul className="space-y-1 text-[#555960] text-[11px]">
                    <li className="flex items-center gap-1.5">
                      <span className="text-[#B45309]">•</span>
                      <span>Dispatch Campus Rapid Security &amp; Hazmat Team immediately</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="text-[#B45309]">•</span>
                      <span>Isolate local electrical main distribution breakers</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="text-[#B45309]">•</span>
                      <span>Initiate Level 1 localized building evacuation</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3 DETAILS: Security Receive & Acknowledge */}
          {activeStep === 3 && (
            <div className="p-5 rounded-xl border border-[#D0D1D6] bg-white space-y-4 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold mb-1">
                    <span>STAGE 3: SECURITY OPERATIONS DESK</span>
                  </div>
                  <h3 className="text-base font-bold text-[#202226] font-mono">
                    Step 3: Security Receives &amp; Acknowledges Incident
                  </h3>
                  <p className="text-xs text-[#555960]">
                    Officer Vikram Sharma receives real-time dispatch alert on Security Desk (`/security`) and dispatches Rapid Patrol Unit Alpha.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleSecurityAction}
                    className="bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs font-mono gap-1.5"
                  >
                    <ShieldAlert className="h-4 w-4" />
                    <span>Acknowledge &amp; Dispatch Unit Alpha</span>
                  </Button>

                  <Button asChild variant="outline" size="sm" className="h-9 text-xs font-mono border-[#D0D1D6]">
                    <Link href="/security">Open Security Desk →</Link>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4 DETAILS: Command Center & Campus Map */}
          {activeStep === 4 && (
            <div className="p-5 rounded-xl border border-[#D0D1D6] bg-white space-y-4 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-red-500/20 text-red-300 text-[10px] font-mono font-bold mb-1">
                    <span>STAGE 4: GEOSPATIAL MAP &amp; EMERGENCY BROADCAST</span>
                  </div>
                  <h3 className="text-base font-bold text-[#202226] font-mono">
                    Step 4: Command Center &amp; Campus Map Update Live
                  </h3>
                  <p className="text-xs text-[#555960]">
                    Threat level escalates to HIGH_ALERT. The geospatial map shows Block D pulsing red, and emergency broadcasts are transmitted.
                  </p>
                </div>

                <Button
                  size="sm"
                  onClick={() => setActiveStep(5)}
                  className="bg-[#EAB308] text-[#0B132B] font-bold text-xs font-mono gap-1.5"
                >
                  <span>Proceed to Step 5: Admin Intelligence</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Direct Links Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <Link
                  href="/safety/command-center"
                  className="p-3.5 rounded-xl border border-[#D0D1D6] bg-[#F4F5F6] hover:border-[#EAB308] transition-all space-y-1 block font-mono"
                >
                  <div className="flex items-center justify-between text-xs text-[#B45309] font-bold">
                    <span className="flex items-center gap-1.5">
                      <Radio className="h-4 w-4" />
                      <span>Command Center</span>
                    </span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-[11px] text-[#555960]">View live threat posture and active emergency queue</p>
                </Link>

                <Link
                  href="/campus-map"
                  className="p-3.5 rounded-xl border border-[#D0D1D6] bg-[#F4F5F6] hover:border-[#EAB308] transition-all space-y-1 block font-mono"
                >
                  <div className="flex items-center justify-between text-xs text-[#B45309] font-bold">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      <span>Campus Map</span>
                    </span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-[11px] text-[#555960]">See Block D pulsing red hazard warning</p>
                </Link>

                <Link
                  href="/safety/emergency"
                  className="p-3.5 rounded-xl border border-[#D0D1D6] bg-[#F4F5F6] hover:border-[#EAB308] transition-all space-y-1 block font-mono"
                >
                  <div className="flex items-center justify-between text-xs text-[#B45309] font-bold">
                    <span className="flex items-center gap-1.5">
                      <Bell className="h-4 w-4" />
                      <span>Emergency Alerts</span>
                    </span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                  <p className="text-[11px] text-[#555960]">Inspect active evacuation broadcast alert</p>
                </Link>
              </div>
            </div>
          )}

          {/* STEP 5 DETAILS: AI Risk Intelligence & Admin Recommendation */}
          {activeStep === 5 && (
            <div className="p-5 rounded-xl border border-indigo-500/40 bg-gradient-to-br from-[#131C38] via-[#0F1026] to-[#1C2541] space-y-4 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-mono font-bold mb-1">
                    <span>STAGE 5: AI RISK INTELLIGENCE &amp; ADMIN GOVERNANCE</span>
                  </div>
                  <h3 className="text-base font-bold text-[#202226] font-mono">
                    Step 5: AI Identifies Broader Pattern &amp; Admin Executes Recommendation
                  </h3>
                  <p className="text-xs text-[#555960]">
                    AI Risk Intelligence correlates 7 Block D infrastructure incidents over the last 30 days and recommends an electrical inspection SOP.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleAdminAction}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs font-mono gap-1.5"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Execute Electrical Directive</span>
                  </Button>

                  <Button asChild variant="outline" size="sm" className="h-9 text-xs font-mono border-[#D0D1D6]">
                    <Link href="/safety/risk-intelligence">Open Risk Intelligence →</Link>
                  </Button>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-[#EAB308]/40 bg-white space-y-2 font-mono text-xs">
                <div className="text-[#B45309] font-bold">
                  AI Pattern Cluster #1: Block D (Engineering) Recurrent Electrical &amp; Fume Strain
                </div>
                <p className="text-[#555960] font-sans text-xs">
                  Grounded Evidence: 7 incidents logged in last 30 days. Directive: &ldquo;Schedule an electrical inspection and thermal imaging of all sub-panels in Block D.&rdquo;
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* DEMO ACCOUNTS & PERSONA SWITCHER GRID */}
      <Card className="border-gray-200 bg-white">
        <CardHeader className="p-4 border-b border-gray-200 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-gray-500" />
            <CardTitle className="text-sm font-bold text-gray-900">
              Demo Persona Accounts
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              {
                roleKey: 'student' as UserRole,
                name: DEMO_USERS.student.full_name,
                email: DEMO_USERS.student.email,
                desc: 'Student',
                icon: '🎓',
              },
              {
                roleKey: 'security' as UserRole,
                name: DEMO_USERS.security.full_name,
                email: DEMO_USERS.security.email,
                desc: 'Security Dispatcher',
                icon: '🛡️',
              },
              {
                roleKey: 'faculty' as UserRole,
                name: DEMO_USERS.faculty.full_name,
                email: DEMO_USERS.faculty.email,
                desc: 'Faculty Professor',
                icon: '📚',
              },
              {
                roleKey: 'admin' as UserRole,
                name: DEMO_USERS.admin.full_name,
                email: DEMO_USERS.admin.email,
                desc: 'Campus Safety Admin',
                icon: '🏛️',
              },
              {
                roleKey: 'super_admin' as UserRole,
                name: DEMO_USERS.super_admin.full_name,
                email: DEMO_USERS.super_admin.email,
                desc: 'Super Administrator',
                icon: '👑',
              },
              {
                roleKey: 'parent' as UserRole,
                name: DEMO_USERS.parent.full_name,
                email: DEMO_USERS.parent.email,
                desc: 'Parent / Guardian',
                icon: '👨‍👩‍👧',
              },
            ].map((usr) => (
              <div
                key={usr.roleKey}
                onClick={() => {
                  switchRole(usr.roleKey);
                  showToast(`Switched persona to ${usr.name} (${usr.roleKey.toUpperCase()})`);
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                  role === usr.roleKey
                    ? 'border-[#EAB308] bg-white shadow-md'
                    : 'border-[#D0D1D6] bg-[#F7F8F6] hover:border-[#EAB308]/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl">{usr.icon}</span>
                  {role === usr.roleKey ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EAB308] text-[#0B132B]">
                      ACTIVE
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-[#E7E8EB] text-[#555960]">
                      SWITCH
                    </span>
                  )}
                </div>
                <div>
                  <div className="font-bold text-xs text-[#202226]">{usr.name}</div>
                  <div className="text-[10px] text-[#B45309]">{usr.email}</div>
                </div>
                <p className="text-[10px] text-[#555960] line-clamp-1">{usr.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* INTERACTIVE GEMINI AI TRIAGE SANDBOX */}
      <Card className="border-[#D0D1D6] bg-[#F4F5F6] text-[#202226] shadow-xl">
        <CardHeader className="p-4 border-b border-[#D0D1D6] bg-white flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-[#B45309]" />
            <CardTitle className="text-xs font-mono font-bold uppercase text-[#202226]">
              GEMINI 3.7 FLASH REAL-TIME AI TRIAGE SANDBOX
            </CardTitle>
          </div>
          <span className="text-[10px] font-mono text-[#B45309]">Test custom inputs &amp; inspect JSON output</span>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          {/* Preset Buttons */}
          <div className="space-y-1.5 font-mono">
            <span className="text-[10px] text-[#B45309] uppercase font-bold block">
              Quick Test Presets:
            </span>
            <div className="flex flex-wrap gap-2">
              {PRESET_TEST_CASES.map((pst) => (
                <button
                  key={pst.id}
                  onClick={() => {
                    setSandboxPrompt(pst.description);
                    setSandboxLocation(pst.location);
                    setSandboxCategory(pst.category);
                  }}
                  className="px-2.5 py-1 rounded bg-white border border-[#D0D1D6] hover:border-[#EAB308] text-xs text-[#202226] font-bold cursor-pointer transition-colors"
                >
                  {pst.name}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt & Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2 space-y-1">
              <label className="text-[11px] font-mono text-[#202226]">
                Incident Report Text Description:
              </label>
              <textarea
                value={sandboxPrompt}
                onChange={(e) => setSandboxPrompt(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-[#D0D1D6] bg-white p-3 text-xs text-[#202226] focus:border-[#EAB308] focus:outline-none"
              />
            </div>

            <div className="space-y-3 font-mono">
              <div>
                <label className="text-[11px] text-[#202226]">Location:</label>
                <Input
                  value={sandboxLocation}
                  onChange={(e) => setSandboxLocation(e.target.value)}
                  className="h-8 text-xs bg-white border-[#D0D1D6]"
                />
              </div>

              <Button
                onClick={handleRunSandbox}
                disabled={isSandboxLoading || !sandboxPrompt}
                className="w-full bg-[#EAB308] hover:bg-[#D4AF37] text-[#0B132B] font-bold text-xs gap-1.5 h-9"
              >
                <Sparkles className="h-4 w-4" />
                <span>{isSandboxLoading ? 'Analyzing...' : 'Run Gemini Triage'}</span>
              </Button>
            </div>
          </div>

          {/* AI Sandbox Output Result */}
          {isSandboxLoading ? (
            <div className="py-8 text-center space-y-2 font-mono text-xs text-[#555960]">
              <Sparkles className="h-6 w-6 text-[#B45309] animate-spin mx-auto" />
              <p>Gemini 3.7 Flash synthesizing incident telemetry...</p>
            </div>
          ) : sandboxResult ? (
            <div className="p-4 rounded-xl border border-[#EAB308]/50 bg-white space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-[#D0D1D6] pb-2 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[#B45309] font-bold">Structured AI Triage Output</span>
                  {sandboxUsedFallback ? (
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px]">
                      Deterministic Triage Fallback (0ms Latency)
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">
                      Gemini 2.0 / 3.7 Flash API (Live)
                    </span>
                  )}
                </div>
                {sandboxLatency !== null && (
                  <span className="text-[#B45309]">Response Time: {sandboxLatency}ms</span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[#555960]">Severity Classification:</span>
                    <SeverityBadge severity={sandboxResult.severity.toLowerCase() as IncidentSeverity} size="sm" isAiClassified />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#555960]">Confidence Score:</span>
                    <span className="text-emerald-400 font-bold">{Math.round((sandboxResult.confidence || 0.98) * 100)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#555960]">Category:</span>
                    <span className="text-[#B45309] font-bold capitalize">{sandboxResult.category}</span>
                  </div>
                  <div>
                    <span className="text-[#B45309] block mb-1">Executive Summary:</span>
                    <p className="text-[#202226] font-sans text-xs bg-[#F4F5F6] p-2.5 rounded border border-[#D0D1D6]">
                      {sandboxResult.summary}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[#B45309] block">Actionable Directives:</span>
                  <ul className="space-y-1 text-[#555960] text-[11px]">
                    {sandboxResult.recommended_actions.map((act, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-[#B45309]">•</span>
                        <span>{act}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-2 border-t border-[#D0D1D6] flex items-center gap-1 flex-wrap text-[10px]">
                    <span className="text-[#B45309]">Departments Routed:</span>
                    {sandboxResult.departments.map((d, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded bg-white text-[#B45309] border border-[#D0D1D6]">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
