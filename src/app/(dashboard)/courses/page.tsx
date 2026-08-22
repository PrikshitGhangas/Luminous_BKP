'use client';

import React, { useState } from 'react';
import { useAcademic } from '@/lib/context/academic-context';
import { useRole } from '@/lib/hooks/use-role';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  BookOpen,
  Plus,
  Search,
  Users,
  Clock,
  MapPin,
  FileText,
  X,
  ChevronRight,
  GraduationCap,
} from 'lucide-react';
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
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D6D8D5] pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1F2933] flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-[#1F2933]" />
            <span>Course Catalog &amp; Curriculum</span>
          </h1>
          <p className="text-xs text-[#667085] mt-0.5">
            Degree requirements, syllabus modules, active courses, and classroom allocations.
          </p>
        </div>

        {canCreate && (
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#1F2933] hover:bg-[#111827] text-white text-xs font-semibold gap-1.5 rounded-lg shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Course</span>
          </Button>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl border border-[#D6D8D5] bg-white shadow-xs">
          <span className="text-xs text-[#667085]">Active Courses</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-[#1F2933]">{courses.length}</span>
            <span className="text-xs text-[#667085]">Undergraduate &amp; Postgrad</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[#D6D8D5] bg-white shadow-xs">
          <span className="text-xs text-[#667085]">Total Credit Hours</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-[#1F2933]">{totalCredits} Hrs</span>
            <span className="text-xs text-emerald-700 font-medium">Curriculum credits</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[#D6D8D5] bg-white shadow-xs">
          <span className="text-xs text-[#667085]">Active Enrollments</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-[#1F2933]">{totalEnrolled} Students</span>
            <span className="text-xs text-[#667085]">Across batches</span>
          </div>
        </div>
      </div>

      {/* Search & Dept Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#667085]" />
          <Input
            placeholder="Search course title, code, or instructor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 text-xs border-[#D6D8D5] bg-white rounded-xl shadow-xs"
          />
        </div>

        <div className="inline-flex p-1 bg-[#F0F1EF] rounded-full border border-[#D6D8D5] gap-1 overflow-x-auto">
          {['ALL', 'CSE', 'AI-DS', 'ECE', 'MECH', 'CIVIL'].map((deptCode) => (
            <button
              key={deptCode}
              onClick={() => setSelectedDeptFilter(deptCode)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                selectedDeptFilter === deptCode
                  ? 'bg-[#1F2933] text-white shadow-xs'
                  : 'text-[#667085] hover:text-[#1F2933]'
              }`}
            >
              {deptCode === 'ALL' ? 'All Departments' : deptCode}
            </button>
          ))}
        </div>
      </div>

      {/* Courses List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCourses.map((course) => {
          const fillPercent = Math.round((course.enrolledCount / course.capacity) * 100);
          return (
            <div
              key={course.id}
              className="p-4 rounded-xl border border-[#D6D8D5] bg-white shadow-xs hover:border-[#1F2933] transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F0F1EF] text-[#1F2933]">
                      {course.code}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F0F1EF] text-[#667085]">
                      Sem {course.semester} · {course.credits} Credits
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedCourse(course)}
                    className="p-1 rounded hover:bg-[#F0F1EF] text-[#667085] hover:text-[#1F2933] cursor-pointer"
                    title="View syllabus"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                <h3 className="text-sm font-bold text-[#1F2933] mt-2 line-clamp-1">
                  {course.title}
                </h3>
                <p className="text-xs text-[#667085] mt-1 line-clamp-2">
                  {course.description}
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#D6D8D5] text-xs text-[#667085]">
                <div className="flex items-center gap-1.5 text-[#1F2933] font-medium">
                  <GraduationCap className="h-3.5 w-3.5 text-[#667085]" />
                  <span>{course.instructorName}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-[#667085]" />
                    <span>{course.room}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-[#667085]" />
                    <span>{course.scheduleDays[0] || 'Schedule'}</span>
                  </span>
                </div>

                {/* Enrollment Seats */}
                <div className="pt-1">
                  <div className="flex justify-between text-[11px] text-[#667085] mb-1">
                    <span>Enrollment Seats</span>
                    <span className="font-medium text-[#1F2933]">
                      {course.enrolledCount} / {course.capacity} ({fillPercent}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#F0F1EF] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#1F2933] rounded-full transition-all"
                      style={{ width: `${fillPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Create New Course */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <Card className="w-full max-w-lg bg-white border-[#D6D8D5] text-[#1F2933] shadow-xl">
            <CardHeader className="p-4 border-b border-[#D6D8D5] flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-[#1F2933] flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>Add Academic Course</span>
              </CardTitle>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#667085] hover:text-[#1F2933] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </CardHeader>
            <CardContent className="p-4 space-y-3.5">
              <form onSubmit={handleCreateCourse} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#1F2933] block mb-1">Course Code *</label>
                    <Input
                      required
                      placeholder="e.g. CS402"
                      value={newCode}
                      onChange={(e) => setNewCode(e.target.value)}
                      className="bg-white border-[#D6D8D5] text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#1F2933] block mb-1">Department</label>
                    <select
                      value={newDept}
                      onChange={(e) => setNewDept(e.target.value)}
                      className="w-full rounded-lg bg-white border border-[#D6D8D5] p-2 text-xs text-[#1F2933] cursor-pointer"
                    >
                      {departments.map((d) => (
                        <option key={d.code} value={d.code}>{d.code} - {d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#1F2933] block mb-1">Course Title *</label>
                  <Input
                    required
                    placeholder="e.g. Advanced Distributed Protocols"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="bg-white border-[#D6D8D5] text-xs"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#1F2933] block mb-1">Credits</label>
                    <Input
                      type="number"
                      value={newCredits}
                      onChange={(e) => setNewCredits(Number(e.target.value))}
                      className="bg-white border-[#D6D8D5] text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#1F2933] block mb-1">Semester</label>
                    <Input
                      type="number"
                      value={newSemester}
                      onChange={(e) => setNewSemester(Number(e.target.value))}
                      className="bg-white border-[#D6D8D5] text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#1F2933] block mb-1">Capacity</label>
                    <Input
                      type="number"
                      value={newCapacity}
                      onChange={(e) => setNewCapacity(Number(e.target.value))}
                      className="bg-white border-[#D6D8D5] text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#1F2933] block mb-1">Instructor Name</label>
                    <Input
                      value={newInstructor}
                      onChange={(e) => setNewInstructor(e.target.value)}
                      className="bg-white border-[#D6D8D5] text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#1F2933] block mb-1">Room Allocation</label>
                    <Input
                      value={newRoom}
                      onChange={(e) => setNewRoom(e.target.value)}
                      className="bg-white border-[#D6D8D5] text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#1F2933] block mb-1">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Brief description of course objectives..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full rounded-lg bg-white border border-[#D6D8D5] p-2 text-xs text-[#1F2933] focus:outline-none"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <Card className="w-full max-w-xl bg-white border-[#D6D8D5] text-[#1F2933] shadow-xl">
            <CardHeader className="p-4 border-b border-[#D6D8D5] flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-[#F0F1EF] text-[#1F2933]">
                  {selectedCourse.code}
                </span>
                <CardTitle className="text-sm font-bold text-[#1F2933]">
                  {selectedCourse.title}
                </CardTitle>
              </div>
              <button
                onClick={() => setSelectedCourse(null)}
                className="text-[#667085] hover:text-[#1F2933] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </CardHeader>

            <CardContent className="p-4 space-y-4 text-xs">
              <p className="text-[#667085] leading-relaxed">{selectedCourse.description}</p>

              <div className="grid grid-cols-3 gap-2.5 bg-[#F7F8F6] p-3 rounded-lg border border-[#D6D8D5] text-xs">
                <div>
                  <span className="text-[#667085] block text-[10px]">Credits</span>
                  <span className="font-semibold text-[#1F2933]">{selectedCourse.credits} Credit Hours</span>
                </div>
                <div>
                  <span className="text-[#667085] block text-[10px]">Semester</span>
                  <span className="font-semibold text-[#1F2933]">Semester {selectedCourse.semester}</span>
                </div>
                <div>
                  <span className="text-[#667085] block text-[10px]">Department</span>
                  <span className="font-semibold text-[#1F2933]">{selectedCourse.departmentCode}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs text-[#1F2933] font-bold mb-2 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  <span>Syllabus Modules &amp; Topics</span>
                </h4>
                <div className="space-y-1.5">
                  {selectedCourse.syllabus.map((topic, i) => (
                    <div
                      key={i}
                      className="bg-[#F7F8F6] p-2.5 rounded-lg border border-[#D6D8D5] text-[#1F2933] flex items-center gap-2"
                    >
                      <span className="h-5 w-5 rounded bg-[#F0F1EF] text-[#1F2933] text-[10px] flex items-center justify-center font-semibold shrink-0">
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
