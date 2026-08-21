'use client';

import React, { useState, useMemo } from 'react';
import { useSafety } from '@/lib/context/safety-context';
import { Incident, TimeFilter, ThreatLevel } from '@/lib/types';
import { StatCard } from '@/components/shared/stat-card';
import { CampusMapInteractive } from '@/components/safety/campus-map-interactive';
import { IncidentDetailsModal } from '@/components/safety/incident-details-modal';
import { IncidentReportModal } from '@/components/safety/incident-report-modal';
import { AISafetyIntelligencePanel } from '@/components/safety/ai-intelligence-panel';
import { IncidentCharts } from '@/components/safety/incident-charts';
import { LiveIncidentFeed } from '@/components/safety/live-incident-feed';
import { SecurityActivityFeed } from '@/components/safety/security-activity-feed';
import { Button } from '@/components/ui/button';
import {
  Radio,
  Flame,
  ShieldCheck,
  Clock,
  Sparkles,
  AlertOctagon,
  RefreshCw,
  Plus,
  ShieldAlert,
  Activity,
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
      {/* 1. SOC Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-[#AEB0B7] pb-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="flex h-3 w-3 rounded-full bg-[#EAB308] animate-ping" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#202226] flex items-center gap-2">
              <span>Campus Security Operations Center (SOC)</span>
            </h1>
            <span className="rounded bg-[#EAB308]/15 border border-[#EAB308]/40 px-2 py-0.5 text-[10px] font-bold text-[#B45309]">
              COMMAND CENTER
            </span>
          </div>
          <p className="text-xs text-[#555960] mt-1">
            Autonomous AI Incident Triage · Real-time Multi-Sector Vector Telemetry · Rapid Dispatch
          </p>
        </div>

        {/* Global Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            onClick={() => setIsReportModalOpen(true)}
            className="bg-gradient-to-r from-[#EAB308] via-[#EAB308] to-[#D4AF37] text-[#202226] font-bold text-xs gap-1.5 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Report Incident</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsBroadcastOpen(!isBroadcastOpen)}
            className="bg-[#DC2626] hover:bg-[#b91c1c] text-white font-bold text-xs gap-1.5 shadow-sm border border-[#DC2626]"
          >
            <Radio className="h-3.5 w-3.5 animate-pulse" />
            <span>Broadcast Alert</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={resetDemoData}
            title="Reset to default seeded demo state"
            className="text-xs text-[#555960] hover:text-[#202226]"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* 2. Global Threat Level & Filter Ribbon */}
      <div className="rounded-xl border border-[#AEB0B7] bg-white p-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3 shadow-sm">
        {/* Threat Level Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase font-bold text-[#555960] shrink-0">
            Campus Safety Threat Posture:
          </span>
          <div className="flex items-center gap-1 bg-[#E7E8EB] border border-[#D0D1D6] p-1 rounded-lg text-xs font-bold">
            {(['NORMAL', 'ELEVATED', 'HIGH_ALERT', 'LOCKDOWN'] as ThreatLevel[]).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setThreatLevel(lvl)}
                className={`px-2 py-0.5 rounded uppercase transition-colors cursor-pointer text-[10px] ${
                  threatLevel === lvl
                    ? lvl === 'LOCKDOWN'
                      ? 'bg-[#DC2626] text-white animate-pulse'
                      : lvl === 'HIGH_ALERT'
                      ? 'bg-[#F59E0B] text-white'
                      : lvl === 'ELEVATED'
                      ? 'bg-[#EAB308] text-[#202226]'
                      : 'bg-[#10B981] text-white'
                    : 'text-[#555960] hover:text-[#202226]'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Global Severity & Time Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Severity Filter */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-[#555960]">Severity:</span>
            <div className="flex items-center gap-0.5 bg-[#E7E8EB] border border-[#D0D1D6] p-0.5 rounded-lg text-[10px]">
              {['all', 'critical', 'high', 'medium', 'low'].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-2 py-0.5 rounded capitalize transition-colors cursor-pointer ${
                    severityFilter === sev
                      ? 'bg-[#EAB308] text-[#202226] font-bold'
                      : 'text-[#555960] hover:text-[#202226]'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          {/* Time Filter */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-[#555960]">Time Window:</span>
            <div className="flex items-center gap-0.5 bg-[#E7E8EB] border border-[#D0D1D6] p-0.5 rounded-lg text-[10px]">
              {(['today', '7days', '30days'] as TimeFilter[]).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeFilter(tf)}
                  className={`px-2 py-0.5 rounded uppercase transition-colors cursor-pointer ${
                    timeFilter === tf
                      ? 'bg-[#EAB308] text-[#202226] font-bold'
                      : 'text-[#555960] hover:text-[#202226]'
                  }`}
                >
                  {tf === 'today' ? 'Today' : tf === '7days' ? '7 Days' : '30 Days'}
                </button>
              ))}
            </div>
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

      {/* 3. Top Metrics Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Campus Safety Posture"
          value={threatLevel}
          description="Real-time SOC monitoring"
          icon={<ShieldCheck className="h-5 w-5" />}
          variant={threatLevel === 'LOCKDOWN' ? 'critical' : threatLevel === 'HIGH_ALERT' ? 'warning' : 'primary'}
        />
        <StatCard
          title="Active Emergencies"
          value={metrics.activeCount}
          description={`${metrics.resolvedCount} cleared this window`}
          icon={<Flame className="h-5 w-5" />}
          variant={metrics.activeCount > 0 ? 'warning' : 'default'}
        />
        <StatCard
          title="Critical Incidents"
          value={metrics.criticalCount}
          description="Life-safety priority dispatch"
          icon={<AlertOctagon className="h-5 w-5" />}
          variant="critical"
        />
        <StatCard
          title="High Severity Count"
          value={metrics.highCount}
          description="Urgent containment tier"
          icon={<Radio className="h-5 w-5" />}
          variant="warning"
        />
        <StatCard
          title="Avg Response Latency"
          value="2.8 min"
          trend={{ value: "18% faster", isPositive: true }}
          description="Target < 4.0 min (94.6% SLA)"
          icon={<Clock className="h-5 w-5" />}
          variant="success"
        />
      </div>

      {/* 4. Centerpiece Grid: Interactive SVG Campus Map & Live Incident Feed */}
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

      {/* 5. AI Safety Intelligence & Pattern Synthesis */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-[#AEB0B7] pb-2">
          <Sparkles className="h-4 w-4 text-[#B45309]" />
          <h2 className="text-sm font-bold text-[#202226] uppercase tracking-wider">
            AI Safety Intelligence &amp; Predictive Risk Synthesis
          </h2>
        </div>
        <AISafetyIntelligencePanel />
      </div>

      {/* 6. Incident Velocity & First Responder Response Time Charts */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-[#AEB0B7] pb-2">
          <Activity className="h-4 w-4 text-[#B45309]" />
          <h2 className="text-sm font-bold text-[#202226] uppercase tracking-wider">
            Campus Incident Trends &amp; SLA Velocity Charts
          </h2>
        </div>
        <IncidentCharts timeFilter={timeFilter} />
      </div>

      {/* 7. Security Activity Stream & Active Patrol Telemetry */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-[#AEB0B7] pb-2">
          <ShieldCheck className="h-4 w-4 text-[#B45309]" />
          <h2 className="text-sm font-bold text-[#202226] uppercase tracking-wider">
            Security Operations Telemetry &amp; Audit Log Stream
          </h2>
        </div>
        <SecurityActivityFeed />
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
