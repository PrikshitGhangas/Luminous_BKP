'use client';

import React, { useState } from 'react';
import { useAcademic } from '@/lib/context/academic-context';
import { useRole } from '@/lib/hooks/use-role';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Plus,
  Search,
  Users,
  Clock,
  MapPin,
  CheckCircle,
  FileText,
  X,
  ChevronRight,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { Course } from '@/lib/types/academic';

export default function CoursesPage() {
  const { courses, addCourse, departments } = useAcademic();
  const { role } = useRole();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // New Course Form State
  const [newCode, setNewCode] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDept, setNewDept] = useState('CSE');
  const [newCredits, setNewCredits] = useState(4);
  const [newSemester, setNewSemester] = useState(6);
  const [newInstructor, setNewInstructor] = useState('Prof. Sarah Jenkins');
  const [newCapacity, setNewCapacity] = useState(60);
  const [newScheduleDays, setNewScheduleDays] = useState('Monday, Wednesday');
  const [newScheduleTime, setNewScheduleTime] = useState('10:00 - 11:30 AM');
  const [newRoom, setNewRoom] = useState('Tech Hall 104');
  const [newDescription, setNewDescription] = useState('');

  const canCreate = role === 'super_admin' || role === 'admin' || role === 'faculty';

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.instructorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDeptFilter === 'ALL' || c.departmentCode === selectedDeptFilter;
    return matchesSearch && matchesDept;
  });

  const totalCredits = courses.reduce((acc, c) => acc + c.credits, 0);
  const totalEnrolled = courses.reduce((acc, c) => acc + c.enrolledCount, 0);
  const avgCapacityUtil = Math.round(
    (courses.reduce((acc, c) => acc + (c.enrolledCount / c.capacity) * 100, 0) / (courses.length || 1))
  );

  const chartData = courses.map((c) => ({
    code: c.code,
    enrolled: c.enrolledCount,
    capacity: c.capacity,
  }));

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newTitle) return;

    addCourse({
      code: newCode.toUpperCase(),
      title: newTitle,
      departmentCode: newDept,
      credits: Number(newCredits),
      semester: Number(newSemester),
      instructorId: 'fac-001',
      instructorName: newInstructor,
      capacity: Number(newCapacity),
      enrolledCount: 0,
      description: newDescription || 'Academic course covering theoretical frameworks and practical laboratory assignments.',
      syllabus: [
        'Module 1: Foundations & Core Concepts',
        'Module 2: Advanced Design & Applied Architectures',
        'Module 3: Case Studies & Project Implementation',
      ],
      scheduleDays: newScheduleDays.split(',').map((s) => s.trim()),
      scheduleTime: newScheduleTime,
      room: newRoom,
      status: 'active',
    });

    setNewCode('');
    setNewTitle('');
    setNewDescription('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#243356] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F4F1DE] font-mono flex items-center gap-2.5">
            <BookOpen className="h-6 w-6 text-[#FFD700]" />
            <span>COURSES CATALOG &amp; SYLLABUS</span>
          </h1>
          <p className="text-xs text-[#B8B5A3] mt-1 font-sans">
            Curriculum mapping, degree credits, syllabus modules, and course section capacity
          </p>
        </div>

        {canCreate && (
          <Button
            onClick={() => setIsAddModalOpen(true)}
            size="sm"
            className="bg-gradient-to-r from-[#D4AF37] to-[#C5A059] hover:opacity-90 text-[#0B132B] font-bold text-xs gap-1.5 shadow-md shadow-[#D4AF37]/20"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Course</span>
          </Button>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Card className="bg-[#0F1026] border-[#243356] text-[#F4F1DE]">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono text-[#C5A059] uppercase tracking-wider">Total Courses</p>
              <h3 className="text-xl font-bold font-mono mt-0.5 text-[#F4F1DE]">{courses.length}</h3>
            </div>
            <div className="h-9 w-9 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#FFD700]">
              <BookOpen className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0F1026] border-[#243356] text-[#F4F1DE]">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono text-[#C5A059] uppercase tracking-wider">Total Credits</p>
              <h3 className="text-xl font-bold font-mono mt-0.5 text-[#F4F1DE]">{totalCredits} Hrs</h3>
            </div>
            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Layers className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0F1026] border-[#243356] text-[#F4F1DE]">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono text-[#C5A059] uppercase tracking-wider">Enrolled Students</p>
              <h3 className="text-xl font-bold font-mono mt-0.5 text-[#F4F1DE]">{totalEnrolled}</h3>
            </div>
            <div className="h-9 w-9 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0F1026] border-[#243356] text-[#F4F1DE]">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono text-[#C5A059] uppercase tracking-wider">Capacity Fill Rate</p>
              <h3 className="text-xl font-bold font-mono mt-0.5 text-[#FFD700]">{avgCapacityUtil}%</h3>
            </div>
            <div className="h-9 w-9 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <CheckCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart: Course Enrollment Capacity */}
      <Card className="bg-[#0F1026] border-[#243356] text-[#F4F1DE]">
        <CardHeader className="p-4 pb-2 border-b border-[#243356] bg-[#131C38]/60">
          <CardTitle className="text-xs font-mono font-bold uppercase tracking-wider text-[#FFD700] flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Course Capacity vs Current Enrollment</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="code" stroke="#B8B5A3" fontSize={11} />
              <YAxis stroke="#B8B5A3" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0B132B', borderColor: '#243356', color: '#F4F1DE' }}
              />
              <Bar dataKey="capacity" fill="#243356" name="Max Capacity" radius={[4, 4, 0, 0]} />
              <Bar dataKey="enrolled" fill="#D4AF37" name="Enrolled" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Search & Dept Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-3 bg-[#0F1026] p-3 rounded-xl border border-[#243356]">
          <Search className="h-4 w-4 text-[#C5A059] shrink-0" />
          <Input
            placeholder="Search course title, code, or instructor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-0 text-xs text-[#F4F1DE] placeholder:text-[#B8B5A3]/60 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'CSE', 'AI-DS', 'ECE', 'MECH', 'CIVIL'].map((deptCode) => (
            <button
              key={deptCode}
              onClick={() => setSelectedDeptFilter(deptCode)}
              className={`px-3 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
                selectedDeptFilter === deptCode
                  ? 'bg-[#D4AF37] text-[#0B132B]'
                  : 'bg-[#0F1026] text-[#B8B5A3] border border-[#243356] hover:text-white'
              }`}
            >
              {deptCode}
            </button>
          ))}
        </div>
      </div>

      {/* Courses List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCourses.map((course) => {
          const fillPercent = Math.round((course.enrolledCount / course.capacity) * 100);
          return (
            <Card
              key={course.id}
              className="bg-[#0F1026] border-[#243356] hover:border-[#D4AF37]/50 transition-all duration-200 text-[#F4F1DE] flex flex-col justify-between"
            >
              <CardHeader className="p-4 pb-3 border-b border-[#243356] bg-[#131C38]/40 flex flex-row items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-[#D4AF37]/15 text-[#FFD700] border-[#D4AF37]/30 font-mono text-[10px]">
                      {course.code}
                    </Badge>
                    <Badge variant="outline" className="text-[9px] font-mono border-[#243356] text-[#C5A059]">
                      Sem {course.semester} · {course.credits} Credits
                    </Badge>
                  </div>
                  <h3 className="text-sm font-bold text-[#F4F1DE] mt-1.5 font-mono line-clamp-1">{course.title}</h3>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedCourse(course)}
                  className="h-7 w-7 text-[#B8B5A3] hover:text-[#FFD700] hover:bg-[#1C2541]"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardHeader>

              <CardContent className="p-4 space-y-3 text-xs flex-1">
                <p className="text-[#B8B5A3] text-[11px] line-clamp-2">{course.description}</p>

                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center gap-2 text-[#B8B5A3]">
                    <Clock className="h-3.5 w-3.5 text-[#C5A059]" />
                    <span>{course.scheduleDays.join(', ')} ({course.scheduleTime})</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#B8B5A3]">
                    <MapPin className="h-3.5 w-3.5 text-[#C5A059]" />
                    <span>{course.room}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#F4F1DE] font-semibold">
                    <Users className="h-3.5 w-3.5 text-purple-400" />
                    <span>Instructor: {course.instructorName}</span>
                  </div>
                </div>

                {/* Enrollment Bar */}
                <div className="pt-2 border-t border-[#243356]">
                  <div className="flex justify-between text-[10px] font-mono text-[#B8B5A3] mb-1">
                    <span>ENROLLMENT SEATS</span>
                    <span className="font-bold text-[#FFD700]">{course.enrolledCount} / {course.capacity} ({fillPercent}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#1C2541] rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        fillPercent > 90 ? 'bg-amber-400' : 'bg-[#D4AF37]'
                      }`}
                      style={{ width: `${fillPercent}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Modal: Create New Course */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <Card className="w-full max-w-lg bg-[#0F1026] border-[#243356] text-[#F4F1DE]">
            <CardHeader className="p-4 border-b border-[#243356] flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold font-mono text-[#FFD700] flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>Add New Academic Course</span>
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsAddModalOpen(false)}
                className="h-6 w-6 text-[#B8B5A3] hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-4 space-y-3.5">
              <form onSubmit={handleCreateCourse} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-[#C5A059] uppercase block mb-1">Course Code *</label>
                    <Input
                      required
                      placeholder="e.g. CS402"
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value)}
                      className="bg-[#131C38] border-[#243356] text-xs text-[#F4F1DE]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-[#C5A059] uppercase block mb-1">Department</label>
                    <select
                      value={newDept}
                      onChange={(e) => setNewDept(e.target.value)}
                      className="w-full rounded-md bg-[#131C38] border border-[#243356] p-2 text-xs text-[#F4F1DE]"
                    >
                      {departments.map((d) => (
                        <option key={d.code} value={d.code}>{d.code} - {d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-[#C5A059] uppercase block mb-1">Course Title *</label>
                  <Input
                    required
                    placeholder="e.g. Advanced Quantum Computing Protocols"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="bg-[#131C38] border-[#243356] text-xs text-[#F4F1DE]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-[#C5A059] uppercase block mb-1">Credits</label>
                    <Input
                      type="number"
                      value={newCredits}
                      onChange={(e) => setNewCredits(Number(e.target.value))}
                      className="bg-[#131C38] border-[#243356] text-xs text-[#F4F1DE]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-[#C5A059] uppercase block mb-1">Semester</label>
                    <Input
                      type="number"
                      value={newSemester}
                      onChange={(e) => setNewSemester(Number(e.target.value))}
                      className="bg-[#131C38] border-[#243356] text-xs text-[#F4F1DE]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-[#C5A059] uppercase block mb-1">Capacity</label>
                    <Input
                      type="number"
                      value={newCapacity}
                      onChange={(e) => setNewCapacity(Number(e.target.value))}
                      className="bg-[#131C38] border-[#243356] text-xs text-[#F4F1DE]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-[#C5A059] uppercase block mb-1">Instructor Name</label>
                    <Input
                      value={newInstructor}
                      onChange={(e) => setNewInstructor(e.target.value)}
                      className="bg-[#131C38] border-[#243356] text-xs text-[#F4F1DE]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-[#C5A059] uppercase block mb-1">Room Allocation</label>
                    <Input
                      value={newRoom}
                      onChange={(e) => setNewRoom(e.target.value)}
                      className="bg-[#131C38] border-[#243356] text-xs text-[#F4F1DE]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-[#C5A059] uppercase block mb-1">Schedule Days</label>
                    <Input
                      placeholder="Monday, Wednesday"
                      value={newScheduleDays}
                      onChange={(e) => setNewScheduleDays(e.target.value)}
                      className="bg-[#131C38] border-[#243356] text-xs text-[#F4F1DE]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-[#C5A059] uppercase block mb-1">Schedule Time</label>
                    <Input
                      placeholder="09:00 - 10:30 AM"
                      value={newScheduleTime}
                      onChange={(e) => setNewScheduleTime(e.target.value)}
                      className="bg-[#131C38] border-[#243356] text-xs text-[#F4F1DE]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-[#C5A059] uppercase block mb-1">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Brief description of course objectives..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full rounded-md bg-[#131C38] border border-[#243356] p-2 text-xs text-[#F4F1DE] focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#243356]">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddModalOpen(false)}
                    className="text-xs border-[#243356]"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#D4AF37] hover:bg-[#C5A059] text-[#0B132B] font-bold text-xs"
                  >
                    Publish Course
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal: Course Syllabus Details */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <Card className="w-full max-w-xl bg-[#0F1026] border-[#243356] text-[#F4F1DE]">
            <CardHeader className="p-4 border-b border-[#243356] flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className="bg-[#D4AF37]/20 text-[#FFD700] border-[#D4AF37]/40 font-mono">
                  {selectedCourse.code}
                </Badge>
                <CardTitle className="text-sm font-bold font-mono text-[#F4F1DE]">
                  {selectedCourse.title}
                </CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedCourse(null)}
                className="h-6 w-6 text-[#B8B5A3] hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent className="p-4 space-y-4 text-xs">
              <p className="text-[#B8B5A3] leading-relaxed">{selectedCourse.description}</p>

              <div className="grid grid-cols-3 gap-2.5 bg-[#131C38] p-3 rounded-lg border border-[#243356] font-mono text-[11px]">
                <div>
                  <span className="text-[#C5A059] block text-[9px]">CREDITS</span>
                  <span className="font-bold text-[#F4F1DE]">{selectedCourse.credits} Credit Hours</span>
                </div>
                <div>
                  <span className="text-[#C5A059] block text-[9px]">SEMESTER</span>
                  <span className="font-bold text-[#F4F1DE]">Semester {selectedCourse.semester}</span>
                </div>
                <div>
                  <span className="text-[#C5A059] block text-[9px]">DEPT</span>
                  <span className="font-bold text-[#FFD700]">{selectedCourse.departmentCode}</span>
                </div>
              </div>

              <div>
                <h4 className="font-mono text-[11px] text-[#C5A059] uppercase font-bold mb-2 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-[#FFD700]" />
                  <span>Syllabus Modules &amp; Topics</span>
                </h4>
                <div className="space-y-1.5">
                  {selectedCourse.syllabus.map((topic, i) => (
                    <div
                      key={i}
                      className="bg-[#1C2541]/40 p-2.5 rounded border border-[#243356] text-[#F4F1DE] flex items-center gap-2"
                    >
                      <span className="h-5 w-5 rounded bg-[#D4AF37]/15 text-[#FFD700] font-mono text-[10px] flex items-center justify-center font-bold">
                        0{i + 1}
                      </span>
                      <span>{topic}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
