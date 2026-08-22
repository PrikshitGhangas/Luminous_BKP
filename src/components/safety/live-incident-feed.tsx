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
      <CardHeader className="p-4 pb-2 border-b border-[#D6D8D5] bg-[#F7F8F6] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2">
          <Radio className="h-4 w-4 text-[#8a6d1a]" />
          <CardTitle className="text-xs font-bold text-[#1F2933] flex items-center gap-2">
            <span>Campus Incident Log</span>
            <span className="rounded-full bg-[#F0F1EF] border border-[#D6D8D5] px-2 py-0.5 text-[10px] text-[#667085]">
              {filtered.length} Reports
            </span>
          </CardTitle>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={simulateIncomingIncident}
            variant="outline"
            className="h-7 text-xs border-[#D6D8D5] text-[#667085] hover:text-[#1F2933] gap-1 rounded-lg cursor-pointer"
            title="Simulate incoming campus incident event"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Simulate Report</span>
          </Button>

          <Button
            size="sm"
            onClick={onOpenReportModal}
            className="h-7 text-xs bg-[#1F2933] hover:bg-[#111827] text-white gap-1 rounded-lg shadow-xs cursor-pointer"
          >
            <Plus className="h-3 w-3" />
            <span>Report Issue</span>
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
                {/* Top Row: Title, Status, Time */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-[#1F2933] line-clamp-1">
                      {incident.title}
                    </h4>
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-medium capitalize ${
                        incident.status === 'responding'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : isResolved
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-[#F0F1EF] text-[#667085] border border-[#D6D8D5]'
                      }`}
                    >
                      {incident.status.replace('_', ' ')}
                    </span>
                  </div>

                  <span className="text-[10px] text-[#667085] shrink-0 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatTimeAgo(incident.created_at)}</span>
                  </span>
                </div>

                <p className="text-[11px] text-[#667085] line-clamp-2 leading-relaxed">
                  {incident.description}
                </p>



                {/* Bottom Row: Location, Officer, Action Button */}
                <div className="flex items-center justify-between text-[11px] text-[#667085] pt-2 border-t border-[#D6D8D5]">
                  <span className="flex items-center gap-1 truncate max-w-[170px]">
                    <MapPin className="h-3 w-3 text-[#8a6d1a] shrink-0" />
                    <span className="truncate">{incident.location_name}</span>
                  </span>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {!isResolved && incident.status !== 'responding' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatchResponder(incident.id);
                        }}
                        className="px-2.5 py-0.5 rounded-md bg-[#F0F1EF] hover:bg-[#E8E9E7] text-[#1F2933] font-medium text-[10px] border border-[#D6D8D5] cursor-pointer"
                      >
                        Respond
                      </button>
                    )}

                    {!isResolved && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          resolveIncident(incident.id);
                        }}
                        className="px-2.5 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-medium text-[10px] border border-emerald-200 cursor-pointer"
                      >
                        Resolve
                      </button>
                    )}

                    <span className="text-[11px] font-semibold text-[#8a6d1a] hover:underline">
                      View →
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