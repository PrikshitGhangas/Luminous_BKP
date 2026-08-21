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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D0D1D6] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#202226] font-mono flex items-center gap-2.5">
            <Bus className="h-6 w-6 text-[#B45309]" />
            <span>CAMPUS TRANSPORTATION &amp; BUS FLEET DESK</span>
          </h1>
          <p className="text-xs text-[#555960] mt-1 font-sans">
            Bus fleet tracking, morning pickup schedules, driver communication, live GPS telemetry, and transit passes
          </p>
        </div>

        <Button
          onClick={() => setIsPassModalOpen(true)}
          size="sm"
          className="bg-gradient-to-r from-[#EAB308] to-[#D4AF37] hover:opacity-90 text-[#0B132B] font-bold text-xs gap-1.5 shadow-md shadow-[#D4AF37]/20"
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
      <div className="flex items-center gap-2 border-b border-[#D0D1D6] pb-2 overflow-x-auto">
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
                  ? 'bg-[#EAB308] text-[#0B132B] shadow-md shadow-[#D4AF37]/20'
                  : 'bg-[#F4F5F6] text-[#555960] border border-[#D0D1D6] hover:text-white hover:border-[#EAB308]/50'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold ${isActive ? 'bg-white text-[#B45309]' : 'bg-[#E7E8EB] text-[#B45309]'}`}>
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
            <Card key={r.id} className="bg-[#F4F5F6] border-[#D0D1D6] text-[#202226]">
              <CardHeader className="p-4 border-b border-[#D0D1D6] bg-white/60 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold font-mono text-[#202226]">
                    {r.routeName} ({r.routeCode})
                  </CardTitle>
                  <p className="text-[11px] font-mono text-[#B45309] mt-0.5">
                    Start: {r.startPoint} ➔ End: {r.endPoint}
                  </p>
                </div>
                <Badge className="bg-[#E7E8EB] text-[#B45309] border-[#D0D1D6] font-mono text-[10px]">
                  Departure: {r.departureTime}
                </Badge>
              </CardHeader>

              <CardContent className="p-4 space-y-3 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-[#555960]">
                  <span>Vehicle Assigned: <strong className="text-[#202226]">{r.assignedBusNo}</strong></span>
                  <span>Duration: {r.estimatedDuration}</span>
                  <span>Subscribers: <strong className="text-[#B45309]">{r.subscribedCount} / {r.capacity} Seats</strong></span>
                </div>

                <div>
                  <p className="text-[10px] font-mono text-[#B45309] uppercase font-bold mb-1.5">Route Stops Sequence:</p>
                  <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
                    {r.stops.map((stop, idx) => (
                      <React.Fragment key={stop}>
                        <span className="px-2 py-1 rounded bg-white border border-[#D0D1D6] text-[#202226]">
                          {stop}
                        </span>
                        {idx < r.stops.length - 1 && <span className="text-[#B45309]">➔</span>}
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
            <Card key={v.id} className="bg-[#F4F5F6] border-[#D0D1D6] text-[#202226]">
              <CardHeader className="p-4 border-b border-[#D0D1D6] bg-white/60 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold font-mono text-[#202226] flex items-center gap-2">
                    <Bus className="h-4 w-4 text-[#B45309]" />
                    <span>Bus Reg: {v.busNumber}</span>
                  </CardTitle>
                  <p className="text-[11px] font-mono text-[#B45309] mt-0.5">Assigned Route: {v.routeCode}</p>
                </div>
                <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30 font-mono text-[10px]">
                  {v.status}
                </Badge>
              </CardHeader>
              <CardContent className="p-4 space-y-3 text-xs font-mono">
                <div className="space-y-1 text-[11px] text-[#555960]">
                  <p>Driver Name: <strong className="text-[#202226]">{v.driverName}</strong></p>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-[#B45309]" />
                    <span>Phone: {v.driverPhone}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-white p-2.5 rounded-lg border border-[#D0D1D6] text-center text-[10px]">
                  <div>
                    <span className="text-[#B45309] block">CURRENT STOP</span>
                    <span className="font-bold text-[#202226]">{v.currentLocationStop}</span>
                  </div>
                  <div>
                    <span className="text-[#B45309] block">SPEED</span>
                    <span className="font-bold text-[#B45309]">{v.speedKmH} km/h</span>
                  </div>
                  <div>
                    <span className="text-[#B45309] block">FUEL LEVEL</span>
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
        <Card className="bg-[#F4F5F6] border-[#D0D1D6] text-[#202226]">
          <CardHeader className="p-4 border-b border-[#D0D1D6] bg-white/60">
            <CardTitle className="text-xs font-mono font-bold uppercase tracking-wider text-[#B45309] flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>Live Transit GPS Location Simulation</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {transportVehicles.map((v) => (
              <div key={v.id} className="bg-white p-4 rounded-xl border border-[#D0D1D6] space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#202226]">{v.busNumber} ({v.routeCode})</span>
                  <span className="text-emerald-400 text-xs font-bold animate-pulse">● LIVE GPS ACTIVE ({v.speedKmH} km/h)</span>
                </div>
                <div className="relative h-2.5 w-full bg-[#F4F5F6] rounded-full border border-[#D0D1D6] overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#EAB308] to-[#10B981] w-3/4 rounded-full" />
                </div>
                <div className="flex justify-between text-[11px] text-[#555960]">
                  <span>Passed: {v.currentLocationStop}</span>
                  <span>Next Stop: <strong className="text-[#B45309]">{v.nextStop}</strong></span>
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
            <Card key={tp.id} className="bg-[#F4F5F6] border-2 border-[#EAB308] text-[#202226]">
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-[#B45309]" />
                    <span className="font-bold text-sm">{tp.studentName}</span>
                    <Badge className="bg-[#E7E8EB] text-[#B45309] border-[#D0D1D6] font-mono text-[10px]">
                      {tp.rollNumber}
                    </Badge>
                  </div>
                  <p className="text-[#555960] text-[11px]">
                    Assigned Route: <strong className="text-[#202226]">{tp.routeCode}</strong> · Boarding Stop: {tp.pickupStop}
                  </p>
                  <p className="text-[11px] text-[#B45309]">Validity: {tp.validityPeriod}</p>
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
            <Card key={adv.id} className="bg-[#F4F5F6] border-[#D0D1D6] text-[#202226]">
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                    <span className="font-bold text-sm text-[#202226]">{adv.title}</span>
                    <Badge className="bg-amber-500/15 text-amber-300 border-amber-500/30 text-[10px]">
                      {adv.routeCode}
                    </Badge>
                  </div>
                  <p className="text-[#555960] text-[11px]">{adv.message}</p>
                </div>
                <span className="text-[10px] text-[#B45309]">Posted: {new Date(adv.postedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal: APPLY FOR TRANSIT PASS */}
      {isPassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <Card className="w-full max-w-md bg-[#F4F5F6] border-[#D0D1D6] text-[#202226]">
            <CardHeader className="p-4 border-b border-[#D0D1D6] flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold font-mono text-[#B45309] flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <span>Apply for Student Bus Transit Pass</span>
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsPassModalOpen(false)}
                className="h-6 w-6 text-[#555960] hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-4 space-y-3.5">
              <form onSubmit={handlePassApply} className="space-y-3 text-xs">
                <div>
                  <label className="text-[10px] font-mono text-[#B45309] uppercase block mb-1">Select Bus Route *</label>
                  <select
                    value={selectedRoute}
                    onChange={(e) => setSelectedRoute(e.target.value)}
                    className="w-full rounded-md bg-white border border-[#D0D1D6] p-2 text-xs text-[#202226]"
                  >
                    {transportRoutes.map((r) => (
                      <option key={r.id} value={r.routeCode}>{r.routeName} ({r.routeCode})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-[#B45309] uppercase block mb-1">Pickup Boarding Stop *</label>
                  <Input
                    required
                    value={selectedStop}
                    onChange={(e) => setSelectedStop(e.target.value)}
                    className="bg-white border-[#D0D1D6] text-xs text-[#202226]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-[#B45309] uppercase block mb-1">Student Name</label>
                    <Input
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="bg-white border-[#D0D1D6] text-xs text-[#202226]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-[#B45309] uppercase block mb-1">Roll Number</label>
                    <Input
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      className="bg-white border-[#D0D1D6] text-xs text-[#202226]"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#D0D1D6]">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsPassModalOpen(false)}
                    className="text-xs border-[#D0D1D6]"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#EAB308] hover:bg-[#D4AF37] text-[#0B132B] font-bold text-xs"
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
