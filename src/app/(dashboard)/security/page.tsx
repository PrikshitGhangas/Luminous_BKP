'use client';

import React, { useState } from 'react';
import { useSafety } from '@/lib/context/safety-context';
import { useAuth } from '@/lib/hooks/use-auth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatCard } from '@/components/shared/stat-card';
import { SeverityBadge } from '@/components/shared/severity-badge';
import { IncidentDetailsModal } from '@/components/safety/incident-details-modal';
import {
  Incident,
  ThreatLevel,
} from '@/lib/types';
import { formatTimeAgo } from '@/lib/utils';
import {
  ShieldCheck,
  Shield,
  Users,
  Radio,
  Clock,
  MapPin,
  CheckCircle,
  Flame,
  UserCheck,
  Plus,
  QrCode,
  Search,
  CheckCircle2,
  Bell,
  Layers,
  Activity,
  Send,
  Info,
} from 'lucide-react';
import Link from 'next/link';

const ON_DUTY_OFFICERS = [
  { name: 'Capt. Vikram Sharma', unit: 'Rapid Unit Alpha (Lead)', sector: 'Central Sector' },
  { name: 'Officer Ramos', unit: 'Patrol Beta (Vehicle #4)', sector: 'North Perimeter' },
  { name: 'Officer Chen', unit: 'Station Guard (Post #1)', sector: 'Main Academic Gate' },
  { name: 'Officer Priya Nair', unit: 'Hostel Patrol Delta', sector: 'Residential Block B' },
  { name: 'Hazmat Reaction Crew', unit: 'Hazmat Unit #2', sector: 'Science & Tech Wing' },
];

const SECTORS_STATUS = [
  { name: 'Academic Complex', code: 'SEC-A', status: 'Optimal', cameras: 42, guard: 'Officer Chen', alertCount: 0 },
  { name: 'Science & Engineering', code: 'SEC-B', status: 'Elevated Hazard', cameras: 38, guard: 'Hazmat Crew', alertCount: 1 },
  { name: 'Residential Hostels', code: 'SEC-C', status: 'Optimal', cameras: 29, guard: 'Officer Priya Nair', alertCount: 0 },
  { name: 'Outer Perimeter & Gates', code: 'SEC-D', status: 'Patrolling', cameras: 54, guard: 'Officer Ramos', alertCount: 0 },
  { name: 'Sports Arena & Quads', code: 'SEC-E', status: 'Optimal', cameras: 18, guard: 'Station Post 3', alertCount: 0 },
];

