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
      <Card className="border-[#243356] bg-[#0F1026] text-[#F4F1DE] shadow-xl overflow-hidden">
        <CardHeader className="p-4 pb-2 border-b border-[#243356] bg-[#131C38]/80 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#FFD700]" />
            <CardTitle className="text-xs font-bold font-mono text-[#F4F1DE] tracking-wider uppercase">
              ACTIVE PATROL ROSTER &amp; TELEMETRY
            </CardTitle>
          </div>
          <span className="rounded bg-emerald-950/80 border border-emerald-500 px-2 py-0.5 text-[10px] font-mono text-emerald-300 font-bold">
            5 UNITS SYNCED
          </span>
        </CardHeader>

        <CardContent className="p-4 space-y-2.5 max-h-[300px] overflow-y-auto">
          {patrolLogs.map((patrol) => (
            <div
              key={patrol.id}
              className="flex items-center justify-between p-3 rounded-xl bg-[#131C38]/90 border border-[#243356] text-xs hover:border-[#D4AF37]/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`h-2.5 w-2.5 rounded-full ${
                  patrol.status === 'responding'
                    ? 'bg-red-500 animate-ping'
                    : patrol.status === 'patrolling'
                    ? 'bg-emerald-500'
                    : 'bg-[#FFD700]'
                }`} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#F4F1DE]">{patrol.officer_name}</span>
                    <span className="rounded bg-[#0B132B] border border-[#243356] px-1.5 py-0.2 text-[9px] font-mono text-[#C5A059]">
                      {patrol.unit}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#B8B5A3] font-mono flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3 text-[#FFD700]" />
                    <span>{patrol.location_name}</span>
                  </p>
                </div>
              </div>

              <div className="text-right font-mono text-[11px]">
                <span className={`font-bold uppercase ${
                  patrol.status === 'responding'
                    ? 'text-red-400'
                    : patrol.status === 'patrolling'
                    ? 'text-emerald-400'
                    : 'text-[#FFD700]'
                }`}>
                  {patrol.status}
                </span>
                <span className="text-[#C5A059] block text-[10px]">
                  Checked in {patrol.last_check_in}
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Security Activity / Audit Trail */}
      <Card className="border-[#243356] bg-[#0F1026] text-[#F4F1DE] shadow-xl overflow-hidden">
        <CardHeader className="p-4 pb-2 border-b border-[#243356] bg-[#131C38]/80 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4 text-[#FFD700]" />
            <CardTitle className="text-xs font-bold font-mono text-[#F4F1DE] tracking-wider uppercase">
              RECENT SECURITY DISPATCH &amp; ACCESS EVENTS
            </CardTitle>
          </div>
          <span className="text-[10px] font-mono text-[#C5A059]">
            REAL-TIME FEED
          </span>
        </CardHeader>

        <CardContent className="p-4 space-y-2.5 max-h-[300px] overflow-y-auto">
          {auditLogs.slice(0, 5).map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-xl bg-[#131C38]/70 border border-[#243356] text-xs space-y-1"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono font-bold text-xs text-[#FFD700] truncate">
                  {log.action}
                </span>
                <span className="text-[10px] font-mono text-[#C5A059] shrink-0 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{log.timeAgo || 'Just now'}</span>
                </span>
              </div>
              <p className="text-[11px] text-[#B8B5A3] line-clamp-1">{log.details || log.entity}</p>
              <div className="flex items-center justify-between text-[10px] font-mono text-[#C5A059] pt-1 border-t border-[#243356]/40">
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
