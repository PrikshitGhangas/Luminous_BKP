'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSafety } from '@/lib/context/safety-context';
import { useAuth } from '@/lib/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Incident } from '@/lib/types';
import {
  MapPin,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Radio,
  MessageSquare,
  PhoneCall,
  PhoneOff,
  UserCheck,
  Send,
  WifiOff,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';

export default function SafetySosPage() {
  const { triggerEmergencySos, updateIncidentStatus, escalateIncident } = useSafety();
  const { user } = useAuth();

  const [isSosActive, setIsSosActive] = useState(false);
  const [activeSosIncident, setActiveSosIncident] = useState<Incident | null>(null);
  const [locationName, setLocationName] = useState('Academic Quadrangle Corridor (GPS Verified ±2m)');
  const [coordinates, setCoordinates] = useState({ lat: 12.9716, lng: 77.5946 });

  // Hold state for Police SOS
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isTriggering, setIsTriggering] = useState(false);
  const [escortRequested, setEscortRequested] = useState(false);

  // Tap counter state (3 clicks vs 5 clicks)
  const [tapCount, setTapCount] = useState(0);
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 5-minute SLA countdown timer for Level 1 Campus SOS
  const [secondsRemaining, setSecondsRemaining] = useState<number>(300);

  // Offline SMS Failsafe State
  const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);
  const [copiedSms, setCopiedSms] = useState(false);

  // Fake Call State
  const [isFakeCallActive, setIsFakeCallActive] = useState(false);
  const [fakeCallTimer, setFakeCallTimer] = useState(0);
  const [isCallAnswered, setIsCallAnswered] = useState(false);

  // Simulated GPS fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      setLocationName('Academic Block D, 2nd Floor Corridor (GPS ±3m)');
      setCoordinates({ lat: 12.9724, lng: 77.5952 });
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Fake call timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isFakeCallActive && isCallAnswered) {
      interval = setInterval(() => {
        setFakeCallTimer((t) => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isFakeCallActive, isCallAnswered]);

  // Execute SOS Trigger
  const executeSosTrigger = useCallback(
    async (level: 'campus' | 'police' = 'campus') => {
      setIsTriggering(true);
      setIsHolding(false);
      setTapCount(0);
      try {
        const result = await triggerEmergencySos(
          locationName,
          'sos_panic',
          coordinates,
          user || undefined,
          level === 'police'
            ? `Level 2 Emergency Distress Beacon (Police & Multi-Squad) activated at ${locationName}.`
            : `Level 1 Campus Distress Beacon (Nearest Guard/Volunteer) activated at ${locationName}. 5-minute auto-escalation active.`,
          level
        );
        setActiveSosIncident(result.incident);
        setIsSosActive(true);
        setSecondsRemaining(300);
      } catch (err) {
        console.error('Failed to trigger SOS:', err);
      } finally {
        setIsTriggering(false);
      }
    },
    [triggerEmergencySos, locationName, coordinates, user]
  );

  // Handle Multi-Tap Click Sensor (3 taps -> Campus, 5 taps -> Police)
  const handleTap = () => {
    if (isSosActive || isTriggering) return;

    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
    }

    const nextCount = tapCount + 1;
    setTapCount(nextCount);

    if (nextCount >= 5) {
      setTapCount(0);
      executeSosTrigger('police');
      return;
    }

    tapTimeoutRef.current = setTimeout(() => {
      if (nextCount >= 3) {
        executeSosTrigger('campus');
      }
      setTapCount(0);
    }, 800);
  };

  // Hold to activate progress bar for Police SOS
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isHolding && !isSosActive) {
      interval = setInterval(() => {
        setHoldProgress((prev) => {
          if (prev >= 100) return 100;
          return prev + 10;
        });
      }, 100);
    } else {
      setHoldProgress(0);
    }
    return () => clearInterval(interval);
  }, [isHolding, isSosActive]);

  // Trigger Police SOS when hold reaches 100%
  useEffect(() => {
    if (holdProgress >= 100 && !isSosActive && !isTriggering) {
      executeSosTrigger('police');
    }
  }, [holdProgress, isSosActive, isTriggering, executeSosTrigger]);

  // SLA Countdown Timer for Level 1 Campus SOS
  useEffect(() => {
    if (!isSosActive || !activeSosIncident) return;
    if (activeSosIncident.sos_level === 'police') return;

    if (secondsRemaining <= 0) {
      escalateIncident(activeSosIncident.id, '5-minute SLA expired with no guard resolution');
      setActiveSosIncident((prevInc) =>
        prevInc ? { ...prevInc, sos_level: 'police', auto_escalated: true } : null
      );
      return;
    }

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, [isSosActive, activeSosIncident, secondsRemaining, escalateIncident]);

  const handleManualEscalate = () => {
    if (activeSosIncident) {
      escalateIncident(activeSosIncident.id, 'Manually escalated by caller to Level 2 Police/Admin');
      setActiveSosIncident((prev) =>
        prev ? { ...prev, sos_level: 'police', auto_escalated: true } : null
      );
    }
  };

  const handleCancelSos = () => {
    if (activeSosIncident) {
      updateIncidentStatus(activeSosIncident.id, 'false_alarm');
    }
    setIsSosActive(false);
    setActiveSosIncident(null);
    setHoldProgress(0);
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const isLevelPolice = activeSosIncident?.sos_level === 'police';

  // Construct Zero-Data Offline SMS Payload
  const studentName = user?.full_name || 'Aanya Patel';
  const emergencySmsBody = `[EMERGENCY SOS - LUMINOUS CAMPUS DISPATCH]
Student: ${studentName} (CSE-3A)
Distress Level: LEVEL 1 (CAMPUS EMERGENCY)
Location: ${locationName}
GPS Link: https://maps.google.com/?q=${coordinates.lat},${coordinates.lng}
Indoor Timetable Fallback: Block D, Room 201 (Chem Lab)
Medical: Blood Group B+, Asthmatic (Inhaler)
Guardian: Rajesh Patel (+91 98454 15882)`;

  const smsUri = `sms:112?body=${encodeURIComponent(emergencySmsBody)}`;

  const handleCopySms = () => {
    navigator.clipboard.writeText(emergencySmsBody);
    setCopiedSms(true);
    setTimeout(() => setCopiedSms(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Fake Call Overlay Modal */}
      {isFakeCallActive && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 text-white p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-[#111827] border border-gray-800 p-8 text-center space-y-8 shadow-2xl">
            <div className="space-y-2">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#EAB308]/20 text-[#EAB308] ring-4 ring-[#EAB308]/30 animate-pulse">
                <PhoneCall className="h-10 w-10" />
              </div>
              <h2 className="text-xl font-bold">Dad (Rajesh Patel)</h2>
              <p className="text-xs text-gray-400">
                {isCallAnswered
                  ? `In Call — ${Math.floor(fakeCallTimer / 60)}:${(fakeCallTimer % 60).toString().padStart(2, '0')}`
                  : 'Incoming Call...'}
              </p>
            </div>

            {isCallAnswered ? (
              <div className="space-y-4">
                <p className="text-xs text-gray-300 italic">
                  &quot;Hey, are you on your way back to the hostel? Let me know once you reach.&quot;
                </p>
                <Button
                  onClick={() => {
                    setIsFakeCallActive(false);
                    setIsCallAnswered(false);
                    setFakeCallTimer(0);
                  }}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-full gap-2"
                >
                  <PhoneOff className="h-4 w-4" /> End Call
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 pt-4">
                <Button
                  onClick={() => setIsFakeCallActive(false)}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-full gap-2"
                >
                  <PhoneOff className="h-4 w-4" /> Decline
                </Button>
                <Button
                  onClick={() => setIsCallAnswered(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-full gap-2 animate-bounce"
                >
                  <PhoneCall className="h-4 w-4" /> Accept
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Offline SMS Failsafe Modal */}
      {isSmsModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-white border border-[#D6D8D5] p-6 space-y-4 shadow-2xl text-left">
            <div className="flex items-center justify-between border-b border-[#D6D8D5] pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600">
                  <WifiOff className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1F2933]">Zero-Data Offline SMS Failsafe</h3>
                  <p className="text-[11px] text-[#667085]">Transmits emergency coordinates without Wi-Fi or cellular data</p>
                </div>
              </div>
              <button
                onClick={() => setIsSmsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#1F2933]">Pre-Compiled Emergency Telemetry Packet:</label>
              <textarea
                readOnly
                value={emergencySmsBody}
                rows={7}
                className="w-full rounded-xl border border-[#D6D8D5] bg-[#F7F8F6] p-3 text-xs font-mono text-[#1F2933] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopySms}
                className="text-xs rounded-lg gap-1.5"
              >
                {copiedSms ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <Send className="h-3.5 w-3.5" />}
                <span>{copiedSms ? 'Copied to Clipboard' : 'Copy Message'}</span>
              </Button>

              <a
                href={smsUri}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Launch Native SMS App</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1F2933]">Emergency SOS &amp; Safety Hub</h1>
        <p className="text-xs text-[#667085] mt-0.5">
          Multi-tier distress broadcasting, offline SMS failsafe, and 24/7 campus responder telemetry
        </p>
      </div>

      {/* Main Interactive SOS Hero Arena */}
      <div className="flex flex-col items-center justify-center p-8 bg-white border border-[#D6D8D5] rounded-2xl shadow-xs space-y-6 text-center">
        {!isSosActive ? (
          <>
            <div className="space-y-2 max-w-md">
              <h2 className="text-lg font-bold text-[#1F2933]">Tap or Hold for Emergency Response</h2>
              <p className="text-xs text-[#667085]">
                Level 1 dispatches the nearest on-duty security guard. Level 2 alerts Police (112), administrators, and guardians.
              </p>
            </div>

            {/* Giant Big Red SOS Beacon Button */}
            <div className="relative flex flex-col items-center justify-center my-4">
              <button
                onClick={handleTap}
                onMouseDown={() => setIsHolding(true)}
                onMouseUp={() => setIsHolding(false)}
                onTouchStart={() => setIsHolding(true)}
                onTouchEnd={() => setIsHolding(false)}
                disabled={isTriggering}
                className="relative flex h-48 w-48 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-700 text-white font-extrabold text-3xl shadow-xl shadow-red-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer border-4 border-red-300"
                aria-label="Emergency SOS Trigger"
              >
                <span className="tracking-wider">SOS</span>
                {tapCount > 0 && (
                  <span className="absolute bottom-6 text-[11px] font-bold tracking-normal bg-black/40 px-2.5 py-0.5 rounded-full">
                    {tapCount} {tapCount === 1 ? 'Tap' : 'Taps'}
                  </span>
                )}
              </button>

              {/* Hold Progress Ring */}
              {isHolding && (
                <div className="w-56 bg-gray-200 rounded-full h-2.5 mt-4 overflow-hidden border border-[#D6D8D5]">
                  <div
                    className="bg-red-600 h-2.5 rounded-full transition-all duration-100"
                    style={{ width: `${holdProgress}%` }}
                  />
                </div>
              )}
            </div>

            {/* Two Tier Quick Triggers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg text-left">
              {/* Level 1: 3 Clicks (Campus Guard Dispatch) */}
              <button
                onClick={() => executeSosTrigger('campus')}
                disabled={isTriggering}
                className="p-3.5 rounded-xl border border-amber-300 bg-amber-50/70 hover:bg-amber-100/70 transition-all text-[#1F2933] cursor-pointer group space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-md">
                    <Radio className="h-3 w-3" />
                    <span>3 Clicks</span>
                  </span>
                  <span className="text-[10px] font-semibold text-amber-700">Level 1</span>
                </div>
                <p className="text-xs font-bold text-[#1F2933]">Campus Security Guard</p>
                <p className="text-[11px] text-[#667085] leading-snug">
                  Dispatches the nearest campus guard and notifies on-duty staff. 5-min auto-escalation timer.
                </p>
              </button>

              {/* Level 2: 5 Clicks / Hold 3s (Police & Emergency) */}
              <button
                onClick={() => executeSosTrigger('police')}
                disabled={isTriggering}
                className="p-3.5 rounded-xl border border-red-300 bg-red-50/70 hover:bg-red-100/70 transition-all text-[#1F2933] cursor-pointer group space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-800 bg-red-200/80 px-2 py-0.5 rounded-md">
                    <Radio className="h-3 w-3" />
                    <span>5 Clicks / Hold 3s</span>
                  </span>
                  <span className="text-[10px] font-semibold text-red-700">Level 2</span>
                </div>
                <p className="text-xs font-bold text-[#1F2933]">Police &amp; Emergency Alert</p>
                <p className="text-[11px] text-[#667085] leading-snug">
                  Immediate emergency broadcast to Police (112), all campus guards, and Administration.
                </p>
              </button>
            </div>

            <div className="inline-flex items-center gap-1.5 text-xs text-[#667085] bg-white px-4 py-1.5 rounded-full border border-[#D6D8D5] shadow-xs">
              <MapPin className="h-3.5 w-3.5 text-red-500" />
              <span>{locationName}</span>
            </div>
          </>
        ) : (
          <div className="space-y-4 w-full max-w-lg bg-white p-6 rounded-2xl border border-red-200 shadow-lg animate-in fade-in zoom-in-95 duration-200 text-left">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                <span>
                  {isLevelPolice
                    ? 'Level 2: Police & Campus-Wide Alert Active'
                    : 'Level 1: Campus Guard Dispatched'}
                </span>
              </div>

              {!isLevelPolice && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold font-mono">
                  <Clock className="h-3.5 w-3.5 text-amber-600" />
                  <span>SLA Timer: {formatTimer(secondsRemaining)}</span>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-[#1F2933]">
                {isLevelPolice ? 'Emergency Response Active' : 'Campus Guard En Route'}
              </h2>
              <p className="text-xs text-[#667085]">
                {isLevelPolice
                  ? 'All campus security units and local police authorities notified.'
                  : 'Nearest campus guard deployed. If unacknowledged within 5 minutes, auto-escalates to Police and Admin.'}
              </p>
            </div>

            {/* 5-Min SLA Progress Bar */}
            {!isLevelPolice && (
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-[#667085]">
                  <span>5-Minute Auto-Escalation SLA</span>
                  <span className="font-mono font-semibold text-amber-700">{formatTimer(secondsRemaining)} remaining</span>
                </div>
                <div className="w-full bg-[#F0F1EF] rounded-full h-2 overflow-hidden border border-[#D6D8D5]">
                  <div
                    className="bg-amber-500 h-full transition-all duration-1000"
                    style={{ width: `${(secondsRemaining / 300) * 100}%` }}
                  />
                </div>
              </div>
            )}

            <div className="rounded-xl bg-[#F7F8F6] border border-[#D6D8D5] p-3.5 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-[#667085]">Incident ID:</span>
                <span className="font-mono font-semibold text-[#1F2933]">{activeSosIncident?.incident_number || 'SOS-ACTIVE'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#667085]">Assigned Staff:</span>
                <span className="font-semibold text-emerald-700">{activeSosIncident?.assigned_officer_name || 'Ramesh Ramos (Campus Guard)'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#667085]">Location:</span>
                <span className="font-semibold text-[#1F2933] truncate max-w-[240px]">{locationName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#667085]">Escalation Mode:</span>
                <span className={`font-semibold ${isLevelPolice ? 'text-red-600' : 'text-amber-600'}`}>
                  {isLevelPolice ? 'Level 2 (Police & Chancellor Office)' : 'Level 1 (5-Min Auto-Escalation)'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelSos}
                className="text-xs border-red-200 text-red-700 hover:bg-red-50 rounded-lg cursor-pointer"
              >
                Cancel Beacon (False Alarm)
              </Button>

              {!isLevelPolice ? (
                <Button
                  size="sm"
                  onClick={handleManualEscalate}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-lg gap-1.5 cursor-pointer shadow-xs"
                >
                  <ShieldAlert className="h-3.5 w-3.5" />
                  <span>Escalate to Police Now</span>
                </Button>
              ) : (
                <Button asChild size="sm" className="bg-[#1F2933] text-white text-xs rounded-lg cursor-pointer">
                  <Link href="/security">
                    <span>View Security Operations</span>
                  </Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Secondary Quick Action Tools: Offline SMS + Women's Safety */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Offline Zero-Data SMS SOS Failsafe */}
        <div className="p-5 rounded-2xl bg-white border border-[#D6D8D5] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600">
                <WifiOff className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-[#1F2933]">Offline SMS SOS Failsafe</h3>
            </div>
            <span className="text-[10px] font-semibold bg-red-50 text-red-700 px-2 py-0.5 rounded-md border border-red-200">
              Zero Internet Needed
            </span>
          </div>
          <p className="text-xs text-[#667085] leading-relaxed">
            In campus basements, elevators, or dead-zones without Wi-Fi or mobile data, generate an encrypted cellular SMS payload containing your live GPS coordinates, academic building fallback, and medical notes.
          </p>
          <div className="pt-1 flex gap-2">
            <Button
              onClick={() => setIsSmsModalOpen(true)}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold gap-1.5 rounded-lg"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Preview &amp; Send Offline SMS</span>
            </Button>
          </div>
        </div>

        {/* Women's Safety: Fake Call Simulator */}
        <div className="p-5 rounded-2xl bg-white border border-[#D6D8D5] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FAF5E6] text-[#8a6d1a]">
                <PhoneCall className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-[#1F2933]">Fake Call Simulation</h3>
            </div>
            <span className="text-[10px] font-semibold bg-[#FAF5E6] text-[#8a6d1a] px-2 py-0.5 rounded-md border border-[#EAB308]/30">
              Discreet Exit
            </span>
          </div>
          <p className="text-xs text-[#667085] leading-relaxed">
            Trigger a realistic simulated incoming phone call with ringtone and caller ID to excuse yourself from uncomfortable, suspicious, or unsafe situations.
          </p>
          <div className="pt-1">
            <Button
              onClick={() => setIsFakeCallActive(true)}
              variant="outline"
              className="w-full text-xs font-semibold gap-1.5 rounded-lg border-[#D6D8D5] hover:bg-[#F7F8F6]"
            >
              <PhoneCall className="h-3.5 w-3.5 text-[#8a6d1a]" />
              <span>Trigger Fake Call Now</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Helplines & Night Walk Support */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#D6D8D5]">
        {/* Helplines */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-[#1F2933] block">
            Emergency Helplines (India)
          </span>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#D6D8D5]">
              <div>
                <p className="text-xs font-semibold text-[#1F2933]">Campus Security Control Room</p>
                <p className="text-[11px] text-[#667085]">080-2360-0100 / 112</p>
              </div>
              <a
                href="tel:112"
                className="px-3 py-1 rounded-full bg-[#F0F1EF] hover:bg-[#E8E9E7] text-xs font-medium text-[#1F2933]"
              >
                Call 112
              </a>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#D6D8D5]">
              <div>
                <p className="text-xs font-semibold text-[#1F2933]">Women&apos;s Safety Helpline</p>
                <p className="text-[11px] text-[#667085]">1091 / 181 (Toll Free)</p>
              </div>
              <a
                href="tel:1091"
                className="px-3 py-1 rounded-full bg-[#F0F1EF] hover:bg-[#E8E9E7] text-xs font-medium text-[#1F2933]"
              >
                Call 1091
              </a>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#D6D8D5]">
              <div>
                <p className="text-xs font-semibold text-[#1F2933]">Campus Medical &amp; Ambulance</p>
                <p className="text-[11px] text-[#667085]">108 / 080-2360-0108</p>
              </div>
              <a
                href="tel:108"
                className="px-3 py-1 rounded-full bg-[#F0F1EF] hover:bg-[#E8E9E7] text-xs font-medium text-[#1F2933]"
              >
                Call 108
              </a>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#D6D8D5]">
              <div>
                <p className="text-xs font-semibold text-[#1F2933]">National Anti-Ragging Helpline</p>
                <p className="text-[11px] text-[#667085]">1800-180-5522 (Toll Free)</p>
              </div>
              <a
                href="tel:18001805522"
                className="px-3 py-1 rounded-full bg-[#F0F1EF] hover:bg-[#E8E9E7] text-xs font-medium text-[#1F2933]"
              >
                Call
              </a>
            </div>
          </div>
        </div>

        {/* Night Walk Escort */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-[#1F2933] block">
            Night Walk Escort
          </span>
          <div className="p-3.5 rounded-xl bg-white border border-[#D6D8D5] space-y-2.5">
            <p className="text-xs text-[#667085] leading-relaxed">
              Walking alone after dark? Request an on-duty campus security officer to accompany you.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Available 24/7 campus-wide</span>
            </div>

            {escortRequested ? (
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>Officer Ramos assigned — meeting at entrance.</span>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={() => setEscortRequested(true)}
                className="w-full bg-[#1F2933] hover:bg-[#111827] text-white text-xs rounded-lg cursor-pointer"
              >
                Request Escort
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
