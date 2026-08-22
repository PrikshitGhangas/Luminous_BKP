'use client';

import React, { useState } from 'react';
import { Incident } from '@/lib/types';
import { useSafety } from '@/lib/context/safety-context';
import { SeverityBadge } from '@/components/shared/severity-badge';
import { Button } from '@/components/ui/button';
import { formatTimeAgo } from '@/lib/utils';
import {
  X,
  Flame,
  Sparkles,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle,
  Radio,
  User,
  CheckCheck,
} from 'lucide-react';

import { useRole } from '@/lib/hooks/use-role';

interface IncidentDetailsModalProps {
  incident: Incident | null;
  isOpen: boolean;
  onClose: () => void;
}

export function IncidentDetailsModal({ incident, isOpen, onClose }: IncidentDetailsModalProps) {
  const { updateIncidentStatus, dispatchResponder, resolveIncident, broadcastEmergencyAlert } = useSafety();
  const { role, isSuperAdmin, isAdmin, isSecurity } = useRole();
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  if (!isOpen || !incident) return null;

  const canManageIncident = isSuperAdmin || isAdmin || isSecurity;
  const canBroadcastAlert = isSuperAdmin || isAdmin || isSecurity;
  const isResolved = incident.status === 'resolved' || incident.status === 'closed';
  const isCritical = incident.severity === 'critical';
  const displayReporter = incident.is_anonymous && !isSuperAdmin
    ? '[ANONYMOUS REPORTER - PROTECTED]'
    : incident.reporter_name || 'Anonymous Student';

  const getReporterRole = (reporterId?: string, reporterName?: string): string => {
    if (reporterName?.includes('Prof.') || reporterName?.includes('Dr.') || reporterId?.includes('faculty')) return 'Faculty';
    if (reporterName?.includes('Admin') || reporterName?.includes('Chancellor') || reporterId?.includes('admin')) return 'Admin';
    if (reporterName?.includes('Officer') || reporterName?.includes('Security') || reporterId?.includes('security')) return 'Security';
    if (reporterName?.includes('Warden') || reporterId?.includes('warden')) return 'Hostel Warden';
    if (reporterName?.includes('Parent') || reporterId?.includes('parent')) return 'Parent';
    return 'Student';
  };

  const handleDispatch = () => {
    dispatchResponder(incident.id, 'Campus Hazmat & Rapid Security', 'Officer Vikram Sharma');
    setActionSuccessMessage('Rapid Response Unit successfully dispatched to ' + incident.location_name);
    setTimeout(() => setActionSuccessMessage(null), 3500);
  };

  const handleAcknowledge = () => {
    updateIncidentStatus(incident.id, 'acknowledged', 'Officer Vikram Sharma (Security)', 'Incident acknowledged by SOC duty desk.');
    setActionSuccessMessage('Incident acknowledged.');
    setTimeout(() => setActionSuccessMessage(null), 3000);
  };

  const handleConfirmResolve = (e: React.FormEvent) => {
    e.preventDefault();
    resolveIncident(incident.id, 'Officer Vikram Sharma (Security)', resolutionNotes || 'Area secured and normal operations restored.');
    setIsResolving(false);
    setResolutionNotes('');
    setActionSuccessMessage('Incident marked as RESOLVED and archived into audit log.');
    setTimeout(() => setActionSuccessMessage(null), 3500);
  };

  const handleBroadcastAlert = () => {
    broadcastEmergencyAlert(
      `HAZARD NOTICE: ${incident.title}`,
      `Security Protocol active at ${incident.location_name}. Avoid the sector until cleared.`,
      'security',
      incident.severity === 'critical' ? 'critical' : 'high'
    );
    setActionSuccessMessage('Emergency broadcast transmitted to campus.');
    setTimeout(() => setActionSuccessMessage(null), 3500);
  };

  const reporterRole = getReporterRole(incident.reporter_id, incident.reporter_name);

  const timelineEvents = incident.timeline && incident.timeline.length > 0
    ? incident.timeline
    : [
        {
          id: 't-1',
          incident_id: incident.id,
          timestamp: incident.created_at,
          title: 'Incident Logged',
          description: `Reported by ${displayReporter}`,
          actor_name: displayReporter,
          actor_role: reporterRole,
          type: 'reported',
        },
      ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl border border-[#D0D1D6] bg-white text-[#202226] shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#D0D1D6] bg-[#F4F5F6] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${
              isCritical
                ? 'bg-[#DC2626]/10 border-[#DC2626] text-[#DC2626] animate-pulse'
                : 'bg-[#FEF3C7] border-[#EAB308] text-[#B45309]'
            }`}>
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#B45309]">
                  {incident.incident_number}
                </span>
                <SeverityBadge severity={incident.severity} size="sm" isAiClassified={!!incident.ai_confidence} />
                <span className="rounded-full bg-[#E7E8EB] border border-[#D0D1D6] px-2 py-0.5 text-[10px] font-mono font-bold uppercase text-[#555960]">
                  {incident.status}
                </span>
              </div>
              <h2 className="text-base font-bold text-[#202226] mt-0.5 line-clamp-1">
                {incident.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#555960] hover:bg-[#E7E8EB] hover:text-[#202226] transition-colors"
            title="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Action Success Notification Toast */}
        {actionSuccessMessage && (
          <div className="bg-[#ECFDF5] border-b border-[#10B981] px-6 py-2 text-xs text-[#067a4f] flex items-center gap-2 animate-in slide-in-from-top-2">
            <CheckCheck className="h-4 w-4 text-[#10B981] shrink-0" />
            <span>{actionSuccessMessage}</span>
          </div>
        )}

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-xs">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F4F5F6] p-3.5 rounded-xl border border-[#D0D1D6]">
            <div>
              <span className="text-[#555960] text-[10px] uppercase block">Location</span>
              <p className="font-bold text-[#202226] flex items-center gap-1 mt-0.5">
                <MapPin className="h-3.5 w-3.5 text-[#B45309] shrink-0" />
                <span className="truncate">{incident.location_name}</span>
              </p>
            </div>

            <div>
              <span className="text-[#555960] text-[10px] uppercase block">Category</span>
              <p className="font-bold text-[#202226] uppercase mt-0.5">
                {incident.category}
              </p>
            </div>

            <div>
              <span className="text-[#555960] text-[10px] uppercase block">Reported Time</span>
              <p className="text-[#202226] flex items-center gap-1 mt-0.5">
                <Clock className="h-3.5 w-3.5 text-[#555960] shrink-0" />
                <span>{formatTimeAgo(incident.created_at)}</span>
              </p>
            </div>

            <div>
              <span className="text-[#555960] text-[10px] uppercase block">Reporter</span>
              <p className="font-bold text-[#202226] flex items-center gap-1 mt-0.5">
                <User className="h-3.5 w-3.5 text-[#555960] shrink-0" />
                <span className="truncate">{displayReporter}</span>
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <span className="font-bold uppercase tracking-wider text-[#555960] text-[11px]">
              Incident Description &amp; Observations
            </span>
            <div className="rounded-xl bg-[#F4F5F6] border border-[#D0D1D6] p-3.5 text-xs text-[#202226] leading-relaxed">
              {incident.description}
            </div>
          </div>

          {/* Gemini 3.7 Flash AI Intelligence Panel */}
          <div className="rounded-xl border border-[#EAB308]/50 bg-gradient-to-br from-[#FEFCE8] to-white p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#EAB308]/30 pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#B45309]" />
                <span className="font-bold text-[#B45309] text-xs">
                  Gemini 3.7 Flash Autonomous Triage Assessment
                </span>
              </div>
              <span className="rounded bg-[#FDBF3E]/20 border border-[#EAB308]/40 px-2 py-0.5 text-[10px] font-bold text-[#B45309]">
                {Math.round((incident.ai_confidence || 0.96) * 100)}% Confidence
              </span>
            </div>

            <p className="text-xs text-[#202226] leading-relaxed">
              {incident.ai_summary ||
                'Incident evaluated autonomously against university safety hazard protocols and historical building telemetry.'}
            </p>

            {/* Recommended Protocol Directives */}
            {incident.ai_recommended_actions && incident.ai_recommended_actions.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="font-bold text-[10px] text-[#555960] uppercase">
                  AI Recommended Operational Directives:
                </span>
                <ul className="space-y-1 text-[11px] text-[#555960]">
                  {incident.ai_recommended_actions.map((act, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#B45309] font-bold">•</span>
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Department Routing */}
            {incident.ai_departments && (
              <div className="flex items-center gap-2 pt-2 border-t border-[#EAB308]/20 flex-wrap">
                <span className="text-[10px] text-[#555960]">Routing Targets:</span>
                {incident.ai_departments.map((dept, i) => (
                  <span
                    key={i}
                    className="rounded bg-[#F4F5F6] border border-[#D0D1D6] px-2 py-0.5 text-[10px] text-[#202226]"
                  >
                    {dept}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Incident Timeline / Audit Trail */}
          <div className="space-y-2">
            <span className="font-bold uppercase tracking-wider text-[#555960] text-[11px]">
              Response Timeline &amp; Action Log
            </span>

            <div className="space-y-2 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#D0D1D6]">
              {timelineEvents.map((evt, idx) => (
                <div key={evt.id || idx} className="relative flex items-start gap-3 pl-8">
                  <div className="absolute left-2 top-1.5 h-3 w-3 rounded-full bg-[#EAB308] border-2 border-white" />
                  <div className="flex-1 rounded-lg bg-[#F4F5F6] border border-[#D0D1D6] p-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-[#202226]">{evt.title}</span>
                      <span className="text-[10px] text-[#555960]">
                        {formatTimeAgo(evt.timestamp)}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#555960] mt-0.5">{evt.description}</p>
                    <span className="text-[10px] text-[#555960] block mt-1">
                      Actor: {incident.is_anonymous && evt.type === 'reported' && !isSuperAdmin ? '[ANONYMOUS REPORTER - PROTECTED]' : evt.actor_name} ({evt.actor_role})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resolve Form if Triggered (Admin/Security Only) */}
          {isResolving && canManageIncident && (
            <form onSubmit={handleConfirmResolve} className="rounded-xl bg-[#F4F5F6] border border-[#10B981]/50 p-4 space-y-3">
              <h4 className="font-bold text-sm text-[#067a4f] flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4" />
                <span>Complete Incident Resolution</span>
              </h4>
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Enter root cause summary, corrective actions taken, and clearance notes..."
                rows={2}
                className="w-full rounded-lg border border-[#D0D1D6] bg-white p-2.5 text-xs text-[#202226] placeholder:text-[#8A9199] focus:border-[#10B981] focus:outline-none"
                required
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsResolving(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-[#10B981] hover:bg-[#0da271] text-white font-bold">
                  Confirm Clearance &amp; Archive
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Action Controls Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#D0D1D6] bg-[#F4F5F6] px-6 py-3.5">
          <div className="flex items-center gap-2">
            {canBroadcastAlert ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleBroadcastAlert}
                className="border-[#DC2626]/40 text-[#DC2626] hover:bg-[#DC2626]/10 text-xs gap-1.5"
              >
                <Radio className="h-3.5 w-3.5 text-[#DC2626]" />
                <span>Broadcast Area Warning</span>
              </Button>
            ) : (
              <span className="text-[11px] text-[#555960]">
                Clearance: {role?.toUpperCase() || 'OBSERVER'} (Read-Only View)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {canManageIncident && !isResolved && incident.status !== 'responding' && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAcknowledge}
                className="text-xs"
              >
                Acknowledge
              </Button>
            )}

            {canManageIncident && !isResolved && (
              <Button
                type="button"
                size="sm"
                onClick={handleDispatch}
                className="bg-gradient-to-r from-[#EAB308] to-[#D4AF37] text-[#202226] font-bold text-xs gap-1.5 shadow-sm"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>Dispatch Response Unit</span>
              </Button>
            )}

            {canManageIncident && !isResolved && !isResolving && (
              <Button
                type="button"
                size="sm"
                onClick={() => setIsResolving(true)}
                className="bg-[#10B981] hover:bg-[#0da271] text-white font-bold text-xs gap-1.5"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Resolve</span>
              </Button>
            )}

            <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}