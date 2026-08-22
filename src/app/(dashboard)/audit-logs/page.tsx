'use client';

import React, { useState } from 'react';
import { useSafety } from '@/lib/context/safety-context';
import { useRole } from '@/lib/hooks/use-role';
import {
  ScrollText,
  ShieldAlert,
  Clock,
  Search,
  Filter,
  Shield,
  Activity,
  UserCheck,
  AlertTriangle,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { formatTimeAgo } from '@/lib/utils';

export default function AuditLogsPage() {
  const { auditLogs, incidents, patrolLogs } = useSafety();
  const { role, isSuperAdmin, isAdmin } = useRole();

  const [activeTab, setActiveTab] = useState<'all' | 'audit' | 'safety' | 'patrol'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isSuperAdmin && !isAdmin && role !== 'security' && role !== 'faculty') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 bg-[#F7F8F6] border border-[#D6D8D5] rounded-xl space-y-3">
        <div className="h-10 w-10 rounded-full bg-[#F0F1EF] border border-[#D6D8D5] flex items-center justify-center text-[#1F2933]">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <h2 className="text-base font-bold text-[#1F2933]">Staff Clearance Required</h2>
        <p className="text-xs text-[#667085] max-w-sm">
          System audit and security event logs are restricted to administrative and safety personnel.
        </p>
      </div>
    );
  }

  // Unified minimal log entries
  const systemLogs = auditLogs.map((l) => ({
    id: `audit-${l.id}`,
    type: 'System Audit' as const,
    title: l.action,
    entity: l.entity,
    details: l.details || `Modified ${l.entity}`,
    actor: `${l.actor} (${l.actorRole})`,
    meta: `IP: ${l.ip}`,
    timestamp: l.timestamp,
    timeAgo: l.timeAgo || formatTimeAgo(l.timestamp),
    badgeVariant: 'bg-[#F0F1EF] text-[#1F2933] border-[#D6D8D5]',
  }));

  const safetyLogs = incidents.map((i) => ({
    id: `incident-${i.id}`,
    type: 'Safety Incident' as const,
    title: `${i.category.toUpperCase()} · ${i.title}`,
    entity: i.location_name,
    details: i.description,
    actor: i.reporter_name || 'Anonymous Reporter',
    meta: `Status: ${i.status} · Severity: ${i.severity}`,
    timestamp: i.created_at,
    timeAgo: formatTimeAgo(i.created_at),
    badgeVariant:
      i.severity === 'critical' || i.severity === 'high'
        ? 'bg-red-50 text-red-800 border-red-200'
        : 'bg-amber-50 text-amber-800 border-amber-200',
  }));

  const patrolLogEntries = patrolLogs.map((p) => ({
    id: `patrol-${p.id}`,
    type: 'Patrol Checkpoint' as const,
    title: `Patrol Sweep: ${p.location_name} (${p.unit})`,
    entity: p.location_name,
    details: `Patrol status: ${p.status} · Unit: ${p.unit}`,
    actor: p.officer_name,
    meta: `Status: ${p.status}`,
    timestamp: p.last_check_in,
    timeAgo: formatTimeAgo(p.last_check_in),
    badgeVariant: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  }));

  const allLogs = [...systemLogs, ...safetyLogs, ...patrolLogEntries].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const filteredLogs = allLogs.filter((log) => {
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'audit' && log.type === 'System Audit') ||
      (activeTab === 'safety' && log.type === 'Safety Incident') ||
      (activeTab === 'patrol' && log.type === 'Patrol Checkpoint');

    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      log.title.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q) ||
      log.actor.toLowerCase().includes(q) ||
      log.entity.toLowerCase().includes(q) ||
      log.meta.toLowerCase().includes(q);

    return matchesTab && matchesQuery;
  });

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#D6D8D5] pb-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#1F2933] flex items-center gap-2">
            <ScrollText className="h-5 w-5 text-[#1F2933]" />
            <span>System &amp; Safety Logs</span>
          </h1>
          <p className="text-xs text-[#667085] mt-0.5">
            Minimal audit log of administrative actions, incident reports, and security events.
          </p>
        </div>

        <div className="text-xs text-[#667085] font-mono">
          Total Logs: <span className="font-semibold text-[#1F2933]">{filteredLogs.length}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#667085]" />
          <Input
            placeholder="Filter logs by keyword, actor, location, or action..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 text-xs bg-white border-[#D6D8D5] rounded-xl shadow-xs"
          />
        </div>

        {/* Tab Pills */}
        <div className="inline-flex p-1 bg-[#F0F1EF] rounded-full border border-[#D6D8D5] gap-1 self-start sm:self-auto shrink-0">
          {[
            { id: 'all', label: 'All Logs' },
            { id: 'audit', label: 'System Audits' },
            { id: 'safety', label: 'Safety Events' },
            { id: 'patrol', label: 'Patrols' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#1F2933] text-white shadow-xs'
                    : 'text-[#667085] hover:text-[#1F2933]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Minimal Log Entries Table / List */}
      <div className="bg-white rounded-xl border border-[#D6D8D5] divide-y divide-[#F0F1EF] overflow-hidden text-xs shadow-xs">
        {filteredLogs.length === 0 ? (
          <div className="p-10 text-center text-xs text-[#667085]">
            No matching log entries recorded.
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-[#F7F8F6] transition-colors"
            >
              <div className="space-y-0.5 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-semibold border ${log.badgeVariant}`}
                  >
                    {log.type}
                  </span>
                  <span className="font-semibold text-xs text-[#1F2933] truncate">
                    {log.title}
                  </span>
                  <span className="text-[#667085] text-[11px] truncate">
                    ({log.entity})
                  </span>
                </div>

                <p className="text-[#667085] text-xs line-clamp-1">{log.details}</p>

                <p className="text-[11px] text-[#667085]">
                  Actor: <strong className="text-[#1F2933] font-medium">{log.actor}</strong> ·{' '}
                  <span className="font-mono text-[10px]">{log.meta}</span>
                </p>
              </div>

              <div className="text-left sm:text-right shrink-0 text-[11px] text-[#667085] flex items-center sm:flex-col sm:items-end gap-1">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-[#667085]" />
                  <span>{log.timeAgo}</span>
                </span>
                <span className="font-mono text-[10px] text-[#667085]">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
