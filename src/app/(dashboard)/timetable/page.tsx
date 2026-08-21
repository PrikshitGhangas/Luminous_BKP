'use client';

import React, { useState } from 'react';
import { useAcademic } from '@/lib/context/academic-context';
import { useRole } from '@/lib/hooks/use-role';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Clock,
  MapPin,
  User,
  Plus,
  X,
  Layers,
  CheckCircle,
  Building,
} from 'lucide-react';

const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
] as const;

type DayType = (typeof DAYS)[number];

export default function TimetablePage() {
  const { timetableSlots, addTimetableSlot, courses } = useAcademic();
  const { role } = useRole();

  const [selectedDay, setSelectedDay] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'GRID' | 'AGENDA'>('GRID');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Slot Form State
  const [newDay, setNewDay] = useState<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'>('Monday');
  const [newTime, setNewTime] = useState('09:00 - 10:15 AM');
  const [newCourseCode, setNewCourseCode] = useState('CS301');
  const [newInstructor, setNewInstructor] = useState('Prof. Sarah Jenkins');
  const [newRoom, setNewRoom] = useState('Tech Hall 102');
  const [newBatch, setNewBatch] = useState('CSE-Sem6-SecA');
  const [newType, setNewType] = useState<'Lecture' | 'Lab' | 'Tutorial'>('Lecture');

  const canEdit = role === 'super_admin' || role === 'admin' || role === 'faculty';

  const filteredSlots = timetableSlots.filter((slot) => {
    if (selectedDay !== 'ALL' && slot.day !== selectedDay) return false;
    return true;
  });

  const totalSlots = timetableSlots.length;
  const uniqueRooms = new Set(timetableSlots.map((s) => s.room)).size;
  const uniqueInstructors = new Set(timetableSlots.map((s) => s.instructor)).size;

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    const course = courses.find((c) => c.code === newCourseCode) || courses[0];

    addTimetableSlot({
      day: newDay,
      timeSlot: newTime,
      courseCode: course.code,
      courseName: course.title,
      instructor: newInstructor,
      room: newRoom,
      batch: newBatch,
      type: newType,
    });

    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D0D1D6] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#202226] font-mono flex items-center gap-2.5">
            <Clock className="h-6 w-6 text-[#B45309]" />
            <span>CAMPUS SCHEDULE &amp; TIMETABLE</span>
          </h1>
          <p className="text-xs text-[#555960] mt-1 font-sans">
            Weekly lecture grid, laboratory schedules, classroom allocations, and room occupancy status
          </p>
        </div>

        {canEdit && (
          <Button
            onClick={() => setIsAddModalOpen(true)}
            size="sm"
            className="bg-gradient-to-r from-[#EAB308] to-[#D4AF37] hover:opacity-90 text-[#0B132B] font-bold text-xs gap-1.5 shadow-md shadow-[#D4AF37]/20"
          >
            <Plus className="h-4 w-4" />
            <span>Add Class Slot</span>
          </Button>
        )}
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Card className="bg-[#F4F5F6] border-[#D0D1D6] text-[#202226]">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono text-[#B45309] uppercase tracking-wider">Weekly Slots</p>
              <h3 className="text-xl font-bold font-mono mt-0.5 text-[#202226]">{totalSlots} Class Sessions</h3>
            </div>
            <div className="h-9 w-9 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Layers className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#F4F5F6] border-[#D0D1D6] text-[#202226]">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono text-[#B45309] uppercase tracking-wider">Allocated Rooms</p>
              <h3 className="text-xl font-bold font-mono mt-0.5 text-blue-400">{uniqueRooms} Halls &amp; Labs</h3>
            </div>
            <div className="h-9 w-9 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Building className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#F4F5F6] border-[#D0D1D6] text-[#202226]">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono text-[#B45309] uppercase tracking-wider">Instructors Active</p>
              <h3 className="text-xl font-bold font-mono mt-0.5 text-[#B45309]">{uniqueInstructors} Faculty</h3>
            </div>
            <div className="h-9 w-9 rounded-lg bg-[#EAB308]/10 border border-[#EAB308]/30 flex items-center justify-center text-[#B45309]">
              <User className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#F4F5F6] border-[#D0D1D6] text-[#202226]">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono text-[#B45309] uppercase tracking-wider">Room Conflicts</p>
              <h3 className="text-xl font-bold font-mono mt-0.5 text-emerald-400">0 Conflicts</h3>
            </div>
            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Switcher & Day Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#F4F5F6] p-3 rounded-xl border border-[#D0D1D6]">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedDay('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              selectedDay === 'ALL'
                ? 'bg-[#EAB308] text-[#0B132B]'
                : 'bg-white text-[#555960] hover:text-white'
            }`}
          >
            All Days
          </button>
          {DAYS.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                selectedDay === day
                  ? 'bg-[#EAB308] text-[#0B132B]'
                  : 'bg-white text-[#555960] hover:text-white'
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 justify-end">
          <button
            onClick={() => setViewMode('GRID')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              viewMode === 'GRID'
                ? 'bg-[#E7E8EB] text-[#B45309] border border-[#EAB308]/50'
                : 'text-[#555960] hover:text-white'
            }`}
          >
            Weekly Matrix
          </button>
          <button
            onClick={() => setViewMode('AGENDA')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              viewMode === 'AGENDA'
                ? 'bg-[#E7E8EB] text-[#B45309] border border-[#EAB308]/50'
                : 'text-[#555960] hover:text-white'
            }`}
          >
            Agenda List
          </button>
        </div>
      </div>

      {/* Content View */}
      {viewMode === 'GRID' ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {DAYS.map((day) => {
            const daySlots = timetableSlots.filter((s) => s.day === day);
            if (selectedDay !== 'ALL' && selectedDay !== day) return null;

            return (
              <div key={day} className="space-y-3">
                <div className="bg-white p-2.5 rounded-t-xl border border-[#D0D1D6] text-center font-mono font-bold text-xs text-[#B45309] uppercase">
                  {day} ({daySlots.length})
                </div>

                <div className="space-y-2">
                  {daySlots.length === 0 ? (
                    <div className="p-4 text-center text-[#555960]/50 text-[11px] font-mono border border-dashed border-[#D0D1D6] rounded-xl">
                      No Scheduled Classes
                    </div>
                  ) : (
                    daySlots.map((slot) => (
                      <Card
                        key={slot.id}
                        className="bg-[#F4F5F6] border-[#D0D1D6] hover:border-[#EAB308]/50 transition-all text-[#202226]"
                      >
                        <CardContent className="p-3 space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <Badge className="bg-[#EAB308]/20 text-[#B45309] border-[#EAB308]/40 font-mono text-[9px]">
                              {slot.courseCode}
                            </Badge>
                            <Badge
                              className={
                                slot.type === 'Lecture'
                                  ? 'bg-blue-500/15 text-blue-300 border-blue-500/30 text-[9px]'
                                  : slot.type === 'Lab'
                                  ? 'bg-purple-500/15 text-purple-300 border-purple-500/30 text-[9px]'
                                  : 'bg-amber-500/15 text-amber-300 border-amber-500/30 text-[9px]'
                              }
                            >
                              {slot.type}
                            </Badge>
                          </div>

                          <h4 className="font-bold text-[#202226] text-[11px] font-mono leading-tight">
                            {slot.courseName}
                          </h4>

                          <div className="space-y-1 text-[10px] text-[#555960] font-mono">
                            <div className="flex items-center gap-1 text-[#B45309]">
                              <Clock className="h-3 w-3" />
                              <span>{slot.timeSlot}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-[#B45309]" />
                              <span>{slot.room}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3 text-[#B45309]" />
                              <span className="truncate">{slot.instructor}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSlots.map((slot) => (
            <Card key={slot.id} className="bg-[#F4F5F6] border-[#D0D1D6] text-[#202226] hover:border-[#EAB308]/50 transition-colors">
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-[#EAB308]/20 text-[#B45309] border-[#EAB308]/40 font-mono text-[10px]">
                      {slot.day.toUpperCase()} · {slot.timeSlot}
                    </Badge>
                    <Badge className="bg-white text-[#B45309] border-[#D0D1D6] font-mono text-[10px]">
                      {slot.courseCode}
                    </Badge>
                  </div>
                  <h3 className="text-sm font-bold text-[#202226] font-mono">{slot.courseName}</h3>
                </div>

                <div className="flex items-center gap-4 text-[#555960] text-xs font-mono">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-[#B45309]" />
                    <span>{slot.room}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="h-3.5 w-3.5 text-[#B45309]" />
                    <span>{slot.instructor}</span>
                  </span>
                  <Badge
                    className={
                      slot.type === 'Lecture'
                        ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                        : slot.type === 'Lab'
                        ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                        : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                    }
                  >
                    {slot.type}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal: Add Timetable Slot */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <Card className="w-full max-w-lg bg-[#F4F5F6] border-[#D0D1D6] text-[#202226]">
            <CardHeader className="p-4 border-b border-[#D0D1D6] flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold font-mono text-[#B45309] flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Allocate Timetable Class Slot</span>
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsAddModalOpen(false)}
                className="h-6 w-6 text-[#555960] hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent className="p-4 space-y-3.5">
              <form onSubmit={handleAddSlot} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-[#B45309] uppercase block mb-1">Day of Week</label>
                    <select
                      value={newDay}
                      onChange={(e) => setNewDay(e.target.value as DayType)}
                      className="w-full rounded-md bg-white border border-[#D0D1D6] p-2 text-xs text-[#202226]"
                    >
                      {DAYS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-[#B45309] uppercase block mb-1">Time Slot</label>
                    <Input
                      placeholder="09:00 - 10:15 AM"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="bg-white border-[#D0D1D6] text-xs text-[#202226]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-[#B45309] uppercase block mb-1">Course</label>
                  <select
                    value={newCourseCode}
                    onChange={(e) => setNewCourseCode(e.target.value)}
                    className="w-full rounded-md bg-white border border-[#D0D1D6] p-2 text-xs text-[#202226] font-mono"
                  >
                    {courses.map((c) => (
                      <option key={c.code} value={c.code}>{c.code} — {c.title}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-[#B45309] uppercase block mb-1">Instructor</label>
                    <Input
                      placeholder="Prof. Sarah Jenkins"
                      value={newInstructor}
                      onChange={(e) => setNewInstructor(e.target.value)}
                      className="bg-white border-[#D0D1D6] text-xs text-[#202226]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-[#B45309] uppercase block mb-1">Room / Hall</label>
                    <Input
                      placeholder="Tech Hall 102"
                      value={newRoom}
                      onChange={(e) => setNewRoom(e.target.value)}
                      className="bg-white border-[#D0D1D6] text-xs text-[#202226]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-[#B45309] uppercase block mb-1">Batch / Section</label>
                    <Input
                      placeholder="CSE-Sem6-SecA"
                      value={newBatch}
                      onChange={(e) => setNewBatch(e.target.value)}
                      className="bg-white border-[#D0D1D6] text-xs text-[#202226]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-[#B45309] uppercase block mb-1">Slot Type</label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as 'Lecture' | 'Lab' | 'Tutorial')}
                      className="w-full rounded-md bg-white border border-[#D0D1D6] p-2 text-xs text-[#202226]"
                    >
                      <option value="Lecture">Lecture</option>
                      <option value="Lab">Lab</option>
                      <option value="Tutorial">Tutorial</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#D0D1D6]">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddModalOpen(false)}
                    className="text-xs border-[#D0D1D6]"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#EAB308] hover:bg-[#D4AF37] text-[#0B132B] font-bold text-xs"
                  >
                    Save Slot Allocation
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
