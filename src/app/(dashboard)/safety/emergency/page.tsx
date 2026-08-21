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
      {/* Simulation Compliance Warning */}
      <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-start gap-3 text-amber-200">
        <Info className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-0.5">
          <span className="font-bold uppercase tracking-wider font-mono text-[#B45309]">
            Operational Training &amp; Demo System Notice:
          </span>
          <p className="text-[#202226] opacity-90 leading-relaxed">
            This module provides simulated multi-channel campus alert broadcasting for university security drills and internal incident dispatch. It does <strong>NOT</strong> dispatch external police or local municipal 911/112 emergency services.
          </p>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D0D1D6] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#202226] font-mono flex items-center gap-2">
            <Bell className="h-6 w-6 text-red-500 animate-pulse" />
            <span>CAMPUS EMERGENCY RESPONSE &amp; BROADCAST HUB</span>
          </h1>
          <p className="text-xs text-[#555960] mt-1 font-mono">
            Multi-tier perimeter alerts: Campus-wide, Building-level, Hostel sector, and Department containment
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsBroadcastModalOpen(true)}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs gap-1.5 shadow-lg shadow-red-950/60 border border-red-500/40"
          >
            <Radio className="h-4 w-4 animate-ping" />
            <span>New Emergency Broadcast</span>
          </Button>
        </div>
      </div>

      {lastBroadcastSuccess && (
        <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2 font-mono animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>Emergency alert transmitted and synchronized across all active devices &amp; digital signage.</span>
        </div>
      )}

      {/* Quick Trigger Scopes Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Campus-Wide */}
        <div
          onClick={() =>
            setPresetAlert(
              'campus_wide',
              'lockdown',
              'CAMPUS-WIDE LOCKDOWN PROTOCOL INITIATED',
              'All students, faculty, and staff must seek immediate indoor shelter. Lock all peripheral doors and silence mobile communications.',
              'critical'
            )
          }
          className="p-4 rounded-xl bg-white border border-red-500/30 hover:border-red-400 hover:bg-[#E7E8EB] transition-all cursor-pointer space-y-2 group shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="p-2 rounded-lg bg-red-950/80 text-red-400 border border-red-600/40">
              <Globe className="h-5 w-5" />
            </span>
            <span className="text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
              Tier 1 • Global
            </span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#202226] group-hover:text-[#B45309] transition-colors">
              Campus-Wide Alert
            </h3>
            <p className="text-[11px] text-[#555960] mt-0.5">
              Full lockdown, severe weather, or universal evacuation
            </p>
          </div>
          <span className="text-[10px] font-mono text-red-400 flex items-center gap-1 font-bold pt-1">
            <span>Broadcast Campus-Wide →</span>
          </span>
        </div>

        {/* Building-Specific */}
        <div
          onClick={() =>
            setPresetAlert(
              'building',
              'evacuation',
              'BUILDING EVACUATION: Science & Tech Wing B',
              'Audible fire alarm triggered. Safely exit via designated stairwells. Do NOT use elevators. Gather at Quad Assembly Point #3.',
              'high'
            )
          }
          className="p-4 rounded-xl bg-white border border-amber-500/30 hover:border-amber-400 hover:bg-[#E7E8EB] transition-all cursor-pointer space-y-2 group shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="p-2 rounded-lg bg-amber-950/80 text-amber-400 border border-amber-600/40">
              <Building className="h-5 w-5" />
            </span>
            <span className="text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
              Tier 2 • Building
            </span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#202226] group-hover:text-[#B45309] transition-colors">
              Building Specific
            </h3>
            <p className="text-[11px] text-[#555960] mt-0.5">
              Targeted academic block alarms &amp; localized hazard containment
            </p>
          </div>
          <span className="text-[10px] font-mono text-amber-400 flex items-center gap-1 font-bold pt-1">
            <span>Select Building →</span>
          </span>
        </div>

        {/* Hostel Alert */}
        <div
          onClick={() =>
            setPresetAlert(
              'hostel',
              'security',
              'HOSTEL SECURITY DRILL: Block B Girls Residence',
              'Warden curfew check & emergency muster roll drill in progress. Ground floor security doors secured.',
              'medium'
            )
          }
          className="p-4 rounded-xl bg-white border border-orange-500/30 hover:border-orange-400 hover:bg-[#E7E8EB] transition-all cursor-pointer space-y-2 group shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="p-2 rounded-lg bg-orange-950/80 text-orange-400 border border-orange-600/40">
              <Home className="h-5 w-5" />
            </span>
            <span className="text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded bg-orange-950 text-orange-300 border border-orange-800">
              Tier 3 • Hostel
            </span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#202226] group-hover:text-[#B45309] transition-colors">
              Hostel Alert
            </h3>
            <p className="text-[11px] text-[#555960] mt-0.5">
              Residential quarters curfew alerts &amp; dormitory emergency pings
            </p>
          </div>
          <span className="text-[10px] font-mono text-orange-400 flex items-center gap-1 font-bold pt-1">
            <span>Target Hostels →</span>
          </span>
        </div>

        {/* Department Alert */}
        <div
          onClick={() =>
            setPresetAlert(
              'department',
              'medical',
              'LAB BIOHAZARD CONTAINMENT: Chemical Materials Dept',
              'Fume extraction engaged in Nanotech Cleanroom. Access restricted to authorized hazmat handlers.',
              'high'
            )
          }
          className="p-4 rounded-xl bg-white border border-indigo-500/30 hover:border-indigo-400 hover:bg-[#E7E8EB] transition-all cursor-pointer space-y-2 group shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="p-2 rounded-lg bg-indigo-950/80 text-indigo-400 border border-indigo-600/40">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span className="text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
              Tier 4 • Department
            </span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#202226] group-hover:text-[#B45309] transition-colors">
              Department Alert
            </h3>
            <p className="text-[11px] text-[#555960] mt-0.5">
              Specialized faculty labs, server room isolations, and workshops
            </p>
          </div>
          <span className="text-[10px] font-mono text-indigo-400 flex items-center gap-1 font-bold pt-1">
            <span>Target Depts →</span>
          </span>
        </div>
      </div>

      {/* Broadcast Modal / Form */}
      {isBroadcastModalOpen && (
        <Card className="border-red-500/50 bg-[#F4F5F6] text-[#202226] shadow-2xl animate-in fade-in duration-200">
          <CardHeader className="p-4 pb-2 border-b border-[#D0D1D6] bg-red-950/30 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-red-300 flex items-center gap-2 font-mono">
              <ShieldAlert className="h-5 w-5 text-red-400 animate-pulse" />
              <span>TRANSMIT EMERGENCY BROADCAST</span>
            </CardTitle>
            <span className="text-[10px] font-mono text-amber-300 bg-amber-950/80 border border-amber-600/40 px-2 py-0.5 rounded">
              SIMULATED CAMPUS MESH
            </span>
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
          <h2 className="text-sm font-bold text-[#202226] uppercase tracking-wider font-mono flex items-center gap-2">
            <History className="h-4 w-4 text-[#B45309]" />
            <span>Emergency Broadcast History &amp; Active Feed ({alerts.length})</span>
          </h2>
          <span className="text-[11px] font-mono text-[#B45309]">REAL-TIME AUDIT TRAIL</span>
        </div>

        {alerts.length === 0 ? (
          <Card className="p-8 text-center bg-[#F4F5F6] border-[#D0D1D6] text-[#555960] font-mono text-xs">
            No active emergency alerts recorded. All sectors in normal operating posture.
          </Card>
        ) : (
          alerts.map((alert) => (
            <Card
              key={alert.id}
              className={`border-l-4 transition-all bg-[#F4F5F6] text-[#202226] ${
                alert.severity === 'critical'
                  ? 'border-l-red-500 border-[#D0D1D6]'
                  : alert.severity === 'high'
                  ? 'border-l-amber-500 border-[#D0D1D6]'
                  : 'border-l-blue-500 border-[#D0D1D6]'
              }`}
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <SeverityBadge severity={alert.severity} size="sm" />
                    <span className="rounded bg-white border border-[#D0D1D6] px-2 py-0.5 text-[10px] font-bold uppercase font-mono text-[#B45309]">
                      {alert.scope ? alert.scope.replace('_', ' ') : 'CAMPUS WIDE'}
                    </span>
                    {alert.target_entity && (
                      <span className="rounded bg-[#E7E8EB] border border-[#D0D1D6] px-2 py-0.5 text-[10px] font-mono text-[#B45309]">
                        Target: {alert.target_entity}
                      </span>
                    )}
                    {alert.is_active && (
                      <span className="flex items-center gap-1 rounded-full bg-red-950 text-red-300 border border-red-800 px-2 py-0.2 text-[10px] font-bold font-mono">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
                        BROADCASTING
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-[#B45309] font-mono">
                    {formatTimeAgo(alert.created_at)}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-[#202226]">{alert.title}</h3>
                  <p className="text-xs text-[#555960] mt-1 leading-relaxed">{alert.message}</p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-[#B45309] pt-2 border-t border-[#D0D1D6] font-mono">
                  <span>Authorized by: {alert.created_by}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400">Pushed to Mobile App, SMS Mesh &amp; IoT Alarms</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => dismissAlert(alert.id)}
                      className="h-6 text-[10px] border-[#D0D1D6] text-[#202226]"
                    >
                      Dismiss Alert
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
