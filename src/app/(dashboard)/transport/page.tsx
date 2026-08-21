'use client';

import React, { useState } from 'react';
import { useCampusServices } from '@/lib/context/campus-services-context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Bus,
  MapPin,
  Phone,
  Clock,
  Navigation,
  AlertTriangle,
  Plus,
  Users,
  X,
  CreditCard,
} from 'lucide-react';
import { StatCard } from '@/components/shared/stat-card';

export default function TransportPage() {
  const {
    transportRoutes,
    transportVehicles,
    transportPasses,
    transportAdvisories,
    applyTransportPass,
  } = useCampusServices();

  const [activeTab, setActiveTab] = useState<'routes' | 'fleet' | 'live_gps' | 'passes' | 'advisories'>('routes');
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);

  // Pass Form State
  const [selectedRoute, setSelectedRoute] = useState('BUS-R1');
  const [selectedStop, setSelectedStop] = useState('Central Metro Station');
  const [studentName, setStudentName] = useState('Aanya Patel');
  const [rollNumber, setRollNumber] = useState('CS23B042');

  const handlePassApply = (e: React.FormEvent) => {
    e.preventDefault();
    applyTransportPass(selectedRoute, selectedStop, studentName, rollNumber);
    setIsPassModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#243356] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F4F1DE] font-mono flex items-center gap-2.5">
            <Bus className="h-6 w-6 text-[#FFD700]" />
            <span>CAMPUS TRANSPORTATION &amp; BUS FLEET DESK</span>
          </h1>
          <p className="text-xs text-[#B8B5A3] mt-1 font-sans">
            Bus fleet tracking, morning pickup schedules, driver communication, live GPS telemetry, and transit passes
          </p>
        </div>

        <Button
          onClick={() => setIsPassModalOpen(true)}
          size="sm"
          className="bg-gradient-to-r from-[#D4AF37] to-[#C5A059] hover:opacity-90 text-[#0B132B] font-bold text-xs gap-1.5 shadow-md shadow-[#D4AF37]/20"
        >
          <Plus className="h-4 w-4" />
          <span>Apply for Student Transit Pass</span>
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <StatCard
          title="Active Bus Fleet"
          value={transportVehicles.length.toString()}
          description="GPS Monitored Buses"
          icon={<Bus className="h-5 w-5" />}
          variant="primary"
        />
        <StatCard
          title="Official Routes"
          value={transportRoutes.length.toString()}
          description="Connecting Metro & Suburbs"
          icon={<Navigation className="h-5 w-5" />}
          variant="success"
        />
        <StatCard
          title="Subscribed Commuters"
          value={transportRoutes.reduce((acc, r) => acc + r.subscribedCount, 0).toString()}
          description="Students & Staff"
          icon={<Users className="h-5 w-5" />}
          variant="warning"
        />
        <StatCard
          title="Route Status"
          value="ON TIME"
          description="1 Active Delay Advisory"
          icon={<Clock className="h-5 w-5" />}
          variant="primary"
        />
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#243356] pb-2 overflow-x-auto">
        {[
          { id: 'routes', label: 'Bus Routes & Timetable', icon: Navigation },
          { id: 'fleet', label: 'Fleet Vehicles & Drivers', icon: Bus },
          { id: 'live_gps', label: 'Live GPS Telemetry', icon: MapPin },
          { id: 'passes', label: 'My Transit Passes', icon: CreditCard, count: transportPasses.length },
          { id: 'advisories', label: 'Traffic & Delay Advisories', icon: AlertTriangle, count: transportAdvisories.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[#D4AF37] text-[#0B132B] shadow-md shadow-[#D4AF37]/20'
                  : 'bg-[#0F1026] text-[#B8B5A3] border border-[#243356] hover:text-white hover:border-[#D4AF37]/50'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold ${isActive ? 'bg-[#0B132B] text-[#FFD700]' : 'bg-[#1C2541] text-[#FFD700]'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: ROUTES */}
      {activeTab === 'routes' && (
        <div className="space-y-3">
          {transportRoutes.map((r) => (
            <Card key={r.id} className="bg-[#0F1026] border-[#243356] text-[#F4F1DE]">
              <CardHeader className="p-4 border-b border-[#243356] bg-[#131C38]/60 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold font-mono text-[#F4F1DE]">
                    {r.routeName} ({r.routeCode})
                  </CardTitle>
                  <p className="text-[11px] font-mono text-[#C5A059] mt-0.5">
                    Start: {r.startPoint} ➔ End: {r.endPoint}
                  </p>
                </div>
                <Badge className="bg-[#1C2541] text-[#FFD700] border-[#243356] font-mono text-[10px]">
                  Departure: {r.departureTime}
                </Badge>
              </CardHeader>

              <CardContent className="p-4 space-y-3 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-[#B8B5A3]">
                  <span>Vehicle Assigned: <strong className="text-[#F4F1DE]">{r.assignedBusNo}</strong></span>
                  <span>Duration: {r.estimatedDuration}</span>
                  <span>Subscribers: <strong className="text-[#FFD700]">{r.subscribedCount} / {r.capacity} Seats</strong></span>
                </div>

                <div>
                  <p className="text-[10px] font-mono text-[#C5A059] uppercase font-bold mb-1.5">Route Stops Sequence:</p>
                  <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
                    {r.stops.map((stop, idx) => (
                      <React.Fragment key={stop}>
                        <span className="px-2 py-1 rounded bg-[#131C38] border border-[#243356] text-[#F4F1DE]">
                          {stop}
                        </span>
                        {idx < r.stops.length - 1 && <span className="text-[#C5A059]">➔</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* TAB 2: FLEET & DRIVERS */}
      {activeTab === 'fleet' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {transportVehicles.map((v) => (
            <Card key={v.id} className="bg-[#0F1026] border-[#243356] text-[#F4F1DE]">
              <CardHeader className="p-4 border-b border-[#243356] bg-[#131C38]/60 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold font-mono text-[#F4F1DE] flex items-center gap-2">
                    <Bus className="h-4 w-4 text-[#FFD700]" />
                    <span>Bus Reg: {v.busNumber}</span>
                  </CardTitle>
                  <p className="text-[11px] font-mono text-[#C5A059] mt-0.5">Assigned Route: {v.routeCode}</p>
                </div>
                <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30 font-mono text-[10px]">
                  {v.status}
                </Badge>
              </CardHeader>
              <CardContent className="p-4 space-y-3 text-xs font-mono">
                <div className="space-y-1 text-[11px] text-[#B8B5A3]">
                  <p>Driver Name: <strong className="text-[#F4F1DE]">{v.driverName}</strong></p>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-[#C5A059]" />
                    <span>Phone: {v.driverPhone}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-[#131C38] p-2.5 rounded-lg border border-[#243356] text-center text-[10px]">
                  <div>
                    <span className="text-[#C5A059] block">CURRENT STOP</span>
                    <span className="font-bold text-[#F4F1DE]">{v.currentLocationStop}</span>
                  </div>
                  <div>
                    <span className="text-[#C5A059] block">SPEED</span>
                    <span className="font-bold text-[#FFD700]">{v.speedKmH} km/h</span>
                  </div>
                  <div>
                    <span className="text-[#C5A059] block">FUEL LEVEL</span>
                    <span className="font-bold text-emerald-400">{v.fuelLevelPercent}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* TAB 3: LIVE GPS */}
      {activeTab === 'live_gps' && (
        <Card className="bg-[#0F1026] border-[#243356] text-[#F4F1DE]">
          <CardHeader className="p-4 border-b border-[#243356] bg-[#131C38]/60">
            <CardTitle className="text-xs font-mono font-bold uppercase tracking-wider text-[#FFD700] flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>Live Transit GPS Location Simulation</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {transportVehicles.map((v) => (
              <div key={v.id} className="bg-[#131C38] p-4 rounded-xl border border-[#243356] space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#F4F1DE]">{v.busNumber} ({v.routeCode})</span>
                  <span className="text-emerald-400 text-xs font-bold animate-pulse">● LIVE GPS ACTIVE ({v.speedKmH} km/h)</span>
                </div>
                <div className="relative h-2.5 w-full bg-[#0F1026] rounded-full border border-[#243356] overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#D4AF37] to-[#10B981] w-3/4 rounded-full" />
                </div>
                <div className="flex justify-between text-[11px] text-[#B8B5A3]">
                  <span>Passed: {v.currentLocationStop}</span>
                  <span>Next Stop: <strong className="text-[#FFD700]">{v.nextStop}</strong></span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* TAB 4: MY TRANSIT PASSES */}
      {activeTab === 'passes' && (
        <div className="space-y-3">
          {transportPasses.map((tp) => (
            <Card key={tp.id} className="bg-[#0F1026] border-2 border-[#D4AF37] text-[#F4F1DE]">
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-[#FFD700]" />
                    <span className="font-bold text-sm">{tp.studentName}</span>
                    <Badge className="bg-[#1C2541] text-[#FFD700] border-[#243356] font-mono text-[10px]">
                      {tp.rollNumber}
                    </Badge>
                  </div>
                  <p className="text-[#B8B5A3] text-[11px]">
                    Assigned Route: <strong className="text-[#F4F1DE]">{tp.routeCode}</strong> · Boarding Stop: {tp.pickupStop}
                  </p>
                  <p className="text-[11px] text-[#C5A059]">Validity: {tp.validityPeriod}</p>
                </div>
                <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30 font-bold self-start sm:self-center">
                  PASS ACTIVE
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* TAB 5: ADVISORIES */}
      {activeTab === 'advisories' && (
        <div className="space-y-3">
          {transportAdvisories.map((adv) => (
            <Card key={adv.id} className="bg-[#0F1026] border-[#243356] text-[#F4F1DE]">
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                    <span className="font-bold text-sm text-[#F4F1DE]">{adv.title}</span>
                    <Badge className="bg-amber-500/15 text-amber-300 border-amber-500/30 text-[10px]">
                      {adv.routeCode}
                    </Badge>
                  </div>
                  <p className="text-[#B8B5A3] text-[11px]">{adv.message}</p>
                </div>
                <span className="text-[10px] text-[#C5A059]">Posted: {new Date(adv.postedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal: APPLY FOR TRANSIT PASS */}
      {isPassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <Card className="w-full max-w-md bg-[#0F1026] border-[#243356] text-[#F4F1DE]">
            <CardHeader className="p-4 border-b border-[#243356] flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold font-mono text-[#FFD700] flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <span>Apply for Student Bus Transit Pass</span>
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsPassModalOpen(false)}
                className="h-6 w-6 text-[#B8B5A3] hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-4 space-y-3.5">
              <form onSubmit={handlePassApply} className="space-y-3 text-xs">
                <div>
                  <label className="text-[10px] font-mono text-[#C5A059] uppercase block mb-1">Select Bus Route *</label>
                  <select
                    value={selectedRoute}
                    onChange={(e) => setSelectedRoute(e.target.value)}
                    className="w-full rounded-md bg-[#131C38] border border-[#243356] p-2 text-xs text-[#F4F1DE]"
                  >
                    {transportRoutes.map((r) => (
                      <option key={r.id} value={r.routeCode}>{r.routeName} ({r.routeCode})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-[#C5A059] uppercase block mb-1">Pickup Boarding Stop *</label>
                  <Input
                    required
                    value={selectedStop}
                    onChange={(e) => setSelectedStop(e.target.value)}
                    className="bg-[#131C38] border-[#243356] text-xs text-[#F4F1DE]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-[#C5A059] uppercase block mb-1">Student Name</label>
                    <Input
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="bg-[#131C38] border-[#243356] text-xs text-[#F4F1DE]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-[#C5A059] uppercase block mb-1">Roll Number</label>
                    <Input
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      className="bg-[#131C38] border-[#243356] text-xs text-[#F4F1DE]"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#243356]">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsPassModalOpen(false)}
                    className="text-xs border-[#243356]"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#D4AF37] hover:bg-[#C5A059] text-[#0B132B] font-bold text-xs"
                  >
                    Issue Transit Pass
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