export default function SecurityDashboardPage() {
  const {
    incidents,
    visitors,
    patrolLogs,
    threatLevel,
    setThreatLevel,
    acknowledgeIncident,
    assignIncident,
    dispatchResponder,
    startResponse,
    resolveIncident,
    checkInVisitor,
    checkOutVisitor,
    issueVisitorPass,
    simulateIncomingIncident,
  } = useSafety();

  const { user } = useAuth();

  // Navigation & Filtering
  const [activeTab, setActiveTab] = useState<
    'queue' | 'assigned' | 'all' | 'critical' | 'visitors' | 'sectors'
  >('queue');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modals & Action States
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Assign Modal
  const [assignModalIncident, setAssignModalIncident] = useState<Incident | null>(null);
  const [selectedOfficerToAssign, setSelectedOfficerToAssign] = useState(ON_DUTY_OFFICERS[0].name);
  const [assignNotes, setAssignNotes] = useState('');

  // Dispatch Modal
  const [dispatchModalIncident, setDispatchModalIncident] = useState<Incident | null>(null);
  const [selectedDispatchUnit, setSelectedDispatchUnit] = useState('Rapid Unit Alpha');
  const [dispatchOfficerName, setDispatchOfficerName] = useState('Capt. Vikram Sharma');
  const [dispatchNotes, setDispatchNotes] = useState('');

  // Resolve Modal
  const [resolveModalIncident, setResolveModalIncident] = useState<Incident | null>(null);
  const [resolveNotes, setResolveNotes] = useState('');

  // Visitor Pass Creation Modal
  const [isVisitorPassModalOpen, setIsVisitorPassModalOpen] = useState(false);
  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [visitorCompany, setVisitorCompany] = useState('');
  const [visitorHost, setVisitorHost] = useState('');
  const [visitorDestination, setVisitorDestination] = useState('');
  const [visitorPurpose, setVisitorPurpose] = useState('');

  // Derived metrics
  const activeIncidents = incidents.filter(
    (i) => i.status !== 'resolved' && i.status !== 'closed' && i.status !== 'false_alarm'
  );
  const criticalIncidents = activeIncidents.filter((i) => i.severity === 'critical');
  const responseQueueIncidents = activeIncidents.filter(
    (i) => i.status === 'reported' || i.status === 'ai_analyzed' || !i.assigned_officer_name || i.assigned_officer_name === 'Unassigned'
  );
  const assignedToMeIncidents = activeIncidents.filter(
    (i) =>
      i.assigned_officer_name?.toLowerCase().includes('vikram') ||
      i.assigned_officer_name?.toLowerCase().includes('capt') ||
      i.assigned_department?.toLowerCase().includes('rapid')
  );

  const checkedInVisitors = visitors.filter((v) => v.status === 'checked_in');

  // Action handlers
  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalIncident) return;
    assignIncident(assignModalIncident.id, selectedOfficerToAssign, 'Campus Security Rapid Response', assignNotes);
    setAssignModalIncident(null);
    setAssignNotes('');
  };

  const handleDispatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchModalIncident) return;
    dispatchResponder(dispatchModalIncident.id, selectedDispatchUnit, dispatchOfficerName, 'UNIT-A1', dispatchNotes);
    setDispatchModalIncident(null);
    setDispatchNotes('');
  };

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolveModalIncident) return;
    resolveIncident(resolveModalIncident.id, `${user?.full_name || 'Capt. Vikram Sharma'} (Security Officer)`, resolveNotes);
    setResolveModalIncident(null);
    setResolveNotes('');
  };

  const handleCreateVisitorPass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorName || !visitorHost) return;

    issueVisitorPass({
      pass_number: `PASS-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
      visitor_name: visitorName,
      visitor_phone: visitorPhone || '+1 (555) 019-0000',
      visitor_company: visitorCompany || 'Independent Guest',
      host_name: visitorHost,
      host_department: 'Campus Department',
      destination_building: visitorDestination || 'Main Academic Block',
      purpose: visitorPurpose || 'Official Visit / Meeting',
      badge_id: `VIS-SEC-${Math.floor(100 + Math.random() * 900)}`,
      status: 'expected',
      id_verified: true,
    });

    setIsVisitorPassModalOpen(false);
    setVisitorName('');
    setVisitorPhone('');
    setVisitorCompany('');
    setVisitorHost('');
    setVisitorDestination('');
    setVisitorPurpose('');
  };

  const TIMELINE_STEPS = [
    'Reported',
    'AI analyzed',
    'Assigned',
    'Acknowledged',
    'Officer dispatched',
    'Arrived',
    'Resolved',
  ] as const;

  type TimelineStep = (typeof TIMELINE_STEPS)[number];

  // Timeline Step Helper
  const getTimelineStepStatus = (
    stepName: TimelineStep,
    incident: Incident
  ) => {
    const s = incident.status;
    const timeline = incident.timeline || [];

    const hasEvent = (typeStr: string) => timeline.some((t) => t.type === typeStr || t.title.toLowerCase().includes(typeStr));

    if (stepName === 'Reported') return true;
    if (stepName === 'AI analyzed') return !!incident.ai_summary || hasEvent('ai_triage') || hasEvent('ai');
    if (stepName === 'Assigned') return !!(incident.assigned_officer_name && incident.assigned_officer_name !== 'Unassigned');
    if (stepName === 'Acknowledged') return s === 'acknowledged' || s === 'dispatched' || s === 'responding' || s === 'arrived' || s === 'resolved' || hasEvent('acknowledged');
    if (stepName === 'Officer dispatched') return s === 'dispatched' || s === 'responding' || s === 'arrived' || s === 'resolved' || hasEvent('dispatch');
    if (stepName === 'Arrived') return s === 'arrived' || s === 'resolved' || hasEvent('arrived');
    if (stepName === 'Resolved') return s === 'resolved' || s === 'closed';
    return false;
  };

  return (
    <div className="space-y-6">
      {/* Simulation Compliance Warning */}
      <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-start justify-between gap-3 text-amber-200">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-0.5">
            <span className="font-bold uppercase tracking-wider font-mono text-[#B45309]">
              Campus Security Operations Desk • Training &amp; Demo System:
            </span>
            <p className="text-[#202226] opacity-90 leading-relaxed">
              Real-time operational dashboard for on-duty security officers. RBAC active: Security officers have tactical response clearance and no administrative governance privileges. Simulated internal dispatch only.
            </p>
          </div>
        </div>

        <Button
          size="sm"
          onClick={simulateIncomingIncident}
          className="bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs shrink-0 font-mono shadow-md"
        >
          <Flame className="h-3.5 w-3.5" />
          <span>Simulate Emergency</span>
        </Button>
      </div>

      {/* Security Posture Bar & Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-[#D0D1D6] pb-4 bg-[#F4F5F6] p-4 rounded-xl border">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-[#B45309]" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#202226] font-mono">
              SECURITY OPERATIONS DESK &amp; DISPATCH QUEUE
            </h1>
          </div>
          <p className="text-xs text-[#555960] font-mono">
            Active Duty Officer: <span className="text-[#B45309] font-bold">Capt. Vikram Sharma</span> • Sector Patrol Unit Alpha
          </p>
        </div>

        {/* Threat Level & Action Hub */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-[#D0D1D6]">
            <span className="text-[10px] font-mono uppercase text-[#B45309] font-bold">Campus Threat Level:</span>
            <select
              value={threatLevel}
              onChange={(e) => setThreatLevel(e.target.value as ThreatLevel)}
              className="bg-[#F4F5F6] text-xs font-mono font-bold px-2 py-0.5 rounded border border-[#D0D1D6] text-[#B45309] focus:outline-none"
            >
              <option value="NORMAL">NORMAL</option>
              <option value="ELEVATED">ELEVATED</option>
              <option value="HIGH_ALERT">HIGH ALERT</option>
              <option value="LOCKDOWN">LOCKDOWN</option>
            </select>
          </div>

          <Button
            asChild
            size="sm"
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs gap-1.5 shadow-md font-mono"
          >
            <Link href="/safety/emergency">
              <Bell className="h-3.5 w-3.5 animate-pulse" />
              <span>Broadcast Alert</span>
            </Link>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsVisitorPassModalOpen(true)}
            className="bg-[#E7E8EB] hover:bg-[#243356] text-[#202226] border border-[#D0D1D6] font-bold text-xs gap-1.5 font-mono"
          >
            <Plus className="h-3.5 w-3.5 text-[#B45309]" />
            <span>Issue Visitor Pass</span>
          </Button>
        </div>
      </div>

      {/* Top HUD Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Emergencies"
          value={activeIncidents.length}
          description={`${criticalIncidents.length} Critical Tier • ${responseQueueIncidents.length} in Queue`}
          icon={<Flame className="h-5 w-5" />}
          variant={criticalIncidents.length > 0 ? 'critical' : 'warning'}
        />
        <StatCard
          title="On-Duty Patrol Units"
          value="5 Units Active"
          description="14 Officers Across 5 Sectors"
          icon={<Users className="h-5 w-5" />}
          variant="primary"
        />
        <StatCard
          title="Campus Visitors"
          value={`${checkedInVisitors.length} On Site`}
          description={`${visitors.length} Total Passes Logged Today`}
          icon={<UserCheck className="h-5 w-5" />}
          variant="success"
        />
        <StatCard
          title="Avg Response Time (SLA)"
          value="2.8 min"
          trend={{ value: "Target <5m met", isPositive: true }}
          description="Median arrival SLA verified"
          icon={<Clock className="h-5 w-5" />}
          variant="default"
        />
      </div>

      {/* Critical Incidents Urgent Alert Bar if any */}
      {criticalIncidents.length > 0 && (
        <div className="p-4 rounded-xl bg-red-950/40 border-2 border-red-500/60 shadow-xl shadow-red-950/50 space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-300 font-bold font-mono text-xs">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-ping" />
              <span>CRITICAL INCIDENT HUD • IMMEDIATE PATROL ACTION MANDATED ({criticalIncidents.length})</span>
            </div>
            <span className="text-[10px] font-mono text-red-400 bg-red-950 px-2 py-0.5 rounded border border-red-800">
              PRIORITY LEVEL 1
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {criticalIncidents.map((inc) => (
              <div
                key={inc.id}
                onClick={() => {
                  setSelectedIncident(inc);
                  setIsDetailsModalOpen(true);
                }}
                className="p-3 rounded-lg bg-[#F4F5F6] border border-red-500/40 hover:border-red-400 transition-all cursor-pointer space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#B45309] font-mono">{inc.incident_number}</span>
                  <SeverityBadge severity="critical" size="sm" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#202226]">{inc.title}</h4>
                  <p className="text-[11px] text-[#555960] mt-0.5 line-clamp-1">{inc.description}</p>
                </div>
                <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-[#B45309] border-t border-[#D0D1D6]">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-red-400" />
                    <span>{inc.location_name}</span>
                  </span>
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="sm"
                      onClick={() => setDispatchModalIncident(inc)}
                      className="h-6 text-[10px] bg-red-600 hover:bg-red-500 text-white font-bold"
                    >
                      Dispatch Unit
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setResolveModalIncident(inc)}
                      className="h-6 text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                    >
                      Resolve
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Operational Console Tabs */}
      <div className="space-y-4">
        {/* Tab Headers */}
        <div className="flex flex-wrap items-center gap-2 border-b border-[#D0D1D6] pb-2">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'queue'
                ? 'bg-gradient-to-r from-[#EAB308] to-[#D4AF37] text-[#0B132B] shadow-md'
                : 'bg-white text-[#555960] hover:text-[#B45309]'
            }`}
          >
            <Radio className="h-3.5 w-3.5" />
            <span>Response Queue ({responseQueueIncidents.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('assigned')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'assigned'
                ? 'bg-gradient-to-r from-[#EAB308] to-[#D4AF37] text-[#0B132B] shadow-md'
                : 'bg-white text-[#555960] hover:text-[#B45309]'
            }`}
          >
            <Shield className="h-3.5 w-3.5" />
            <span>Assigned to My Squad ({assignedToMeIncidents.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-gradient-to-r from-[#EAB308] to-[#D4AF37] text-[#0B132B] shadow-md'
                : 'bg-white text-[#555960] hover:text-[#B45309]'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>All Active Incidents ({activeIncidents.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('visitors')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'visitors'
                ? 'bg-gradient-to-r from-[#EAB308] to-[#D4AF37] text-[#0B132B] shadow-md'
                : 'bg-white text-[#555960] hover:text-[#B45309]'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Visitors Desk ({visitors.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('sectors')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'sectors'
                ? 'bg-gradient-to-r from-[#EAB308] to-[#D4AF37] text-[#0B132B] shadow-md'
                : 'bg-white text-[#555960] hover:text-[#B45309]'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span>Campus Sectors &amp; Guards</span>
          </button>
        </div>

        {/* Tab 1: Response Queue */}
        {activeTab === 'queue' && (
          <Card className="border-[#D0D1D6] bg-[#F4F5F6] text-[#202226]">
            <CardHeader className="p-4 pb-2 border-b border-[#D0D1D6] bg-white/80 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-bold font-mono uppercase text-[#202226] flex items-center gap-2">
                <Radio className="h-4 w-4 text-[#B45309]" />
                <span>Priority Response Queue • Pending Dispatch ({responseQueueIncidents.length})</span>
              </CardTitle>
              <span className="text-[10px] font-mono text-[#B45309]">SLA TIMER ACTIVE (&lt;5 MIN)</span>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {responseQueueIncidents.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#555960] font-mono">
                  All incidents dispatched and assigned. Queue is clear.
                </div>
              ) : (
                responseQueueIncidents.map((incident) => (
                  <div
                    key={incident.id}
                    className="p-4 rounded-xl border border-[#D0D1D6] bg-white/90 space-y-3 transition-all hover:border-[#EAB308]/50"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-[#B45309]">
                          {incident.incident_number}
                        </span>
                        <SeverityBadge severity={incident.severity} size="sm" isAiClassified />
                        <span className="rounded bg-[#E7E8EB] border border-[#D0D1D6] px-2 py-0.5 text-[9px] font-mono uppercase text-[#B45309]">
                          STATUS: {incident.status}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-[#B45309]">
                        Reported {formatTimeAgo(incident.created_at)}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h4 className="text-sm font-bold text-[#202226]">{incident.title}</h4>
                      <p className="text-xs text-[#555960] mt-1">{incident.description}</p>
                    </div>

                    {/* 7-Stage Timeline Visualizer */}
                    <div className="pt-2 pb-1 border-t border-[#D0D1D6]">
                      <span className="text-[10px] font-bold font-mono text-[#B45309] uppercase block mb-1.5">
                        Incident Progression Lifecycle:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1 text-[10px] font-mono">
                        {TIMELINE_STEPS.map((step) => {
                          const isDone = getTimelineStepStatus(step, incident);
                          return (
                            <div
                              key={step}
                              className={`p-1.5 rounded text-center border transition-all ${
                                isDone
                                  ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300 font-bold'
                                  : 'bg-white border-[#D0D1D6] text-[#8A9199]'
                              }`}
                            >
                              <div className="flex items-center justify-center gap-1">
                                {isDone ? (
                                  <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                                ) : (
                                  <span className="h-2 w-2 rounded-full bg-[#AEB0B7] shrink-0" />
                                )}
                                <span className="truncate">{step}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#D0D1D6]">
                      <span className="flex items-center gap-1 text-xs font-mono text-[#B45309]">
                        <MapPin className="h-3.5 w-3.5 text-[#B45309]" />
                        <span>{incident.location_name}</span>
                      </span>

                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => acknowledgeIncident(incident.id)}
                          className="h-7 text-xs bg-[#E7E8EB] hover:bg-[#D4D5DA] text-[#B45309] border border-[#D0D1D6] font-mono font-bold"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          <span>Acknowledge</span>
                        </Button>

                        <Button
                          size="sm"
                          onClick={() => setAssignModalIncident(incident)}
                          className="h-7 text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold"
                        >
                          <UserCheck className="h-3 w-3 mr-1" />
                          <span>Assign Officer</span>
                        </Button>

                        <Button
                          size="sm"
                          onClick={() => setDispatchModalIncident(incident)}
                          className="h-7 text-xs bg-[#EAB308] hover:bg-[#D4AF37] text-[#0B132B] font-mono font-bold"
                        >
                          <Send className="h-3 w-3 mr-1" />
                          <span>Dispatch Unit</span>
                        </Button>

                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedIncident(incident);
                            setIsDetailsModalOpen(true);
                          }}
                          variant="outline"
                          className="h-7 text-xs border-[#D0D1D6] text-[#202226] font-mono"
                        >
                          <span>Full Details</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}

        {/* Tab 2: Assigned to My Squad */}
        {activeTab === 'assigned' && (
          <Card className="border-[#D0D1D6] bg-[#F4F5F6] text-[#202226]">
            <CardHeader className="p-4 pb-2 border-b border-[#D0D1D6] bg-white/80 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-bold font-mono uppercase text-[#202226] flex items-center gap-2">
                <Shield className="h-4 w-4 text-[#B45309]" />
                <span>My Unit Active Deployments ({assignedToMeIncidents.length})</span>
              </CardTitle>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">UNIT ALPHA ON SCENE</span>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {assignedToMeIncidents.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#555960] font-mono">
                  No active incidents currently assigned to Capt. Vikram Sharma.
                </div>
              ) : (
                assignedToMeIncidents.map((incident) => (
                  <div
                    key={incident.id}
                    className="p-4 rounded-xl border border-indigo-500/40 bg-white/90 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-[#B45309]">
                          {incident.incident_number}
                        </span>
                        <SeverityBadge severity={incident.severity} size="sm" />
                        <span className="rounded bg-indigo-950 border border-indigo-500/50 px-2 py-0.5 text-[9px] font-mono text-indigo-300 uppercase">
                          ASSIGNED: {incident.assigned_officer_name}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-[#B45309]">
                        {formatTimeAgo(incident.created_at)}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-[#202226]">{incident.title}</h4>
                      <p className="text-xs text-[#555960] mt-1">{incident.description}</p>
                    </div>

                    {/* Timeline */}
                    <div className="pt-2 pb-1 border-t border-[#D0D1D6]">
                      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1 text-[10px] font-mono">
                        {TIMELINE_STEPS.map((step) => {
                          const isDone = getTimelineStepStatus(step, incident);
                          return (
                            <div
                              key={step}
                              className={`p-1.5 rounded text-center border ${
                                isDone
                                  ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300 font-bold'
                                  : 'bg-white border-[#D0D1D6] text-[#8A9199]'
                              }`}
                            >
                              <div className="flex items-center justify-center gap-1">
                                {isDone ? (
                                  <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                                ) : (
                                  <span className="h-2 w-2 rounded-full bg-[#AEB0B7] shrink-0" />
                                )}
                                <span className="truncate">{step}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Quick Stage Progression Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#D0D1D6]">
                      <span className="text-xs font-mono text-[#B45309] flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-[#B45309]" />
                        <span>{incident.location_name}</span>
                      </span>

                      <div className="flex flex-wrap items-center gap-2">
                        {incident.status !== 'arrived' && incident.status !== 'resolved' && (
                          <Button
                            size="sm"
                            onClick={() => startResponse(incident.id)}
                            className="h-7 text-xs bg-amber-600 hover:bg-amber-500 text-black font-bold font-mono"
                          >
                            <MapPin className="h-3 w-3 mr-1" />
                            <span>Start Response (Arrived)</span>
                          </Button>
                        )}

                        <Button
                          size="sm"
                          onClick={() => setResolveModalIncident(incident)}
                          className="h-7 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold font-mono"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          <span>Resolve Incident</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}

        {/* Tab 3: All Active Incidents */}
        {activeTab === 'all' && (
          <Card className="border-[#D0D1D6] bg-[#F4F5F6] text-[#202226]">
            <CardHeader className="p-4 pb-2 border-b border-[#D0D1D6] bg-white/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <CardTitle className="text-xs font-bold font-mono uppercase text-[#202226]">
                  All Active Incidents Feed ({activeIncidents.length})
                </CardTitle>

                {/* Filters */}
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="h-3.5 w-3.5 text-[#8A9199] absolute left-2.5 top-2.5" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search incident..."
                      className="h-8 pl-8 text-xs bg-[#F4F5F6] border-[#D0D1D6] font-mono w-40"
                    />
                  </div>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="h-8 bg-[#F4F5F6] border border-[#D0D1D6] rounded-md px-2 text-xs font-mono text-[#202226]"
                  >
                    <option value="all">All Categories</option>
                    <option value="fire">Fire &amp; Hazard</option>
                    <option value="medical">Medical</option>
                    <option value="womens_safety">Women&apos;s Safety</option>
                    <option value="suspicious_activity">Suspicious Entry</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {activeIncidents
                .filter((inc) =>
                  categoryFilter === 'all' ? true : inc.category === categoryFilter
                )
                .filter((inc) =>
                  searchQuery === ''
                    ? true
                    : inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      inc.location_name.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((incident) => (
                  <div
                    key={incident.id}
                    onClick={() => {
                      setSelectedIncident(incident);
                      setIsDetailsModalOpen(true);
                    }}
                    className="p-3.5 rounded-xl border border-[#D0D1D6] bg-white/80 hover:bg-white hover:border-[#EAB308]/40 transition-all cursor-pointer space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-[#B45309]">
                          {incident.incident_number}
                        </span>
                        <SeverityBadge severity={incident.severity} size="sm" isAiClassified />
                        <span className="rounded bg-[#E7E8EB] border border-[#D0D1D6] px-2 py-0.5 text-[9px] font-mono uppercase text-[#B45309]">
                          {incident.status}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-[#B45309]">
                        {formatTimeAgo(incident.created_at)}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-[#202226]">{incident.title}</h4>
                      <p className="text-[11px] text-[#555960] mt-0.5">{incident.description}</p>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-[#B45309] pt-1.5 border-t border-[#D0D1D6]">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-[#B45309]" />
                        <span>{incident.location_name}</span>
                      </span>
                      <span>Handler: {incident.assigned_officer_name || 'Unassigned'}</span>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        )}

        {/* Tab 4: Visitors Desk */}
        {activeTab === 'visitors' && (
          <Card className="border-[#D0D1D6] bg-[#F4F5F6] text-[#202226]">
            <CardHeader className="p-4 pb-2 border-b border-[#D0D1D6] bg-white/80 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-bold font-mono uppercase text-[#202226] flex items-center gap-2">
                <Users className="h-4 w-4 text-[#B45309]" />
                <span>Visitor Gate Pass &amp; Entry Log ({visitors.length})</span>
              </CardTitle>
              <Button
                size="sm"
                onClick={() => setIsVisitorPassModalOpen(true)}
                className="h-7 text-xs bg-[#EAB308] text-[#0B132B] font-bold font-mono"
              >
                <Plus className="h-3 w-3 mr-1" />
                <span>New Visitor Pass</span>
              </Button>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {visitors.map((pass) => (
                <div
                  key={pass.id}
                  className="p-3.5 rounded-xl border border-[#D0D1D6] bg-white/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-[#E7E8EB] border border-[#D0D1D6] text-[#B45309]">
                      <QrCode className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#202226]">{pass.visitor_name}</span>
                        <span className="font-mono text-[10px] bg-white border border-[#D0D1D6] px-1.5 py-0.2 rounded text-[#B45309]">
                          {pass.pass_number}
                        </span>
                        {pass.visitor_company && (
                          <span className="text-[10px] text-[#555960]">({pass.visitor_company})</span>
                        )}
                      </div>
                      <p className="text-[#555960] text-[11px] mt-0.5">
                        Visiting: <strong className="text-[#202226]">{pass.host_name}</strong> • Purpose: {pass.purpose}
                      </p>
                      <p className="text-[10px] font-mono text-[#B45309] mt-0.5">
                        Badge ID: {pass.badge_id} • Destination: {pass.destination_building}
                      </p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2 shrink-0">
                    <span
                      className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        pass.status === 'checked_in'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : pass.status === 'expected'
                          ? 'bg-blue-950 text-blue-300 border border-blue-800'
                          : 'bg-[#E7E8EB] text-[#555960]'
                      }`}
                    >
                      {pass.status.replace('_', ' ')}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {pass.status === 'expected' && (
                        <Button
                          size="sm"
                          onClick={() => checkInVisitor(pass.id)}
                          className="h-6 text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white font-bold font-mono"
                        >
                          Check In
                        </Button>
                      )}
                      {pass.status === 'checked_in' && (
                        <Button
                          size="sm"
                          onClick={() => checkOutVisitor(pass.id)}
                          className="h-6 text-[10px] bg-amber-600 hover:bg-amber-500 text-black font-bold font-mono"
                        >
                          Check Out
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Tab 5: Campus Sectors & Guards */}
        {activeTab === 'sectors' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-[#D0D1D6] bg-[#F4F5F6] text-[#202226]">
              <CardHeader className="p-4 pb-2 border-b border-[#D0D1D6] bg-white/80">
                <CardTitle className="text-xs font-bold font-mono uppercase text-[#202226]">
                  Sector Surveillance Readiness
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2.5">
                {SECTORS_STATUS.map((sec) => (
                  <div
                    key={sec.code}
                    className="p-3 rounded-lg bg-white border border-[#D0D1D6] flex items-center justify-between text-xs font-mono"
                  >
                    <div>
                      <div className="font-bold text-[#202226]">
                        {sec.name} ({sec.code})
                      </div>
                      <p className="text-[11px] text-[#555960] mt-0.5">
                        Stationed: {sec.guard} • {sec.cameras} CCTV Feeds Live
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        sec.status === 'Optimal'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {sec.status}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-[#D0D1D6] bg-[#F4F5F6] text-[#202226]">
              <CardHeader className="p-4 pb-2 border-b border-[#D0D1D6] bg-white/80">
                <CardTitle className="text-xs font-bold font-mono uppercase text-[#202226]">
                  Active Patrol Roster &amp; GPS Trackers
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-2.5">
                {patrolLogs.map((patrol) => (
                  <div
                    key={patrol.id}
                    className="p-3 rounded-lg bg-white border border-[#D0D1D6] flex items-center justify-between text-xs font-mono"
                  >
                    <div className="flex items-center gap-3">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <div>
                        <div className="font-bold text-[#202226]">
                          {patrol.officer_name} ({patrol.unit})
                        </div>
                        <p className="text-[11px] text-[#555960]">{patrol.location_name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-400 font-bold uppercase text-[10px]">
                        {patrol.status}
                      </span>
                      <p className="text-[10px] text-[#8A9199]">Checked in 2m ago</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Assign Officer Modal */}
      {assignModalIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <Card className="w-full max-w-md bg-[#F4F5F6] border-[#D0D1D6] text-[#202226] shadow-2xl animate-in zoom-in-95 duration-200">
            <CardHeader className="p-4 border-b border-[#D0D1D6] bg-white">
              <CardTitle className="text-xs font-bold font-mono uppercase text-[#B45309] flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                <span>Assign Incident Officer: {assignModalIncident.incident_number}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <form onSubmit={handleAssignSubmit} className="space-y-3 text-xs font-mono">
                <div className="space-y-1">
                  <label className="text-[#B45309]">Select On-Duty Officer / Unit:</label>
                  <select
                    value={selectedOfficerToAssign}
                    onChange={(e) => setSelectedOfficerToAssign(e.target.value)}
                    className="w-full h-9 rounded-md bg-white border border-[#D0D1D6] text-[#202226] px-2"
                  >
                    {ON_DUTY_OFFICERS.map((off) => (
                      <option key={off.name} value={off.name}>
                        {off.name} — {off.unit} ({off.sector})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[#B45309]">Special Assignment Directives (Optional):</label>
                  <textarea
                    value={assignNotes}
                    onChange={(e) => setAssignNotes(e.target.value)}
                    placeholder="e.g. Bring breathalyzer kit, secure rear stairwell..."
                    rows={2}
                    className="w-full rounded-md bg-white border border-[#D0D1D6] text-[#202226] p-2 text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAssignModalIncident(null)}
                    className="border-[#D0D1D6] text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-[#EAB308] text-[#0B132B] font-bold text-xs"
                  >
                    Confirm Assignment
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Dispatch Modal */}
      {dispatchModalIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <Card className="w-full max-w-md bg-[#F4F5F6] border-red-500/40 text-[#202226] shadow-2xl animate-in zoom-in-95 duration-200">
            <CardHeader className="p-4 border-b border-[#D0D1D6] bg-red-950/40">
              <CardTitle className="text-xs font-bold font-mono uppercase text-red-300 flex items-center gap-2">
                <Send className="h-4 w-4 animate-pulse" />
                <span>Deploy Rapid Dispatch: {dispatchModalIncident.incident_number}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <form onSubmit={handleDispatchSubmit} className="space-y-3 text-xs font-mono">
                <div className="p-2.5 rounded bg-white border border-[#D0D1D6] text-[11px]">
                  <p className="font-bold text-[#B45309]">{dispatchModalIncident.title}</p>
                  <p className="text-[#555960] mt-0.5">Location: {dispatchModalIncident.location_name}</p>
                </div>

                <div className="space-y-1">
                  <label className="text-[#B45309]">Deploying Unit:</label>
                  <select
                    value={selectedDispatchUnit}
                    onChange={(e) => setSelectedDispatchUnit(e.target.value)}
                    className="w-full h-9 rounded-md bg-white border border-[#D0D1D6] text-[#202226] px-2"
                  >
                    <option value="Rapid Unit Alpha">Rapid Unit Alpha (Lead Cruiser #1)</option>
                    <option value="Patrol Beta Vehicle">Patrol Beta (Vehicle #4)</option>
                    <option value="Hazmat Reaction Crew">Hazmat Reaction Crew #2</option>
                    <option value="Hostel Quick Response">Hostel Quick Response Squad</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[#B45309]">Lead Dispatch Officer:</label>
                  <Input
                    value={dispatchOfficerName}
                    onChange={(e) => setDispatchOfficerName(e.target.value)}
                    className="bg-white border-[#D0D1D6] text-xs h-9"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#B45309]">Dispatch Instructions:</label>
                  <textarea
                    value={dispatchNotes}
                    onChange={(e) => setDispatchNotes(e.target.value)}
                    placeholder="e.g. Sirens active, approach via South Gate ramp..."
                    rows={2}
                    className="w-full rounded-md bg-white border border-[#D0D1D6] text-[#202226] p-2 text-xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setDispatchModalIncident(null)}
                    className="border-[#D0D1D6] text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
                  >
                    Authorize &amp; Dispatch Unit
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Resolve Incident Modal */}
      {resolveModalIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <Card className="w-full max-w-md bg-[#F4F5F6] border-emerald-500/40 text-[#202226] shadow-2xl animate-in zoom-in-95 duration-200">
            <CardHeader className="p-4 border-b border-[#D0D1D6] bg-emerald-950/40">
              <CardTitle className="text-xs font-bold font-mono uppercase text-emerald-300 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>Resolve Incident: {resolveModalIncident.incident_number}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <form onSubmit={handleResolveSubmit} className="space-y-3 text-xs font-mono">
                <div className="space-y-1">
                  <label className="text-[#B45309]">Resolution Debrief &amp; Root Cause Notes:</label>
                  <textarea
                    value={resolveNotes}
                    onChange={(e) => setResolveNotes(e.target.value)}
                    placeholder="e.g. Area thoroughly secured, ventilation restored, student escorted to safety with zero injuries."
                    rows={3}
                    className="w-full rounded-md bg-white border border-[#D0D1D6] text-[#202226] p-2 text-xs"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setResolveModalIncident(null)}
                    className="border-[#D0D1D6] text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                  >
                    Confirm Resolution
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Visitor Pass Creation Modal */}
      {isVisitorPassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <Card className="w-full max-w-md bg-[#F4F5F6] border-[#D0D1D6] text-[#202226] shadow-2xl animate-in zoom-in-95 duration-200">
            <CardHeader className="p-4 border-b border-[#D0D1D6] bg-white">
              <CardTitle className="text-xs font-bold font-mono uppercase text-[#B45309] flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                <span>Issue Digital Visitor Pass</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <form onSubmit={handleCreateVisitorPass} className="space-y-3 text-xs font-mono">
                <div className="space-y-1">
                  <label className="text-[#B45309]">Visitor Full Name:</label>
                  <Input
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                    placeholder="e.g. Prof. David Miller"
                    required
                    className="bg-white border-[#D0D1D6] text-xs h-9"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[#B45309]">Visitor Phone:</label>
                    <Input
                      value={visitorPhone}
                      onChange={(e) => setVisitorPhone(e.target.value)}
                      placeholder="+1 (555) 019-3388"
                      className="bg-white border-[#D0D1D6] text-xs h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[#B45309]">Organization:</label>
                    <Input
                      value={visitorCompany}
                      onChange={(e) => setVisitorCompany(e.target.value)}
                      placeholder="e.g. MIT Labs"
                      className="bg-white border-[#D0D1D6] text-xs h-9"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[#B45309]">Host Staff / Faculty:</label>
                    <Input
                      value={visitorHost}
                      onChange={(e) => setVisitorHost(e.target.value)}
                      placeholder="e.g. Prof. Sarah Jenkins"
                      required
                      className="bg-white border-[#D0D1D6] text-xs h-9"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[#B45309]">Destination Complex:</label>
                    <Input
                      value={visitorDestination}
                      onChange={(e) => setVisitorDestination(e.target.value)}
                      placeholder="e.g. CS Lab 2"
                      className="bg-white border-[#D0D1D6] text-xs h-9"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[#B45309]">Purpose of Campus Entry:</label>
                  <Input
                    value={visitorPurpose}
                    onChange={(e) => setVisitorPurpose(e.target.value)}
                    placeholder="e.g. Guest Lecture & Lab Evaluation"
                    className="bg-white border-[#D0D1D6] text-xs h-9"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsVisitorPassModalOpen(false)}
                    className="border-[#D0D1D6] text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-[#EAB308] text-[#0B132B] font-bold text-xs"
                  >
                    Generate Visitor Pass
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Incident Details Modal */}
      <IncidentDetailsModal
        incident={selectedIncident}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
      />
    </div>
  );
}

