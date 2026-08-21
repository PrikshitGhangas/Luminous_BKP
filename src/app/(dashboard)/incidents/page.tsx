'use client';

import React, { useState } from 'react';
import { useSafety } from '@/lib/context/safety-context';
import { Incident } from '@/lib/types';
import { SeverityBadge } from '@/components/shared/severity-badge';
import { IncidentReportModal } from '@/components/safety/incident-report-modal';
import { IncidentDetailsModal } from '@/components/safety/incident-details-modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { formatTimeAgo } from '@/lib/utils';
import {
  Flame,
  Plus,
  Search,
  Sparkles,
  MapPin,
  Clock,
} from 'lucide-react';

import { useRole } from '@/lib/hooks/use-role';

export default function IncidentsPage() {
  const { incidents } = useSafety();
  const { user, isSuperAdmin, isAdmin, isSecurity } = useRole();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const isPrivileged = isSuperAdmin || isAdmin || isSecurity;

  // Incident Scoping: Non-privileged users only see incidents they reported or campus-wide critical emergencies
  const scopedIncidents = incidents.filter((i) => {
    if (isPrivileged) return true;
    if (i.severity === 'critical') return true;
    return i.reporter_id === user?.id || (user?.full_name && i.reporter_name === user?.full_name);
  });

  const filtered = scopedIncidents.filter((i) => {
    if (filterSeverity !== 'all' && i.severity !== filterSeverity) return false;

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

  const handleOpenDetails = (inc: Incident) => {
    setSelectedIncident(inc);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D0D1D6] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#202226] font-mono flex items-center gap-2">
            <Flame className="h-6 w-6 text-red-500" />
            <span>INCIDENT MANAGEMENT SYSTEM</span>
          </h1>
          <p className="text-xs text-[#555960] mt-1 font-mono">
            Autonomous Gemini 3.7 Flash triage, rapid dispatch, and complete audit lifecycle
          </p>
        </div>

        <Button
          onClick={() => setIsReportModalOpen(true)}
          className="bg-gradient-to-r from-[#F4C430] via-[#EAB308] to-[#D4AF37] text-[#0B132B] font-bold text-xs gap-1.5 shadow-lg shadow-[#D4AF37]/20"
        >
          <Plus className="h-4 w-4" />
          <span>Report Safety Incident</span>
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#B45309]" />
          <Input
            placeholder="Search by incident number, title, category, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-1 bg-[#F4F5F6] border border-[#D0D1D6] p-1 rounded-lg text-xs font-mono shrink-0">
          {['all', 'critical', 'high', 'medium', 'low'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-2.5 py-1 rounded capitalize transition-colors cursor-pointer text-xs ${
                filterSeverity === sev
                  ? 'bg-gradient-to-r from-[#EAB308] to-[#D4AF37] text-[#0B132B] font-bold shadow-xs'
                  : 'text-[#555960] hover:text-[#B45309]'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Incident List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#555960] font-mono border border-[#D0D1D6] rounded-xl bg-[#F4F5F6]">
            No incidents matching search and filter criteria.
          </div>
        ) : (
          filtered.map((incident) => {
            const isResolved = incident.status === 'resolved' || incident.status === 'closed';

            return (
              <Card
                key={incident.id}
                onClick={() => handleOpenDetails(incident)}
                className={`transition-all hover:border-[#EAB308] cursor-pointer ${
                  incident.severity === 'critical'
                    ? 'border-l-4 border-l-red-500 bg-white/95'
                    : incident.severity === 'high'
                    ? 'border-l-4 border-l-amber-500 bg-white/95'
                    : 'border-l-4 border-l-[#D4AF37] bg-white/95'
                }`}
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-[#B45309]">
                          {incident.incident_number}
                        </span>
                        <SeverityBadge
                          severity={incident.severity}
                          isAiClassified={!!incident.ai_confidence}
                          size="sm"
                        />
                        <span className="rounded bg-[#F4F5F6] border border-[#D0D1D6] px-2 py-0.5 text-[10px] font-bold uppercase font-mono text-[#202226]">
                          {incident.category}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase font-mono ${
                            incident.status === 'responding'
                              ? 'bg-amber-950 text-[#B45309] border border-[#EAB308] animate-pulse'
                              : isResolved
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-[#E7E8EB] text-[#555960] border border-[#D0D1D6]'
                          }`}
                        >
                          {incident.status}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-[#202226]">
                        {incident.title}
                      </h3>
                    </div>

                    <span className="text-[11px] text-[#B45309] font-mono shrink-0 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatTimeAgo(incident.created_at)}</span>
                    </span>
                  </div>

                  <p className="text-xs text-[#555960] leading-relaxed">
                    {incident.description}
                  </p>

                  {incident.ai_summary && (
                    <div className="rounded-lg bg-[#F4F5F6] border border-[#EAB308]/30 p-2.5 text-xs text-[#202226] flex items-start gap-2">
                      <Sparkles className="h-4 w-4 text-[#B45309] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-[#B45309]">Gemini Triage: </span>
                        <span className="text-[#202226]">{incident.ai_summary}</span>
                        <span className="ml-2 text-[10px] font-mono text-[#B45309]">
                          (Confidence: {Math.round((incident.ai_confidence || 0.95) * 100)}%)
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-[#D0D1D6] text-xs text-[#555960]">
                    <div className="flex items-center gap-4 flex-wrap font-mono">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-[#B45309]" />
                        <span>{incident.location_name}</span>
                      </span>
                      <span>
                        Reporter:{' '}
                        {incident.is_anonymous && !isSuperAdmin
                          ? '[ANONYMOUS REPORTER - PROTECTED]'
                          : incident.reporter_name || 'Anonymous Student'}
                      </span>
                      {incident.assigned_officer_name && (
                        <span className="text-[#B45309]">
                          Assigned: {incident.assigned_officer_name}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-mono text-[#B45309] font-bold">
                      <span>View Full Details →</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
