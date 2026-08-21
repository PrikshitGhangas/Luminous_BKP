'use client';

import React, { useState } from 'react';
import { useAcademic } from '@/lib/context/academic-context';
import { useRole } from '@/lib/hooks/use-role';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  FileSpreadsheet,
  Award,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  Plus,
  X,
  FileCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

export default function ExamsPage() {
  const { exams, scheduleExam, courses } = useAcademic();
  const { role } = useRole();

  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'RESULTS'>('UPCOMING');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // New Exam Form State
  const [newCourseCode, setNewCourseCode] = useState('CS301');
  const [newType, setNewType] = useState<'Mid-Term' | 'Final Semester' | 'Quiz' | 'Practical'>('Mid-Term');
  const [newDate, setNewDate] = useState('2026-09-22');
  const [newTimeSlot, setNewTimeSlot] = useState('09:30 AM - 11:30 AM');
  const [newRoom, setNewRoom] = useState('Main Exam Hall B');
  const [newTotalMarks, setNewTotalMarks] = useState(50);

  const canSchedule = role === 'super_admin' || role === 'admin' || role === 'faculty';

  const upcomingExams = exams.filter((e) => e.status === 'Upcoming' || e.status === 'Ongoing');
  const publishedExams = exams.filter((e) => e.status === 'Grades Published' || e.status === 'Completed');

  const gradeDistributionData = [
    { grade: 'A+', count: 12 },
    { grade: 'A', count: 18 },
    { grade: 'B+', count: 8 },
    { grade: 'B', count: 5 },
    { grade: 'C', count: 2 },
    { grade: 'F', count: 0 },
  ];

  const handleScheduleExam = (e: React.FormEvent) => {
    e.preventDefault();
    const course = courses.find((c) => c.code === newCourseCode) || courses[0];

    scheduleExam({
      examCode: `EXAM-${course.code}-${Date.now().toString().slice(-4)}`,
      courseCode: course.code,
      courseName: course.title,
      department: course.departmentCode,
      type: newType,
      date: newDate,
      timeSlot: newTimeSlot,
      duration: '2 Hours',
      room: newRoom,
      totalMarks: Number(newTotalMarks),
      status: 'Upcoming',
    });

    setIsScheduleModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#243356] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F4F1DE] font-mono flex items-center gap-2.5">
            <FileSpreadsheet className="h-6 w-6 text-[#FFD700]" />
            <span>EXAMINATIONS &amp; GRADE PORTAL</span>
          </h1>
          <p className="text-xs text-[#B8B5A3] mt-1 font-sans">
            Mid-term &amp; final semester schedules, hall ticket clearance, grade reports, and SGPA transcripts
          </p>
        </div>

        {canSchedule && (
          <Button
            onClick={() => setIsScheduleModalOpen(true)}
            size="sm"
            className="bg-gradient-to-r from-[#D4AF37] to-[#C5A059] hover:opacity-90 text-[#0B132B] font-bold text-xs gap-1.5 shadow-md shadow-[#D4AF37]/20"
          >
            <Plus className="h-4 w-4" />
            <span>Schedule New Exam</span>
          </Button>
        )}
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Card className="bg-[#0F1026] border-[#243356] text-[#F4F1DE]">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono text-[#C5A059] uppercase tracking-wider">Scheduled Exams</p>
              <h3 className="text-xl font-bold font-mono mt-0.5 text-[#F4F1DE]">{upcomingExams.length} Exams</h3>
            </div>
            <div className="h-9 w-9 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Calendar className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0F1026] border-[#243356] text-[#F4F1DE]">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono text-[#C5A059] uppercase tracking-wider">Published Results</p>
              <h3 className="text-xl font-bold font-mono mt-0.5 text-emerald-400">{publishedExams.length} Sessions</h3>
            </div>
            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0F1026] border-[#243356] text-[#F4F1DE]">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono text-[#C5A059] uppercase tracking-wider">Average Campus SGPA</p>
              <h3 className="text-xl font-bold font-mono mt-0.5 text-[#FFD700]">9.12 / 10.0</h3>
            </div>
            <div className="h-9 w-9 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#FFD700]">
              <Award className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0F1026] border-[#243356] text-[#F4F1DE]">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono text-[#C5A059] uppercase tracking-wider">Hall Ticket Status</p>
              <h3 className="text-xl font-bold font-mono mt-0.5 text-purple-400">100% Cleared</h3>
            </div>
            <div className="h-9 w-9 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <CheckCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grade Distribution Chart */}
      <Card className="bg-[#0F1026] border-[#243356] text-[#F4F1DE]">
        <CardHeader className="p-4 pb-2 border-b border-[#243356] bg-[#131C38]/60">
          <CardTitle className="text-xs font-mono font-bold uppercase tracking-wider text-[#FFD700] flex items-center gap-2">
            <Award className="h-4 w-4" />
            <span>Semester Grade Distribution (A+ to F)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={gradeDistributionData}>
              <XAxis dataKey="grade" stroke="#B8B5A3" fontSize={11} />
              <YAxis stroke="#B8B5A3" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0B132B', borderColor: '#243356', color: '#F4F1DE' }}
              />
              <Bar dataKey="count" fill="#8B5CF6" name="Student Count" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-[#243356] pb-2">
        <button
          onClick={() => setActiveTab('UPCOMING')}
          className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
            activeTab === 'UPCOMING'
              ? 'bg-[#D4AF37] text-[#0B132B]'
              : 'bg-[#0F1026] text-[#B8B5A3] border border-[#243356] hover:text-white'
          }`}
        >
          Upcoming Examinations ({upcomingExams.length})
        </button>
        <button
          onClick={() => setActiveTab('RESULTS')}
          className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
            activeTab === 'RESULTS'
              ? 'bg-[#D4AF37] text-[#0B132B]'
              : 'bg-[#0F1026] text-[#B8B5A3] border border-[#243356] hover:text-white'
          }`}
        >
          Published Grade Reports
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'UPCOMING' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {upcomingExams.map((ex) => (
            <Card key={ex.id} className="bg-[#0F1026] border-[#243356] text-[#F4F1DE]">
              <CardHeader className="p-4 pb-3 border-b border-[#243356] bg-[#131C38]/40 flex flex-row items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-[#D4AF37]/15 text-[#FFD700] border-[#D4AF37]/30 font-mono text-[10px]">
                      {ex.courseCode}
                    </Badge>
                    <Badge variant="outline" className="text-[9px] font-mono border-[#243356] text-[#C5A059]">
                      {ex.type}
                    </Badge>
                  </div>
                  <h3 className="text-sm font-bold text-[#F4F1DE] mt-1 font-mono">{ex.courseName}</h3>
                </div>
                <Badge className="bg-indigo-500/15 text-indigo-300 border-indigo-500/30 text-[10px] font-mono">
                  {ex.status}
                </Badge>
              </CardHeader>

              <CardContent className="p-4 space-y-2.5 text-xs">
                <div className="flex items-center gap-2 text-[#B8B5A3]">
                  <Calendar className="h-3.5 w-3.5 text-[#C5A059]" />
                  <span>Date: {ex.date}</span>
                </div>
                <div className="flex items-center gap-2 text-[#B8B5A3]">
                  <Clock className="h-3.5 w-3.5 text-[#C5A059]" />
                  <span>Time: {ex.timeSlot} ({ex.duration})</span>
                </div>
                <div className="flex items-center gap-2 text-[#B8B5A3]">
                  <MapPin className="h-3.5 w-3.5 text-[#C5A059]" />
                  <span>Hall: {ex.room}</span>
                </div>

                <div className="pt-2 border-t border-[#243356] flex justify-between items-center text-[11px] font-mono">
                  <span className="text-[#B8B5A3]">Maximum Score:</span>
                  <span className="font-bold text-[#FFD700]">{ex.totalMarks} Marks</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {publishedExams.map((ex) => (
            <Card key={ex.id} className="bg-[#0F1026] border-[#243356] text-[#F4F1DE]">
              <CardHeader className="p-4 pb-3 border-b border-[#243356] bg-[#131C38]/50 flex flex-row items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-mono text-[10px]">
                      {ex.courseCode}
                    </Badge>
                    <CardTitle className="text-sm font-bold font-mono text-[#F4F1DE]">
                      {ex.courseName}
                    </CardTitle>
                  </div>
                  <p className="text-[11px] text-[#B8B5A3] font-mono mt-1">
                    Exam: {ex.examCode} · Max Score: {ex.totalMarks} Marks
                  </p>
                </div>
                <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30">
                  {ex.status}
                </Badge>
              </CardHeader>

              <CardContent className="p-0">
                <div className="divide-y divide-[#243356] text-xs">
                  {ex.grades?.map((g) => (
                    <div key={g.id} className="flex items-center justify-between p-3.5 hover:bg-[#131C38]/40">
                      <div>
                        <p className="font-bold text-[#F4F1DE]">{g.studentName}</p>
                        <p className="text-[#B8B5A3] font-mono text-[11px]">{g.rollNumber}</p>
                      </div>

                      <div className="flex items-center gap-4 font-mono">
                        <span className="text-[#B8B5A3]">Score: <strong className="text-[#F4F1DE]">{g.score} / {g.maxScore}</strong></span>
                        <Badge className="bg-[#D4AF37]/20 text-[#FFD700] border-[#D4AF37]/40 font-bold text-xs font-mono">
                          GRADE {g.grade}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal: Schedule Exam */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <Card className="w-full max-w-lg bg-[#0F1026] border-[#243356] text-[#F4F1DE]">
            <CardHeader className="p-4 border-b border-[#243356] flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold font-mono text-[#FFD700] flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                <span>Schedule New Examination</span>
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsScheduleModalOpen(false)}
                className="h-6 w-6 text-[#B8B5A3] hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-4 space-y-3.5">
              <form onSubmit={handleScheduleExam} className="space-y-3 text-xs">
                <div>
                  <label className="text-[10px] font-mono text-[#C5A059] uppercase block mb-1">Select Course</label>
                  <select
                    value={newCourseCode}
                    onChange={(e) => setNewCourseCode(e.target.value)}
                    className="w-full rounded-md bg-[#131C38] border border-[#243356] p-2 text-xs text-[#F4F1DE] font-mono"
                  >
                    {courses.map((c) => (
                      <option key={c.code} value={c.code}>{c.code} — {c.title}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-[#C5A059] uppercase block mb-1">Exam Type</label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as 'Mid-Term' | 'Final Semester' | 'Quiz' | 'Practical')}
                      className="w-full rounded-md bg-[#131C38] border border-[#243356] p-2 text-xs text-[#F4F1DE]"
                    >
                      <option value="Mid-Term">Mid-Term</option>
                      <option value="Final Semester">Final Semester</option>
                      <option value="Quiz">Quiz</option>
                      <option value="Practical">Practical</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-[#C5A059] uppercase block mb-1">Total Marks</label>
                    <Input
                      type="number"
                      value={newTotalMarks}
                      onChange={(e) => setNewTotalMarks(Number(e.target.value))}
                      className="bg-[#131C38] border-[#243356] text-xs text-[#F4F1DE]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-[#C5A059] uppercase block mb-1">Date</label>
                    <Input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="bg-[#131C38] border-[#243356] text-xs text-[#F4F1DE]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-[#C5A059] uppercase block mb-1">Time Slot</label>
                    <Input
                      placeholder="09:30 AM - 11:30 AM"
                      value={newTimeSlot}
                      onChange={(e) => setNewTimeSlot(e.target.value)}
                      className="bg-[#131C38] border-[#243356] text-xs text-[#F4F1DE]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-[#C5A059] uppercase block mb-1">Exam Hall / Room</label>
                  <Input
                    placeholder="e.g. Main Auditorium Hall A"
                    value={newRoom}
                    onChange={(e) => setNewRoom(e.target.value)}
                    className="bg-[#131C38] border-[#243356] text-xs text-[#F4F1DE]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#243356]">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsScheduleModalOpen(false)}
                    className="text-xs border-[#243356]"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#D4AF37] hover:bg-[#C5A059] text-[#0B132B] font-bold text-xs"
                  >
                    Publish Exam Schedule
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
