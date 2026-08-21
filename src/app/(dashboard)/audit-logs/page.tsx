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
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 bg-[#0F1026] border border-red-500/30 rounded-2xl space-y-4">
        <div className="h-14 w-14 rounded-full bg-red-950/80 border border-red-500 flex items-center justify-center text-red-400">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold font-mono text-[#F4F1DE]">RESTRICTED: ADMINISTRATOR CLEARANCE REQUIRED</h2>
        <p className="text-xs text-[#B8B5A3] max-w-md font-mono">
          Role &apos;{role}&apos; is not authorized to inspect immutable governance audit records.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-[#243356] pb-4">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F4F1DE] font-mono flex items-center gap-2">
          <ScrollText className="h-6 w-6 text-[#FFD700]" />
          <span>IMMUTABLE SYSTEM AUDIT TRAIL</span>
        </h1>
        <p className="text-xs text-[#B8B5A3] mt-1 font-mono">
          Cryptographically timestamped record of AI triage events, administrative mutations, and emergency dispatches
        </p>
      </div>

      <div className="divide-y divide-[#243356] bg-[#0F1026] rounded-xl border border-[#243356] overflow-hidden text-xs">
        {auditLogs.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#B8B5A3] font-mono">No audit logs recorded.</div>
        ) : (
          auditLogs.map((log) => (
            <div
              key={log.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-[#131C38] transition-colors gap-2"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-[#FFD700] text-xs">{log.action}</span>
                  <span className="text-[#C5A059] font-mono text-[10px]">({log.entity})</span>
                </div>
                {log.details && (
                  <p className="text-[#F4F1DE] text-xs font-mono">{log.details}</p>
                )}
                <p className="text-[#B8B5A3] text-[11px]">
                  Actor: <strong className="text-[#F4F1DE]">{log.actor}</strong> ({log.actorRole})
                </p>
              </div>

              <div className="text-left sm:text-right font-mono text-[11px] text-[#C5A059] shrink-0">
                <p>Node IP: {log.ip}</p>
                <p className="flex items-center sm:justify-end gap-1 text-[#B8B5A3]">
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
