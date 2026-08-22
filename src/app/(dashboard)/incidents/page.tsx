'use client';

import React, { useState } from 'react';
import { useSafety } from '@/lib/context/safety-context';
import { Incident } from '@/lib/types';
import { IncidentReportModal } from '@/components/safety/incident-report-modal';
import { IncidentDetailsModal } from '@/components/safety/incident-details-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatTimeAgo } from '@/lib/utils';
import {
  Flame,
  Plus,
  Search,
  MapPin,
  Clock,
  ChevronDown,
  FileText,
  User,
  Shield,
} from 'lucide-react';
import { useRole } from '@/lib/hooks/use-role';

export default function IncidentsPage() {
  const { incidents } = useSafety();
  const { user, isSuperAdmin, isAdmin, isSecurity } = useRole();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusTab, setStatusTab] = useState<'all' | 'active' | 'resolved'>('all');
  const [expandedIncidentIds, setExpandedIncidentIds] = useState<Record<string, boolean>>({});
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const isPrivileged = isSuperAdmin || isAdmin || isSecurity;

  const scopedIncidents = incidents.filter((i) => {
    if (isPrivileged) return true;
    if (i.severity === 'critical') return true;
    return i.reporter_id === user?.id || (user?.full_name && i.reporter_name === user?.full_name);
  });

  const filtered = scopedIncidents.filter((i) => {
    const isResolved = i.status === 'resolved' || i.status === 'closed';
    if (statusTab === 'active' && isResolved) return false;
    if (statusTab === 'resolved' && !isResolved) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        i.title.toLowerCase().includes(q) ||
        i.location_name.toLowerCase().includes(q) ||
        i.incident_number.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedIncidentIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenDetails = (inc: Incident) => {
    setSelectedIncident(inc);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D6D8D5] pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1F2933] flex items-center gap-2">
            <Flame className="h-6 w-6 text-red-600" />
            <span>Incidents Queue</span>
          </h1>
          <p className="text-xs text-[#667085] mt-0.5">
            Overview and status records of active campus security events and safety reports.
          </p>
        </div>

        <Button
          onClick={() => setIsReportModalOpen(true)}
          className="bg-[#1F2933] hover:bg-[#111827] text-white text-xs font-semibold gap-1.5 rounded-lg shadow-xs cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Report Safety Incident</span>
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#667085]" />
          <Input
            placeholder="Search by incident title, building, or reporter..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 text-xs border-[#D6D8D5] bg-white rounded-xl shadow-xs"
          />
        </div>

        {/* Status Segmented Pills */}
        <div className="inline-flex p-1 bg-[#F0F1EF] rounded-full border border-[#D6D8D5] gap-1 shrink-0">
          {(['all', 'active', 'resolved'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusTab(tab)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all capitalize cursor-pointer ${
                statusTab === tab
                  ? 'bg-[#1F2933] text-white shadow-xs'
                  : 'text-[#667085] hover:text-[#1F2933]'
              }`}
            >
              {tab === 'all' ? 'All Incidents' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Incident List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#667085] border border-[#D6D8D5] rounded-xl bg-white shadow-xs">
            No incident reports found matching the criteria.
          </div>
        ) : (
          filtered.map((incident) => {
            const isResolved = incident.status === 'resolved' || incident.status === 'closed';
            const isExpanded = !!expandedIncidentIds[incident.id];

            return (
              <div
                key={incident.id}
                className="p-4 rounded-xl border border-[#D6D8D5] bg-white transition-all space-y-3 shadow-xs"
              >
                {/* Top Row: Title, Status, Time */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h2 className="text-sm font-bold text-[#1F2933]">
                      {incident.title}
                    </h2>
                    <div className="flex items-center gap-3 text-xs text-[#667085]">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-[#667085]" />
                        <span>{incident.location_name}</span>
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-[#667085]" />
                        <span>{formatTimeAgo(incident.created_at)}</span>
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold shrink-0 capitalize ${
                      incident.status === 'dispatched' || incident.status === 'investigating' || incident.status === 'arrived'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : isResolved
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-[#F0F1EF] text-[#667085] border border-[#D6D8D5]'
                    }`}
                  >
                    {incident.status.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-xs text-[#667085] leading-relaxed">
                  {incident.description}
                </p>

                {/* Collapsible Dropdown Trigger */}
                <div className="pt-2 border-t border-[#D6D8D5] flex items-center justify-between">
                  <button
                    onClick={(e) => toggleExpand(incident.id, e)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#1F2933] hover:underline cursor-pointer"
                  >
                    <span>{isExpanded ? 'Hide Technical Log' : 'View Incident Details & Log'}</span>
                    <ChevronDown
                      className={`h-4 w-4 text-[#667085] transition-transform duration-200 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  <button
                    onClick={() => handleOpenDetails(incident)}
                    className="text-xs font-medium text-[#667085] hover:text-[#1F2933] cursor-pointer"
                  >
                    Full Incident Report →
                  </button>
                </div>

                {/* Collapsed Technical Details & Operational Log */}
                {isExpanded && (
                  <div className="mt-2 p-3.5 rounded-lg bg-[#F7F8F6] border border-[#D6D8D5] text-xs space-y-2 animate-in fade-in duration-150">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-[11px] text-[#667085] block">Reference Number</span>
                        <strong className="text-[#1F2933]">{incident.incident_number}</strong>
                      </div>
                      <div>
                        <span className="text-[11px] text-[#667085] block">Reported By</span>
                        <strong className="text-[#1F2933]">
                          {incident.is_anonymous && !isSuperAdmin
                            ? 'Anonymous Reporter'
                            : incident.reporter_name || 'Anonymous Reporter'}
                        </strong>
                      </div>
                      <div>
                        <span className="text-[11px] text-[#667085] block">Assigned Officer</span>
                        <strong className="text-[#1F2933]">
                          {incident.assigned_officer_name || 'Campus Patrol Dispatch'}
                        </strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modals */}
      <IncidentReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSuccess={(id) => {
          const inc = incidents.find((i) => i.id === id);
          if (inc) setSelectedIncident(inc);
        }}
      />

      <IncidentDetailsModal
        incident={selectedIncident}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
      />
    </div>
  );
}
