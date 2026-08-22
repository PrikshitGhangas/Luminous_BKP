'use client';

import React, { useState } from 'react';
import { useAcademic } from '@/lib/context/academic-context';
import { useRole } from '@/lib/hooks/use-role';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  FileSpreadsheet,
  Award,
  Calendar,
  Clock,
  MapPin,
  Plus,
  X,
  FileCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';

const GRADE_DATA = [
  { name: 'Grade A+', grade: 'A+', count: 12, percentage: '27%', color: '#10B981' },
  { name: 'Grade A', grade: 'A', count: 18, percentage: '40%', color: '#3B82F6' },
  { name: 'Grade B+', grade: 'B+', count: 8, percentage: '18%', color: '#8B5CF6' },
  { name: 'Grade B', grade: 'B', count: 5, percentage: '11%', color: '#F59E0B' },
  { name: 'Grade C', grade: 'C', count: 2, percentage: '4%', color: '#EC4899' },
];

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
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D6D8D5] pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1F2933] flex items-center gap-2">
            <FileSpreadsheet className="h-6 w-6 text-[#1F2933]" />
            <span>Examinations &amp; Grade Reports</span>
          </h1>
          <p className="text-xs text-[#667085] mt-0.5">
            Semester exam schedules, hall allocations, published grades, and GPA distributions.
          </p>
        </div>

        {canSchedule && (
          <Button
            onClick={() => setIsScheduleModalOpen(true)}
            className="bg-[#1F2933] hover:bg-[#111827] text-white text-xs font-semibold gap-1.5 rounded-lg shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Schedule New Exam</span>
          </Button>
        )}
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl border border-[#D6D8D5] bg-white shadow-xs">
          <span className="text-xs text-[#667085]">Scheduled Examinations</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-[#1F2933]">{upcomingExams.length} Exams</span>
            <span className="text-xs text-[#667085]">Active roster</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[#D6D8D5] bg-white shadow-xs">
          <span className="text-xs text-[#667085]">Published Grade Reports</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-[#1F2933]">{publishedExams.length} Batches</span>
            <span className="text-xs text-emerald-700 font-medium">Results verified</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[#D6D8D5] bg-white shadow-xs">
          <span className="text-xs text-[#667085]">Campus Average SGPA</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-[#1F2933]">9.12 / 10.0</span>
            <span className="text-xs text-[#667085]">Across departments</span>
          </div>
        </div>
      </div>

      {/* Grade Distribution Pie Chart */}
      <div className="p-5 rounded-xl border border-[#D6D8D5] bg-white shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[#D6D8D5]">
          <div>
            <h3 className="text-sm font-bold text-[#1F2933]">Semester Grade Distribution</h3>
            <p className="text-xs text-[#667085]">Breakdown of student performance across active cohorts</p>
          </div>
          <span className="text-xs font-semibold text-[#1F2933]">45 Students Evaluated</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-6 pt-4">
          {/* Donut Chart */}
          <div className="h-52 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={GRADE_DATA}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                >
                  {GRADE_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white px-3 py-2 rounded-lg border border-[#D6D8D5] shadow-md text-xs space-y-0.5">
                          <p className="font-bold text-[#1F2933]">{data.name}</p>
                          <p className="text-[#667085]">
                            {data.count} Students ({data.percentage})
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Clean Legend & Statistics */}
          <div className="space-y-2.5">
            {GRADE_DATA.map((item) => (
              <div key={item.grade} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-semibold text-[#1F2933]">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#667085]">{item.count} students</span>
                  <span className="font-semibold text-[#1F2933] w-10 text-right">{item.percentage}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="inline-flex p-1 bg-[#F0F1EF] rounded-full border border-[#D6D8D5] gap-1">
        <button
          onClick={() => setActiveTab('UPCOMING')}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'UPCOMING'
              ? 'bg-[#1F2933] text-white shadow-xs'
              : 'text-[#667085] hover:text-[#1F2933]'
          }`}
        >
          Upcoming Examinations ({upcomingExams.length})
        </button>
        <button
          onClick={() => setActiveTab('RESULTS')}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'RESULTS'
              ? 'bg-[#1F2933] text-white shadow-xs'
              : 'text-[#667085] hover:text-[#1F2933]'
          }`}
        >
          Published Grade Reports ({publishedExams.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'UPCOMING' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {upcomingExams.map((ex) => (
            <div
              key={ex.id}
              className="p-4 rounded-xl border border-[#D6D8D5] bg-white shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F0F1EF] text-[#1F2933]">
                      {ex.courseCode}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F0F1EF] text-[#667085]">
                      {ex.type}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-[#1F2933] mt-1">{ex.courseName}</h3>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                  {ex.status}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-[#667085]">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Date: {ex.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Time: {ex.timeSlot} ({ex.duration})</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>Hall: {ex.room}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#D6D8D5] flex justify-between items-center text-xs">
                <span className="text-[#667085]">Maximum Score:</span>
                <span className="font-bold text-[#1F2933]">{ex.totalMarks} Marks</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {publishedExams.map((ex) => (
            <div
              key={ex.id}
              className="rounded-xl border border-[#D6D8D5] bg-white shadow-xs overflow-hidden"
            >
              <div className="p-4 border-b border-[#D6D8D5] flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F0F1EF] text-[#1F2933]">
                      {ex.courseCode}
                    </span>
                    <h3 className="text-sm font-bold text-[#1F2933]">{ex.courseName}</h3>
                  </div>
                  <p className="text-xs text-[#667085] mt-0.5">
                    Exam Ref: {ex.examCode} · Max Score: {ex.totalMarks} Marks
                  </p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {ex.status}
                </span>
              </div>

              <div className="divide-y divide-[#E5E7EB] text-xs">
                {ex.grades?.map((g) => (
                  <div key={g.id} className="flex items-center justify-between p-3.5 hover:bg-[#F7F8F6]">
                    <div>
                      <p className="font-semibold text-[#1F2933]">{g.studentName}</p>
                      <p className="text-[#667085] text-[11px]">{g.rollNumber}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-[#667085]">
                        Score: <strong className="text-[#1F2933]">{g.score} / {g.maxScore}</strong>
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md font-bold text-xs bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Grade {g.grade}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Schedule Exam */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <Card className="w-full max-w-lg bg-white border-[#D6D8D5] text-[#1F2933] shadow-xl">
            <CardHeader className="p-4 border-b border-[#D6D8D5] flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-[#1F2933] flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                <span>Schedule New Examination</span>
              </CardTitle>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="text-[#667085] hover:text-[#1F2933] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </CardHeader>
            <CardContent className="p-4 space-y-3.5">
              <form onSubmit={handleScheduleExam} className="space-y-3 text-xs">
                <div>
                  <label className="text-xs font-semibold text-[#1F2933] block mb-1">Select Course</label>
                  <select
                    value={newCourseCode}
                    onChange={(e) => setNewCourseCode(e.target.value)}
                    className="w-full rounded-lg bg-white border border-[#D6D8D5] p-2 text-xs text-[#1F2933] cursor-pointer"
                  >
                    {courses.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} — {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#1F2933] block mb-1">Exam Type</label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as any)}
                      className="w-full rounded-lg bg-white border border-[#D6D8D5] p-2 text-xs text-[#1F2933] cursor-pointer"
                    >
                      <option value="Mid-Term">Mid-Term</option>
                      <option value="Final Semester">Final Semester</option>
                      <option value="Quiz">Quiz</option>
                      <option value="Practical">Practical</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#1F2933] block mb-1">Total Marks</label>
                    <Input
                      type="number"
                      value={newTotalMarks}
                      onChange={(e) => setNewTotalMarks(Number(e.target.value))}
                      className="bg-white border-[#D6D8D5] text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#1F2933] block mb-1">Date</label>
                    <Input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="bg-white border-[#D6D8D5] text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#1F2933] block mb-1">Time Slot</label>
                    <Input
                      placeholder="09:30 AM - 11:30 AM"
                      value={newTimeSlot}
                      onChange={(e) => setNewTimeSlot(e.target.value)}
                      className="bg-white border-[#D6D8D5] text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#1F2933] block mb-1">Exam Hall / Room</label>
                  <Input
                    placeholder="e.g. Main Auditorium Hall A"
                    value={newRoom}
                    onChange={(e) => setNewRoom(e.target.value)}
                    className="bg-white border-[#D6D8D5] text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#D6D8D5]">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsScheduleModalOpen(false)}
                    className="text-xs cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-[#1F2933] hover:bg-[#111827] text-white font-semibold text-xs cursor-pointer"
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
