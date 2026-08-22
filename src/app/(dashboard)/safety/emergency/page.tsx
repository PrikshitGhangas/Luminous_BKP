'use client';

import React, { useState } from 'react';
import { useSafety } from '@/lib/context/safety-context';
import { useAuth } from '@/lib/hooks/use-auth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SeverityBadge } from '@/components/shared/severity-badge';
import { AlertType, IncidentSeverity, AlertScope } from '@/lib/types';
import { formatTimeAgo } from '@/lib/utils';
import {
  Bell,
  Radio,
  ShieldAlert,
  Send,
  Building,
  Home,
  GraduationCap,
  Globe,
  History,
  CheckCircle2,
  Info,
} from 'lucide-react';

const BUILDINGS = [
  'Main Academic Block A',
  'Science & Technology Wing B',
  'Engineering Complex Block C',
  'Bio-Research Facility D',
  'Central University Library',
  'Administrative Headquarters',
  'Indoor Sports Arena & Gymnasium',
];

const HOSTELS = [
  'Hostel Block A (Boys Residence)',
  'Hostel Block B (Girls Residence - Priority Secure)',
  'Hostel Block C (Senior Dorms)',
  'Postgraduate Scholars Quarters',
];

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Chemical & Materials Engineering',
  'Biotechnology & Nanomedicine',
  'Campus Operations & Facilities Maintenance',
  'Executive Chancellor & Dean Administration',
];

