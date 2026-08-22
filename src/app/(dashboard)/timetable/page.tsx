'use client';

import React, { useState } from 'react';
import { useAcademic } from '@/lib/context/academic-context';
import { useRole } from '@/lib/hooks/use-role';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Clock,
  MapPin,
  User,
  Plus,
  X,
  CalendarDays,
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

const DEPARTMENTS = [
  { code: 'CSE', name: 'Computer Science & Engineering' },
  { code: 'AI-DS', name: 'Artificial Intelligence & Data Science' },
  { code: 'ECE', name: 'Electronics & Communication Engineering' },
  { code: 'MECH', name: 'Mechanical Engineering' },
];

export default function TimetablePage() {
  const { timetableSlots, addTimetableSlot, courses } = useAcademic();
  const { role } = useRole();

  const [selectedDept, setSelectedDept] = useState('CSE');
  const [selectedSemester, setSelectedSemester] = useState('6');
  const [selectedDay, setSelectedDay] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'GRID' | 'AGENDA'>('GRID');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Slot Form State
  const [newDay, setNewDay] = useState<DayType>('Monday');
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
      batch: `${selectedDept}-Sem${selectedSemester}-SecA`,
      type: newType,
    });

    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D6D8D5] pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1F2933] flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-[#1F2933]" />
            <span>Master Timetable &amp; Schedules</span>
          </h1>
          <p className="text-xs text-[#667085] mt-0.5">
            Departmental class grids, laboratory allocations, and instructor schedules.
          </p>
        </div>

        {canEdit && (
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#1F2933] hover:bg-[#111827] text-white text-xs font-semibold gap-1.5 rounded-lg shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Class Slot</span>
          </Button>
        )}
      </div>

      {/* Scope Selector Bar */}
      <div className="p-4 rounded-xl border border-[#D6D8D5] bg-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <span className="text-[11px] text-[#667085] block font-medium">Department</span>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="text-xs font-semibold text-[#1F2933] bg-[#F0F1EF] border border-[#D6D8D5] rounded-lg px-2.5 py-1.5 cursor-pointer mt-0.5"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept.code} value={dept.code}>
                  {dept.name} ({dept.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <span className="text-[11px] text-[#667085] block font-medium">Semester / Batch</span>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="text-xs font-semibold text-[#1F2933] bg-[#F0F1EF] border border-[#D6D8D5] rounded-lg px-2.5 py-1.5 cursor-pointer mt-0.5"
            >
              <option value="6">Semester 6 · 3rd Year (Section A)</option>
              <option value="4">Semester 4 · 2nd Year (Section A)</option>
              <option value="2">Semester 2 · 1st Year (Section A)</option>
              <option value="8">Semester 8 · 4th Year (Section A)</option>
            </select>
          </div>
        </div>

        {/* View Switcher */}
        <div className="inline-flex p-1 bg-[#F0F1EF] rounded-full border border-[#D6D8D5] gap-1 shrink-0 self-start md:self-center">
          <button
            onClick={() => setViewMode('GRID')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
              viewMode === 'GRID'
                ? 'bg-[#1F2933] text-white shadow-xs'
                : 'text-[#667085] hover:text-[#1F2933]'
            }`}
          >
            Weekly Grid
          </button>
          <button
            onClick={() => setViewMode('AGENDA')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
              viewMode === 'AGENDA'
                ? 'bg-[#1F2933] text-white shadow-xs'
                : 'text-[#667085] hover:text-[#1F2933]'
            }`}
          >
            List View
          </button>
        </div>
      </div>

      {/* Day Filter Pills */}
      <div className="inline-flex p-1 bg-[#F0F1EF] rounded-full border border-[#D6D8D5] gap-1 overflow-x-auto max-w-full">
        <button
          onClick={() => setSelectedDay('ALL')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
            selectedDay === 'ALL'
              ? 'bg-[#1F2933] text-white shadow-xs'
              : 'text-[#667085] hover:text-[#1F2933]'
          }`}
        >
          All Days
        </button>
        {DAYS.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
              selectedDay === day
                ? 'bg-[#1F2933] text-white shadow-xs'
                : 'text-[#667085] hover:text-[#1F2933]'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Content View */}
      {viewMode === 'GRID' ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {DAYS.map((day) => {
            const daySlots = timetableSlots.filter((s) => s.day === day);
            if (selectedDay !== 'ALL' && selectedDay !== day) return null;

            return (
              <div key={day} className="space-y-3">
                <div className="bg-white p-2.5 rounded-xl border border-[#D6D8D5] text-center font-bold text-xs text-[#1F2933] shadow-xs">
                  {day} ({daySlots.length})
                </div>

                <div className="space-y-2">
                  {daySlots.length === 0 ? (
                    <div className="p-4 text-center text-[#667085] text-xs border border-dashed border-[#D6D8D5] rounded-xl bg-white/50">
                      No Classes
                    </div>
                  ) : (
                    daySlots.map((slot) => (
                      <div
                        key={slot.id}
                        className="p-3.5 rounded-xl border border-[#D6D8D5] bg-white hover:border-[#1F2933] transition-all text-[#1F2933] space-y-2 shadow-xs"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F0F1EF] text-[#1F2933]">
                            {slot.courseCode}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${
                              slot.type === 'Lecture'
                                ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                : slot.type === 'Lab'
                                ? 'bg-purple-50 text-purple-800 border border-purple-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {slot.type}
                          </span>
                        </div>

                        <h4 className="font-bold text-xs text-[#1F2933] leading-snug">
                          {slot.courseName}
                        </h4>

                        <div className="space-y-1 text-[11px] text-[#667085]">
                          <div className="flex items-center gap-1 font-medium text-[#1F2933]">
                            <Clock className="h-3 w-3 text-[#667085]" />
                            <span>{slot.timeSlot}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-[#667085]" />
                            <span>{slot.room}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3 text-[#667085]" />
                            <span className="truncate">{slot.instructor}</span>
                          </div>
                        </div>
                      </div>
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
            <div
              key={slot.id}
              className="p-4 rounded-xl border border-[#D6D8D5] bg-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F0F1EF] text-[#1F2933]">
                    {slot.day} · {slot.timeSlot}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F0F1EF] text-[#1F2933]">
                    {slot.courseCode}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[#1F2933]">{slot.courseName}</h3>
              </div>

              <div className="flex items-center gap-4 text-[#667085] text-xs">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{slot.room}</span>
                </span>
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  <span>{slot.instructor}</span>
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                    slot.type === 'Lecture'
                      ? 'bg-blue-50 text-blue-800 border border-blue-200'
                      : slot.type === 'Lab'
                      ? 'bg-purple-50 text-purple-800 border border-purple-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                >
                  {slot.type}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add Timetable Slot */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <Card className="w-full max-w-lg bg-white border-[#D6D8D5] text-[#1F2933] shadow-xl">
            <CardHeader className="p-4 border-b border-[#D6D8D5] flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-[#1F2933] flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Schedule Class Slot</span>
              </CardTitle>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#667085] hover:text-[#1F2933] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </CardHeader>

            <CardContent className="p-4 space-y-3.5">
              <form onSubmit={handleAddSlot} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#1F2933] block mb-1">Day of Week</label>
                    <select
                      value={newDay}
                      onChange={(e) => setNewDay(e.target.value as DayType)}
                      className="w-full rounded-lg bg-white border border-[#D6D8D5] p-2 text-xs text-[#1F2933] cursor-pointer"
                    >
                      {DAYS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#1F2933] block mb-1">Session Type</label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as any)}
                      className="w-full rounded-lg bg-white border border-[#D6D8D5] p-2 text-xs text-[#1F2933] cursor-pointer"
                    >
                      <option value="Lecture">Lecture</option>
                      <option value="Lab">Laboratory Session</option>
                      <option value="Tutorial">Tutorial / Discussion</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#1F2933] block mb-1">Course Subject</label>
                  <select
                    value={newCourseCode}
                    onChange={(e) => setNewCourseCode(e.target.value)}
                    className="w-full rounded-lg bg-white border border-[#D6D8D5] p-2 text-xs text-[#1F2933] cursor-pointer"
                  >
                    {courses.map((c) => (
                      <option key={c.code} value={c.code}>{c.code} — {c.title}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#1F2933] block mb-1">Time Slot</label>
                    <Input
                      placeholder="09:00 - 10:15 AM"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="bg-white border-[#D6D8D5] text-xs text-[#1F2933]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#1F2933] block mb-1">Room / Hall</label>
                    <Input
                      placeholder="Tech Hall 102"
                      value={newRoom}
                      onChange={(e) => setNewRoom(e.target.value)}
                      className="bg-white border-[#D6D8D5] text-xs text-[#1F2933]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#1F2933] block mb-1">Faculty Instructor</label>
                  <Input
                    placeholder="Prof. Sarah Jenkins"
                    value={newInstructor}
                    onChange={(e) => setNewInstructor(e.target.value)}
                    className="bg-white border-[#D6D8D5] text-xs text-[#1F2933]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#D6D8D5]">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddModalOpen(false)}
                    className="text-xs cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-[#1F2933] hover:bg-[#111827] text-white font-semibold text-xs cursor-pointer"
                  >
                    Save Class Slot
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
