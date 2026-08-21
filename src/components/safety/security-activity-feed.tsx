'use client';

import React from 'react';
import { useSafety } from '@/lib/context/safety-context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ShieldCheck, Radio, MapPin, Clock } from 'lucide-react';

export function SecurityActivityFeed() {
  const { patrolLogs, auditLogs } = useSafety();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Active Patrol Units Telemetry */}
      <Card className="border-[#AEB0B7] bg-white text-[#202226] shadow-sm overflow-hidden">
        <CardHeader className="p-4 pb-2 border-b border-[#D0D1D6] bg-[#F4F5F6] flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#B45309]" />
            <CardTitle className="text-xs font-bold text-[#202226] tracking-wider uppercase">
              Active Patrol Roster &amp; Telemetry
            </CardTitle>
          </div>
          <span className="rounded bg-[#ECFDF5] border border-[#10B981] px-2 py-0.5 text-[10px] text-[#067a4f] font-bold">
            5 UNITS SYNCED
          </span>
        </CardHeader>

        <CardContent className="p-4 space-y-2.5 max-h-[300px] overflow-y-auto">
          {patrolLogs.map((patrol) => (
            <div
              key={patrol.id}
              className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#D0D1D6] text-xs hover:border-[#EAB308]/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`h-2.5 w-2.5 rounded-full ${
                  patrol.status === 'responding'
                    ? 'bg-[#DC2626] animate-ping'
                    : patrol.status === 'patrolling'
                    ? 'bg-[#10B981]'
                    : 'bg-[#EAB308]'
                }`} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#202226]">{patrol.officer_name}</span>
                    <span className="rounded bg-[#F4F5F6] border border-[#D0D1D6] px-1.5 py-0.2 text-[9px] text-[#555960]">
                      {patrol.unit}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#555960] flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3 text-[#B45309]" />
                    <span>{patrol.location_name}</span>
                  </p>
                </div>
              </div>

              <div className="text-right text-[11px]">
                <span className={`font-bold uppercase ${
                  patrol.status === 'responding'
                    ? 'text-[#DC2626]'
                    : patrol.status === 'patrolling'
                    ? 'text-[#067a4f]'
                    : 'text-[#B45309]'
                }`}>
                  {patrol.status}
                </span>
                <span className="text-[#555960] block text-[10px]">
                  Checked in {patrol.last_check_in}
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Security Activity / Audit Trail */}
      <Card className="border-[#AEB0B7] bg-white text-[#202226] shadow-sm overflow-hidden">
        <CardHeader className="p-4 pb-2 border-b border-[#D0D1D6] bg-[#F4F5F6] flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-[#B45309]" />
            <CardTitle className="text-xs font-bold text-[#202226] tracking-wider uppercase">
              Recent Security Dispatch &amp; Access Events
            </CardTitle>
          </div>
          <span className="text-[10px] text-[#555960]">
            REAL-TIME FEED
          </span>
        </CardHeader>

        <CardContent className="p-4 space-y-2.5 max-h-[300px] overflow-y-auto">
          {auditLogs.slice(0, 5).map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-xl bg-[#F4F5F6] border border-[#D0D1D6] text-xs space-y-1"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-xs text-[#B45309] truncate">
                  {log.action}
                </span>
                <span className="text-[10px] text-[#555960] shrink-0 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{log.timeAgo || 'Just now'}</span>
                </span>
              </div>
              <p className="text-[11px] text-[#555960] line-clamp-1">{log.details || log.entity}</p>
              <div className="flex items-center justify-between text-[10px] text-[#555960] pt-1 border-t border-[#D0D1D6]">
                <span>By: {log.actor}</span>
                <span>Node: {log.ip}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}