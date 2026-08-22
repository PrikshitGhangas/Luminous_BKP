'use client';

import React, { useState } from 'react';
import { useAcademic } from '@/lib/context/academic-context';
import { useRole } from '@/lib/hooks/use-role';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  CalendarCheck,
  Plus,
  X,
  Search,
  ChevronDown,
  MapPin,
  CheckCircle2,
  Navigation,
  Radio,
  Shield,
  Clock,
} from 'lucide-react';
import { AttendanceStudentLog } from '@/lib/types/academic';

export default function AttendancePage() {
  const { attendanceRecords, submitAttendanceSession, students, courses } = useAcademic();
  const { role, user } = useRole();

  const [isMarkingModalOpen, setIsMarkingModalOpen] = useState(false);
  const [selectedCourseCode, setSelectedCourseCode] = useState('CS301');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSessionIds, setExpandedSessionIds] = useState<Record<string, boolean>>({
    [attendanceRecords[0]?.id || '']: true,
  });

  // Geofence Self Check-In State (Student Perspective)
  const [geofenceCheckedIn, setGeofenceCheckedIn] = useState(false);
  const [isVerifyingGeofence, setIsVerifyingGeofence] = useState(false);

  const handleGeofenceCheckIn = () => {
    setIsVerifyingGeofence(true);
    setTimeout(() => {
      setIsVerifyingGeofence(false);
      setGeofenceCheckedIn(true);
    }, 800);
  };

  // Interactive marking session state
  const [studentLogs, setStudentLogs] = useState<AttendanceStudentLog[]>([
    { studentId: 'std-001', rollNumber: 'CS23B042', studentName: 'Aanya Patel', status: 'present' },
    { studentId: 'std-002', rollNumber: 'CS23B043', studentName: 'Rohan Sengupta', status: 'present' },
    { studentId: 'std-003', rollNumber: 'CS23B044', studentName: 'Priya Sharma', status: 'present' },
    { studentId: 'std-004', rollNumber: 'AI23B012', studentName: 'Kabir Mehta', status: 'absent', remarks: 'Unexcused' },
    { studentId: 'std-005', rollNumber: 'EC24B008', studentName: 'Sneha Krishnan', status: 'present' },
  ]);

  const canMark = role === 'super_admin' || role === 'admin' || role === 'faculty';

  // Metrics
  const totalSubmissions = attendanceRecords.length;
  const defaultersCount = students.filter((s) => s.attendancePercentage < 75).length;
  const overallAvgAttendance = Math.round(
    students.reduce((acc, s) => acc + s.attendancePercentage, 0) / (students.length || 1)
  );

  const handleStatusToggle = (index: number, newStatus: 'present' | 'absent' | 'late' | 'excused') => {
    setStudentLogs((prev) =>
      prev.map((log, i) => (i === index ? { ...log, status: newStatus } : log))
    );
  };

  const handleSaveAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    const course = courses.find((c) => c.code === selectedCourseCode) || courses[0];
    const presentCount = studentLogs.filter((l) => l.status === 'present').length;
    const absentCount = studentLogs.filter((l) => l.status === 'absent').length;
    const lateCount = studentLogs.filter((l) => l.status === 'late').length;

    submitAttendanceSession({
      date: new Date().toISOString().split('T')[0],
      courseCode: course.code,
      courseName: course.title,
      batch: `${course.departmentCode}-Sem${course.semester}`,
      totalStudents: studentLogs.length,
      presentCount,
      absentCount,
      lateCount,
      markedBy: user?.full_name || 'Prof. Sarah Jenkins',
      status: 'Submitted',
      studentLogs,
    });

    setIsMarkingModalOpen(false);
  };

  const toggleExpand = (id: string) => {
    setExpandedSessionIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredRecords = attendanceRecords.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.courseName.toLowerCase().includes(q) ||
      r.courseCode.toLowerCase().includes(q) ||
      r.batch.toLowerCase().includes(q) ||
      r.markedBy.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D6D8D5] pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1F2933] flex items-center gap-2">
            <CalendarCheck className="h-6 w-6 text-[#1F2933]" />
            <span>Attendance Management</span>
          </h1>
          <p className="text-xs text-[#667085] mt-0.5">
            Classroom attendance logs, batch verification, and student attendance tracking.
          </p>
        </div>

        {canMark && (
          <Button
            onClick={() => setIsMarkingModalOpen(true)}
            className="bg-[#1F2933] hover:bg-[#111827] text-white text-xs font-semibold gap-1.5 rounded-lg shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Mark Class Attendance</span>
          </Button>
        )}
      </div>

      {/* Smart Geofenced Check-In Active Banner (PostGIS ST_Within) */}
      <div className="p-4 rounded-2xl bg-white border border-[#D6D8D5] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-bold text-[#1F2933]">PostGIS Polygon Geofence Attendance</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              ST_Within Active
            </span>
          </div>
          <p className="text-xs text-[#667085]">
            Active Schedule: <strong>CS301 (Cloud Computing)</strong> • AB1, Lecture Hall 201 • Coordinates: 12.9724°N, 77.5952°E
          </p>
        </div>

        <div>
          {geofenceCheckedIn ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Checked-In (Geofence Verified)</span>
            </div>
          ) : (
            <Button
              onClick={handleGeofenceCheckIn}
              disabled={isVerifyingGeofence}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs gap-1.5 rounded-lg shadow-xs cursor-pointer"
            >
              <Navigation className="h-3.5 w-3.5" />
              <span>{isVerifyingGeofence ? 'Verifying Coordinates...' : 'Verify Geofence Check-In'}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Clean Metric Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl border border-[#D6D8D5] bg-white shadow-xs">
          <span className="text-xs text-[#667085]">Average Campus Attendance</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-[#1F2933]">{overallAvgAttendance}%</span>
            <span className="text-xs font-medium text-emerald-700">Healthy rate</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[#D6D8D5] bg-white shadow-xs">
          <span className="text-xs text-[#667085]">Recorded Sessions</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-[#1F2933]">{totalSubmissions}</span>
            <span className="text-xs text-[#667085]">Total verified batches</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[#D6D8D5] bg-white shadow-xs">
          <span className="text-xs text-[#667085]">Attendance Warnings (&lt;75%)</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-amber-700">{defaultersCount} Students</span>
            <span className="text-xs text-[#667085]">Follow-up required</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#667085]" />
        <Input
          placeholder="Filter by subject name, course code, or instructor..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 text-xs border-[#D6D8D5] bg-white rounded-xl shadow-xs"
        />
      </div>

      {/* Lecture Attendance Session Cards */}
      <div className="space-y-4">
        {filteredRecords.map((record) => {
          const isExpanded = !!expandedSessionIds[record.id];
          const presentRatio =
            record.totalStudents > 0
              ? Math.round((record.presentCount / record.totalStudents) * 100)
              : 100;

          return (
            <div
              key={record.id}
              className="rounded-xl border border-[#D6D8D5] bg-white shadow-xs overflow-hidden transition-all"
            >
              {/* Session Header Row */}
              <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#F0F1EF] text-[#1F2933]">
                      {record.courseCode}
                    </span>
                    <h3 className="text-sm font-bold text-[#1F2933]">
                      {record.courseName}
                    </h3>
                  </div>
                  <p className="text-xs text-[#667085]">
                    Batch: <span className="font-medium text-[#1F2933]">{record.batch}</span> · Instructor:{' '}
                    <span className="font-medium text-[#1F2933]">{record.markedBy}</span> · Date:{' '}
                    <span className="text-[#667085]">{record.date}</span>
                  </p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <span className="text-xs font-bold text-[#1F2933]">
                      {record.presentCount}/{record.totalStudents} Present
                    </span>
                    <span className="text-[11px] text-emerald-700 block font-medium">
                      {presentRatio}% Attendance
                    </span>
                  </div>

                  <button
                    onClick={() => toggleExpand(record.id)}
                    className="p-1.5 rounded-lg border border-[#D6D8D5] hover:bg-[#F0F1EF] text-[#667085] cursor-pointer"
                  >
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Collapsible Student Attendance Roster */}
              {isExpanded && (
                <div className="border-t border-[#D6D8D5] bg-[#F7F8F6] p-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-left text-[#667085] border-b border-[#D6D8D5] pb-2">
                          <th className="pb-2 font-medium">Roll Number</th>
                          <th className="pb-2 font-medium">Student Name</th>
                          <th className="pb-2 font-medium">Status</th>
                          <th className="pb-2 font-medium">Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E7EB]">
                        {record.studentLogs.map((log, idx) => (
                          <tr key={idx} className="hover:bg-white/60">
                            <td className="py-2.5 font-medium text-[#1F2933]">{log.rollNumber}</td>
                            <td className="py-2.5 text-[#1F2933]">{log.studentName}</td>
                            <td className="py-2.5">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                                  log.status === 'present'
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                    : log.status === 'absent'
                                    ? 'bg-red-50 text-red-800 border border-red-200'
                                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                                }`}
                              >
                                {log.status}
                              </span>
                            </td>
                            <td className="py-2.5 text-[#667085]">{log.remarks || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal: Attendance Marking */}
      {isMarkingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md z-[100] p-4">
          <Card className="w-full max-w-lg bg-white border-[#D6D8D5] text-[#1F2933] shadow-xl">
            <CardHeader className="p-4 border-b border-[#D6D8D5] flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-[#1F2933] flex items-center gap-2">
                <CalendarCheck className="h-4 w-4 text-[#1F2933]" />
                <span>Mark Class Attendance</span>
              </CardTitle>
              <button
                onClick={() => setIsMarkingModalOpen(false)}
                className="text-[#667085] hover:text-[#1F2933] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
              <form onSubmit={handleSaveAttendance} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[#1F2933] block mb-1">
                    Select Subject &amp; Section
                  </label>
                  <select
                    value={selectedCourseCode}
                    onChange={(e) => setSelectedCourseCode(e.target.value)}
                    className="w-full rounded-lg bg-white border border-[#D6D8D5] p-2 text-xs text-[#1F2933] cursor-pointer"
                  >
                    {courses.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} — {c.title} ({c.departmentCode})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Enrolled Student List for marking */}
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {studentLogs.map((log, index) => (
                    <div
                      key={log.studentId}
                      className="flex items-center justify-between p-2.5 bg-[#F7F8F6] rounded-lg border border-[#D6D8D5] text-xs"
                    >
                      <div>
                        <span className="font-semibold text-[#1F2933] block">{log.studentName}</span>
                        <span className="text-[11px] text-[#667085]">{log.rollNumber}</span>
                      </div>

                      <div className="inline-flex rounded-lg border border-[#D6D8D5] bg-white p-0.5 gap-0.5">
                        <button
                          type="button"
                          onClick={() => handleStatusToggle(index, 'present')}
                          className={`px-2.5 py-1 rounded text-[10px] font-semibold transition-all cursor-pointer ${
                            log.status === 'present'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'text-[#667085] hover:text-[#1F2933]'
                          }`}
                        >
                          Present
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusToggle(index, 'absent')}
                          className={`px-2.5 py-1 rounded text-[10px] font-semibold transition-all cursor-pointer ${
                            log.status === 'absent'
                              ? 'bg-red-600 text-white shadow-xs'
                              : 'text-[#667085] hover:text-[#1F2933]'
                          }`}
                        >
                          Absent
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#D6D8D5]">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsMarkingModalOpen(false)}
                    className="text-xs cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-[#1F2933] hover:bg-[#111827] text-white font-semibold text-xs cursor-pointer"
                  >
                    Save Attendance Log
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
