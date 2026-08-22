'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRole } from '@/lib/hooks/use-role';
import { useSafety } from '@/lib/context/safety-context';
import { Incident } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IncidentDetailsModal } from '@/components/safety/incident-details-modal';
import { IncidentReportModal } from '@/components/safety/incident-report-modal';
import { SeverityBadge } from '@/components/shared/severity-badge';
import { formatTimeAgo } from '@/lib/utils';
import {
  ShieldCheck,
  Flame,
  Plus,
  ChevronRight,
  MapPin,
  Clock,
  HeartPulse,
  RefreshCw,
  UserCheck,
  Radio,
  Map,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

const ON_DUTY_PATROL = [
  { id: 'sec-1', name: 'Vikram Sharma', role: 'Security Supervisor', area: 'Central Academic Commons (AB4)', status: 'On Patrol' },
  { id: 'sec-2', name: 'Ramesh Ramos', role: 'Campus Patrol Officer', area: 'Engineering Block D & North Gate', status: 'Responding' },
  { id: 'sec-3', name: 'Chen Wei', role: 'Perimeter Access Guard', area: 'Main Gate & Administrative Lot', status: 'Stationary' },
  { id: 'sec-4', name: 'Priya Nair', role: 'Residential Warden Guard', area: 'Hostel Block B & C Quarters', status: 'On Patrol' },
];

export default function SafetyDeskPage() {
  const { user, isSuperAdmin, isAdmin, role } = useRole();
  const {
    incidents,
    resetDemoData,
    acknowledgeIncident,
    assignIncident,
    resolveIncident,
  } = useSafety();

  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [queueFilter, setQueueFilter] = useState<'all' | 'priority' | 'responding' | 'unassigned'>('all');

  const isAuthorized = isSuperAdmin || isAdmin || role === 'security';
  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 bg-[#F7F8F6] border border-[#D6D8D5] rounded-xl space-y-3">
        <div className="h-10 w-10 rounded-full bg-[#F0F1EF] border border-[#D6D8D5] flex items-center justify-center text-[#1F2933]">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <h2 className="text-base font-bold text-[#1F2933]">Campus Safety Access Required</h2>
        <p className="text-xs text-[#667085] max-w-sm">
          This operations desk is strictly available to campus safety staff, officers, and administrators.
        </p>
      </div>
    );
  }

  const handleOpenDetails = (incident: Incident) => {
    setSelectedIncident(incident);
    setIsDetailsModalOpen(true);
  };

  const activeIncidents = useMemo(
    () => incidents.filter((i) => i.status !== 'resolved' && i.status !== 'closed' && i.status !== 'false_alarm'),
    [incidents]
  );
  const resolvedIncidents = useMemo(
    () => incidents.filter((i) => i.status === 'resolved' || i.status === 'closed'),
    [incidents]
  );
  const priorityIncidents = useMemo(
    () => activeIncidents.filter((i) => i.severity === 'critical' || i.severity === 'high'),
    [activeIncidents]
  );

  const filteredQueue = useMemo(() => {
    switch (queueFilter) {
      case 'priority':
        return priorityIncidents;
      case 'responding':
        return activeIncidents.filter((i) => i.status === 'responding');
      case 'unassigned':
        return activeIncidents.filter(
          (i) => !i.assigned_officer_name || i.assigned_officer_name === 'Unassigned' || i.status === 'reported'
        );
      default:
        return activeIncidents;
    }
  }, [queueFilter, activeIncidents, priorityIncidents]);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  const firstName = user?.full_name?.split(' ')[0] || 'Officer';

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Greeting & Header Bar */}
      <div className="border-b border-[#D6D8D5] pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1F2933]">
            {greeting}, {firstName}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#667085]">
            <ShieldCheck className="h-4 w-4 text-[#3F8F68]" />
            <span>Campus Safety Status:</span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-[#3F8F68]">
              <span className="h-2 w-2 rounded-full bg-[#3F8F68]" />
              Active Patrols Operational
            </span>
            {activeIncidents.length > 0 && (
              <>
                <span className="text-[#D6D8D5]">·</span>
                <span className="font-semibold text-amber-700">
                  {activeIncidents.length} Active {activeIncidents.length === 1 ? 'Incident' : 'Incidents'} in Dispatch Queue
                </span>
              </>
            )}
          </div>
        </div>

        {/* Quick Action Navigation */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            onClick={() => setIsReportModalOpen(true)}
            className="bg-[#1F2933] hover:bg-[#111827] text-white text-xs font-semibold gap-1.5 rounded-lg shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Report Incident</span>
          </Button>
          <Button asChild size="sm" variant="outline" className="text-xs font-medium gap-1.5 border-[#D6D8D5] cursor-pointer">
            <Link href="/campus-map">
              <Map className="h-4 w-4 text-[#8a6d1a]" />
              <span>Full Campus Map</span>
            </Link>
          </Button>
          <Button asChild size="sm" variant="emergency" className="gap-1.5 text-xs">
            <Link href="/safety/sos">
              <HeartPulse className="h-4 w-4 animate-pulse" />
              <span>SOS Hub</span>
            </Link>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={resetDemoData}
            title="Reset demo data"
            className="gap-1.5 text-xs border-[#D6D8D5] cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Key Metric Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl border border-[#D6D8D5] bg-white shadow-xs">
          <span className="text-xs text-[#667085]">Active Incidents</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-[#1F2933]">{activeIncidents.length}</span>
            <span className="text-xs font-medium text-amber-700">{priorityIncidents.length} Critical/High</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[#D6D8D5] bg-white shadow-xs">
          <span className="text-xs text-[#667085]">Resolved This Month</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-[#1F2933]">{resolvedIncidents.length}</span>
            <span className="text-xs text-emerald-700 font-medium">Cases closed</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[#D6D8D5] bg-white shadow-xs">
          <span className="text-xs text-[#667085]">On-Duty Officers</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-[#1F2933]">{ON_DUTY_PATROL.length}</span>
            <span className="text-xs text-[#667085]">Sectors covered</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[#D6D8D5] bg-white shadow-xs">
          <span className="text-xs text-[#667085]">Avg Guard Response SLA</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-[#1F2933]">3.4 min</span>
            <span className="text-xs text-emerald-700 font-medium">&lt; 5 min SLA</span>
          </div>
        </div>
      </div>

      {/* Main Operations Arena (List Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 Cols): Interactive Dispatch Queue & Incident Feed */}
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-2xl border border-[#D6D8D5] bg-white shadow-xs overflow-hidden">
            {/* Filter Pills Header */}
            <div className="p-4 border-b border-[#D6D8D5] bg-[#F7F8F6] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Radio className="h-4 w-4 text-red-600 animate-pulse" />
                <h2 className="text-sm font-bold text-[#1F2933]">Live Safety Dispatch Queue</h2>
              </div>

              <div className="inline-flex p-0.5 bg-white rounded-lg border border-[#D6D8D5] text-xs">
                {[
                  { id: 'all', label: `All Active (${activeIncidents.length})` },
                  { id: 'priority', label: `High/Crit (${priorityIncidents.length})` },
                  { id: 'responding', label: 'In Response' },
                  { id: 'unassigned', label: 'Unassigned' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setQueueFilter(tab.id as typeof queueFilter)}
                    className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                      queueFilter === tab.id
                        ? 'bg-[#1F2933] text-white shadow-xs'
                        : 'text-[#667085] hover:text-[#1F2933]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Incidents List */}
            <div className="p-4 space-y-3">
              {filteredQueue.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#8A9199] space-y-1">
                  <CheckCircle2 className="h-8 w-8 text-[#3F8F68] mx-auto mb-2" />
                  <p className="font-bold text-[#1F2933]">No pending incidents in this filter view</p>
                  <p>All reported items have been handled or assigned to patrol units.</p>
                </div>
              ) : (
                filteredQueue.map((inc) => {
                  const isResponding = inc.status === 'responding';
                  const isCritical = inc.severity === 'critical';

                  return (
                    <div
                      key={inc.id}
                      className={`p-4 rounded-xl border transition-all text-xs space-y-3 ${
                        isCritical
                          ? 'border-red-300 bg-red-50/40 hover:border-red-400'
                          : 'border-[#D6D8D5] bg-white hover:border-[#1F2933]'
                      }`}
                    >
                      {/* Incident Top Bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-[#1F2933]">{inc.incident_number}</span>
                          <SeverityBadge severity={inc.severity} size="sm" />
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                              isResponding
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-[#F0F1EF] text-[#667085] border border-[#D6D8D5]'
                            }`}
                          >
                            {inc.status.replace('_', ' ')}
                          </span>
                        </div>

                        <span className="text-[11px] text-[#667085] flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatTimeAgo(inc.created_at)}</span>
                        </span>
                      </div>

                      {/* Title & Description */}
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-[#1F2933]">{inc.title}</h3>
                        <p className="text-xs text-[#667085] line-clamp-2">{inc.description}</p>
                      </div>

                      {/* Location & AI Triage Summary */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1.5 bg-[#F7F8F6] p-2.5 rounded-lg border border-[#D6D8D5]">
                          <MapPin className="h-3.5 w-3.5 text-red-500 shrink-0" />
                          <span className="font-semibold text-[#1F2933] truncate">{inc.location_name}</span>
                        </div>

                        <div className="flex items-center gap-1.5 bg-[#F7F8F6] p-2.5 rounded-lg border border-[#D6D8D5]">
                          <UserCheck className="h-3.5 w-3.5 text-[#3F8F68] shrink-0" />
                          <span className="text-[#667085] truncate">
                            Assigned: <strong className="text-[#1F2933]">{inc.assigned_officer_name || 'Unassigned'}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Gemini AI Triage Insight if present */}
                      {inc.ai_summary && (
                        <div className="p-2.5 rounded-lg bg-[#FAF9F5] border border-[#EAB308]/40 text-[11px] text-[#8a6d1a] flex items-start gap-1.5">
                          <Sparkles className="h-3.5 w-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
                          <span>
                            <strong>AI Triage:</strong> {inc.ai_summary}
                          </span>
                        </div>
                      )}

                      {/* Action Bar */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#D6D8D5] flex-wrap">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenDetails(inc)}
                          className="text-xs border-[#D6D8D5] text-[#1F2933] hover:bg-[#F7F8F6] rounded-lg cursor-pointer"
                        >
                          View Full Telemetry
                        </Button>

                        <div className="flex items-center gap-2">
                          {!inc.assigned_officer_name || inc.assigned_officer_name === 'Unassigned' ? (
                            <Button
                              size="sm"
                              onClick={() => {
                                assignIncident(inc.id, 'Ramesh Ramos', 'Campus Guard', 'Dispatched via Quick Queue');
                              }}
                              className="bg-[#1F2933] hover:bg-[#111827] text-white text-xs font-semibold rounded-lg cursor-pointer"
                            >
                              Dispatch Guard
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => resolveIncident(inc.id, 'Resolved and verified by on-duty patrol officer.')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg cursor-pointer gap-1"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Mark Resolved</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column (4 Cols): On-Duty Guard Roster & Interactive Map Gateway */}
        <div className="lg:col-span-4 space-y-4">
          {/* Interactive Map Gateway Card */}
          <div className="p-5 rounded-2xl border border-[#D6D8D5] bg-gradient-to-br from-white to-[#F7F8F6] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FAF9F5] text-[#8a6d1a] border border-[#EAB308]/40">
                  <Map className="h-4 w-4" />
                </div>
                <h3 className="text-xs font-bold text-[#1F2933]">Campus Blueprint Map</h3>
              </div>
              <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                12 Facilities
              </span>
            </div>
            <p className="text-xs text-[#667085] leading-relaxed">
              Explore full interactive vector blueprints, live patrol breadcrumbs, building boundary polygons, and pinpoint incident coordinates.
            </p>
            <Button asChild className="w-full bg-[#1F2933] hover:bg-[#111827] text-white text-xs font-semibold rounded-lg gap-1.5 shadow-xs">
              <Link href="/campus-map">
                <span>Open Dedicated Campus Map</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          {/* On-Duty Safety Officers List */}
          <div className="p-5 rounded-2xl border border-[#D6D8D5] bg-white shadow-xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-[#D6D8D5] pb-2.5">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-[#3F8F68]" />
                <h3 className="text-xs font-bold text-[#1F2933]">On-Duty Patrol Staff</h3>
              </div>
              <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                4 Active
              </span>
            </div>

            <div className="space-y-2.5">
              {ON_DUTY_PATROL.map((officer) => (
                <div key={officer.id} className="p-3 rounded-xl bg-[#F7F8F6] border border-[#D6D8D5] space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <strong className="text-[#1F2933] font-bold">{officer.name}</strong>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        officer.status === 'Responding'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {officer.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#667085]">{officer.role}</p>
                  <p className="text-[11px] text-[#1F2933] font-medium flex items-center gap-1 pt-1 border-t border-[#D6D8D5]/60">
                    <MapPin className="h-3 w-3 text-red-500 shrink-0" />
                    <span className="truncate">{officer.area}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Helplines Box */}
          <div className="p-4 rounded-2xl bg-[#F7F8F6] border border-[#D6D8D5] text-xs space-y-2">
            <span className="font-bold text-[#1F2933] block">Operations Helpline</span>
            <div className="flex justify-between py-1 border-b border-[#D6D8D5]/60 text-[11px]">
              <span className="text-[#667085]">Control Room Dispatch:</span>
              <strong className="text-[#1F2933]">080-2360-0100</strong>
            </div>
            <div className="flex justify-between py-1 text-[11px]">
              <span className="text-[#667085]">Emergency Multi-Squad:</span>
              <strong className="text-red-700">112 (Police / EMS)</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <IncidentDetailsModal
        incident={selectedIncident}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
      />
      <IncidentReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSuccess={(id) => {
          const inc = incidents.find((i) => i.id === id);
          if (inc) setSelectedIncident(inc);
        }}
      />
    </div>
  );
}
