'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSafety } from '@/lib/context/safety-context';
import { useRole } from '@/lib/hooks/use-role';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { SeverityBadge } from '@/components/shared/severity-badge';
import { IncidentDetailsModal } from '@/components/safety/incident-details-modal';
import { Incident } from '@/lib/types';
import { formatTimeAgo } from '@/lib/utils';
import {
  ShieldCheck,
  MapPin,
  Clock,
  CheckCircle,
  Search,
  X,
  UserCheck,
  ChevronRight,
  HeartPulse,
} from 'lucide-react';

const STAFF_ON_DUTY = [
  { name: 'Vikram Sharma', role: 'Security Supervisor', area: 'Central Campus' },
  { name: 'Ramesh Ramos', role: 'Campus Guard', area: 'North Gate' },
  { name: 'Chen Wei', role: 'Gate Security', area: 'Main Academic Gate' },
  { name: 'Priya Nair', role: 'Hostel Security', area: 'Block B Residence' },
];

export default function SecurityDashboardPage() {
  const {
    incidents,
    acknowledgeIncident,
    assignIncident,
    dispatchResponder,
    startResponse,
    resolveIncident,
    escalateIncident,
  } = useSafety();

  const { user, role, isSuperAdmin, isAdmin } = useRole();

  const isAuthorized = isSuperAdmin || isAdmin || role === 'security';
  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 bg-[#F7F8F6] border border-[#D6D8D5] rounded-xl space-y-3">
        <div className="h-10 w-10 rounded-full bg-[#F0F1EF] border border-[#D6D8D5] flex items-center justify-center text-[#1F2933]">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <h2 className="text-base font-bold text-[#1F2933]">Security Staff Access Only</h2>
        <p className="text-xs text-[#667085] max-w-sm">
          This page is restricted to campus security staff and administrators.
        </p>
      </div>
    );
  }

  // Tabs
  const [activeTab, setActiveTab] = useState<'queue' | 'assigned' | 'all'>('queue');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Assign modal
  const [assignModalIncident, setAssignModalIncident] = useState<Incident | null>(null);
  const [selectedStaff, setSelectedStaff] = useState(STAFF_ON_DUTY[0].name);
  const [assignNotes, setAssignNotes] = useState('');

  // Resolve modal
  const [resolveModalIncident, setResolveModalIncident] = useState<Incident | null>(null);
  const [resolveNotes, setResolveNotes] = useState('');

  // Derived
  const activeIncidents = incidents.filter(
    (i) => i.status !== 'resolved' && i.status !== 'closed' && i.status !== 'false_alarm'
  );
  const queueIncidents = activeIncidents.filter(
    (i) => i.status === 'reported' || i.status === 'ai_analyzed' || !i.assigned_officer_name || i.assigned_officer_name === 'Unassigned'
  );
  const assignedIncidents = activeIncidents.filter(
    (i) => i.assigned_officer_name && i.assigned_officer_name !== 'Unassigned'
  );

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalIncident) return;
    assignIncident(assignModalIncident.id, selectedStaff, 'Campus Security', assignNotes);
    dispatchResponder(assignModalIncident.id, 'Campus Security', selectedStaff, '', assignNotes);
    setAssignModalIncident(null);
    setAssignNotes('');
  };

  const handleResolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolveModalIncident) return;
    resolveIncident(resolveModalIncident.id, `${user?.full_name || 'Security Staff'}`, resolveNotes);
    setResolveModalIncident(null);
    setResolveNotes('');
  };

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();
  const firstName = user?.full_name?.split(' ')[0] || 'there';

  // Filter for "all" tab
  const filteredAll = activeIncidents.filter((inc) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return inc.title.toLowerCase().includes(q) || inc.location_name.toLowerCase().includes(q);
  });

  const renderIncidentRow = (inc: Incident, showActions: 'queue' | 'assigned' | 'none') => (
    <div
      key={inc.id}
      className="p-4 rounded-xl border border-[#D6D8D5] bg-white space-y-3 shadow-xs"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-semibold text-[#1F2933] truncate">{inc.title}</p>
          <div className="flex items-center gap-2 text-xs text-[#667085] flex-wrap">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {inc.location_name}
            </span>
            <span>·</span>
            <span>{formatTimeAgo(inc.created_at)}</span>
            {inc.assigned_officer_name && inc.assigned_officer_name !== 'Unassigned' && (
              <>
                <span>·</span>
                <span className="font-medium text-[#1F2933]">{inc.assigned_officer_name}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium capitalize border ${
            inc.status === 'resolved' || inc.status === 'closed'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : inc.status === 'responding' || inc.status === 'dispatched'
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : 'bg-[#F0F1EF] text-[#667085] border-[#D6D8D5]'
          }`}>
            {inc.status.replace('_', ' ')}
          </span>
          <SeverityBadge severity={inc.severity} size="sm" />
        </div>
      </div>

      {/* SLA banner for campus SOS */}
      {inc.sos_level === 'campus' && inc.sla_expires_at && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-medium">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          <span>Auto-escalation active — respond within 5 minutes</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#F0F1EF]">
        <span className="text-xs text-[#667085] font-mono">{inc.incident_number}</span>
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {showActions === 'queue' && (
            <>
              <Button size="sm" variant="outline" onClick={() => acknowledgeIncident(inc.id)} className="h-7 text-xs rounded-lg cursor-pointer">
                Acknowledge
              </Button>
              <Button size="sm" onClick={() => setAssignModalIncident(inc)} className="h-7 text-xs rounded-lg cursor-pointer">
                Assign & Dispatch
              </Button>
              {inc.sos_level === 'campus' && !inc.auto_escalated && (
                <Button size="sm" onClick={() => escalateIncident(inc.id, 'Manually escalated')} className="h-7 text-xs bg-amber-600 hover:bg-amber-700 text-white rounded-lg cursor-pointer">
                  Escalate
                </Button>
              )}
            </>
          )}
          {showActions === 'assigned' && (
            <>
              {inc.status !== 'arrived' && inc.status !== 'resolved' && (
                <Button size="sm" variant="outline" onClick={() => startResponse(inc.id)} className="h-7 text-xs rounded-lg cursor-pointer">
                  Mark Arrived
                </Button>
              )}
              <Button size="sm" onClick={() => setResolveModalIncident(inc)} className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer">
                Resolve
              </Button>
            </>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => { setSelectedIncident(inc); setIsDetailsModalOpen(true); }}
            className="h-7 text-xs text-[#667085] hover:text-[#1F2933] cursor-pointer"
          >
            Details
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header — matches admin/student pattern */}
      <div className="border-b border-[#D6D8D5] pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-[#1F2933]">
          {greeting}, {firstName}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[#667085]">
          <ShieldCheck className="h-4 w-4 text-[#3F8F68]" />
          <span>Security Desk:</span>
          <span className="inline-flex items-center gap-1.5 font-semibold text-[#3F8F68]">
            <span className="h-2 w-2 rounded-full bg-[#3F8F68]" />
            On duty
          </span>
          {queueIncidents.length > 0 && (
            <>
              <span className="text-[#D6D8D5]">·</span>
              <span className="font-medium text-amber-700">
                {queueIncidents.length} awaiting response
              </span>
            </>
          )}
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl border border-[#D6D8D5] bg-white shadow-xs">
          <span className="text-xs text-[#667085]">Awaiting Response</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-[#1F2933]">{queueIncidents.length}</span>
            <span className="text-xs text-amber-700 font-medium">in queue</span>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-[#D6D8D5] bg-white shadow-xs">
          <span className="text-xs text-[#667085]">Being Handled</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-[#1F2933]">{assignedIncidents.length}</span>
            <span className="text-xs text-[#667085]">assigned to staff</span>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-[#D6D8D5] bg-white shadow-xs">
          <span className="text-xs text-[#667085]">Staff On Duty</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-[#1F2933]">{STAFF_ON_DUTY.length}</span>
            <span className="text-xs text-[#667085]">campus security</span>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap items-center gap-2.5">
        <Button asChild size="sm" variant="emergency" className="gap-1.5">
          <Link href="/safety/sos"><HeartPulse className="h-4 w-4 animate-pulse" /> SOS</Link>
        </Button>
        <Button asChild size="sm" variant="outline" className="gap-1.5">
          <Link href="/safety/command-center"><ShieldCheck className="h-4 w-4" /> Safety Desk</Link>
        </Button>
        <Button asChild size="sm" variant="outline" className="gap-1.5">
          <Link href="/campus-map"><MapPin className="h-4 w-4" /> Campus Map</Link>
        </Button>
      </div>

      {/* Tabbed incident console */}
      <div className="space-y-4">
        <div className="flex items-center gap-1 bg-[#F0F1EF] p-1 rounded-xl border border-[#D6D8D5] w-fit">
          {[
            { key: 'queue' as const, label: `Queue (${queueIncidents.length})` },
            { key: 'assigned' as const, label: `Assigned (${assignedIncidents.length})` },
            { key: 'all' as const, label: `All Active (${activeIncidents.length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-white text-[#1F2933] font-bold shadow-xs'
                  : 'text-[#667085] hover:text-[#1F2933]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Queue tab */}
        {activeTab === 'queue' && (
          <div className="space-y-3">
            {queueIncidents.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#667085] bg-white rounded-xl border border-[#D6D8D5]">
                <div className="text-[#3F8F68] font-semibold">Queue is clear</div>
                <p className="mt-1 text-[#8A9199]">All reported incidents have been assigned.</p>
              </div>
            ) : (
              queueIncidents.map((inc) => renderIncidentRow(inc, 'queue'))
            )}
          </div>
        )}

        {/* Assigned tab */}
        {activeTab === 'assigned' && (
          <div className="space-y-3">
            {assignedIncidents.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#667085] bg-white rounded-xl border border-[#D6D8D5]">
                No incidents currently assigned to staff.
              </div>
            ) : (
              assignedIncidents.map((inc) => renderIncidentRow(inc, 'assigned'))
            )}
          </div>
        )}

        {/* All active tab */}
        {activeTab === 'all' && (
          <div className="space-y-3">
            <div className="relative w-full sm:w-64">
              <Search className="h-3.5 w-3.5 text-[#8A9199] absolute left-2.5 top-2.5" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search incidents..."
                className="h-8 pl-8 text-xs bg-white border-[#D6D8D5] rounded-lg"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-2.5 cursor-pointer text-[#667085] hover:text-[#1F2933]">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            {filteredAll.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#667085] bg-white rounded-xl border border-[#D6D8D5]">
                No matching incidents found.
              </div>
            ) : (
              filteredAll.map((inc) => renderIncidentRow(inc, 'none'))
            )}
          </div>
        )}
      </div>

      {/* Staff on duty — simple card */}
      <Card>
        <CardHeader className="p-4 border-b border-[#D6D8D5] flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-bold text-[#1F2933] flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-[#8a6d1a]" />
            Staff On Duty
          </CardTitle>
          <span className="text-xs text-[#8A9199]">{STAFF_ON_DUTY.length} personnel</span>
        </CardHeader>
        <CardContent className="p-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {STAFF_ON_DUTY.map((staff) => (
              <div key={staff.name} className="flex items-center gap-2.5 rounded-lg border border-[#D6D8D5] p-2.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                <div className="min-w-0 text-xs">
                  <p className="font-semibold text-[#1F2933] truncate">{staff.name}</p>
                  <p className="text-[11px] text-[#667085]">{staff.role} · {staff.area}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Assign Modal — clean, light theme */}
      {assignModalIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setAssignModalIncident(null)}>
          <Card className="w-full max-w-md shadow-xl animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="p-4 border-b border-[#D6D8D5]">
              <CardTitle className="text-sm font-bold text-[#1F2933] flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-[#8a6d1a]" />
                Assign & Dispatch — {assignModalIncident.incident_number}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <form onSubmit={handleAssign} className="space-y-3 text-xs">
                <div className="p-2.5 rounded-lg bg-[#F7F8F6] border border-[#D6D8D5]">
                  <p className="font-semibold text-[#1F2933]">{assignModalIncident.title}</p>
                  <p className="text-[#667085] mt-0.5">{assignModalIncident.location_name}</p>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-[#1F2933]">Assign to:</label>
                  <select
                    value={selectedStaff}
                    onChange={(e) => setSelectedStaff(e.target.value)}
                    className="w-full h-9 rounded-lg bg-white border border-[#D6D8D5] text-[#1F2933] px-3 text-xs focus:outline-none"
                  >
                    {STAFF_ON_DUTY.map((s) => (
                      <option key={s.name} value={s.name}>{s.name} — {s.role} ({s.area})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-[#1F2933]">Notes (optional):</label>
                  <textarea
                    value={assignNotes}
                    onChange={(e) => setAssignNotes(e.target.value)}
                    placeholder="Any special instructions..."
                    rows={2}
                    className="w-full rounded-lg bg-white border border-[#D6D8D5] text-[#1F2933] p-2.5 text-xs focus:outline-none"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <Button type="button" variant="outline" size="sm" onClick={() => setAssignModalIncident(null)} className="text-xs cursor-pointer">Cancel</Button>
                  <Button type="submit" size="sm" className="text-xs cursor-pointer">Assign & Dispatch</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Resolve Modal — clean, light theme */}
      {resolveModalIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setResolveModalIncident(null)}>
          <Card className="w-full max-w-md shadow-xl animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="p-4 border-b border-[#D6D8D5]">
              <CardTitle className="text-sm font-bold text-[#1F2933] flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                Resolve — {resolveModalIncident.incident_number}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <form onSubmit={handleResolve} className="space-y-3 text-xs">
                <div className="p-2.5 rounded-lg bg-[#F7F8F6] border border-[#D6D8D5]">
                  <p className="font-semibold text-[#1F2933]">{resolveModalIncident.title}</p>
                  <p className="text-[#667085] mt-0.5">{resolveModalIncident.location_name}</p>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-[#1F2933]">Resolution notes:</label>
                  <textarea
                    value={resolveNotes}
                    onChange={(e) => setResolveNotes(e.target.value)}
                    placeholder="Describe how the incident was resolved..."
                    rows={3}
                    className="w-full rounded-lg bg-white border border-[#D6D8D5] text-[#1F2933] p-2.5 text-xs focus:outline-none"
                    required
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <Button type="button" variant="outline" size="sm" onClick={() => setResolveModalIncident(null)} className="text-xs cursor-pointer">Cancel</Button>
                  <Button type="submit" size="sm" className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer">Mark Resolved</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      <IncidentDetailsModal
        incident={selectedIncident}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
      />
    </div>
  );
}
