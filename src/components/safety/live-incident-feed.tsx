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
    <Card className="border-[#AEB0B7] bg-white text-[#202226] shadow-md overflow-hidden flex flex-col h-full">
      {/* Header */}
      <CardHeader className="p-4 pb-2 border-b border-[#D0D1D6] bg-[#F4F5F6] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2">
          <Radio className="h-4 w-4 text-[#B45309] animate-pulse" />
          <CardTitle className="text-xs font-bold text-[#202226] tracking-wider uppercase flex items-center gap-2">
            <span>Live Incident Stream</span>
            <span className="rounded bg-[#E7E8EB] border border-[#D0D1D6] px-2 py-0.5 text-[10px] text-[#202226]">
              {filtered.length} ACTIVE
            </span>
          </CardTitle>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={simulateIncomingIncident}
            className="h-7 text-[10px] font-mono font-bold bg-white hover:bg-[#E7E8EB] border border-[#EAB308] text-[#B45309] gap-1"
            title="Simulate incoming real-time incident event"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Simulate Alert</span>
          </Button>

          <Button
            size="sm"
            onClick={onOpenReportModal}
            className="h-7 text-[10px] font-mono font-bold bg-gradient-to-r from-[#EAB308] to-[#D4AF37] text-[#202226] gap-1 shadow-sm"
          >
            <Plus className="h-3 w-3" />
            <span>Report Incident</span>
          </Button>
        </div>
      </CardHeader>

      {/* Quick Search in Feed */}
      <div className="p-3 border-b border-[#D0D1D6] bg-white">
        <div className="relative">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-[#555960]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search incident number, title, or location..."
            className="h-8 w-full rounded-lg border border-[#D0D1D6] bg-[#E7E8EB] pl-8 pr-2.5 text-xs text-[#202226] placeholder:text-[#8A9199] focus:border-[#EAB308] focus:outline-none"
          />
        </div>
      </div>

      {/* Feed List Items */}
      <CardContent className="p-3 flex-1 overflow-y-auto space-y-2.5 max-h-[520px]">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#555960]">
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
                className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 relative bg-white shadow-sm ${
                  isSelected
                    ? 'border-[#EAB308] ring-1 ring-[#EAB308]'
                    : isCritical
                    ? 'border-l-4 border-l-[#DC2626] border-[#D0D1D6] hover:border-[#EAB308]/50 hover:shadow-md'
                    : incident.severity === 'high'
                    ? 'border-l-4 border-l-[#F59E0B] border-[#D0D1D6] hover:border-[#EAB308]/50 hover:shadow-md'
                    : incident.severity === 'medium'
                    ? 'border-l-4 border-l-[#3B82F6] border-[#D0D1D6] hover:border-[#EAB308]/50 hover:shadow-md'
                    : 'border-l-4 border-l-[#10B981] border-[#D0D1D6] hover:border-[#EAB308]/50 hover:shadow-md'
                }`}
              >
                {/* Top Row: ID, Severity, Status, Time */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-mono text-xs font-bold text-[#B45309]">
                      {incident.incident_number}
                    </span>
                    <SeverityBadge severity={incident.severity} size="sm" isAiClassified={!!incident.ai_confidence} />
                    <span
                      className={`rounded-full px-2 py-0.2 text-[9px] font-mono font-bold uppercase ${
                        incident.status === 'responding'
                          ? 'bg-[#FEF3C7] text-[#B45309] border border-[#EAB308] animate-pulse'
                          : isResolved
                          ? 'bg-[#ECFDF5] text-[#067a4f] border border-[#10B981]'
                          : 'bg-[#E7E8EB] text-[#555960] border border-[#D0D1D6]'
                      }`}
                    >
                      {incident.status}
                    </span>
                  </div>

                  <span className="text-[10px] text-[#555960] shrink-0 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatTimeAgo(incident.created_at)}</span>
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h4 className="text-xs font-bold text-[#202226] line-clamp-1">
                    {incident.title}
                  </h4>
                  <p className="text-[11px] text-[#555960] line-clamp-2 mt-0.5">
                    {incident.description}
                  </p>
                </div>

                {/* AI Assessment Pill if present */}
                {incident.ai_summary && (
                  <div className="rounded-lg bg-[#FEFCE8] border border-[#EAB308]/40 p-2 text-[11px] text-[#202226] flex items-start gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-[#B45309] shrink-0 mt-0.5" />
                    <span className="line-clamp-1 text-[#202226]">
                      <strong className="text-[#B45309]">AI:</strong> {incident.ai_summary}
                    </span>
                  </div>
                )}

                {/* Bottom Row: Location, Officer, Action Button */}
                <div className="flex items-center justify-between text-[10px] text-[#555960] pt-1.5 border-t border-[#D0D1D6]">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-[#B45309]" />
                    <span className="truncate max-w-[140px]">{incident.location_name}</span>
                  </span>

                  <div className="flex items-center gap-1.5">
                    {!isResolved && incident.status !== 'responding' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatchResponder(incident.id);
                        }}
                        className="px-2 py-0.5 rounded bg-[#FEF3C7] border border-[#EAB308]/40 text-[#B45309] font-bold hover:bg-[#FDE68A] cursor-pointer"
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
                        className="px-2 py-0.5 rounded bg-[#ECFDF5] border border-[#10B981] text-[#067a4f] font-bold hover:bg-[#D1FAE5] cursor-pointer"
                      >
                        Resolve
                      </button>
                    )}

                    <span className="font-bold text-[#B45309] hover:underline">
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