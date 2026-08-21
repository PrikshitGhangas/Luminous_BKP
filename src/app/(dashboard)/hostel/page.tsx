'use client';

import React, { useState } from 'react';
import { useCampusServices } from '@/lib/context/campus-services-context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  Bed,
  Users,
  ShieldAlert,
  Wrench,
  Plus,
  Search,
  Phone,
  User,
  X,
} from 'lucide-react';
import { StatCard } from '@/components/shared/stat-card';
import { HostelRoom } from '@/lib/types';

export default function HostelPage() {
  const {
    hostelBuildings,
    hostelRooms,
    hostelMaintenance,
    hostelIncidents,
    submitHostelMaintenance,
    reportHostelIncident,
  } = useCampusServices();

  const [activeTab, setActiveTab] = useState<'buildings' | 'rooms' | 'occupancy' | 'maintenance' | 'incidents'>('buildings');
  const [buildingFilter, setBuildingFilter] = useState<string>('ALL');
  const [roomStatusFilter, setRoomStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modals
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<HostelRoom | null>(null);

  // Maintenance Form State
  const [maintBuilding, setMaintBuilding] = useState('HST-B');
  const [maintRoom, setMaintRoom] = useState('304');
  const [maintCategory, setMaintCategory] = useState<'Plumbing' | 'Electrical' | 'Furniture' | 'Cleanliness' | 'Wi-Fi / Network'>('Plumbing');
  const [maintDesc, setMaintDesc] = useState('');
  const [maintPriority, setMaintPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');

  // Incident Form State
  const [incBuilding, setIncBuilding] = useState('HST-B');
  const [incTitle, setIncTitle] = useState('');
  const [incCategory, setIncCategory] = useState<'Curfew Violation' | 'Noise Violation' | 'Unauthorized Guest' | 'Property Damage' | 'Security Risk'>('Curfew Violation');
  const [incDesc, setIncDesc] = useState('');
  const [incStudent, setIncStudent] = useState('');
  const [incRoll, setIncRoll] = useState('');

  const totalCapacity = hostelBuildings.reduce((acc, b) => acc + b.totalBeds, 0);
  const totalOccupied = hostelBuildings.reduce((acc, b) => acc + b.occupiedBeds, 0);
  const totalVacant = totalCapacity - totalOccupied;
  const occupancyRate = Math.round((totalOccupied / (totalCapacity || 1)) * 100);

  const filteredRooms = hostelRooms.filter((r) => {
    const matchesBuilding = buildingFilter === 'ALL' || r.buildingCode === buildingFilter;
    const matchesStatus = roomStatusFilter === 'ALL' || r.status === roomStatusFilter;
    const matchesSearch = r.roomNumber.includes(searchTerm) || r.occupants.some((o) => o.studentName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesBuilding && matchesStatus && matchesSearch;
  });

  const handleMaintenanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!maintRoom || !maintDesc) return;
    submitHostelMaintenance({
      buildingCode: maintBuilding,
      roomNumber: maintRoom,
      category: maintCategory,
      description: maintDesc,
      reportedBy: 'Aanya Patel (Resident Student)',
      priority: maintPriority,
    });
    setMaintDesc('');
    setIsMaintenanceModalOpen(false);
  };

  const handleIncidentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incTitle || !incDesc) return;
    reportHostelIncident({
      buildingCode: incBuilding,
      title: incTitle,
      description: incDesc,
      category: incCategory,
      studentName: incStudent || undefined,
      studentRoll: incRoll || undefined,
    });
    setIncTitle('');
    setIncDesc('');
    setIncStudent('');
    setIncRoll('');
    setIsIncidentModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#243356] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F4F1DE] font-mono flex items-center gap-2.5">
            <Building2 className="h-6 w-6 text-[#FFD700]" />
            <span>HOSTEL QUARTERS &amp; RESIDENTIAL WARDEN DESK</span>
          </h1>
          <p className="text-xs text-[#B8B5A3] mt-1 font-sans">
            Room allocations, night curfews, occupancy records, maintenance ticketing, and hostel incidents
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => setIsMaintenanceModalOpen(true)}
            size="sm"
            className="bg-[#131C38] hover:bg-[#1C2541] text-[#FFD700] border border-[#D4AF37]/40 text-xs font-semibold gap-1.5"
          >
            <Wrench className="h-4 w-4" />
            <span>Submit Maintenance Ticket</span>
          </Button>
          <Button
            onClick={() => setIsIncidentModalOpen(true)}
            size="sm"
            className="bg-gradient-to-r from-[#D4AF37] to-[#C5A059] hover:opacity-90 text-[#0B132B] font-bold text-xs gap-1.5 shadow-md shadow-[#D4AF37]/20"
          >
            <Plus className="h-4 w-4" />
            <span>Report Hostel Incident</span>
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <StatCard
          title="Total Residents"
          value={totalOccupied.toString()}
          description={`Across ${hostelBuildings.length} Residential Blocks`}
          icon={<Users className="h-5 w-5" />}
          variant="primary"
        />
        <StatCard
          title="Vacant Beds"
          value={totalVacant.toString()}
          description="Ready for allocation"
          icon={<Bed className="h-5 w-5" />}
          variant="success"
        />
        <StatCard
          title="Occupancy Rate"
          value={`${occupancyRate}%`}
          description={`${totalOccupied} / ${totalCapacity} Total Capacity`}
          icon={<Building2 className="h-5 w-5" />}
          variant="warning"
        />
        <StatCard
          title="Curfew Standard"
          value="22:30 PM"
          description="Biometric Gate Lockout"
          icon={<ShieldAlert className="h-5 w-5" />}
          variant="critical"
        />
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#243356] pb-2 overflow-x-auto">
        {[
          { id: 'buildings', label: 'Residential Buildings', icon: Building2 },
          { id: 'rooms', label: 'Room Directory & Allocations', icon: Bed },
          { id: 'occupancy', label: 'Occupancy Analytics', icon: Users },
          { id: 'maintenance', label: 'Maintenance Requests', icon: Wrench, count: hostelMaintenance.filter(m => m.status !== 'Fixed').length },
          { id: 'incidents', label: 'Hostel Incidents & Curfew', icon: ShieldAlert, count: hostelIncidents.filter(i => i.status !== 'Resolved').length },
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

      {/* TAB 1: BUILDINGS */}
      {activeTab === 'buildings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hostelBuildings.map((b) => (
            <Card key={b.id} className="bg-[#0F1026] border-[#243356] text-[#F4F1DE]">
              <CardHeader className="p-4 border-b border-[#243356] bg-[#131C38]/60 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold font-mono text-[#F4F1DE] flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-[#FFD700]" />
                    <span>{b.name}</span>
                  </CardTitle>
                  <p className="text-[11px] font-mono text-[#C5A059] mt-0.5">Building Code: {b.code}</p>
                </div>
                <Badge className={`font-mono text-[10px] ${b.gender === 'Boys' ? 'bg-blue-500/15 text-blue-300 border-blue-500/30' : 'bg-pink-500/15 text-pink-300 border-pink-500/30'}`}>
                  {b.gender} Residency
                </Badge>
              </CardHeader>
              <CardContent className="p-4 space-y-3.5 text-xs">
                <div className="grid grid-cols-3 gap-2 bg-[#131C38] p-3 rounded-lg border border-[#243356] text-center font-mono">
                  <div>
                    <span className="text-[10px] text-[#C5A059] block">ROOMS</span>
                    <span className="font-bold text-[#F4F1DE]">{b.totalRooms}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#C5A059] block">OCCUPIED</span>
                    <span className="font-bold text-emerald-400">{b.occupiedBeds} / {b.totalBeds}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#C5A059] block">VACANT BEDS</span>
                    <span className="font-bold text-[#FFD700]">{b.totalBeds - b.occupiedBeds}</span>
                  </div>
                </div>

                <div className="space-y-1.5 font-mono text-[11px] text-[#B8B5A3]">
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-[#C5A059]" />
                    <span>Warden in Charge: <strong className="text-[#F4F1DE]">{b.wardenName}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-[#C5A059]" />
                    <span>Desk Helpline: {b.wardenPhone}</span>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-mono text-[#C5A059] uppercase font-bold mb-1.5">Amenities &amp; Facilities:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {b.amenities.map((am) => (
                      <span key={am} className="px-2 py-0.5 rounded bg-[#1C2541] border border-[#243356] text-[10px] font-mono text-[#F4F1DE]">
                        ✓ {am}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* TAB 2: ROOMS */}
      {activeTab === 'rooms' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center gap-3 bg-[#0F1026] p-3 rounded-xl border border-[#243356]">
              <Search className="h-4 w-4 text-[#C5A059] shrink-0" />
              <Input
                placeholder="Search room number or resident student name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-0 text-xs text-[#F4F1DE] placeholder:text-[#B8B5A3]/60 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={buildingFilter}
                onChange={(e) => setBuildingFilter(e.target.value)}
                className="rounded-xl bg-[#0F1026] border border-[#243356] text-xs text-[#F4F1DE] px-3 py-2 font-mono"
              >
                <option value="ALL">All Blocks</option>
                <option value="HST-A">Block A</option>
                <option value="HST-B">Block B</option>
                <option value="HST-C">Block C</option>
                <option value="HST-D">Block D</option>
              </select>

              <select
                value={roomStatusFilter}
                onChange={(e) => setRoomStatusFilter(e.target.value)}
                className="rounded-xl bg-[#0F1026] border border-[#243356] text-xs text-[#F4F1DE] px-3 py-2 font-mono"
              >
                <option value="ALL">All Statuses</option>
                <option value="Occupied">Occupied</option>
                <option value="Vacant">Vacant</option>
                <option value="Under Maintenance">Under Maintenance</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredRooms.map((r) => (
              <Card
                key={r.id}
                onClick={() => setSelectedRoom(r)}
                className="bg-[#0F1026] border-[#243356] hover:border-[#D4AF37]/50 transition-colors cursor-pointer text-[#F4F1DE]"
              >
                <CardHeader className="p-3.5 border-b border-[#243356] bg-[#131C38]/40 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bed className="h-4 w-4 text-[#FFD700]" />
                    <span className="font-bold font-mono text-sm">{r.buildingCode} — Room {r.roomNumber}</span>
                  </div>
                  <Badge
                    className={`font-mono text-[10px] ${
                      r.status === 'Occupied'
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : r.status === 'Vacant'
                        ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                        : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {r.status}
                  </Badge>
                </CardHeader>
                <CardContent className="p-3.5 space-y-2 text-xs">
                  <div className="flex justify-between font-mono text-[11px] text-[#B8B5A3]">
                    <span>Floor {r.floor} · {r.type} Occupancy</span>
                    <span className="font-bold text-[#F4F1DE]">{r.occupiedCount} / {r.capacity} Beds</span>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-mono text-[#C5A059] uppercase font-bold">Occupants:</p>
                    {r.occupants.length === 0 ? (
                      <p className="text-[11px] text-[#B8B5A3] italic font-mono">No students currently assigned</p>
                    ) : (
                      r.occupants.map((occ) => (
                        <div key={occ.bedNumber} className="flex justify-between p-1.5 rounded bg-[#131C38] border border-[#243356] font-mono text-[11px]">
                          <span className="font-bold text-[#F4F1DE]">{occ.studentName} ({occ.rollNumber})</span>
                          <span className="text-[#FFD700] text-[10px]">{occ.bedNumber}</span>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: OCCUPANCY ANALYTICS */}
      {activeTab === 'occupancy' && (
        <div className="space-y-4">
          <Card className="bg-[#0F1026] border-[#243356] text-[#F4F1DE]">
            <CardHeader className="p-4 border-b border-[#243356] bg-[#131C38]/60">
              <CardTitle className="text-xs font-mono font-bold uppercase tracking-wider text-[#FFD700] flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Hostel Capacity &amp; Allocation Breakdown</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-xs">
              {hostelBuildings.map((b) => {
                const pct = Math.round((b.occupiedBeds / (b.totalBeds || 1)) * 100);
                return (
                  <div key={b.id} className="space-y-1.5">
                    <div className="flex justify-between font-mono text-xs">
                      <span className="font-bold text-[#F4F1DE]">{b.name} ({b.code})</span>
                      <span className="text-[#FFD700] font-bold">{b.occupiedBeds} / {b.totalBeds} Beds ({pct}%)</span>
                    </div>
                    <div className="h-3 w-full bg-[#131C38] rounded-full overflow-hidden border border-[#243356]">
                      <div
                        className="h-full bg-gradient-to-r from-[#D4AF37] to-[#10B981] rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 4: MAINTENANCE */}
      {activeTab === 'maintenance' && (
        <div className="space-y-3">
          {hostelMaintenance.map((m) => (
            <Card key={m.id} className="bg-[#0F1026] border-[#243356] text-[#F4F1DE]">
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[#C5A059] font-bold">{m.ticketNumber}</span>
                    <Badge className="bg-[#1C2541] text-[#FFD700] border-[#243356] font-mono text-[10px]">
                      {m.buildingCode} — Room {m.roomNumber}
                    </Badge>
                    <Badge className="bg-purple-500/15 text-purple-300 border-purple-500/30 text-[10px] font-mono">
                      {m.category}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-[#F4F1DE] text-sm">{m.description}</h3>
                  <p className="text-[#B8B5A3] font-mono text-[11px]">
                    Reported by: {m.reportedBy} · Priority: <strong className="text-[#FFD700]">{m.priority}</strong>
                  </p>
                </div>
                <div className="text-left sm:text-right font-mono">
                  <Badge
                    className={`font-bold ${
                      m.status === 'Fixed'
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    {m.status}
                  </Badge>
                  {m.assignedTechnician && (
                    <p className="text-[10px] text-[#B8B5A3] mt-1">Tech: {m.assignedTechnician}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* TAB 5: HOSTEL INCIDENTS */}
      {activeTab === 'incidents' && (
        <div className="space-y-3">
          {hostelIncidents.map((inc) => (
            <Card key={inc.id} className="bg-[#0F1026] border-[#243356] text-[#F4F1DE]">
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[#C5A059] font-bold">{inc.incidentNumber}</span>
                    <Badge className="bg-red-500/15 text-red-300 border-red-500/30 font-mono text-[10px]">
                      {inc.category}
                    </Badge>
                    <span className="font-mono text-[#B8B5A3] text-[11px]">{inc.buildingCode}</span>
                  </div>
                  <h3 className="font-bold text-[#F4F1DE] text-sm">{inc.title}</h3>
                  <p className="text-[#B8B5A3] text-[11px]">{inc.description}</p>
                  {inc.studentName && (
                    <p className="text-[#FFD700] font-mono text-[11px]">
                      Student Flagged: {inc.studentName} ({inc.studentRoll})
                    </p>
                  )}
                </div>
                <div className="text-left sm:text-right font-mono">
                  <Badge className="bg-amber-500/15 text-amber-300 border-amber-500/30 font-bold">
                    {inc.status}
                  </Badge>
                  {inc.actionTaken && (
                    <p className="text-[10px] text-[#B8B5A3] mt-1 italic">{inc.actionTaken}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal: Room Details */}
      {selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <Card className="w-full max-w-md bg-[#0F1026] border-[#243356] text-[#F4F1DE]">
            <CardHeader className="p-4 border-b border-[#243356] flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold font-mono text-[#FFD700] flex items-center gap-2">
                <Bed className="h-4 w-4" />
                <span>{selectedRoom.buildingCode} — Room {selectedRoom.roomNumber} Details</span>
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedRoom(null)}
                className="h-6 w-6 text-[#B8B5A3] hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-[#131C38] p-3 rounded-lg border border-[#243356] font-mono text-center">
                <div>
                  <span className="text-[10px] text-[#C5A059] block">OCCUPANCY TYPE</span>
                  <span className="font-bold text-[#F4F1DE]">{selectedRoom.type} Bed</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#C5A059] block">CURRENT OCCUPANTS</span>
                  <span className="font-bold text-emerald-400">{selectedRoom.occupiedCount} / {selectedRoom.capacity}</span>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-mono text-[#C5A059] uppercase font-bold mb-1.5">Assigned Resident Students:</p>
                {selectedRoom.occupants.length === 0 ? (
                  <p className="text-[11px] text-[#B8B5A3] italic font-mono">No students assigned to this room.</p>
                ) : (
                  selectedRoom.occupants.map((occ) => (
                    <div key={occ.bedNumber} className="p-2.5 rounded bg-[#131C38] border border-[#243356] font-mono text-xs space-y-0.5 mb-2">
                      <div className="flex justify-between font-bold text-[#F4F1DE]">
                        <span>{occ.studentName}</span>
                        <span className="text-[#FFD700]">{occ.bedNumber}</span>
                      </div>
                      <p className="text-[10px] text-[#B8B5A3]">Roll Number: {occ.rollNumber} • Student ID: {occ.studentId}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal: Submit Maintenance Ticket */}
      {isMaintenanceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <Card className="w-full max-w-lg bg-[#0F1026] border-[#243356] text-[#F4F1DE]">
            <CardHeader className="p-4 border-b border-[#243356] flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold font-mono text-[#FFD700] flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                <span>Submit Hostel Maintenance Ticket</span>
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMaintenanceModalOpen(false)}
                className="h-6 w-6 text-[#B8B5A3] hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-4 space-y-3.5">
              <form onSubmit={handleMaintenanceSubmit} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-[#C5A059] uppercase block mb-1">Hostel Block *</label>
                    <select
                      value={maintBuilding}
                      onChange={(e) => setMaintBuilding(e.target.value)}
                      className="w-full rounded-md bg-[#131C38] border border-[#243356] p-2 text-xs text-[#F4F1DE]"
                    >
                      <option value="HST-A">Block A (Boys Senior)</option>
                      <option value="HST-B">Block B (Girls Senior)</option>
                      <option value="HST-C">Block C (Girls Junior)</option>
                      <option value="HST-D">Block D (Boys Freshers)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-[#C5A059] uppercase block mb-1">Room Number *</label>
                    <Input
                      required
                      placeholder="e.g. 304"
                      value={maintRoom}
                      onChange={(e) => setMaintRoom(e.target.value)}
                      className="bg-[#131C38] border-[#243356] text-xs text-[#F4F1DE]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-[#C5A059] uppercase block mb-1">Category</label>
                    <select
                      value={maintCategory}
                      onChange={(e) => setMaintCategory(e.target.value as typeof maintCategory)}
                      className="w-full rounded-md bg-[#131C38] border border-[#243356] p-2 text-xs text-[#F4F1DE]"
                    >
                      <option value="Plumbing">Plumbing</option>
                      <option value="Electrical">Electrical</option>
                      <option value="Furniture">Furniture</option>
                      <option value="Cleanliness">Cleanliness</option>
                      <option value="Wi-Fi / Network">Wi-Fi / Network</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-[#C5A059] uppercase block mb-1">Priority</label>
                    <select
                      value={maintPriority}
                      onChange={(e) => setMaintPriority(e.target.value as typeof maintPriority)}
                      className="w-full rounded-md bg-[#131C38] border border-[#243356] p-2 text-xs text-[#F4F1DE]"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-[#C5A059] uppercase block mb-1">Issue Description *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe the maintenance defect, location in room, or urgency..."
                    value={maintDesc}
                    onChange={(e) => setMaintDesc(e.target.value)}
                    className="w-full rounded-md bg-[#131C38] border border-[#243356] p-2 text-xs text-[#F4F1DE]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#243356]">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsMaintenanceModalOpen(false)}
                    className="text-xs border-[#243356]"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#D4AF37] hover:bg-[#C5A059] text-[#0B132B] font-bold text-xs"
                  >
                    Lodge Ticket
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal: Report Hostel Incident */}
      {isIncidentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <Card className="w-full max-w-lg bg-[#0F1026] border-[#243356] text-[#F4F1DE]">
            <CardHeader className="p-4 border-b border-[#243356] flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold font-mono text-[#FFD700] flex items-center gap-2">
                <ShieldAlert className="h-4 w-4" />
                <span>Log Residential Hostel Incident</span>
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsIncidentModalOpen(false)}
                className="h-6 w-6 text-[#B8B5A3] hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-4 space-y-3.5">
              <form onSubmit={handleIncidentSubmit} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-[#C5A059] uppercase block mb-1">Hostel Block *</label>
                    <select
                      value={incBuilding}
                      onChange={(e) => setIncBuilding(e.target.value)}
                      className="w-full rounded-md bg-[#131C38] border border-[#243356] p-2 text-xs text-[#F4F1DE]"
                    >
                      <option value="HST-A">Block A</option>
                      <option value="HST-B">Block B</option>
                      <option value="HST-C">Block C</option>
                      <option value="HST-D">Block D</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-[#C5A059] uppercase block mb-1">Incident Category *</label>
                    <select
                      value={incCategory}
                      onChange={(e) => setIncCategory(e.target.value as typeof incCategory)}
                      className="w-full rounded-md bg-[#131C38] border border-[#243356] p-2 text-xs text-[#F4F1DE]"
                    >
                      <option value="Curfew Violation">Curfew Violation</option>
                      <option value="Noise Violation">Noise Violation</option>
                      <option value="Unauthorized Guest">Unauthorized Guest</option>
                      <option value="Property Damage">Property Damage</option>
                      <option value="Security Risk">Security Risk</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-[#C5A059] uppercase block mb-1">Incident Title *</label>
                  <Input
                    required
                    placeholder="e.g. Late entry past 22:30 curfew at South Gate"
                    value={incTitle}
                    onChange={(e) => setIncTitle(e.target.value)}
                    className="bg-[#131C38] border-[#243356] text-xs text-[#F4F1DE]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-[#C5A059] uppercase block mb-1">Student Name (Optional)</label>
                    <Input
                      placeholder="e.g. Aanya Patel"
                      value={incStudent}
                      onChange={(e) => setIncStudent(e.target.value)}
                      className="bg-[#131C38] border-[#243356] text-xs text-[#F4F1DE]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-[#C5A059] uppercase block mb-1">Student Roll (Optional)</label>
                    <Input
                      placeholder="e.g. CS23B042"
                      value={incRoll}
                      onChange={(e) => setIncRoll(e.target.value)}
                      className="bg-[#131C38] border-[#243356] text-xs text-[#F4F1DE]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-[#C5A059] uppercase block mb-1">Full Description *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Details of incident, time, location, warden observations..."
                    value={incDesc}
                    onChange={(e) => setIncDesc(e.target.value)}
                    className="w-full rounded-md bg-[#131C38] border border-[#243356] p-2 text-xs text-[#F4F1DE]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#243356]">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsIncidentModalOpen(false)}
                    className="text-xs border-[#243356]"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#D4AF37] hover:bg-[#C5A059] text-[#0B132B] font-bold text-xs"
                  >
                    Log Incident
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
