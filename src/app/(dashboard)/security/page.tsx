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
  Search,
  CheckCircle2,
  Bell,
  Layers,
  Activity,
  Send,
  Info,
  ChevronDown,
} from 'lucide-react';
import Link from 'next/link';

const ON_DUTY_OFFICERS = [
  { name: 'Officer Vikram Sharma', unit: 'Rapid Unit Alpha (Lead)', sector: 'Central Sector' },
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

import { useRole } from '@/lib/hooks/use-role';

export default function SecurityDashboardPage() {
  const {
    incidents,
    patrolLogs,
    threatLevel,
    setThreatLevel,
    acknowledgeIncident,
    assignIncident,
    dispatchResponder,
    startResponse,
    resolveIncident,
    simulateIncomingIncident,
  } = useSafety();

  const { user, role, isSuperAdmin, isAdmin } = useRole();

  const isAuthorized = isSuperAdmin || isAdmin || role === 'security';
  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 bg-[#F7F8F6] border border-[#D6D8D5] rounded-xl space-y-3">
        <div className="h-10 w-10 rounded-full bg-[#F0F1EF] border border-[#D6D8D5] flex items-center justify-center text-[#1F2933]">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <h2 className="text-base font-bold text-[#1F2933]">Security Operations Clearance Required</h2>
        <p className="text-xs text-[#667085] max-w-sm">
          This operations desk is restricted to campus security dispatchers, patrol squads, and system administrators.
        </p>
      </div>
    );
  }

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
  const [dispatchOfficerName, setDispatchOfficerName] = useState('Officer Vikram Sharma');
  const [dispatchNotes, setDispatchNotes] = useState('');

  // Resolve Modal
  const [resolveModalIncident, setResolveModalIncident] = useState<Incident | null>(null);
  const [resolveNotes, setResolveNotes] = useState('');

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
    resolveIncident(resolveModalIncident.id, `${user?.full_name || 'Officer Vikram Sharma'} (Security Officer)`, resolveNotes);
    setResolveModalIncident(null);
    setResolveNotes('');
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
      {/* Security Operations Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D6D8D5] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1F2933]">
            Security Operations
          </h1>
          <p className="text-xs text-[#667085] mt-1">
            Active Duty: <span className="font-semibold text-[#1F2933]">Officer Vikram Sharma</span> · Sector Patrol Unit Alpha
          </p>
        </div>

        {/* Threat Level & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-full border border-[#D6D8D5] text-xs">
            <span className="text-[11px] text-[#667085]">Threat Level:</span>
            <select
              value={threatLevel}
              onChange={(e) => setThreatLevel(e.target.value as ThreatLevel)}
              className="bg-transparent text-xs font-semibold text-[#1F2933] focus:outline-none cursor-pointer"
            >
              <option value="NORMAL">Normal</option>
              <option value="ELEVATED">Elevated</option>
              <option value="HIGH_ALERT">High Alert</option>
              <option value="LOCKDOWN">Lockdown</option>
            </select>
          </div>

          <Button
            asChild
            size="sm"
            className="bg-[#DC2626] hover:bg-[#B91C1C] text-white font-medium text-xs gap-1.5 shadow-sm rounded-lg"
          >
            <Link href="/safety/emergency">
              <Bell className="h-3.5 w-3.5" />
              <span>Broadcast Alert</span>
            </Link>
          </Button>

          <Button
            size="sm"
            onClick={simulateIncomingIncident}
            variant="outline"
            className="border-[#D6D8D5] hover:bg-[#F0F1EF] text-[#1F2933] font-medium text-xs gap-1.5 rounded-lg"
          >
            <Flame className="h-3.5 w-3.5 text-amber-500" />
            <span>Simulate Incident</span>
          </Button>
        </div>
      </div>

      {/* Critical Incident Alert (if any) */}
      {criticalIncidents.length > 0 && (
        <div className="space-y-2">
          {criticalIncidents.map((inc) => (
            <div
              key={inc.id}
              onClick={() => {
                setSelectedIncident(inc);
                setIsDetailsModalOpen(true);
              }}
              className="p-4 rounded-xl bg-red-50 border border-red-200 hover:border-red-300 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-800">
                    Priority Incident
                  </span>
                  <span className="text-xs text-[#667085] flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-red-600" />
                    <span>{inc.location_name}</span>
                  </span>
                </div>
                <h4 className="text-sm font-bold text-[#1F2933]">{inc.title}</h4>
                <p className="text-xs text-[#667085] line-clamp-1">{inc.description}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                <Button
                  size="sm"
                  onClick={() => setDispatchModalIncident(inc)}
                  className="bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-medium h-8 px-3 rounded-lg cursor-pointer"
                >
                  Dispatch Unit
                </Button>
                <Button
                  size="sm"
                  onClick={() => setResolveModalIncident(inc)}
                  variant="outline"
                  className="border-[#D6D8D5] text-xs h-8 px-3 rounded-lg hover:bg-white cursor-pointer"
                >
                  Resolve
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Operational Console Tabs */}
      <div className="space-y-4">
        {/* Clean Segmented Tab Buttons */}
        <div className="flex items-center gap-1 bg-[#F0F1EF] p-1 rounded-xl border border-[#D6D8D5] w-fit">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'queue'
                ? 'bg-white text-[#1F2933] font-bold shadow-xs'
                : 'text-[#667085] hover:text-[#1F2933]'
            }`}
          >
            Queue ({responseQueueIncidents.length})
          </button>

          <button
            onClick={() => setActiveTab('assigned')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'assigned'
                ? 'bg-white text-[#1F2933] font-bold shadow-xs'
                : 'text-[#667085] hover:text-[#1F2933]'
            }`}
          >
            My Squad ({assignedToMeIncidents.length})
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-white text-[#1F2933] font-bold shadow-xs'
                : 'text-[#667085] hover:text-[#1F2933]'
            }`}
          >
            Active ({activeIncidents.length})
          </button>

          <button
            onClick={() => setActiveTab('sectors')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'sectors'
                ? 'bg-white text-[#1F2933] font-bold shadow-xs'
                : 'text-[#667085] hover:text-[#1F2933]'
            }`}
          >
            Sectors
          </button>
        </div>

        {/* Tab 1: Response Queue */}
        {activeTab === 'queue' && (
          <div className="space-y-3">
            {responseQueueIncidents.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#667085] bg-white rounded-xl border border-[#D6D8D5]">
                All incidents dispatched and assigned. Queue is clear.
              </div>
            ) : (
              responseQueueIncidents.map((incident) => (
                <div
                  key={incident.id}
                  className="p-4 rounded-xl border border-[#D6D8D5] bg-white space-y-3 shadow-xs transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-[#1F2933]">{incident.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-[#667085]">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-[#667085]" />
                          <span>{incident.location_name}</span>
                        </span>
                        <span>·</span>
                        <span>{formatTimeAgo(incident.created_at)}</span>
                      </div>
                    </div>

                    <span className="rounded-full bg-[#F0F1EF] border border-[#D6D8D5] px-2.5 py-0.5 text-[10px] font-medium text-[#667085] capitalize shrink-0">
                      {incident.status.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-xs text-[#667085] leading-relaxed">{incident.description}</p>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#D6D8D5]">
                    <span className="text-xs text-[#667085]">
                      Ref: <strong className="text-[#1F2933]">{incident.incident_number}</strong>
                    </span>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => acknowledgeIncident(incident.id)}
                        className="h-7 text-xs border-[#D6D8D5] text-[#1F2933] rounded-lg cursor-pointer"
                      >
                        Acknowledge
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => setAssignModalIncident(incident)}
                        className="h-7 text-xs bg-[#1F2933] hover:bg-[#111827] text-white rounded-lg cursor-pointer"
                      >
                        Assign Officer
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => setDispatchModalIncident(incident)}
                        className="h-7 text-xs bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg cursor-pointer"
                      >
                        Dispatch Unit
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedIncident(incident);
                          setIsDetailsModalOpen(true);
                        }}
                        variant="ghost"
                        className="h-7 text-xs text-[#667085] hover:text-[#1F2933] cursor-pointer"
                      >
                        Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Assigned to My Squad */}
        {activeTab === 'assigned' && (
          <div className="space-y-3">
            {assignedToMeIncidents.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#667085] bg-white rounded-xl border border-[#D6D8D5]">
                No active incidents currently assigned to Officer Vikram Sharma.
              </div>
            ) : (
              assignedToMeIncidents.map((incident) => (
                <div
                  key={incident.id}
                  className="p-4 rounded-xl border border-[#D6D8D5] bg-white space-y-3 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-[#1F2933]">{incident.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-[#667085]">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-[#667085]" />
                          <span>{incident.location_name}</span>
                        </span>
                        <span>·</span>
                        <span>{formatTimeAgo(incident.created_at)}</span>
                      </div>
                    </div>

                    <span className="rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-[10px] text-indigo-700 font-medium shrink-0">
                      Assigned: {incident.assigned_officer_name}
                    </span>
                  </div>

                  <p className="text-xs text-[#667085] leading-relaxed">{incident.description}</p>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#D6D8D5]">
                    <span className="text-xs text-[#667085]">
                      Ref: <strong className="text-[#1F2933]">{incident.incident_number}</strong>
                    </span>

                    <div className="flex flex-wrap items-center gap-2">
                      {incident.status !== 'arrived' && incident.status !== 'resolved' && (
                        <Button
                          size="sm"
                          onClick={() => startResponse(incident.id)}
                          className="h-7 text-xs bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg cursor-pointer"
                        >
                          Arrived on Scene
                        </Button>
                      )}

                      <Button
                        size="sm"
                        onClick={() => setResolveModalIncident(incident)}
                        className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg"
                      >
                        Resolve Incident
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: All Active Incidents */}
        {activeTab === 'all' && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
              <span className="text-xs font-semibold text-[#1F2933]">
                Active Incidents ({activeIncidents.length})
              </span>

              {/* Filters */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="h-3.5 w-3.5 text-[#8A9199] absolute left-2.5 top-2.5" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search incidents..."
                    className="h-8 pl-8 text-xs bg-white border-[#D6D8D5] w-48 rounded-lg"
                  />
                </div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="h-8 bg-white border border-[#D6D8D5] rounded-lg px-2 text-xs text-[#1F2933]"
                >
                  <option value="all">All Categories</option>
                  <option value="fire">Fire &amp; Hazard</option>
                  <option value="medical">Medical</option>
                  <option value="womens_safety">Women&apos;s Safety</option>
                  <option value="suspicious_activity">Suspicious Entry</option>
                </select>
              </div>
            </div>
            <div className="space-y-3">
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
                    className="p-4 rounded-xl border border-[#D6D8D5] bg-white hover:border-[#8a6d1a] transition-all cursor-pointer space-y-2 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-[#1F2933]">
                          {incident.incident_number}
                        </span>
                        <SeverityBadge severity={incident.severity} size="sm" isAiClassified />
                        <span className="rounded-full bg-[#F0F1EF] border border-[#D6D8D5] px-2.5 py-0.5 text-[10px] text-[#667085] capitalize font-medium">
                          {incident.status}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#667085]">
                        {formatTimeAgo(incident.created_at)}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-[#1F2933]">{incident.title}</h4>
                      <p className="text-xs text-[#667085] mt-0.5">{incident.description}</p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-[#667085] pt-2 border-t border-[#D6D8D5]">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-[#8a6d1a]" />
                        <span>{incident.location_name}</span>
                      </span>
                      <span>Handler: <strong className="text-[#1F2933]">{incident.assigned_officer_name || 'Unassigned'}</strong></span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Tab 4: Campus Sectors & Guards */}
        {activeTab === 'sectors' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-[#D6D8D5] bg-white p-4 space-y-3 shadow-xs">
              <h3 className="text-xs font-bold text-[#1F2933]">
                Sector Surveillance Readiness
              </h3>
              <div className="space-y-2">
                {SECTORS_STATUS.map((sec) => (
                  <div
                    key={sec.code}
                    className="p-3 rounded-lg bg-[#F7F8F6] border border-[#D6D8D5] flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-[#1F2933]">
                        {sec.name} ({sec.code})
                      </div>
                      <p className="text-[11px] text-[#667085] mt-0.5">
                        Stationed: {sec.guard} · {sec.cameras} Live CCTV Feeds
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        sec.status === 'Optimal'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {sec.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-[#D6D8D5] bg-white p-4 space-y-3 shadow-xs">
              <h3 className="text-xs font-bold text-[#1F2933]">
                Active Patrol Roster
              </h3>
              <div className="space-y-2">
                {patrolLogs.map((patrol) => (
                  <div
                    key={patrol.id}
                    className="p-3 rounded-lg bg-[#F7F8F6] border border-[#D6D8D5] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      <div>
                        <div className="font-semibold text-[#1F2933]">
                          {patrol.officer_name} ({patrol.unit})
                        </div>
                        <p className="text-[11px] text-[#667085]">{patrol.location_name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-700 font-semibold text-[10px] capitalize">
                        {patrol.status}
                      </span>
                      <p className="text-[10px] text-[#8A9199]">Checked in 2m ago</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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



      {/* Incident Details Modal */}
      <IncidentDetailsModal
        incident={selectedIncident}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
      />
    </div>
  );
}

