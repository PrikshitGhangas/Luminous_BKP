'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRole } from '@/lib/hooks/use-role';
import { useSafety } from '@/lib/context/safety-context';
import { Incident, TimeFilter } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CampusMapInteractive } from '@/components/safety/campus-map-interactive';
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
  CalendarCheck,
  RefreshCw,
} from 'lucide-react';

export default function SafetyDeskPage() {
  const { user, isSuperAdmin, isAdmin, role } = useRole();
  const {
    incidents,
    resetDemoData,
  } = useSafety();

  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const isAuthorized = isSuperAdmin || isAdmin || role === 'security';
  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 bg-[#F7F8F6] border border-[#D6D8D5] rounded-xl space-y-3">
        <div className="h-10 w-10 rounded-full bg-[#F0F1EF] border border-[#D6D8D5] flex items-center justify-center text-[#1F2933]">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <h2 className="text-base font-bold text-[#1F2933]">Campus Safety Access Required</h2>
        <p className="text-xs text-[#667085] max-w-sm">
          This page is available to campus safety staff and administrators.
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

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  const firstName = user?.full_name?.split(' ')[0] || 'there';

  return (
    <div className="space-y-6">
      {/* Greeting + status — matches admin/student pattern */}
      <div className="border-b border-[#D6D8D5] pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-[#1F2933]">
          {greeting}, {firstName}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[#667085]">
          <ShieldCheck className="h-4 w-4 text-[#3F8F68]" />
          <span>Campus Safety:</span>
          <span className="inline-flex items-center gap-1.5 font-semibold text-[#3F8F68]">
            <span className="h-2 w-2 rounded-full bg-[#3F8F68]" />
            All areas operational
          </span>
          {activeIncidents.length > 0 && (
            <>
              <span className="text-[#D6D8D5]">·</span>
              <span className="font-medium text-amber-700">
                {activeIncidents.length} open {activeIncidents.length === 1 ? 'report' : 'reports'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Key metrics — matches admin pattern: simple bordered cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl border border-[#D6D8D5] bg-white shadow-xs">
          <span className="text-xs text-[#667085]">Open Reports</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-[#1F2933]">{activeIncidents.length}</span>
            <span className="text-xs text-[#667085]">{priorityIncidents.length} priority</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[#D6D8D5] bg-white shadow-xs">
          <span className="text-xs text-[#667085]">Resolved This Month</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-[#1F2933]">{resolvedIncidents.length}</span>
            <span className="text-xs text-emerald-700 font-medium">cases closed</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[#D6D8D5] bg-white shadow-xs">
          <span className="text-xs text-[#667085]">Safety Staff On-Duty</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-[#1F2933]">8</span>
            <span className="text-xs text-[#667085]">patrol officers &amp; escorts</span>
          </div>
        </div>
      </div>

      {/* Quick actions — matches admin/student pattern */}
      <div className="flex flex-wrap items-center gap-2.5">
        <Button size="sm" className="gap-1.5 cursor-pointer" onClick={() => setIsReportModalOpen(true)}>
          <Plus className="h-4 w-4" /> Report Issue
        </Button>
        <Button asChild size="sm" variant="emergency" className="gap-1.5">
          <Link href="/safety/sos"><HeartPulse className="h-4 w-4 animate-pulse" /> SOS</Link>
        </Button>
        <Button asChild size="sm" variant="outline" className="gap-1.5">
          <Link href="/incidents"><Flame className="h-4 w-4" /> All Incidents</Link>
        </Button>
        <Button asChild size="sm" variant="outline" className="gap-1.5">
          <Link href="/campus-map"><MapPin className="h-4 w-4" /> Campus Map</Link>
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={resetDemoData}
          title="Reset demo data"
          className="gap-1.5 cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Main content grid — map + priority feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Campus map — takes 2 columns */}
        <Card className="lg:col-span-2">
          <CardContent className="p-0">
            <CampusMapInteractive
              incidents={incidents}
              selectedIncident={selectedIncident}
              onSelectIncident={handleOpenDetails}
              className="min-h-[480px]"
            />
          </CardContent>
        </Card>

        {/* Priority reports feed */}
        <Card>
          <CardHeader className="p-4 border-b border-[#D6D8D5] flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-[#1F2933] flex items-center gap-2">
              <Flame className="h-4 w-4 text-[#C94C4C]" />
              Priority Reports
            </CardTitle>
            <Link href="/incidents" className="flex items-center gap-1 text-xs font-medium text-[#8a6d1a] hover:underline">
              View all <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="p-3">
            {priorityIncidents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="text-xs text-[#3F8F68] font-semibold">No priority reports</div>
                <p className="mt-1 text-xs text-[#8A9199]">High and critical items appear here.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {priorityIncidents.slice(0, 5).map((inc) => (
                  <div
                    key={inc.id}
                    onClick={() => handleOpenDetails(inc)}
                    className="flex items-start justify-between gap-3 rounded-lg border border-[#D6D8D5] bg-white p-3 cursor-pointer hover:bg-[#F7F8F6] transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#1F2933]">{inc.title}</p>
                      <p className="mt-0.5 text-xs text-[#667085] flex items-center gap-1.5">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{inc.location_name}</span>
                        <span className="text-[#D6D8D5]">·</span>
                        <span className="shrink-0">{formatTimeAgo(inc.created_at)}</span>
                      </p>
                    </div>
                    <SeverityBadge severity={inc.severity} size="sm" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent activity — all incidents, matches admin's recent activity card */}
      <Card>
        <CardHeader className="p-4 border-b border-[#D6D8D5] flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold text-[#1F2933] flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#8a6d1a]" />
            Recent Activity
          </CardTitle>
          <span className="text-xs text-[#8A9199]">{incidents.length} total reports</span>
        </CardHeader>
        <CardContent className="p-3">
          {incidents.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#8A9199]">No incidents reported.</div>
          ) : (
            <div className="space-y-2">
              {incidents.slice(0, 6).map((inc) => (
                <div
                  key={inc.id}
                  onClick={() => handleOpenDetails(inc)}
                  className="flex items-center justify-between gap-3 rounded-lg border border-[#D6D8D5] p-2.5 cursor-pointer hover:bg-[#F7F8F6] transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#1F2933] truncate">{inc.title}</p>
                    <p className="text-[11px] text-[#667085] mt-0.5 truncate">
                      {inc.location_name} · {formatTimeAgo(inc.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${
                      inc.status === 'resolved' || inc.status === 'closed'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : inc.status === 'responding'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-[#F0F1EF] text-[#667085] border border-[#D6D8D5]'
                    }`}>
                      {inc.status.replace('_', ' ')}
                    </span>
                    <SeverityBadge severity={inc.severity} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          )}
          <Button asChild variant="ghost" size="sm" className="mt-2 w-full gap-1 text-xs">
            <Link href="/incidents">
              View all incidents <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardContent>
      </Card>

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