export default function SafetyEmergencyPage() {
  const { alerts, broadcastEmergencyAlert, dismissAlert } = useSafety();
  const { user } = useAuth();

  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [alertType, setAlertType] = useState<AlertType>('security');
  const [severity, setSeverity] = useState<IncidentSeverity>('high');
  const [scope, setScope] = useState<AlertScope>('campus_wide');
  const [targetEntity, setTargetEntity] = useState('');
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [lastBroadcastSuccess, setLastBroadcastSuccess] = useState(false);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;

    setIsTransmitting(true);

    const chosenTarget =
      scope === 'campus_wide'
        ? 'All Campus Zones'
        : targetEntity || (scope === 'building' ? BUILDINGS[0] : scope === 'hostel' ? HOSTELS[0] : DEPARTMENTS[0]);

    broadcastEmergencyAlert(
      title,
      message,
      alertType,
      severity,
      scope,
      chosenTarget,
      `${user?.full_name || 'Emergency Admin'} (${user?.role?.toUpperCase() || 'SAFETY'})`
    );

    setIsTransmitting(false);
    setLastBroadcastSuccess(true);
    setTitle('');
    setMessage('');
    setIsBroadcastModalOpen(false);

    setTimeout(() => setLastBroadcastSuccess(false), 4000);
  };

  const setPresetAlert = (presetScope: AlertScope, presetType: AlertType, presetTitle: string, presetMsg: string, presetSeverity: IncidentSeverity) => {
    setScope(presetScope);
    setAlertType(presetType);
    setTitle(presetTitle);
    setMessage(presetMsg);
    setSeverity(presetSeverity);
    if (presetScope === 'building') setTargetEntity(BUILDINGS[0]);
    if (presetScope === 'hostel') setTargetEntity(HOSTELS[1]);
    if (presetScope === 'department') setTargetEntity(DEPARTMENTS[0]);
    setIsBroadcastModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D6D8D5] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1F2933] flex items-center gap-2">
            <Bell className="h-6 w-6 text-[#DC2626]" />
            <span>Emergency Alerts</span>
          </h1>
          <p className="text-xs text-[#667085] mt-1">
            Manage and broadcast priority alerts across campus zones, buildings, hostels, and departments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsBroadcastModalOpen(true)}
            className="bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold text-xs gap-1.5 shadow-sm"
          >
            <Radio className="h-4 w-4" />
            <span>New Emergency Broadcast</span>
          </Button>
        </div>
      </div>

      {lastBroadcastSuccess && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>Emergency alert transmitted and synchronized across active devices.</span>
        </div>
      )}

      {/* Quick Trigger Preset Scopes */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-[#1F2933]">Broadcast Templates:</span>
        <button
          onClick={() =>
            setPresetAlert(
              'campus_wide',
              'lockdown',
              'CAMPUS-WIDE LOCKDOWN PROTOCOL INITIATED',
              'All students, faculty, and staff must seek immediate indoor shelter. Lock all peripheral doors and silence mobile communications.',
              'critical'
            )
          }
          className="px-3.5 py-1.5 rounded-full text-xs bg-[#F0F1EF] hover:bg-[#E4E6E3] text-[#1F2933] border border-[#D6D8D5] font-medium transition-colors cursor-pointer"
        >
          Campus Lockdown
        </button>

        <button
          onClick={() =>
            setPresetAlert(
              'building',
              'evacuation',
              'BUILDING EVACUATION: Science & Tech Wing B',
              'Audible fire alarm triggered. Safely exit via designated stairwells. Do NOT use elevators. Gather at Quad Assembly Point #3.',
              'high'
            )
          }
          className="px-3.5 py-1.5 rounded-full text-xs bg-[#F0F1EF] hover:bg-[#E4E6E3] text-[#1F2933] border border-[#D6D8D5] font-medium transition-colors cursor-pointer"
        >
          Building Evacuation
        </button>

        <button
          onClick={() =>
            setPresetAlert(
              'hostel',
              'security',
              'HOSTEL SECURITY DRILL: Block B Girls Residence',
              'Warden curfew check & emergency muster roll drill in progress. Ground floor security doors secured.',
              'medium'
            )
          }
          className="px-3.5 py-1.5 rounded-full text-xs bg-[#F0F1EF] hover:bg-[#E4E6E3] text-[#1F2933] border border-[#D6D8D5] font-medium transition-colors cursor-pointer"
        >
          Hostel Security Drill
        </button>

        <button
          onClick={() =>
            setPresetAlert(
              'department',
              'medical',
              'LAB BIOHAZARD CONTAINMENT: Chemical Materials Dept',
              'Fume extraction engaged in Nanotech Cleanroom. Access restricted to authorized hazmat handlers.',
              'high'
            )
          }
          className="px-3.5 py-1.5 rounded-full text-xs bg-[#F0F1EF] hover:bg-[#E4E6E3] text-[#1F2933] border border-[#D6D8D5] font-medium transition-colors cursor-pointer"
        >
          Lab Containment
        </button>
      </div>

      {/* Broadcast Modal / Form */}
      {isBroadcastModalOpen && (
        <Card className="border-[#D6D8D5] bg-white text-[#1F2933] shadow-lg animate-in fade-in duration-200">
          <CardHeader className="p-4 pb-3 border-b border-[#D6D8D5] bg-[#F7F8F6] flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-[#1F2933] flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-red-600" />
              <span>Transmit Campus Broadcast</span>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsBroadcastModalOpen(false)}
              className="text-xs text-[#667085] hover:text-[#1F2933] h-7 px-2"
            >
              ✕ Close
            </Button>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <form onSubmit={handleBroadcast} className="space-y-4 text-xs">
              {/* Alert Scope Selector */}
              <div className="space-y-1.5">
                <label className="font-bold text-[#B45309] uppercase font-mono text-[11px] block">
                  1. Target Alert Scope &amp; Radius
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setScope('campus_wide')}
                    className={`p-2.5 rounded-lg border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      scope === 'campus_wide'
                        ? 'border-red-500 bg-red-950/50 text-[#202226]'
                        : 'border-[#D0D1D6] bg-white text-[#555960] hover:bg-[#E7E8EB]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold font-mono text-xs">
                      <Globe className="h-3.5 w-3.5 text-red-400" />
                      <span>Campus-Wide</span>
                    </div>
                    <span className="text-[10px] opacity-80">All zones &amp; perimeters</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setScope('building')}
                    className={`p-2.5 rounded-lg border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      scope === 'building'
                        ? 'border-amber-500 bg-amber-950/50 text-[#202226]'
                        : 'border-[#D0D1D6] bg-white text-[#555960] hover:bg-[#E7E8EB]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold font-mono text-xs">
                      <Building className="h-3.5 w-3.5 text-amber-400" />
                      <span>Building</span>
                    </div>
                    <span className="text-[10px] opacity-80">Academic complexes</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setScope('hostel')}
                    className={`p-2.5 rounded-lg border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      scope === 'hostel'
                        ? 'border-orange-500 bg-orange-950/50 text-[#202226]'
                        : 'border-[#D0D1D6] bg-white text-[#555960] hover:bg-[#E7E8EB]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold font-mono text-xs">
                      <Home className="h-3.5 w-3.5 text-orange-400" />
                      <span>Hostel</span>
                    </div>
                    <span className="text-[10px] opacity-80">Dormitories &amp; housing</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setScope('department')}
                    className={`p-2.5 rounded-lg border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      scope === 'department'
                        ? 'border-indigo-500 bg-indigo-950/50 text-[#202226]'
                        : 'border-[#D0D1D6] bg-white text-[#555960] hover:bg-[#E7E8EB]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold font-mono text-xs">
                      <GraduationCap className="h-3.5 w-3.5 text-indigo-400" />
                      <span>Department</span>
                    </div>
                    <span className="text-[10px] opacity-80">Specialized branches</span>
                  </button>
                </div>
              </div>

              {/* Target Entity Selection if not campus_wide */}
              {scope !== 'campus_wide' && (
                <div className="space-y-1.5 animate-in fade-in">
                  <label className="font-bold text-[#B45309] uppercase font-mono text-[11px] block">
                    Specific Destination:
                  </label>
                  <select
                    value={targetEntity}
                    onChange={(e) => setTargetEntity(e.target.value)}
                    className="h-10 w-full rounded-md border border-[#D0D1D6] bg-white px-3 text-xs text-[#202226] focus:border-[#EAB308] focus:outline-none font-mono"
                  >
                    {scope === 'building' &&
                      BUILDINGS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    {scope === 'hostel' &&
                      HOSTELS.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    {scope === 'department' &&
                      DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {/* Headline */}
              <div className="space-y-1">
                <label className="font-bold text-[#202226] uppercase font-mono text-[11px]">
                  Alert Headline / Title
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. FLASH CHEMICAL SPILL CONTAINMENT PROTOCOL"
                  required
                  className="bg-white border-[#D0D1D6] font-mono text-xs"
                />
              </div>

              {/* Detailed Guidance */}
              <div className="space-y-1">
                <label className="font-bold text-[#202226] uppercase font-mono text-[11px]">
                  Operational Directive &amp; Instructions
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Clear instructions: Seal room doors, avoid corridor B, report to assembly point..."
                  rows={3}
                  className="w-full rounded-md border border-[#D0D1D6] bg-white p-3 text-xs text-[#202226] placeholder:text-[#8A9199] focus:border-[#EAB308] focus:outline-none"
                  required
                />
              </div>

              {/* Protocol Type & Severity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#202226] uppercase font-mono text-[11px]">
                    Emergency Classification
                  </label>
                  <select
                    value={alertType}
                    onChange={(e) => setAlertType(e.target.value as AlertType)}
                    className="h-10 w-full rounded-md border border-[#D0D1D6] bg-white px-2 text-xs text-[#202226] focus:border-[#EAB308] focus:outline-none font-mono"
                  >
                    <option value="lockdown">Campus Lockdown</option>
                    <option value="evacuation">Evacuation Directive</option>
                    <option value="security">Security Threat / Intruder</option>
                    <option value="medical">Medical / Health Hazard</option>
                    <option value="weather">Severe Meteorological Warning</option>
                    <option value="general">General Safety Notice</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#202226] uppercase font-mono text-[11px]">
                    Urgency Tier
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as IncidentSeverity)}
                    className="h-10 w-full rounded-md border border-[#D0D1D6] bg-white px-2 text-xs text-[#202226] focus:border-[#EAB308] focus:outline-none font-mono"
                  >
                    <option value="critical">CRITICAL (Immediate Threat to Life)</option>
                    <option value="high">HIGH (Urgent Containment)</option>
                    <option value="medium">MEDIUM (Advisory Caution)</option>
                    <option value="low">LOW (Informational Notice)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D0D1D6]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBroadcastModalOpen(false)}
                  className="border-[#D0D1D6] text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isTransmitting}
                  className="bg-red-600 hover:bg-red-500 text-white font-bold gap-1.5 border border-red-400 font-mono"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>{isTransmitting ? 'Transmitting...' : 'Authorize & Broadcast Alert'}</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Emergency Broadcast History & Active Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#1F2933]">
            Broadcast History ({alerts.length})
          </h2>
          <span className="text-xs text-[#667085]">Audit Log</span>
        </div>

        {alerts.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-xl border border-[#D6D8D5] text-[#667085] text-xs">
            No active emergency alerts recorded. All sectors in normal operating posture.
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border transition-all bg-white text-[#1F2933] space-y-2.5 shadow-xs ${
                alert.severity === 'critical'
                  ? 'border-red-300'
                  : alert.severity === 'high'
                  ? 'border-amber-300'
                  : 'border-[#D6D8D5]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <SeverityBadge severity={alert.severity} size="sm" />
                  <span className="rounded-full bg-[#F0F1EF] border border-[#D6D8D5] px-2.5 py-0.5 text-[10px] font-medium text-[#667085] capitalize">
                    {alert.scope ? alert.scope.replace('_', ' ') : 'Campus Wide'}
                  </span>
                  {alert.target_entity && (
                    <span className="rounded-full bg-[#F0F1EF] border border-[#D6D8D5] px-2.5 py-0.5 text-[10px] font-medium text-[#667085]">
                      Target: {alert.target_entity}
                    </span>
                  )}
                  {alert.is_active && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 text-[10px] font-semibold">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
                      Live
                    </span>
                  )}
                </div>
                <span className="text-xs text-[#667085]">
                  {formatTimeAgo(alert.created_at)}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-[#1F2933]">{alert.title}</h3>
                <p className="text-xs text-[#667085] mt-0.5 leading-relaxed">{alert.message}</p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#667085] pt-2 border-t border-[#D6D8D5]">
                <span>Authorized by: <strong className="text-[#1F2933]">{alert.created_by}</strong></span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => dismissAlert(alert.id)}
                    className="h-7 text-xs border-[#D6D8D5] text-[#1F2933] rounded-lg"
                  >
                    Dismiss Alert
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
