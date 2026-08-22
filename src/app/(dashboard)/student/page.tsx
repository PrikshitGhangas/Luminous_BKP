'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRole } from '@/lib/hooks/use-role';
import { useAcademic } from '@/lib/context/academic-context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Drawer } from '@/components/shared/drawer';
import { StudentSearchSelector } from '@/components/shared/student-search-selector';
import {
  HeartPulse,
  Clock,
  CalendarCheck,
  Megaphone,
  ShieldCheck,
  CalendarDays,
  Phone,
  ChevronRight,
  Search,
  X,
  BookOpen,
  GraduationCap,
} from 'lucide-react';

export default function StudentDashboardPage() {
  const { user, role, isSuperAdmin, isAdmin } = useRole();
  const { students, departments, courses } = useAcademic();

  const [timetableDrawer, setTimetableDrawer] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');

  const isActualStudent = role === 'student';
  const isAuthorized = isActualStudent || isSuperAdmin || isAdmin || role === 'super_admin' || role === 'admin';

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 bg-[#F7F8F6] border border-[#D6D8D5] rounded-xl space-y-3">
        <div className="h-10 w-10 rounded-full bg-[#F0F1EF] border border-[#D6D8D5] flex items-center justify-center text-[#1F2933]">
          <GraduationCap className="h-5 w-5" />
        </div>
        <h2 className="text-base font-bold text-[#1F2933]">Student Record Access Only</h2>
        <p className="text-xs text-[#667085] max-w-sm">
          This portal is reserved for enrolled students and authorized administrators overseeing student performance.
        </p>
      </div>
    );
  }

  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || 'std-001');

  const currentStudent =
    (isActualStudent
      ? students.find(
          (s) =>
            (user?.email && s.email.toLowerCase() === user.email.toLowerCase()) ||
            (user?.full_name && s.name.toLowerCase() === user.full_name.toLowerCase())
        )
      : students.find((s) => s.id === selectedStudentId)) ||
    students[0] || {
      id: 'std-001',
      name: 'Priya Sharma',
      rollNumber: 'CS23B042',
      department: 'Computer Science & Engineering',
      attendancePercentage: 96,
      cgpa: 9.28,
    };

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  const displayName = isActualStudent
    ? user?.full_name || currentStudent.name
    : currentStudent.name;

  // Search Results filtering
  const matchingCourses = courses.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return false;
    const matchesDept = deptFilter === 'ALL' || c.departmentCode === deptFilter || c.departmentCode.toLowerCase().includes(deptFilter.toLowerCase());
    const matchesQ = c.code.toLowerCase().includes(q) || c.title.toLowerCase().includes(q) || c.instructorName.toLowerCase().includes(q);
    return matchesDept && matchesQ;
  });

  const matchingStudents = students.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return false;
    const matchesDept = deptFilter === 'ALL' || s.department.toLowerCase().includes(deptFilter.toLowerCase());
    const matchesQ = s.name.toLowerCase().includes(q) || s.rollNumber.toLowerCase().includes(q) || s.department.toLowerCase().includes(q);
    return matchesDept && matchesQ;
  });

  return (
    <div className="space-y-6">
      {/* Greeting + identity */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#D6D8D5] pb-4">
        <div>
          {isActualStudent ? (
            <>
              <h1 className="text-xl sm:text-2xl font-bold text-[#1F2933]">
                {greeting}, {displayName.split(' ')[0]}
              </h1>
              <p className="mt-1 text-sm text-[#667085]">
                {currentStudent.department} ·{' '}
                <span className="font-medium text-[#1F2933]">{currentStudent.rollNumber}</span>
              </p>
            </>
          ) : (
            <>
              <h1 className="text-xl sm:text-2xl font-bold text-[#1F2933]">
                Student Academic Record
              </h1>
              <p className="text-xs text-[#667085] mt-0.5">
                Administrator View: Inspecting academic status and profile for {currentStudent.name}.
              </p>
            </>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {!isActualStudent && students.length > 0 && (
            <div className="w-full sm:w-72">
              <StudentSearchSelector
                students={students}
                selectedStudentId={selectedStudentId}
                onSelectStudent={setSelectedStudentId}
                placeholder="Search student by name or roll no..."
              />
            </div>
          )}

          <div className="flex items-center gap-2 text-sm">
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F0F1EF] text-[#1F2933] border border-[#D6D8D5]">
              CGPA {currentStudent.cgpa?.toFixed(2) ?? '9.28'}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              Attendance {currentStudent.attendancePercentage ?? 96}%
            </span>
          </div>
        </div>
      </div>

      {/* Primary actions: SOS is highly visible */}
      <div className="flex flex-wrap items-center gap-2.5">
        <Button asChild size="sm" variant="emergency" className="gap-1.5">
          <Link href="/safety/sos"><HeartPulse className="h-4 w-4 animate-pulse" /> SOS</Link>
        </Button>
        <Button asChild size="sm" variant="outline" className="gap-1.5">
          <Link href="/timetable"><CalendarDays className="h-4 w-4" /> View Timetable</Link>
        </Button>
        <Button asChild size="sm" variant="outline" className="gap-1.5">
          <Link href="/attendance"><CalendarCheck className="h-4 w-4" /> View Attendance</Link>
        </Button>
        <Button asChild size="sm" variant="outline" className="gap-1.5">
          <Link href="/complaints"><Phone className="h-4 w-4" /> Contact Support</Link>
        </Button>
      </div>

      {/* Dashboard Search Bar (Similar to Student Directory) */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#667085]" />
          <Input
            placeholder="Search courses, curriculum, schedule, or student peers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs border-[#D6D8D5] bg-white rounded-xl shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 p-0.5 rounded text-[#667085] hover:text-[#1F2933] cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="text-xs bg-white border border-[#D6D8D5] rounded-xl px-3 py-2 text-[#1F2933] shadow-xs cursor-pointer focus:outline-none"
        >
          <option value="ALL">All Departments</option>
          {departments.map((d) => (
            <option key={d.code} value={d.name}>
              {d.code} ({d.name})
            </option>
          ))}
        </select>
      </div>

      {/* Dynamic Search Results Panel (if search query active) */}
      {searchQuery && (
        <div className="space-y-4 p-4 bg-white border border-[#D6D8D5] rounded-xl shadow-xs">
          <div className="flex items-center justify-between border-b border-[#D6D8D5] pb-2 text-xs">
            <span className="font-bold text-[#1F2933]">
              Search Results for &ldquo;{searchQuery}&rdquo;
            </span>
            <span className="text-[#667085]">
              {matchingCourses.length + matchingStudents.length} matches found
            </span>
          </div>

          {/* Matching Courses */}
          {matchingCourses.length > 0 && (
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-[#667085] uppercase flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" /> Matching Courses ({matchingCourses.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {matchingCourses.map((c) => (
                  <div key={c.id} className="p-2.5 rounded-lg border border-[#D6D8D5] bg-[#F7F8F6] space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#1F2933]">{c.code} · {c.title}</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-white border border-[#D6D8D5]">
                        {c.credits} Credits
                      </span>
                    </div>
                    <p className="text-[11px] text-[#667085]">Faculty: {c.instructorName} · Room: {c.room}</p>
                    <p className="text-[11px] text-[#667085]">Days: {c.scheduleDays.join(', ')} ({c.scheduleTime})</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Matching Students */}
          {matchingStudents.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-[#F0F1EF]">
              <span className="text-[11px] font-semibold text-[#667085] uppercase flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5" /> Matching Students ({matchingStudents.length})
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {matchingStudents.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => {
                      if (!isActualStudent) {
                        setSelectedStudentId(s.id);
                        setSearchQuery('');
                      }
                    }}
                    className={`p-2.5 rounded-lg border border-[#D6D8D5] bg-[#F7F8F6] space-y-0.5 ${!isActualStudent ? 'cursor-pointer hover:bg-white hover:border-[#1F2933]' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#1F2933]">{s.name}</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-white border border-[#D6D8D5]">
                        {s.rollNumber}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#667085]">{s.department} · CGPA {s.cgpa}</p>
                    {!isActualStudent && (
                      <span className="text-[10px] text-blue-700 font-medium block pt-0.5">Click to view student record →</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {matchingCourses.length === 0 && matchingStudents.length === 0 && (
            <div className="text-center py-6 text-xs text-[#667085]">
              No courses or students matched &ldquo;{searchQuery}&rdquo;.
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Today's information */}
        <div className="lg:col-span-2 space-y-5">
          {/* Today's class schedule */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b border-[#D6D8D5] p-4">
              <CardTitle className="flex items-center gap-2 text-sm font-bold text-[#1F2933]">
                <Clock className="h-4 w-4 text-[#8a6d1a]" />
                Today&apos;s Schedule
              </CardTitle>
              <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => setTimetableDrawer(true)}>
                Full timetable <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-2 p-4">
              <div className="flex items-center justify-between rounded-lg border border-[#D6D8D5] p-3">
                <div>
                  <p className="text-sm font-semibold text-[#1F2933]">Distributed Systems (CS301)</p>
                  <p className="text-xs text-[#667085]">Room 204 · Main Block</p>
                </div>
                <Badge variant="gold" className="text-xs">09:00 – 10:30</Badge>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-[#D6D8D5] p-3">
                <div>
                  <p className="text-sm font-semibold text-[#1F2933]">AI &amp; Robotics Lab (CS304)</p>
                  <p className="text-xs text-[#667085]">Block D · Lab 302</p>
                </div>
                <Badge variant="gold" className="text-xs">11:00 – 13:00</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Attendance */}
          <Card>
            <CardHeader className="border-b border-[#D6D8D5] p-4">
              <CardTitle className="flex items-center gap-2 text-sm font-bold text-[#1F2933]">
                <CalendarCheck className="h-4 w-4 text-[#3F8F68]" />
                Attendance
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="text-3xl font-bold text-[#1F2933]">{currentStudent.attendancePercentage ?? 0}%</div>
                <div className="flex-1">
                  <div className="h-2 w-full rounded-full bg-[#E8E9E7]">
                    <div
                      className="h-2 rounded-full bg-[#3F8F68]"
                      style={{ width: `${currentStudent.attendancePercentage ?? 0}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-[#667085]">Overall attendance this term</p>
                </div>
              </div>
              <Link href="/attendance" className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[#8a6d1a] hover:underline">
                View attendance details <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Right: Safety status + announcements */}
        <div className="space-y-5">
          <Card>
            <CardHeader className="border-b border-[#D6D8D5] p-4">
              <CardTitle className="flex items-center gap-2 text-sm font-bold text-[#1F2933]">
                <ShieldCheck className="h-4 w-4 text-[#3F8F68]" />
                Safety Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-sm font-semibold text-[#3F8F68]">● Campus secure</p>
              <p className="mt-1 text-xs text-[#667085]">
                Emergency SOS &amp; GPS beacon active on your account.
              </p>
              <Button asChild size="sm" variant="outline" className="mt-3 w-full gap-1.5">
                <Link href="/campus-map"><ShieldCheck className="h-4 w-4" /> View campus map</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b border-[#D6D8D5] p-4">
              <CardTitle className="flex items-center gap-2 text-sm font-bold text-[#1F2933]">
                <Megaphone className="h-4 w-4 text-[#8a6d1a]" />
                Announcements
              </CardTitle>
              <Link href="/announcements" className="flex items-center gap-1 text-xs font-medium text-[#8a6d1a] hover:underline">
                View all <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </CardHeader>
            <CardContent className="p-4">
              <div className="rounded-lg border border-[#D6D8D5] p-3">
                <p className="text-sm font-semibold text-[#1F2933]">Mid-term exam roster published</p>
                <p className="text-xs text-[#667085] mt-0.5">Official timetable for CS &amp; AI departments.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-[#D6D8D5] p-4">
              <CardTitle className="flex items-center gap-2 text-sm font-bold text-[#1F2933]">
                <Phone className="h-4 w-4 text-[#667085]" />
                Support
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-2 text-xs text-[#667085]">
              <p>Need help? File a complaint or contact the helpdesk.</p>
              <Button asChild size="sm" variant="secondary" className="w-full gap-1.5">
                <Link href="/complaints"><Phone className="h-4 w-4" /> Contact Support</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Timetable drawer */}
      <Drawer
        open={timetableDrawer}
        onClose={() => setTimetableDrawer(false)}
        title="Weekly Timetable"
        footer={
          <Button asChild variant="outline" size="sm" className="w-full gap-1.5">
            <Link href="/timetable"><CalendarDays className="h-4 w-4" /> Open Full Timetable</Link>
          </Button>
        }
      >
        <div className="space-y-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day) => (
            <div key={day} className="rounded-lg border border-[#D6D8D5] p-3">
              <p className="text-xs font-bold text-[#8a6d1a] uppercase">{day}</p>
              <p className="text-sm text-[#1F2933] mt-1">CS301 · 09:00 – 10:30</p>
              <p className="text-xs text-[#667085]">CS304 · 11:00 – 13:00</p>
            </div>
          ))}
        </div>
      </Drawer>
    </div>
  );
}