'use client';

import React, { useState } from 'react';
import { Incident, TimeFilter } from '@/lib/types';
import { useSafety } from '@/lib/context/safety-context';
import { SeverityBadge } from '@/components/shared/severity-badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatTimeAgo } from '@/lib/utils';
import {
  Radio,
  Clock,
  MapPin,
  Sparkles,
  Search,
  Plus,
  RefreshCw,
} from 'lucide-react';

interface LiveIncidentFeedProps {
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
  onOpenReportModal: () => void;
  selectedIncidentId?: string;
  severityFilter: string;
  timeFilter: TimeFilter;
}

export function LiveIncidentFeed({
  incidents,
  onSelectIncident,
  onOpenReportModal,
  selectedIncidentId,
  severityFilter,
  timeFilter,
}: LiveIncidentFeedProps) {
  const { dispatchResponder, resolveIncident, simulateIncomingIncident } = useSafety();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter incidents
  const filtered = incidents.filter((inc) => {
    if (severityFilter !== 'all' && inc.severity !== severityFilter.toLowerCase()) {
      return false;
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchNumber = inc.incident_number.toLowerCase().includes(q);
      const matchTitle = inc.title.toLowerCase().includes(q);
      const matchLocation = inc.location_name.toLowerCase().includes(q);
      const matchCategory = inc.category.toLowerCase().includes(q);
      if (!matchNumber && !matchTitle && !matchLocation && !matchCategory) return false;
    }

    // Time filter
    const now = Date.now();
    const incTime = new Date(inc.created_at).getTime();
    const diffHours = (now - incTime) / (1000 * 60 * 60);

    if (timeFilter === 'today' && diffHours > 24) return false;
    if (timeFilter === '7days' && diffHours > 24 * 7) return false;
    if (timeFilter === '30days' && diffHours > 24 * 30) return false;

    return true;
  });

  return (
    <Card className="border-[#243356] bg-[#0F1026] text-[#F4F1DE] shadow-2xl overflow-hidden flex flex-col h-full">
      {/* Header */}
      <CardHeader className="p-4 pb-2 border-b border-[#243356] bg-[#131C38]/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2">
          <Radio className="h-4 w-4 text-[#FFD700] animate-pulse" />
          <CardTitle className="text-xs font-bold font-mono text-[#F4F1DE] tracking-wider uppercase flex items-center gap-2">
            <span>LIVE INCIDENT STREAM</span>
            <span className="rounded bg-[#1C2541] border border-[#243356] px-2 py-0.5 text-[10px] text-[#FFD700]">
              {filtered.length} ACTIVE
            </span>
          </CardTitle>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={simulateIncomingIncident}
            className="h-7 text-[10px] font-mono font-bold bg-[#131C38] hover:bg-[#1C2541] border border-[#D4AF37]/40 text-[#FFD700] gap-1"
            title="Simulate incoming real-time incident event"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Simulate Alert</span>
          </Button>

          <Button
            size="sm"
            onClick={onOpenReportModal}
            className="h-7 text-[10px] font-mono font-bold bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-[#0B132B] gap-1 shadow-sm"
          >
            <Plus className="h-3 w-3" />
            <span>Report Incident</span>
          </Button>
        </div>
      </CardHeader>

      {/* Quick Search in Feed */}
      <div className="p-3 border-b border-[#243356] bg-[#0B132B]/60">
        <div className="relative">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-[#C5A059]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search incident number, title, or location..."
            className="h-8 w-full rounded-lg border border-[#243356] bg-[#131C38] pl-8 pr-2.5 text-xs text-[#F4F1DE] placeholder:text-[#7A786B] focus:border-[#D4AF37] focus:outline-none"
          />
        </div>
      </div>

      {/* Feed List Items */}
      <CardContent className="p-3 flex-1 overflow-y-auto space-y-2.5 max-h-[520px]">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#B8B5A3] font-mono">
            No incidents match current filter criteria.
          </div>
        ) : (
          filtered.map((incident) => {
            const isResolved = incident.status === 'resolved' || incident.status === 'closed';
            const isSelected = selectedIncidentId === incident.id;
            const isCritical = incident.severity === 'critical';

            return (
              <div
                key={incident.id}
                onClick={() => onSelectIncident(incident)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 relative ${
                  isSelected
                    ? 'border-[#D4AF37] bg-[#1C2541] shadow-lg shadow-[#D4AF37]/10'
                    : isCritical
                    ? 'border-l-4 border-l-red-500 border-[#243356] bg-[#131C38]/95 hover:border-[#D4AF37]/50'
                    : incident.severity === 'high'
                    ? 'border-l-4 border-l-amber-500 border-[#243356] bg-[#131C38]/95 hover:border-[#D4AF37]/50'
                    : incident.severity === 'medium'
                    ? 'border-l-4 border-l-blue-500 border-[#243356] bg-[#131C38]/95 hover:border-[#D4AF37]/50'
                    : 'border-l-4 border-l-emerald-500 border-[#243356] bg-[#131C38]/95 hover:border-[#D4AF37]/50'
                }`}
              >
                {/* Top Row: ID, Severity, Status, Time */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-mono text-xs font-bold text-[#FFD700]">
                      {incident.incident_number}
                    </span>
                    <SeverityBadge severity={incident.severity} size="sm" isAiClassified={!!incident.ai_confidence} />
                    <span
                      className={`rounded-full px-2 py-0.2 text-[9px] font-mono font-bold uppercase ${
                        incident.status === 'responding'
                          ? 'bg-amber-950 text-[#FFD700] border border-[#D4AF37] animate-pulse'
                          : isResolved
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-[#1C2541] text-[#B8B5A3] border border-[#243356]'
                      }`}
                    >
                      {incident.status}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono text-[#C5A059] shrink-0 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatTimeAgo(incident.created_at)}</span>
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h4 className="text-xs font-bold text-[#F4F1DE] line-clamp-1">
                    {incident.title}
                  </h4>
                  <p className="text-[11px] text-[#B8B5A3] line-clamp-2 mt-0.5">
                    {incident.description}
                  </p>
                </div>

                {/* AI Assessment Pill if present */}
                {incident.ai_summary && (
                  <div className="rounded-lg bg-[#0F1026] border border-[#D4AF37]/30 p-2 text-[11px] text-[#F4F1DE] flex items-start gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-[#FFD700] shrink-0 mt-0.5" />
                    <span className="line-clamp-1 text-[#F4F1DE]">
                      <strong className="text-[#FFD700]">AI:</strong> {incident.ai_summary}
                    </span>
                  </div>
                )}

                {/* Bottom Row: Location, Officer, Action Button */}
                <div className="flex items-center justify-between text-[10px] font-mono text-[#C5A059] pt-1.5 border-t border-[#243356]">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-[#FFD700]" />
                    <span className="truncate max-w-[140px]">{incident.location_name}</span>
                  </span>

                  <div className="flex items-center gap-1.5">
                    {!isResolved && incident.status !== 'responding' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatchResponder(incident.id);
                        }}
                        className="px-2 py-0.5 rounded bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#FFD700] font-bold hover:bg-[#D4AF37]/30 cursor-pointer"
                      >
                        Dispatch Unit
                      </button>
                    )}

                    {!isResolved && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          resolveIncident(incident.id);
                        }}
                        className="px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-600 text-emerald-300 font-bold hover:bg-emerald-900 cursor-pointer"
                      >
                        Resolve
                      </button>
                    )}

                    <span className="text-[#FFD700] font-bold hover:underline">
                      Inspect →
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
