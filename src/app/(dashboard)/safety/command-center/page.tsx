'use client';

import React, { useState, useMemo } from 'react';
import { useSafety } from '@/lib/context/safety-context';
import { Incident, TimeFilter, ThreatLevel } from '@/lib/types';
import { StatCard } from '@/components/shared/stat-card';
import { CampusMapInteractive } from '@/components/safety/campus-map-interactive';
import { IncidentDetailsModal } from '@/components/safety/incident-details-modal';
import { IncidentReportModal } from '@/components/safety/incident-report-modal';
import { LiveIncidentFeed } from '@/components/safety/live-incident-feed';
import { Button } from '@/components/ui/button';
import {
  Radio,
  Flame,
  ShieldCheck,
  AlertOctagon,
  RefreshCw,
  Plus,
  ShieldAlert,
} from 'lucide-react';

export default function SafetyCommandCenterPage() {
  const {
    incidents,
    threatLevel,
    setThreatLevel,
    resetDemoData,
    broadcastEmergencyAlert,
  } = useSafety();

  // Filters State
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('30days');

  // Modal / Drawer Selection State
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);

  // Broadcast Alert form state
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');

  const handleOpenIncidentDetails = (incident: Incident) => {
    setSelectedIncident(incident);
    setIsDetailsModalOpen(true);
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) return;
    broadcastEmergencyAlert(broadcastTitle, broadcastMessage, 'evacuation', 'critical');
    setBroadcastTitle('');
    setBroadcastMessage('');
    setIsBroadcastOpen(false);
  };

  // Metrics computation based on timeFilter
  const metrics = useMemo(() => {
    const now = Date.now();
    const timeFiltered = incidents.filter((inc) => {
      const incTime = new Date(inc.created_at).getTime();
      const diffHours = (now - incTime) / (1000 * 60 * 60);

      if (timeFilter === 'today' && diffHours > 24) return false;
      if (timeFilter === '7days' && diffHours > 24 * 7) return false;
      if (timeFilter === '30days' && diffHours > 24 * 30) return false;
      return true;
    });

    const active = timeFiltered.filter((i) => i.status !== 'resolved' && i.status !== 'closed');
    const critical = timeFiltered.filter((i) => i.severity === 'critical' && i.status !== 'resolved');
    const high = timeFiltered.filter((i) => i.severity === 'high' && i.status !== 'resolved');

    return {
      activeCount: active.length,
      criticalCount: critical.length,
      highCount: high.length,
      resolvedCount: timeFiltered.filter((i) => i.status === 'resolved').length,
    };
  }, [incidents, timeFilter]);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-[#D6D8D5] pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1F2933]">
            Command Center
          </h1>
          <p className="text-xs text-[#667085] mt-0.5">
            Real-time incident monitoring, threat posture, and security dispatch operations.
          </p>
        </div>

        {/* Global Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            onClick={() => setIsReportModalOpen(true)}
            className="bg-[#1F2933] hover:bg-[#111827] text-white text-xs font-semibold gap-1.5 rounded-lg shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Report Incident</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsBroadcastOpen(!isBroadcastOpen)}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs gap-1.5 rounded-lg shadow-xs cursor-pointer"
          >
            <Radio className="h-3.5 w-3.5" />
            <span>Broadcast Alert</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={resetDemoData}
            title="Reset to default seeded demo state"
            className="text-xs text-[#667085] hover:text-[#1F2933] rounded-lg border-[#D6D8D5] cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* 2. Global Threat Level & Filter Ribbon */}
      <div className="rounded-xl border border-[#D6D8D5] bg-white p-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3 shadow-xs">
        {/* Threat Level Switcher */}
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-semibold text-[#1F2933] shrink-0">
            Campus Threat Posture:
          </span>
          <div className="inline-flex p-1 bg-[#F0F1EF] border border-[#D6D8D5] rounded-full gap-1">
            {(['NORMAL', 'ELEVATED', 'HIGH_ALERT', 'LOCKDOWN'] as ThreatLevel[]).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setThreatLevel(lvl)}
                className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all capitalize cursor-pointer ${
                  threatLevel === lvl
                    ? lvl === 'LOCKDOWN'
                      ? 'bg-red-600 text-white font-bold shadow-xs'
                      : lvl === 'HIGH_ALERT'
                      ? 'bg-amber-600 text-white font-bold shadow-xs'
                      : lvl === 'ELEVATED'
                      ? 'bg-amber-500 text-white font-bold shadow-xs'
                      : 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'text-[#667085] hover:text-[#1F2933]'
                }`}
              >
                {lvl.replace('_', ' ').toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Time Window Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#667085]">Window:</span>
          <div className="inline-flex p-1 bg-[#F0F1EF] border border-[#D6D8D5] rounded-full gap-1">
            {(['today', '7days', '30days'] as const).map((win) => (
              <button
                key={win}
                onClick={() => setTimeFilter(win)}
                className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                  timeFilter === win
                    ? 'bg-[#1F2933] text-white font-semibold shadow-xs'
                    : 'text-[#667085] hover:text-[#1F2933]'
                }`}
              >
                {win === 'today' ? 'Today' : win === '7days' ? 'Last 7 Days' : 'Last 30 Days'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Emergency Broadcast Creation Panel (Collapsible) */}
      {isBroadcastOpen && (
        <div className="rounded-xl border border-[#DC2626] bg-[#FEF2F2] p-4 space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-[#DC2626]/40 pb-2">
            <div className="flex items-center gap-2 text-[#DC2626] font-bold text-xs">
              <ShieldAlert className="h-4 w-4" />
              <span>TRANSMIT IMMEDIATE CAMPUS EMERGENCY BROADCAST</span>
            </div>
            <button onClick={() => setIsBroadcastOpen(false)} className="text-[#DC2626] hover:text-[#B91C1C]">
              ✕
            </button>
          </div>

          <form onSubmit={handleSendBroadcast} className="space-y-3 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[#202226] font-semibold block mb-1">Headline</label>
                <input
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="e.g., HAZARD PROTOCOL: Block D Evacuation"
                  className="w-full h-9 rounded-lg border border-[#DC2626]/50 bg-white px-3 text-xs text-[#202226]"
                  required
                />
              </div>
              <div>
                <label className="text-[#202226] font-semibold block mb-1">Directives &amp; Action Plan</label>
                <input
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="e.g., Avoid Block D 3rd floor. Responders on site."
                  className="w-full h-9 rounded-lg border border-[#DC2626]/50 bg-white px-3 text-xs text-[#202226]"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsBroadcastOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-[#DC2626] hover:bg-[#b91c1c] text-white font-bold">
                Broadcast Across All 8 Roles
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* 3. Top Metrics Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Threat Level"
          value={threatLevel}
          description="Campus security posture"
          icon={<ShieldCheck className="h-5 w-5" />}
          variant={threatLevel === 'LOCKDOWN' ? 'critical' : threatLevel === 'HIGH_ALERT' ? 'warning' : 'primary'}
        />
        <StatCard
          title="Active Emergencies"
          value={metrics.activeCount}
          description={`${metrics.resolvedCount} resolved in window`}
          icon={<Flame className="h-5 w-5" />}
          variant={metrics.activeCount > 0 ? 'warning' : 'default'}
        />
        <StatCard
          title="Critical Incidents"
          value={metrics.criticalCount}
          description="High priority dispatch"
          icon={<AlertOctagon className="h-5 w-5" />}
          variant="critical"
        />
      </div>

      {/* 4. Centerpiece Grid: Interactive Campus Map & Live Incident Feed */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left 7 Columns: Interactive Vector Campus Map */}
        <div className="xl:col-span-7 space-y-6">
          <CampusMapInteractive
            incidents={incidents}
            selectedIncident={selectedIncident}
            onSelectIncident={handleOpenIncidentDetails}
            severityFilter={severityFilter}
            timeFilter={timeFilter}
            className="h-full min-h-[580px]"
          />
        </div>

        {/* Right 5 Columns: Live Incident Feed */}
        <div className="xl:col-span-5 flex flex-col">
          <LiveIncidentFeed
            incidents={incidents}
            onSelectIncident={handleOpenIncidentDetails}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            selectedIncidentId={selectedIncident?.id}
            severityFilter={severityFilter}
            timeFilter={timeFilter}
          />
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
