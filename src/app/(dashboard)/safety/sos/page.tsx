'use client';

import React, { useState, useEffect } from 'react';
import { useSafety } from '@/lib/context/safety-context';
import { useAuth } from '@/lib/hooks/use-auth';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Incident } from '@/lib/types';
import {
  Phone,
  MapPin,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';

export default function SafetySosPage() {
  const { triggerEmergencySos, updateIncidentStatus } = useSafety();
  const { user } = useAuth();

  const [isSosActive, setIsSosActive] = useState(false);
  const [activeSosIncident, setActiveSosIncident] = useState<Incident | null>(null);
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
        'sos_panic',
        coordinates,
        user || undefined,
        `Emergency distress triggered via SOS Beacon. Response unit deployment active.`
      );
      setActiveSosIncident(result.incident);
      setIsSosActive(true);
    } catch (err) {
      console.error('Failed to trigger SOS:', err);
    } finally {
      setIsTriggering(false);
    }
  }, [triggerEmergencySos, locationName, coordinates, user]);

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
    <div className="space-y-8 max-w-3xl mx-auto py-2">
      {/* Header */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-[#1F2933]">
          Emergency SOS
        </h1>
        <p className="text-xs text-[#667085] max-w-md mx-auto">
          Press and hold to immediately transmit your live GPS location and alert Campus Security.
        </p>
      </div>

      {/* Main SOS Trigger */}
      <div className="flex flex-col items-center justify-center py-6 text-center space-y-6">
        {!isSosActive ? (
          <>
            <div className="relative flex items-center justify-center p-8">
              {/* Heartbeat Pulsing Halo */}
              <div className="absolute h-52 w-52 rounded-full bg-red-500/15 animate-ping" />
              <div className="absolute h-44 w-44 rounded-full bg-red-500/25 animate-pulse" />

              <button
                onMouseDown={() => setIsHolding(true)}
                onMouseUp={() => setIsHolding(false)}
                onTouchStart={() => setIsHolding(true)}
                onTouchEnd={() => setIsHolding(false)}
                onClick={executeSosTrigger}
                disabled={isTriggering}
                className="relative z-10 flex h-40 w-40 flex-col items-center justify-center rounded-full bg-gradient-to-b from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-2xl shadow-red-600/40 active:scale-95 transition-all cursor-pointer select-none border-4 border-red-300 group"
              >
                <span className="text-3xl font-black tracking-widest text-white group-hover:scale-105 transition-transform">
                  SOS
                </span>
                <span className="mt-1 text-[11px] font-bold tracking-wider text-red-100 uppercase">
                  {isHolding ? `HOLDING (${holdProgress}%)` : isTriggering ? 'SENDING...' : 'PRESS & HOLD'}
                </span>
              </button>
            </div>

            {/* Hold progress */}
            {isHolding && (
              <div className="w-44 bg-[#F0F1EF] rounded-full h-1.5 overflow-hidden border border-[#D6D8D5]">
                <div
                  className="bg-red-600 h-full transition-all duration-100"
                  style={{ width: `${holdProgress}%` }}
                />
              </div>
            )}

            <div className="inline-flex items-center gap-1.5 text-xs text-[#667085] bg-white px-4 py-1.5 rounded-full border border-[#D6D8D5] shadow-xs">
              <MapPin className="h-3.5 w-3.5 text-red-500" />
              <span>{locationName}</span>
            </div>
          </>
        ) : (
          <div className="space-y-4 w-full max-w-md bg-white p-6 rounded-2xl border border-red-200 shadow-sm animate-in fade-in zoom-in-95 duration-200">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
              <span>Beacon Active · Units Dispatched</span>
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-[#1F2933]">
                Patrol Unit En Route
              </h2>
              <p className="text-xs text-[#667085]">
                Security team notified. ETA ~90 seconds.
              </p>
            </div>

            <div className="rounded-xl bg-[#F7F8F6] border border-[#D6D8D5] p-3 text-xs text-left space-y-1.5">
              <div className="flex justify-between"><span className="text-[#667085]">Incident:</span><span className="font-semibold">{activeSosIncident?.incident_number || 'SOS-ACTIVE'}</span></div>
              <div className="flex justify-between"><span className="text-[#667085]">Responder:</span><span className="font-semibold text-emerald-700">Officer Vikram Sharma</span></div>
              <div className="flex justify-between"><span className="text-[#667085]">Target:</span><span className="font-semibold truncate max-w-[200px]">{locationName}</span></div>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelSos}
                className="text-xs border-red-200 text-red-700 hover:bg-red-50 rounded-lg"
              >
                Cancel Beacon
              </Button>
              <Button asChild size="sm" className="bg-[#1F2933] text-white text-xs rounded-lg">
                <Link href="/security">
                  <span>View Operations</span>
                </Link>
              </Button>
            </div>
          </div>
        )}
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
                className="w-full bg-[#1F2933] hover:bg-[#111827] text-white text-xs rounded-lg"
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
