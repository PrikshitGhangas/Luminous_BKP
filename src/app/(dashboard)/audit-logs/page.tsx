'use client';

import React from 'react';
import { useSafety } from '@/lib/context/safety-context';
import { useRole } from '@/lib/hooks/use-role';
import { ScrollText, ShieldAlert, Clock } from 'lucide-react';
import { formatTimeAgo } from '@/lib/utils';

export default function AuditLogsPage() {
  const { auditLogs } = useSafety();
  const { role, isSuperAdmin, isAdmin } = useRole();

  if (!isSuperAdmin && !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 bg-[#F4F5F6] border border-red-500/30 rounded-2xl space-y-4">
        <div className="h-14 w-14 rounded-full bg-red-950/80 border border-red-500 flex items-center justify-center text-red-400">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold font-mono text-[#202226]">RESTRICTED: ADMINISTRATOR CLEARANCE REQUIRED</h2>
        <p className="text-xs text-[#555960] max-w-md font-mono">
          Role &apos;{role}&apos; is not authorized to inspect immutable governance audit records.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-[#D0D1D6] pb-4">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#202226] font-mono flex items-center gap-2">
          <ScrollText className="h-6 w-6 text-[#B45309]" />
          <span>IMMUTABLE SYSTEM AUDIT TRAIL</span>
        </h1>
        <p className="text-xs text-[#555960] mt-1 font-mono">
          Cryptographically timestamped record of AI triage events, administrative mutations, and emergency dispatches
        </p>
      </div>

      <div className="divide-y divide-[#243356] bg-[#F4F5F6] rounded-xl border border-[#D0D1D6] overflow-hidden text-xs">
        {auditLogs.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#555960] font-mono">No audit logs recorded.</div>
        ) : (
          auditLogs.map((log) => (
            <div
              key={log.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-white transition-colors gap-2"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-[#B45309] text-xs">{log.action}</span>
                  <span className="text-[#B45309] font-mono text-[10px]">({log.entity})</span>
                </div>
                {log.details && (
                  <p className="text-[#202226] text-xs font-mono">{log.details}</p>
                )}
                <p className="text-[#555960] text-[11px]">
                  Actor: <strong className="text-[#202226]">{log.actor}</strong> ({log.actorRole})
                </p>
              </div>

              <div className="text-left sm:text-right font-mono text-[11px] text-[#B45309] shrink-0">
                <p>Node IP: {log.ip}</p>
                <p className="flex items-center sm:justify-end gap-1 text-[#555960]">
                  <Clock className="h-3 w-3" />
                  <span>{log.timeAgo || formatTimeAgo(log.timestamp)}</span>
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
