'use client';

import React, { useState } from 'react';
import { useSafety } from '@/lib/context/safety-context';
import { useRole } from '@/lib/hooks/use-role';
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
  Building,
  Home,
  GraduationCap,
  Globe,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldCheck,
  Megaphone,
} from 'lucide-react';

const BUILDINGS = [
  'Main Academic Block',
  'Engineering Block',
  'Central Library',
  'Campus Medical Center',
  'Administrative Complex',
  'Sports Complex',
  'Cafeteria & Student Union',
];

const HOSTELS = [
  'Hostel Block A (North Tower)',
  'Hostel Block B (East Tower)',
];

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Campus Operations & Facilities',
  'Academic Dean & Student Affairs',
];

export default function SafetyEmergencyPage() {
  const { alerts, broadcastEmergencyAlert, dismissAlert } = useSafety();
  const { user, isSuperAdmin, isAdmin, role } = useRole();

  const isAuthorized = isSuperAdmin || isAdmin || role === 'security';
  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 bg-[#F7F8F6] border border-[#D6D8D5] rounded-xl space-y-3">
        <div className="h-10 w-10 rounded-full bg-[#F0F1EF] border border-[#D6D8D5] flex items-center justify-center text-[#1F2933]">
          <ShieldAlert className="h-5 w-5 text-amber-700" />
        </div>
        <h2 className="text-base font-bold text-[#1F2933]">Administrator Authorization Required</h2>
        <p className="text-xs text-[#667085] max-w-sm">
          Campus-wide emergency alerts and institutional broadcasts are restricted to campus administrators and security supervisors.
        </p>
      </div>
    );
  }

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
      `${user?.full_name || 'Campus Administrator'}`
    );

    setIsTransmitting(false);
    setLastBroadcastSuccess(true);
    setTitle('');
    setMessage('');
    setIsBroadcastModalOpen(false);

    setTimeout(() => setLastBroadcastSuccess(false), 4000);
  };

  const setPresetAlert = (
    presetScope: AlertScope,
    presetType: AlertType,
    presetTitle: string,
    presetMsg: string,
    presetSeverity: IncidentSeverity
  ) => {
    setScope(presetScope);
    setAlertType(presetType);
    setTitle(presetTitle);
    setMessage(presetMsg);
    setSeverity(presetSeverity);
    if (presetScope === 'building') setTargetEntity(BUILDINGS[0]);
    if (presetScope === 'hostel') setTargetEntity(HOSTELS[0]);
    if (presetScope === 'department') setTargetEntity(DEPARTMENTS[0]);
    setIsBroadcastModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D6D8D5] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1F2933] flex items-center gap-2">
            <Bell className="h-5 w-5 text-[#C94C4C]" />
            Campus Safety Announcements &amp; Alerts
          </h1>
          <p className="text-xs text-[#667085] mt-1">
            Dispatch priority notifications and campus advisories across buildings, hostels, and academic departments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsBroadcastModalOpen(true)}
            className="bg-[#1F2933] hover:bg-[#111827] text-white font-semibold text-xs gap-1.5 shadow-xs cursor-pointer"
          >
            <Radio className="h-4 w-4" />
            <span>New Broadcast Notice</span>
          </Button>
        </div>
      </div>

      {lastBroadcastSuccess && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>Campus announcement published and delivered to active members.</span>
        </div>
      )}

      {/* Quick Announcement Templates */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-[#1F2933]">Notice Templates:</span>
        <button
          onClick={() =>
            setPresetAlert(
              'campus_wide',
              'weather',
              'Severe Weather & Heavy Rain Advisory',
              'Heavy rainfall forecast in the campus area. Students are advised to remain indoors. Evening outdoor sports activities postponed.',
              'medium'
            )
          }
          className="px-3 py-1 rounded-full text-xs bg-white hover:bg-[#F0F1EF] text-[#1F2933] border border-[#D6D8D5] font-medium transition-colors cursor-pointer"
        >
          Weather Advisory
        </button>

        <button
          onClick={() =>
            setPresetAlert(
              'building',
              'general',
              'Scheduled Facility Maintenance: Engineering Block D',
              'Scheduled electrical and HVAC maintenance will occur between 6:00 PM and 9:00 PM. High-voltage power lab access will be restricted.',
              'low'
            )
          }
          className="px-3 py-1 rounded-full text-xs bg-white hover:bg-[#F0F1EF] text-[#1F2933] border border-[#D6D8D5] font-medium transition-colors cursor-pointer"
        >
          Facility Maintenance
        </button>

        <button
          onClick={() =>
            setPresetAlert(
              'building',
              'evacuation',
              'Scheduled Fire Evacuation Drill: Central Library',
              'Annual campus safety drill. Safely exit via stairwells upon alarm sounding. Assembly point is at Central Plaza.',
              'medium'
            )
          }
          className="px-3 py-1 rounded-full text-xs bg-white hover:bg-[#F0F1EF] text-[#1F2933] border border-[#D6D8D5] font-medium transition-colors cursor-pointer"
        >
          Safety Evacuation Drill
        </button>

        <button
          onClick={() =>
            setPresetAlert(
              'hostel',
              'security',
              'Hostel Advisory: Regular Biometric Gate Check',
              'Reminder: Residential gates close at 10:30 PM. Please carry your student ID card for gate verification.',
              'low'
            )
          }
          className="px-3 py-1 rounded-full text-xs bg-white hover:bg-[#F0F1EF] text-[#1F2933] border border-[#D6D8D5] font-medium transition-colors cursor-pointer"
        >
          Hostel Gate Advisory
        </button>
      </div>

      {/* Broadcast Modal / Form */}
      {isBroadcastModalOpen && (
        <Card className="border-[#D6D8D5] bg-white text-[#1F2933] shadow-lg animate-in fade-in duration-200">
          <CardHeader className="p-4 pb-3 border-b border-[#D6D8D5] bg-[#F7F8F6] flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-[#1F2933] flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-[#8a6d1a]" />
              <span>Create Campus Safety Announcement</span>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsBroadcastModalOpen(false)}
              className="text-xs text-[#667085] hover:text-[#1F2933] h-7 px-2 cursor-pointer"
            >
              ✕ Close
            </Button>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <form onSubmit={handleBroadcast} className="space-y-4 text-xs">
              {/* Alert Scope Selector */}
              <div className="space-y-1.5">
                <label className="font-semibold text-[#1F2933] text-xs block">
                  1. Target Audience &amp; Scope
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setScope('campus_wide')}
                    className={`p-2.5 rounded-lg border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      scope === 'campus_wide'
                        ? 'border-[#1F2933] bg-[#F0F1EF] text-[#1F2933] font-semibold'
                        : 'border-[#D6D8D5] bg-white text-[#667085] hover:bg-[#F7F8F6]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs">
                      <Globe className="h-3.5 w-3.5 text-[#1F2933]" />
                      <span>Campus-Wide</span>
                    </div>
                    <span className="text-[10px] text-[#667085]">All students &amp; staff</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setScope('building')}
                    className={`p-2.5 rounded-lg border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      scope === 'building'
                        ? 'border-[#1F2933] bg-[#F0F1EF] text-[#1F2933] font-semibold'
                        : 'border-[#D6D8D5] bg-white text-[#667085] hover:bg-[#F7F8F6]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs">
                      <Building className="h-3.5 w-3.5 text-[#1F2933]" />
                      <span>Specific Building</span>
                    </div>
                    <span className="text-[10px] text-[#667085]">Selected facility</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setScope('hostel')}
                    className={`p-2.5 rounded-lg border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      scope === 'hostel'
                        ? 'border-[#1F2933] bg-[#F0F1EF] text-[#1F2933] font-semibold'
                        : 'border-[#D6D8D5] bg-white text-[#667085] hover:bg-[#F7F8F6]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs">
                      <Home className="h-3.5 w-3.5 text-[#1F2933]" />
                      <span>Student Hostels</span>
                    </div>
                    <span className="text-[10px] text-[#667085]">Residential blocks</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setScope('department')}
                    className={`p-2.5 rounded-lg border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      scope === 'department'
                        ? 'border-[#1F2933] bg-[#F0F1EF] text-[#1F2933] font-semibold'
                        : 'border-[#D6D8D5] bg-white text-[#667085] hover:bg-[#F7F8F6]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs">
                      <GraduationCap className="h-3.5 w-3.5 text-[#1F2933]" />
                      <span>Department</span>
                    </div>
                    <span className="text-[10px] text-[#667085]">Specific faculty</span>
                  </button>
                </div>
              </div>

              {/* Target Entity Dropdown (if scoped) */}
              {scope !== 'campus_wide' && (
                <div className="space-y-1">
                  <label className="font-semibold text-[#1F2933] block">
                    Select Target{' '}
                    {scope === 'building' ? 'Building' : scope === 'hostel' ? 'Hostel' : 'Department'}:
                  </label>
                  <select
                    value={targetEntity}
                    onChange={(e) => setTargetEntity(e.target.value)}
                    className="w-full h-9 rounded-lg bg-white border border-[#D6D8D5] text-[#1F2933] px-3 text-xs focus:outline-none"
                  >
                    {(scope === 'building'
                      ? BUILDINGS
                      : scope === 'hostel'
                      ? HOSTELS
                      : DEPARTMENTS
                    ).map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Alert Category & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#1F2933] block">Notice Type</label>
                  <select
                    value={alertType}
                    onChange={(e) => setAlertType(e.target.value as AlertType)}
                    className="w-full h-9 rounded-lg bg-white border border-[#D6D8D5] text-[#1F2933] px-3 text-xs focus:outline-none"
                  >
                    <option value="security">Safety Advisory</option>
                    <option value="weather">Weather Warning</option>
                    <option value="medical">Health &amp; Medical Notice</option>
                    <option value="evacuation">Evacuation Drill</option>
                    <option value="general">General Campus Notice</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#1F2933] block">Priority Level</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as IncidentSeverity)}
                    className="w-full h-9 rounded-lg bg-white border border-[#D6D8D5] text-[#1F2933] px-3 text-xs focus:outline-none"
                  >
                    <option value="low">Standard Info</option>
                    <option value="medium">Medium Advisory</option>
                    <option value="high">High Priority</option>
                    <option value="critical">Critical Urgent Notice</option>
                  </select>
                </div>
              </div>

              {/* Title & Message */}
              <div className="space-y-1">
                <label className="font-semibold text-[#1F2933] block">Headline</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Heavy Rain Advisory: Evening Activities Postponed"
                  className="bg-white border-[#D6D8D5] text-xs h-9"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#1F2933] block">Details &amp; Action Instructions</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Provide guidance or instructions for campus members..."
                  rows={3}
                  className="w-full rounded-lg bg-white border border-[#D6D8D5] text-[#1F2933] p-2.5 text-xs focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D6D8D5]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsBroadcastModalOpen(false)}
                  className="text-xs cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isTransmitting}
                  className="bg-[#1F2933] hover:bg-[#111827] text-white font-semibold text-xs cursor-pointer shadow-xs"
                >
                  {isTransmitting ? 'Publishing...' : 'Publish Announcement'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Active Broadcasts List */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-[#1F2933]">
          Active Announcements ({alerts.filter((a) => a.is_active).length})
        </h2>

        {alerts.filter((a) => a.is_active).length === 0 ? (
          <div className="p-8 text-center bg-white rounded-xl border border-[#D6D8D5] space-y-1">
            <p className="text-xs font-semibold text-[#3F8F68]">No active emergency alerts</p>
            <p className="text-[11px] text-[#8A9199]">All campus facilities are operating under standard conditions.</p>
          </div>
        ) : (
          alerts
            .filter((a) => a.is_active)
            .map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border transition-all space-y-2.5 shadow-xs ${
                  alert.severity === 'critical'
                    ? 'border-red-300 bg-red-50/70'
                    : alert.severity === 'high'
                    ? 'border-amber-300 bg-amber-50/70'
                    : 'border-[#D6D8D5] bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm text-[#1F2933]">{alert.title}</span>
                      <SeverityBadge severity={alert.severity} size="sm" />
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#F0F1EF] text-[#667085] border border-[#D6D8D5] capitalize">
                        {alert.scope ? alert.scope.replace('_', ' ') : 'Campus Wide'}
                      </span>
                    </div>
                    <p className="text-xs text-[#667085] leading-relaxed">{alert.message}</p>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => dismissAlert(alert.id)}
                    className="h-7 text-[11px] border-[#D6D8D5] text-[#667085] hover:text-[#1F2933] shrink-0 cursor-pointer"
                  >
                    Dismiss
                  </Button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#8A9199] pt-2 border-t border-[#D6D8D5]/60">
                  <span>Target: <strong className="text-[#1F2933]">{alert.target_entity || 'Campus Wide'}</strong></span>
                  <span>Issued {formatTimeAgo(alert.created_at)}</span>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}
