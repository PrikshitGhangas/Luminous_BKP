'use client';

import React, { useState, useEffect } from 'react';
import { useSafety } from '@/lib/context/safety-context';
import { useAuth } from '@/lib/hooks/use-auth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Incident } from '@/lib/types';
import {
  HeartPulse,
  Phone,
  MapPin,
  CheckCircle2,
  Users,
  Radio,
  Info,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';

export default function SafetySosPage() {
  const { triggerEmergencySos, updateIncidentStatus } = useSafety();
  const { user } = useAuth();

  const [isSosActive, setIsSosActive] = useState(false);
  const [activeSosIncident, setActiveSosIncident] = useState<Incident | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'womens_safety' | 'sos_panic' | 'medical' | 'threat'>('womens_safety');
  const [locationName, setLocationName] = useState('Academic Quadrangle Corridor (GPS Verified ±2m)');
  const [coordinates, setCoordinates] = useState({ lat: 12.9716, lng: 77.5946 });
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isTriggering, setIsTriggering] = useState(false);
  const [escortRequested, setEscortRequested] = useState(false);

  // Simulated GPS fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      setLocationName('Academic Block A, 2nd Floor Corridor (GPS ±3m)');
      setCoordinates({ lat: 12.9724, lng: 77.5952 });
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const executeSosTrigger = React.useCallback(async () => {
    setIsTriggering(true);
    setIsHolding(false);
    try {
      const result = await triggerEmergencySos(
        locationName,
        selectedCategory,
        coordinates,
        user || undefined,
        `Emergency distress triggered via ${selectedCategory === 'womens_safety' ? "Women's Safety Protocol" : 'Panic Beacon'}. Response unit deployment active.`
      );
      setActiveSosIncident(result.incident);
      setIsSosActive(true);
    } catch (err) {
      console.error('Failed to trigger SOS:', err);
    } finally {
      setIsTriggering(false);
    }
  }, [triggerEmergencySos, locationName, selectedCategory, coordinates, user]);

  // Hold to activate progress bar
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isHolding && !isSosActive) {
      interval = setInterval(() => {
        setHoldProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            executeSosTrigger();
            return 100;
          }
          return prev + 10;
        });
      }, 100);
    } else {
      setHoldProgress(0);
    }
    return () => clearInterval(interval);
  }, [isHolding, isSosActive, executeSosTrigger]);

  const handleCancelSos = () => {
    if (activeSosIncident) {
      updateIncidentStatus(
        activeSosIncident.id,
        'false_alarm',
        `${user?.full_name || 'Caller'} (User Cancel)`,
        'SOS cancelled by user / resolved false alarm'
      );
    }
    setIsSosActive(false);
    setActiveSosIncident(null);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Simulation Compliance Notice */}
      <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-start gap-3 text-amber-200">
        <Info className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-0.5">
          <span className="font-bold uppercase tracking-wider font-mono text-[#FFD700]">
            Demo &amp; Training Simulation Notice:
          </span>
          <p className="text-[#F4F1DE] opacity-90 leading-relaxed">
            This student panic SOS interface simulates immediate campus security dispatch and command center incident creation. In a real-world emergency outside campus, always dial your local emergency services (911 / 112).
          </p>
        </div>
      </div>

      {/* Top Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-red-950/80 border border-red-500/40 px-4 py-1 text-xs font-bold text-red-300 font-mono">
          <HeartPulse className="h-4 w-4 animate-pulse text-[#FFD700]" />
          <span>LUMINOUS EMERGENCY DISTRESS MESH</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#F4F1DE] font-mono">
          WOMEN&apos;S SAFETY &amp; INSTANT SOS BEACON
        </h1>
        <p className="text-xs sm:text-sm text-[#B8B5A3] max-w-lg mx-auto">
          Pressing SOS creates a <strong>CRITICAL</strong> priority incident, transmits GPS coordinates, alerts Campus Security SOC, and immediately mobilizes the nearest patrol unit.
        </p>
      </div>

      {/* Distress Category Selector */}
      {!isSosActive && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => setSelectedCategory('womens_safety')}
            className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
              selectedCategory === 'womens_safety'
                ? 'border-pink-500 bg-pink-950/40 text-[#FFD700] ring-2 ring-pink-500/30 font-bold'
                : 'border-[#243356] bg-[#131C38] text-[#B8B5A3] hover:bg-[#1C2541]'
            }`}
          >
            <div className="text-xs font-mono">Women&apos;s Safety</div>
            <div className="text-[10px] opacity-75 mt-0.5">Priority Escort / Threat</div>
          </button>

          <button
            onClick={() => setSelectedCategory('sos_panic')}
            className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
              selectedCategory === 'sos_panic'
                ? 'border-red-500 bg-red-950/40 text-[#FFD700] ring-2 ring-red-500/30 font-bold'
                : 'border-[#243356] bg-[#131C38] text-[#B8B5A3] hover:bg-[#1C2541]'
            }`}
          >
            <div className="text-xs font-mono">Panic SOS</div>
            <div className="text-[10px] opacity-75 mt-0.5">General Distress</div>
          </button>

          <button
            onClick={() => setSelectedCategory('threat')}
            className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
              selectedCategory === 'threat'
                ? 'border-amber-500 bg-amber-950/40 text-[#FFD700] ring-2 ring-amber-500/30 font-bold'
                : 'border-[#243356] bg-[#131C38] text-[#B8B5A3] hover:bg-[#1C2541]'
            }`}
          >
            <div className="text-xs font-mono">Intruder / Threat</div>
            <div className="text-[10px] opacity-75 mt-0.5">Suspicious Activity</div>
          </button>

          <button
            onClick={() => setSelectedCategory('medical')}
            className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
              selectedCategory === 'medical'
                ? 'border-blue-500 bg-blue-950/40 text-[#FFD700] ring-2 ring-blue-500/30 font-bold'
                : 'border-[#243356] bg-[#131C38] text-[#B8B5A3] hover:bg-[#1C2541]'
            }`}
          >
            <div className="text-xs font-mono">Medical Distress</div>
            <div className="text-[10px] opacity-75 mt-0.5">First Aid / Ambulance</div>
          </button>
        </div>
      )}

      {/* Main SOS Trigger Console */}
      <div className="flex flex-col items-center justify-center p-8 bg-[#131C38] rounded-2xl border border-[#243356] shadow-2xl text-center space-y-6">
        {!isSosActive ? (
          <>
            <div className="relative flex items-center justify-center">
              {/* Pulsing rings */}
              <div className="absolute h-60 w-60 rounded-full bg-red-600/10 animate-ping" />
              <div className="absolute h-48 w-48 rounded-full bg-red-600/20" />

              <button
                onMouseDown={() => setIsHolding(true)}
                onMouseUp={() => setIsHolding(false)}
                onTouchStart={() => setIsHolding(true)}
                onTouchEnd={() => setIsHolding(false)}
                onClick={executeSosTrigger}
                disabled={isTriggering}
                className="relative z-10 flex h-40 w-40 flex-col items-center justify-center rounded-full bg-gradient-to-br from-red-600 via-red-700 to-red-950 text-white shadow-2xl shadow-red-600/60 hover:brightness-110 active:scale-95 transition-all cursor-pointer select-none border-4 border-red-400 group"
              >
                <HeartPulse className="h-12 w-12 animate-pulse text-[#FFD700] group-hover:scale-110 transition-transform" />
                <span className="mt-1 text-sm font-extrabold tracking-wider font-mono">
                  {isHolding ? `HOLDING (${holdProgress}%)` : isTriggering ? 'DISPATCHING...' : 'PRESS SOS'}
                </span>
                <span className="text-[9px] uppercase tracking-widest text-red-200 mt-0.5">
                  Click or Hold 1.5s
                </span>
              </button>
            </div>

            {/* Hold progress bar */}
            {isHolding && (
              <div className="w-48 bg-[#0F1026] rounded-full h-2 overflow-hidden border border-[#243356]">
                <div
                  className="bg-[#FFD700] h-full transition-all duration-100"
                  style={{ width: `${holdProgress}%` }}
                />
              </div>
            )}

            <div className="flex items-center gap-2 text-xs font-mono text-[#C5A059] bg-[#0F1026] px-3.5 py-1.5 rounded-full border border-[#243356]">
              <MapPin className="h-4 w-4 text-red-400 animate-bounce" />
              <span>Location: {locationName}</span>
            </div>
          </>
        ) : (
          <div className="space-y-4 py-2 w-full max-w-lg animate-in fade-in zoom-in-95 duration-300">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-600 text-white shadow-2xl shadow-red-600/70 animate-bounce border-2 border-[#FFD700]">
              <Radio className="h-10 w-10 text-[#FFD700]" />
            </div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 font-mono text-xs font-bold">
                <span className="h-2 w-2 rounded-full bg-red-400 animate-ping" />
                <span>ACTIVE DISTRESS BEACON • CRITICAL INCIDENT LOGGED</span>
              </div>
              <h2 className="text-xl font-bold text-[#FFD700] font-mono">
                SECURITY PATROL ALPHA DISPATCHED
              </h2>
              <p className="text-xs text-[#F4F1DE]">
                Security Operations Center &amp; Campus Admin notified. GPS location locked.
              </p>
            </div>

            {/* Live Responder Telemetry */}
            <div className="rounded-xl bg-[#0F1026] border border-[#243356] p-4 text-xs font-mono text-[#F4F1DE] text-left space-y-2">
              <div className="flex items-center justify-between border-b border-[#243356] pb-2">
                <span className="text-[#C5A059]">Incident ID:</span>
                <span className="font-bold text-[#FFD700]">
                  {activeSosIncident?.incident_number || 'SOS-ACTIVE'}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-[#243356] pb-2">
                <span className="text-[#C5A059]">Caller:</span>
                <span className="font-bold">{user?.full_name || 'Aanya Patel'}</span>
              </div>
              <div className="flex items-center justify-between border-b border-[#243356] pb-2">
                <span className="text-[#C5A059]">Assigned Officer:</span>
                <span className="font-bold text-emerald-400">Capt. Vikram Sharma &amp; Officer Ramos</span>
              </div>
              <div className="flex items-center justify-between border-b border-[#243356] pb-2">
                <span className="text-[#C5A059]">Estimated Arrival:</span>
                <span className="font-bold text-[#FFD700] flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 animate-spin" />
                  <span>~90 seconds</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#C5A059]">Direct GPS Target:</span>
                <span className="font-bold text-xs truncate max-w-[200px]">{locationName}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelSos}
                className="text-xs border-red-500/40 text-red-300 hover:bg-red-950/40"
              >
                Cancel Beacon / False Alarm
              </Button>
              <Button asChild size="sm" className="bg-[#D4AF37] text-[#0B132B] font-bold text-xs">
                <Link href="/security">
                  <span>View in Security SOC</span>
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Emergency Contacts & Night Escort Service */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Helplines */}
        <Card className="bg-[#0F1026] border-[#243356] text-[#F4F1DE]">
          <CardHeader className="p-4 pb-2 border-b border-[#243356]">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#C5A059] font-mono flex items-center justify-between">
              <span>Direct Emergency Helplines</span>
              <Phone className="h-4 w-4 text-[#FFD700]" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-2.5">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#131C38] border border-[#243356]">
              <div>
                <p className="text-xs font-bold text-[#F4F1DE]">Campus Security SOC Desk</p>
                <p className="text-[11px] text-[#C5A059] font-mono">+1 (555) 019-9111</p>
              </div>
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-[#243356] text-emerald-400">
                <Phone className="h-3 w-3" />
                <span>Call</span>
              </Button>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#131C38] border border-[#243356]">
              <div>
                <p className="text-xs font-bold text-[#F4F1DE]">Women&apos;s Safety Rapid Helpline</p>
                <p className="text-[11px] text-[#C5A059] font-mono">+1 (555) 019-9115 (Toll Free)</p>
              </div>
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-pink-500/40 text-pink-300">
                <Phone className="h-3 w-3" />
                <span>Call</span>
              </Button>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#131C38] border border-[#243356]">
              <div>
                <p className="text-xs font-bold text-[#F4F1DE]">Campus Ambulance &amp; Medical Centre</p>
                <p className="text-[11px] text-[#C5A059] font-mono">+1 (555) 019-9112</p>
              </div>
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-[#243356] text-emerald-400">
                <Phone className="h-3 w-3" />
                <span>Call</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Night Walk Safety Escort */}
        <Card className="bg-[#0F1026] border-[#243356] text-[#F4F1DE]">
          <CardHeader className="p-4 pb-2 border-b border-[#243356]">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#C5A059] font-mono flex items-center justify-between">
              <span>Night Walk Safety Escort Service</span>
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-xs">
            <p className="text-[#B8B5A3] leading-relaxed">
              Walking alone after dark from the library, laboratory, or bus terminal to your hostel? Request a vetted campus security officer escort.
            </p>
            <div className="flex items-center gap-2 font-medium text-emerald-400">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Available 24/7 campus-wide with female officer request option</span>
            </div>

            {escortRequested ? (
              <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs font-mono flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Escort requested! Officer Ramos assigned. Meet at current entrance in 3 mins.</span>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={() => setEscortRequested(true)}
                className="w-full bg-[#1C2541] hover:bg-[#243356] text-[#F4F1DE] border border-[#243356] text-xs gap-2 font-mono"
              >
                <Users className="h-3.5 w-3.5 text-[#FFD700]" />
                <span>Request Security Officer Escort</span>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
