'use client';

import React, { useState } from 'react';
import { useCampusServices } from '@/lib/context/campus-services-context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D6D8D5] pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1F2933] flex items-center gap-2">
            <Building2 className="h-6 w-6 text-[#1F2933]" />
            <span>Hostel Quarters</span>
          </h1>
          <p className="text-xs text-[#667085] mt-0.5">
            Room allocations, night curfews, occupancy records, maintenance ticketing, and hostel incidents.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => setIsMaintenanceModalOpen(true)}
            size="sm"
            variant="outline"
            className="text-xs font-medium gap-1.5 border-[#D6D8D5] cursor-pointer"
          >
            <Wrench className="h-4 w-4" />
            <span>Maintenance Ticket</span>
          </Button>
          <Button
            onClick={() => setIsIncidentModalOpen(true)}
            size="sm"
            className="bg-[#1F2933] hover:bg-[#111827] text-white font-semibold text-xs gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Report Hostel Incident</span>
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl border border-[#D6D8D5] bg-white shadow-xs">
          <span className="text-xs text-[#667085]">Total Residents</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-[#1F2933]">{totalOccupied}</span>
            <span className="text-xs text-[#667085]">Across {hostelBuildings.length} Blocks</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[#D6D8D5] bg-white shadow-xs">
          <span className="text-xs text-[#667085]">Vacant Beds</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-[#1F2933]">{totalVacant} Beds</span>
            <span className="text-xs text-emerald-700 font-medium">Ready for allocation</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[#D6D8D5] bg-white shadow-xs">
          <span className="text-xs text-[#667085]">Hostel Occupancy Rate</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-[#1F2933]">{occupancyRate}%</span>
            <span className="text-xs text-[#667085]">{totalOccupied} / {totalCapacity} Capacity</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs (Segmented Pills) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <div className="inline-flex p-1 bg-[#F0F1EF] rounded-full border border-[#D6D8D5] gap-1">
          {[
            { id: 'buildings', label: 'Residential Buildings', icon: Building2 },
            { id: 'rooms', label: 'Room Directory', icon: Bed },
            { id: 'occupancy', label: 'Occupancy', icon: Users },
            { id: 'maintenance', label: 'Maintenance Requests', icon: Wrench, count: hostelMaintenance.filter(m => m.status !== 'Fixed').length },
            { id: 'incidents', label: 'Hostel Log & Curfew', icon: ShieldAlert, count: hostelIncidents.filter(i => i.status !== 'Resolved').length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#1F2933] text-white shadow-xs'
                    : 'text-[#667085] hover:text-[#1F2933]'
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-semibold ${isActive ? 'bg-white/20 text-white' : 'bg-[#E8E9E7] text-[#1F2933]'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: BUILDINGS */}
      {activeTab === 'buildings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hostelBuildings.map((b) => (
            <div key={b.id} className="p-5 rounded-xl border border-[#D6D8D5] bg-white shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#D6D8D5] pb-3">
                <div>
                  <h2 className="text-base font-bold text-[#1F2933] flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    <span>{b.name}</span>
                  </h2>
                  <p className="text-xs text-[#667085] mt-0.5">Block Code: {b.code}</p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${b.gender === 'Boys' ? 'bg-blue-50 text-blue-800 border border-blue-200' : 'bg-pink-50 text-pink-800 border border-pink-200'}`}>
                  {b.gender} Residency
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-[#F7F8F6] p-3 rounded-lg border border-[#D6D8D5] text-center text-xs">
                <div>
                  <span className="text-[#667085] block text-[11px]">Rooms</span>
                  <span className="font-bold text-[#1F2933]">{b.totalRooms}</span>
                </div>
                <div>
                  <span className="text-[#667085] block text-[11px]">Occupied</span>
                  <span className="font-bold text-emerald-700">{b.occupiedBeds} / {b.totalBeds}</span>
                </div>
                <div>
                  <span className="text-[#667085] block text-[11px]">Vacant Beds</span>
                  <span className="font-bold text-[#1F2933]">{b.totalBeds - b.occupiedBeds}</span>
                </div>
              </div>

              <div className="space-y-1 text-xs text-[#667085]">
                <div className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-[#1F2933]" />
                  <span>Warden in Charge: <strong className="text-[#1F2933]">{b.wardenName}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-[#1F2933]" />
                  <span>Desk Helpline: {b.wardenPhone}</span>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-[#1F2933] mb-1.5">Amenities &amp; Facilities:</p>
                <div className="flex flex-wrap gap-1.5">
                  {b.amenities.map((am) => (
                    <span key={am} className="px-2 py-0.5 rounded text-xs bg-[#F0F1EF] border border-[#D6D8D5] text-[#1F2933]">
                       {am}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: ROOMS */}
      {activeTab === 'rooms' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#667085]" />
              <Input
                placeholder="Search room number or resident student name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 text-xs border-[#D6D8D5] bg-white rounded-xl shadow-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={buildingFilter}
                onChange={(e) => setBuildingFilter(e.target.value)}
                className="rounded-xl bg-white border border-[#D6D8D5] text-xs text-[#1F2933] px-3 py-2 cursor-pointer"
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
                className="rounded-xl bg-white border border-[#D6D8D5] text-xs text-[#1F2933] px-3 py-2 cursor-pointer"
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
              <div
                key={r.id}
                onClick={() => setSelectedRoom(r)}
                className="p-4 rounded-xl border border-[#D6D8D5] bg-white hover:border-[#1F2933] transition-all cursor-pointer shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between border-b border-[#D6D8D5] pb-2">
                  <div className="flex items-center gap-2">
                    <Bed className="h-4 w-4 text-[#1F2933]" />
                    <span className="font-bold text-sm text-[#1F2933]">{r.buildingCode} — Room {r.roomNumber}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      r.status === 'Occupied'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : r.status === 'Vacant'
                        ? 'bg-blue-50 text-blue-800 border border-blue-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {r.status}
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-[#667085]">
                    <span>Floor {r.floor} · {r.type} Occupancy</span>
                    <span className="font-bold text-[#1F2933]">{r.occupiedCount} / {r.capacity} Beds</span>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-[#1F2933]">Occupants:</p>
                    {r.occupants.length === 0 ? (
                      <p className="text-xs text-[#667085] italic">No students currently assigned</p>
                    ) : (
                      r.occupants.map((occ) => (
                        <div key={occ.bedNumber} className="flex justify-between p-1.5 rounded bg-[#F7F8F6] border border-[#D6D8D5] text-xs">
                          <span className="font-bold text-[#1F2933]">{occ.studentName} ({occ.rollNumber})</span>
                          <span className="text-[#667085]">{occ.bedNumber}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: OCCUPANCY ANALYTICS */}
      {activeTab === 'occupancy' && (
        <div className="p-5 rounded-xl border border-[#D6D8D5] bg-white shadow-xs space-y-4">
          <div>
            <h2 className="text-sm font-bold text-[#1F2933] flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Hostel Capacity &amp; Allocation Breakdown</span>
            </h2>
            <p className="text-xs text-[#667085] mt-0.5">Live resident occupancy statistics per residential block.</p>
          </div>

          <div className="space-y-4 pt-2">
            {hostelBuildings.map((b) => {
              const pct = Math.round((b.occupiedBeds / (b.totalBeds || 1)) * 100);
              return (
                <div key={b.id} className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="font-bold text-[#1F2933]">{b.name} ({b.code})</span>
                    <span className="text-[#1F2933] font-semibold">{b.occupiedBeds} / {b.totalBeds} Beds ({pct}%)</span>
                  </div>
                  <div className="h-2.5 w-full bg-[#F0F1EF] rounded-full overflow-hidden border border-[#D6D8D5]">
                    <div
                      className="h-full bg-[#1F2933] rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: MAINTENANCE */}
      {activeTab === 'maintenance' && (
        <div className="space-y-3">
          {hostelMaintenance.map((m) => (
            <div key={m.id} className="p-4 rounded-xl border border-[#D6D8D5] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#1F2933]">{m.ticketNumber}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F0F1EF] text-[#1F2933] border border-[#D6D8D5]">
                    {m.buildingCode} — Room {m.roomNumber}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-800 border border-purple-200">
                    {m.category}
                  </span>
                </div>
                <h3 className="font-bold text-[#1F2933] text-sm">{m.description}</h3>
                <p className="text-[#667085] text-xs">
                  Reported by: {m.reportedBy} · Priority: <strong className="text-[#1F2933]">{m.priority}</strong>
                </p>
              </div>
              <div className="text-left sm:text-right shrink-0">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                    m.status === 'Fixed'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                >
                  {m.status}
                </span>
                {m.assignedTechnician && (
                  <p className="text-[11px] text-[#667085] mt-1">Tech: {m.assignedTechnician}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 5: HOSTEL INCIDENTS */}
      {activeTab === 'incidents' && (
        <div className="space-y-3">
          {hostelIncidents.map((inc) => (
            <div key={inc.id} className="p-4 rounded-xl border border-[#D6D8D5] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#1F2933]">{inc.incidentNumber}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-50 text-red-700 border border-red-200">
                    {inc.category}
                  </span>
                  <span className="text-[11px] text-[#667085]">{inc.buildingCode}</span>
                </div>
                <h3 className="font-bold text-[#1F2933] text-sm">{inc.title}</h3>
                <p className="text-[#667085] text-xs">{inc.description}</p>
                {inc.studentName && (
                  <p className="text-xs text-[#667085]">
                    Student: <strong className="text-[#1F2933]">{inc.studentName}</strong> ({inc.studentRoll})
                  </p>
                )}
              </div>
              <div className="text-left sm:text-right shrink-0">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                  {inc.status}
                </span>
                {inc.actionTaken && (
                  <p className="text-[11px] text-[#667085] mt-1">{inc.actionTaken}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Room Details */}
      {selectedRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <Card className="w-full max-w-md bg-white border-[#D6D8D5] text-[#1F2933] shadow-xl">
            <CardHeader className="p-4 border-b border-[#D6D8D5] flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-[#1F2933] flex items-center gap-2">
                <Bed className="h-4 w-4" />
                <span>{selectedRoom.buildingCode} — Room {selectedRoom.roomNumber}</span>
              </CardTitle>
              <button
                onClick={() => setSelectedRoom(null)}
                className="text-[#667085] hover:text-[#1F2933] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-[#F7F8F6] p-3 rounded-lg border border-[#D6D8D5] text-center">
                <div>
                  <span className="text-[11px] text-[#667085] block">Occupancy Type</span>
                  <span className="font-bold text-[#1F2933]">{selectedRoom.type} Bed</span>
                </div>
                <div>
                  <span className="text-[11px] text-[#667085] block">Current Occupants</span>
                  <span className="font-bold text-emerald-700">{selectedRoom.occupiedCount} / {selectedRoom.capacity}</span>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-[#1F2933] mb-1.5">Assigned Resident Students:</p>
                {selectedRoom.occupants.length === 0 ? (
                  <p className="text-xs text-[#667085] italic">No students assigned to this room.</p>
                ) : (
                  selectedRoom.occupants.map((occ) => (
                    <div key={occ.bedNumber} className="p-2.5 rounded-lg bg-[#F7F8F6] border border-[#D6D8D5] text-xs space-y-0.5 mb-2">
                      <div className="flex justify-between font-bold text-[#1F2933]">
                        <span>{occ.studentName}</span>
                        <span className="text-[#667085]">{occ.bedNumber}</span>
                      </div>
                      <p className="text-[11px] text-[#667085]">Roll Number: {occ.rollNumber} • Student ID: {occ.studentId}</p>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <Card className="w-full max-w-lg bg-white border-[#D6D8D5] text-[#1F2933] shadow-xl">
            <CardHeader className="p-4 border-b border-[#D6D8D5] flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-[#1F2933] flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                <span>Submit Maintenance Ticket</span>
              </CardTitle>
              <button
                onClick={() => setIsMaintenanceModalOpen(false)}
                className="text-[#667085] hover:text-[#1F2933] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </CardHeader>
            <CardContent className="p-4 space-y-3.5">
              <form onSubmit={handleMaintenanceSubmit} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#1F2933] block mb-1">Hostel Block *</label>
                    <select
                      value={maintBuilding}
                      onChange={(e) => setMaintBuilding(e.target.value)}
                      className="w-full rounded-lg bg-white border border-[#D6D8D5] p-2 text-xs text-[#1F2933] cursor-pointer"
                    >
                      <option value="HST-A">Block A (Boys Senior)</option>
                      <option value="HST-B">Block B (Girls Senior)</option>
                      <option value="HST-C">Block C (Girls Junior)</option>
                      <option value="HST-D">Block D (Boys Freshers)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#1F2933] block mb-1">Room Number *</label>
                    <Input
                      required
                      placeholder="e.g. 304"
                      value={maintRoom}
                      onChange={(e) => setMaintRoom(e.target.value)}
                      className="bg-white border-[#D6D8D5] text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#1F2933] block mb-1">Category</label>
                    <select
                      value={maintCategory}
                      onChange={(e) => setMaintCategory(e.target.value as typeof maintCategory)}
                      className="w-full rounded-lg bg-white border border-[#D6D8D5] p-2 text-xs text-[#1F2933] cursor-pointer"
                    >
                      <option value="Plumbing">Plumbing</option>
                      <option value="Electrical">Electrical</option>
                      <option value="Furniture">Furniture</option>
                      <option value="Cleanliness">Cleanliness</option>
                      <option value="Wi-Fi / Network">Wi-Fi / Network</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#1F2933] block mb-1">Priority</label>
                    <select
                      value={maintPriority}
                      onChange={(e) => setMaintPriority(e.target.value as typeof maintPriority)}
                      className="w-full rounded-lg bg-white border border-[#D6D8D5] p-2 text-xs text-[#1F2933] cursor-pointer"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#1F2933] block mb-1">Issue Description *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe the maintenance defect, location in room, or urgency..."
                    value={maintDesc}
                    onChange={(e) => setMaintDesc(e.target.value)}
                    className="w-full rounded-lg bg-white border border-[#D6D8D5] p-2 text-xs text-[#1F2933]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#D6D8D5]">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsMaintenanceModalOpen(false)}
                    className="text-xs cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-[#1F2933] hover:bg-[#111827] text-white font-semibold text-xs cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <Card className="w-full max-w-lg bg-white border-[#D6D8D5] text-[#1F2933] shadow-xl">
            <CardHeader className="p-4 border-b border-[#D6D8D5] flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-[#1F2933] flex items-center gap-2">
                <ShieldAlert className="h-4 w-4" />
                <span>Log Hostel Incident</span>
              </CardTitle>
              <button
                onClick={() => setIsIncidentModalOpen(false)}
                className="text-[#667085] hover:text-[#1F2933] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </CardHeader>
            <CardContent className="p-4 space-y-3.5">
              <form onSubmit={handleIncidentSubmit} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#1F2933] block mb-1">Hostel Block *</label>
                    <select
                      value={incBuilding}
                      onChange={(e) => setIncBuilding(e.target.value)}
                      className="w-full rounded-lg bg-white border border-[#D6D8D5] p-2 text-xs text-[#1F2933] cursor-pointer"
                    >
                      <option value="HST-A">Block A</option>
                      <option value="HST-B">Block B</option>
                      <option value="HST-C">Block C</option>
                      <option value="HST-D">Block D</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#1F2933] block mb-1">Incident Category *</label>
                    <select
                      value={incCategory}
                      onChange={(e) => setIncCategory(e.target.value as typeof incCategory)}
                      className="w-full rounded-lg bg-white border border-[#D6D8D5] p-2 text-xs text-[#1F2933] cursor-pointer"
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
                  <label className="text-xs font-semibold text-[#1F2933] block mb-1">Incident Title *</label>
                  <Input
                    required
                    placeholder="e.g. Late entry past 22:30 curfew at South Gate"
                    value={incTitle}
                    onChange={(e) => setIncTitle(e.target.value)}
                    className="bg-white border-[#D6D8D5] text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#1F2933] block mb-1">Student Name (Optional)</label>
                    <Input
                      placeholder="e.g. Aanya Patel"
                      value={incStudent}
                      onChange={(e) => setIncStudent(e.target.value)}
                      className="bg-white border-[#D6D8D5] text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#1F2933] block mb-1">Student Roll (Optional)</label>
                    <Input
                      placeholder="e.g. CS23B042"
                      value={incRoll}
                      onChange={(e) => setIncRoll(e.target.value)}
                      className="bg-white border-[#D6D8D5] text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#1F2933] block mb-1">Full Description *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Details of incident, time, location, warden observations..."
                    value={incDesc}
                    onChange={(e) => setIncDesc(e.target.value)}
                    className="w-full rounded-lg bg-white border border-[#D6D8D5] p-2 text-xs text-[#1F2933]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#D6D8D5]">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsIncidentModalOpen(false)}
                    className="text-xs cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-[#1F2933] hover:bg-[#111827] text-white font-semibold text-xs cursor-pointer"
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
