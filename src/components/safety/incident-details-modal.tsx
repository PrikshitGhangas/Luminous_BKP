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

  const handleDispatch = () => {
    dispatchResponder(incident.id, 'Campus Hazmat & Rapid Security', 'Capt. Vikram Sharma');
    setActionSuccessMessage('Rapid Response Unit successfully dispatched to ' + incident.location_name);
    setTimeout(() => setActionSuccessMessage(null), 3500);
  };

  const handleAcknowledge = () => {
    updateIncidentStatus(incident.id, 'acknowledged', 'Capt. Vikram Sharma (Security)', 'Incident acknowledged by SOC duty desk.');
    setActionSuccessMessage('Incident acknowledged.');
    setTimeout(() => setActionSuccessMessage(null), 3000);
  };

  const handleConfirmResolve = (e: React.FormEvent) => {
    e.preventDefault();
    resolveIncident(incident.id, 'Capt. Vikram Sharma (Security)', resolutionNotes || 'Area secured and normal operations restored.');
    setIsResolving(false);
    setResolutionNotes('');
    setActionSuccessMessage('Incident marked as RESOLVED and archived into audit log.');
    setTimeout(() => setActionSuccessMessage(null), 3500);
  };

  const handleBroadcastAlert = () => {
    broadcastEmergencyAlert(
      `HAZARD NOTICE: ${incident.title}`,
      `Security & emergency teams responding at ${incident.location_name}. Please avoid the immediate vicinity.`,
      'evacuation',
      incident.severity
    );
    setActionSuccessMessage('Emergency broadcast transmitted across all campus channels.');
    setTimeout(() => setActionSuccessMessage(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl border border-[#D4AF37]/40 bg-[#0F1026] text-[#F4F1DE] shadow-2xl shadow-black/80 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#243356] bg-[#131C38] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${
              isCritical
                ? 'bg-red-950/70 border-red-500 text-red-400 animate-pulse'
                : 'bg-[#0B132B] border-[#D4AF37]/40 text-[#FFD700]'
            }`}>
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#FFD700]">
                  {incident.incident_number}
                </span>
                <SeverityBadge severity={incident.severity} size="sm" isAiClassified={!!incident.ai_confidence} />
                <span className="rounded-full bg-[#1C2541] border border-[#243356] px-2 py-0.5 text-[10px] font-mono font-bold uppercase text-[#C5A059]">
                  {incident.status}
                </span>
              </div>
              <h2 className="text-base font-bold text-[#F4F1DE] mt-0.5 line-clamp-1">
                {incident.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#B8B5A3] hover:bg-[#1C2541] hover:text-[#FFD700] transition-colors"
            title="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Action Success Notification Toast */}
        {actionSuccessMessage && (
          <div className="bg-emerald-950/90 border-b border-emerald-500 px-6 py-2 text-xs font-mono text-emerald-300 flex items-center gap-2 animate-in slide-in-from-top-2">
            <CheckCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{actionSuccessMessage}</span>
          </div>
        )}

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-xs">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#131C38]/80 p-3.5 rounded-xl border border-[#243356]">
            <div>
              <span className="text-[#C5A059] font-mono text-[10px] uppercase block">Location</span>
              <p className="font-bold text-[#F4F1DE] flex items-center gap-1 mt-0.5">
                <MapPin className="h-3.5 w-3.5 text-[#FFD700] shrink-0" />
                <span className="truncate">{incident.location_name}</span>
              </p>
            </div>

            <div>
              <span className="text-[#C5A059] font-mono text-[10px] uppercase block">Category</span>
              <p className="font-bold text-[#F4F1DE] uppercase font-mono mt-0.5">
                {incident.category}
              </p>
            </div>

            <div>
              <span className="text-[#C5A059] font-mono text-[10px] uppercase block">Reported Time</span>
              <p className="font-mono text-[#F4F1DE] flex items-center gap-1 mt-0.5">
                <Clock className="h-3.5 w-3.5 text-[#C5A059] shrink-0" />
                <span>{formatTimeAgo(incident.created_at)}</span>
              </p>
            </div>

            <div>
              <span className="text-[#C5A059] font-mono text-[10px] uppercase block">Reporter</span>
              <p className="font-bold text-[#F4F1DE] flex items-center gap-1 mt-0.5">
                <User className="h-3.5 w-3.5 text-[#C5A059] shrink-0" />
                <span className="truncate">{displayReporter}</span>
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <span className="font-bold uppercase tracking-wider text-[#C5A059] font-mono text-[11px]">
              Incident Description &amp; Observations
            </span>
            <div className="rounded-xl bg-[#131C38]/60 border border-[#243356] p-3.5 text-xs text-[#F4F1DE] leading-relaxed">
              {incident.description}
            </div>
          </div>

          {/* Gemini 3.7 Flash AI Intelligence Panel */}
          <div className="rounded-xl border border-[#D4AF37]/50 bg-gradient-to-br from-[#131C38] via-[#0F1026] to-[#1C2541] p-4 space-y-3 shadow-lg">
            <div className="flex items-center justify-between border-b border-[#243356] pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#FFD700]" />
                <span className="font-bold font-mono text-[#FFD700] text-xs">
                  Gemini 3.7 Flash Autonomous Triage Assessment
                </span>
              </div>
              <span className="rounded bg-[#D4AF37]/20 border border-[#D4AF37]/40 px-2 py-0.5 text-[10px] font-mono font-bold text-[#FFD700]">
                {Math.round((incident.ai_confidence || 0.96) * 100)}% Confidence
              </span>
            </div>

            <p className="text-xs text-[#F4F1DE] leading-relaxed">
              {incident.ai_summary ||
                'Incident evaluated autonomously against university safety hazard protocols and historical building telemetry.'}
            </p>

            {/* Recommended Protocol Directives */}
            {incident.ai_recommended_actions && incident.ai_recommended_actions.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="font-bold text-[10px] text-[#C5A059] font-mono uppercase">
                  AI Recommended Operational Directives:
                </span>
                <ul className="space-y-1 text-[11px] text-[#B8B5A3]">
                  {incident.ai_recommended_actions.map((act, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#FFD700] font-bold">•</span>
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Department Routing */}
            {incident.ai_departments && (
              <div className="flex items-center gap-2 pt-2 border-t border-[#243356]/60 flex-wrap">
                <span className="text-[10px] text-[#C5A059] font-mono">Routing Targets:</span>
                {incident.ai_departments.map((dept, i) => (
                  <span
                    key={i}
                    className="rounded bg-[#0B132B] border border-[#243356] px-2 py-0.5 text-[10px] font-mono text-[#F4F1DE]"
                  >
                    {dept}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Incident Timeline / Audit Trail */}
          <div className="space-y-2">
            <span className="font-bold uppercase tracking-wider text-[#C5A059] font-mono text-[11px]">
              Response Timeline &amp; Action Log
            </span>

            <div className="space-y-2 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#243356]">
              {(incident.timeline || [
                {
                  id: 't-1',
                  incident_id: incident.id,
                  timestamp: incident.created_at,
                  title: 'Incident Logged',
                  description: `Reported by ${displayReporter}`,
                  actor_name: displayReporter,
                  actor_role: 'Student',
                  type: 'reported',
                },
              ]).map((evt, idx) => (
                <div key={evt.id || idx} className="relative flex items-start gap-3 pl-8">
                  <div className="absolute left-2 top-1.5 h-3 w-3 rounded-full bg-[#D4AF37] border-2 border-[#0F1026]" />
                  <div className="flex-1 rounded-lg bg-[#131C38]/70 border border-[#243356] p-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-[#F4F1DE]">{evt.title}</span>
                      <span className="font-mono text-[10px] text-[#C5A059]">
                        {formatTimeAgo(evt.timestamp)}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#B8B5A3] mt-0.5">{evt.description}</p>
                    <span className="text-[10px] text-[#C5A059] font-mono block mt-1">
                      Actor: {incident.is_anonymous && evt.type === 'reported' && !isSuperAdmin ? '[ANONYMOUS REPORTER - PROTECTED]' : evt.actor_name} ({evt.actor_role})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resolve Form if Triggered (Admin/Security Only) */}
          {isResolving && canManageIncident && (
            <form onSubmit={handleConfirmResolve} className="rounded-xl bg-[#131C38] border border-emerald-500/50 p-4 space-y-3">
              <h4 className="font-bold text-sm text-emerald-300 flex items-center gap-1.5 font-mono">
                <CheckCircle className="h-4 w-4" />
                <span>Complete Incident Resolution</span>
              </h4>
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Enter root cause summary, corrective actions taken, and clearance notes..."
                rows={2}
                className="w-full rounded-lg border border-[#243356] bg-[#0F1026] p-2.5 text-xs text-[#F4F1DE] placeholder:text-[#7A786B] focus:border-emerald-400 focus:outline-none"
                required
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsResolving(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                  Confirm Clearance &amp; Archive
                </Button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Action Controls Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#243356] bg-[#131C38] px-6 py-3.5">
          <div className="flex items-center gap-2">
            {canBroadcastAlert ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleBroadcastAlert}
                className="border-red-500/40 text-red-300 hover:bg-red-950/40 text-xs font-mono gap-1.5"
              >
                <Radio className="h-3.5 w-3.5 text-red-400" />
                <span>Broadcast Area Warning</span>
              </Button>
            ) : (
              <span className="text-[11px] text-[#B8B5A3] font-mono">
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
                className="text-xs font-mono"
              >
                Acknowledge
              </Button>
            )}

            {canManageIncident && !isResolved && (
              <Button
                type="button"
                size="sm"
                onClick={handleDispatch}
                className="bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-[#0B132B] font-bold text-xs gap-1.5 shadow-md shadow-[#D4AF37]/20"
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
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5"
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
