'use client';

import React, { useState } from 'react';
import { useAcademic } from '@/lib/context/academic-context';
import { useRole } from '@/lib/hooks/use-role';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CalendarCheck,
  CheckCircle,
  AlertTriangle,
  Plus,
  X,
  History,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { AttendanceStudentLog } from '@/lib/types/academic';

export default function AttendancePage() {
  const { attendanceRecords, submitAttendanceSession, students, courses } = useAcademic();
  const { role, user } = useRole();

  const [isMarkingModalOpen, setIsMarkingModalOpen] = useState(false);
  const [selectedCourseCode, setSelectedCourseCode] = useState('CS301');

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

  const trendData = [
    { day: 'Mon', percentage: 92 },
    { day: 'Tue', percentage: 95 },
    { day: 'Wed', percentage: 91 },
    { day: 'Thu', percentage: 94 },
    { day: 'Fri', percentage: 96 },
    { day: 'Sat', percentage: 89 },
    { day: 'Sun', percentage: 97 },
  ];

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D0D1D6] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#202226] font-mono flex items-center gap-2.5">
            <CalendarCheck className="h-6 w-6 text-[#B45309]" />
            <span>ACADEMIC ATTENDANCE ROSTER</span>
          </h1>
          <p className="text-xs text-[#555960] mt-1 font-sans">
            Real-time daily class attendance, batch submission, attendance warnings, and parent observer logs
          </p>
        </div>

        {canMark && (
          <Button
            onClick={() => setIsMarkingModalOpen(true)}
            size="sm"
            className="bg-gradient-to-r from-[#EAB308] to-[#D4AF37] hover:opacity-90 text-[#0B132B] font-bold text-xs gap-1.5 shadow-md shadow-[#D4AF37]/20"
          >
            <Plus className="h-4 w-4" />
            <span>Submit Attendance Session</span>
          </Button>
        )}
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Card className="bg-[#F4F5F6] border-[#D0D1D6] text-[#202226]">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono text-[#B45309] uppercase tracking-wider">Campus Attendance Rate</p>
              <h3 className="text-xl font-bold font-mono mt-0.5 text-emerald-400">{overallAvgAttendance}%</h3>
            </div>
            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CheckCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#F4F5F6] border-[#D0D1D6] text-[#202226]">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono text-[#B45309] uppercase tracking-wider">Submissions Logged</p>
              <h3 className="text-xl font-bold font-mono mt-0.5 text-[#202226]">{totalSubmissions} Sessions</h3>
            </div>
            <div className="h-9 w-9 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <History className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#F4F5F6] border-[#D0D1D6] text-[#202226]">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono text-[#B45309] uppercase tracking-wider">Attendance Defaulters</p>
              <h3 className="text-xl font-bold font-mono mt-0.5 text-red-400">{defaultersCount} Students (&lt;75%)</h3>
            </div>
            <div className="h-9 w-9 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#F4F5F6] border-[#D0D1D6] text-[#202226]">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono text-[#B45309] uppercase tracking-wider">Weekly Velocity</p>
              <h3 className="text-xl font-bold font-mono mt-0.5 text-[#B45309]">+2.4% vs last week</h3>
            </div>
            <div className="h-9 w-9 rounded-lg bg-[#EAB308]/10 border border-[#EAB308]/30 flex items-center justify-center text-[#B45309]">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Trend Chart */}
      <Card className="bg-[#F4F5F6] border-[#D0D1D6] text-[#202226]">
        <CardHeader className="p-4 pb-2 border-b border-[#D0D1D6] bg-white/60">
          <CardTitle className="text-xs font-mono font-bold uppercase tracking-wider text-[#B45309] flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span>7-Day Aggregated Campus Attendance Trend</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <XAxis dataKey="day" stroke="#B8B5A3" fontSize={11} />
              <YAxis domain={[70, 100]} stroke="#B8B5A3" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0B132B', borderColor: '#243356', color: '#F4F1DE' }}
              />
              <Area type="monotone" dataKey="percentage" stroke="#D4AF37" fill="#D4AF37" fillOpacity={0.2} name="Attendance %" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Attendance History Roster Sessions */}
      <div className="space-y-4">
        <h3 className="text-xs font-mono font-bold text-[#B45309] uppercase tracking-wider">
          Submitted Lecture Attendance Sessions
        </h3>

        {attendanceRecords.map((record) => (
          <Card key={record.id} className="bg-[#F4F5F6] border-[#D0D1D6] text-[#202226]">
            <CardHeader className="p-4 pb-3 border-b border-[#D0D1D6] bg-white/50 flex flex-row items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-[#EAB308]/20 text-[#B45309] border-[#EAB308]/40 font-mono text-[10px]">
                    {record.courseCode}
                  </Badge>
                  <CardTitle className="text-sm font-bold font-mono text-[#202226]">
                    {record.courseName}
                  </CardTitle>
                </div>
                <p className="text-[11px] text-[#555960] font-mono mt-1">
                  Batch: {record.batch} · Marked by: {record.markedBy}
                </p>
              </div>

              <div className="text-right font-mono text-xs">
                <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30">
                  {record.status}
                </Badge>
                <p className="text-[10px] text-[#555960] mt-1">{record.date}</p>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="divide-y divide-[#243356] text-xs">
                {record.studentLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3.5 hover:bg-white/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[#555960] text-[11px]">#{idx + 1 < 10 ? `0${idx + 1}` : idx + 1}</span>
                      <div>
                        <p className="font-bold text-[#202226]">{log.studentName}</p>
                        <p className="text-[#555960] font-mono text-[11px]">{log.rollNumber}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {log.remarks && (
                        <span className="text-[10px] text-amber-400 font-mono italic mr-2">{log.remarks}</span>
                      )}
                      <Badge
                        className={
                          log.status === 'present'
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 font-mono text-[10px]'
                            : log.status === 'absent'
                            ? 'bg-red-500/15 text-red-300 border-red-500/30 font-mono text-[10px]'
                            : 'bg-amber-500/15 text-amber-300 border-amber-500/30 font-mono text-[10px]'
                        }
                      >
                        {log.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal: Interactive Attendance Marking */}
      {isMarkingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <Card className="w-full max-w-xl bg-[#F4F5F6] border-[#D0D1D6] text-[#202226]">
            <CardHeader className="p-4 border-b border-[#D0D1D6] flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold font-mono text-[#B45309] flex items-center gap-2">
                <CalendarCheck className="h-4 w-4" />
                <span>Mark Attendance Session</span>
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMarkingModalOpen(false)}
                className="h-6 w-6 text-[#555960] hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
              <form onSubmit={handleSaveAttendance} className="space-y-4">
                <div>
                  <label className="text-[10px] font-mono text-[#B45309] uppercase block mb-1">Select Course Section</label>
                  <select
                    value={selectedCourseCode}
                    onChange={(e) => setSelectedCourseCode(e.target.value)}
                    className="w-full rounded-md bg-white border border-[#D0D1D6] p-2 text-xs text-[#202226] font-mono"
                  >
                    {courses.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} — {c.title} ({c.departmentCode})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Enrolled Student List for marking */}
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {studentLogs.map((log, index) => (
                    <div
                      key={log.studentId}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 bg-white rounded-lg border border-[#D0D1D6] text-xs gap-2"
                    >
                      <div>
                        <span className="font-bold text-[#202226]">{log.studentName}</span>
                        <span className="text-[10px] text-[#555960] font-mono block">{log.rollNumber}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleStatusToggle(index, 'present')}
                          className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold transition-all ${
                            log.status === 'present'
                              ? 'bg-emerald-500 text-[#0B132B]'
                              : 'bg-[#E7E8EB] text-[#555960] hover:text-white'
                          }`}
                        >
                          PRESENT
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusToggle(index, 'absent')}
                          className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold transition-all ${
                            log.status === 'absent'
                              ? 'bg-red-500 text-white'
                              : 'bg-[#E7E8EB] text-[#555960] hover:text-white'
                          }`}
                        >
                          ABSENT
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStatusToggle(index, 'late')}
                          className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold transition-all ${
                            log.status === 'late'
                              ? 'bg-amber-500 text-[#0B132B]'
                              : 'bg-[#E7E8EB] text-[#555960] hover:text-white'
                          }`}
                        >
                          LATE
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#D0D1D6]">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsMarkingModalOpen(false)}
                    className="text-xs border-[#D0D1D6]"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#EAB308] hover:bg-[#D4AF37] text-[#0B132B] font-bold text-xs"
                  >
                    Save &amp; Submit Attendance
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
