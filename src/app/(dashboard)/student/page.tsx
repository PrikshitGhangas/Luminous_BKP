'use client';

import React from 'react';
import Link from 'next/link';
import { useAcademic } from '@/lib/context/academic-context';
import { useSafety } from '@/lib/context/safety-context';
import { useCampusServices } from '@/lib/context/campus-services-context';
import { useRole } from '@/lib/hooks/use-role';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  HeartPulse,
  Flame,
  MessageSquareWarning,
  CalendarCheck,
  Clock,
  FileSpreadsheet,
  Award,
  Megaphone,
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';

export default function StudentDashboardPage() {
  const { user } = useRole();
  const { students } = useAcademic();
  const { threatLevel } = useSafety();
  const { complaints, placementDrives } = useCampusServices();

  const currentStudent =
    students.find(
      (s) =>
        (user?.email && s.email.toLowerCase() === user.email.toLowerCase()) ||
        (user?.full_name && s.name.toLowerCase() === user.full_name.toLowerCase())
    ) ||
    students[0] || {
      name: 'Aanya Patel',
      rollNumber: 'CS23B042',
      department: 'Computer Science & Engineering',
      semester: 6,
      section: 'A',
      cgpa: 9.28,
      attendancePercentage: 96.2,
    };

  const activeComplaintsCount = complaints.filter((c) => c.status !== 'Resolved').length;

  return (
    <div className="space-y-6">
      {/* Student Welcome Banner */}
      <div className="bg-gradient-to-r from-[#131C38] via-[#0F1026] to-[#1C2541] border border-[#243356] p-5 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={user?.avatar_url || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150'}
            alt={currentStudent.name}
            className="h-14 w-14 rounded-full border-2 border-[#D4AF37] object-cover shadow-lg"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-mono text-[#F4F1DE]">{currentStudent.name}</h1>
              <Badge className="bg-[#D4AF37]/15 text-[#FFD700] border-[#D4AF37]/30 font-mono text-xs">
                {currentStudent.rollNumber}
              </Badge>
            </div>
            <p className="text-xs text-[#B8B5A3] font-mono">
              {currentStudent.department} · Semester {currentStudent.semester} (Section {currentStudent.section})
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
          <div className="bg-[#0B132B] px-3 py-2 rounded-xl border border-[#243356] text-center">
            <span className="text-[10px] text-[#C5A059] block">CGPA</span>
            <span className="font-bold text-emerald-400 text-sm">{currentStudent.cgpa} / 10.0</span>
          </div>
          <div className="bg-[#0B132B] px-3 py-2 rounded-xl border border-[#243356] text-center">
            <span className="text-[10px] text-[#C5A059] block">ATTENDANCE</span>
            <span className="font-bold text-[#FFD700] text-sm">{currentStudent.attendancePercentage}%</span>
          </div>
          <div className="bg-[#0B132B] px-3 py-2 rounded-xl border border-[#243356] text-center">
            <span className="text-[10px] text-[#C5A059] block">SAFETY POSTURE</span>
            <span className="font-bold text-emerald-400 text-sm">{threatLevel}</span>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS BAR */}
      <Card className="bg-[#0F1026] border-[#243356]">
        <CardHeader className="p-3.5 border-b border-[#243356] bg-[#131C38]/40">
          <CardTitle className="text-xs font-mono font-bold uppercase tracking-wider text-[#FFD700] flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span>Student Command Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3.5">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            <Button asChild size="sm" className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs gap-1.5 h-10 font-mono">
              <Link href="/safety/sos">
                <HeartPulse className="h-4 w-4 animate-pulse" />
                <span>SOS</span>
              </Link>
            </Button>

            <Button asChild size="sm" variant="outline" className="border-amber-500/40 text-amber-300 hover:bg-amber-950/40 text-xs gap-1.5 h-10 font-mono">
              <Link href="/incidents">
                <Flame className="h-4 w-4 text-amber-400" />
                <span>Report Incident</span>
              </Link>
            </Button>

            <Button asChild size="sm" variant="outline" className="border-[#243356] text-[#FFD700] hover:bg-[#131C38] text-xs gap-1.5 h-10 font-mono">
              <Link href="/complaints">
                <MessageSquareWarning className="h-4 w-4" />
                <span>Complaint</span>
              </Link>
            </Button>

            <Button asChild size="sm" variant="outline" className="border-[#243356] text-[#F4F1DE] hover:bg-[#131C38] text-xs gap-1.5 h-10 font-mono">
              <Link href="/attendance">
                <CalendarCheck className="h-4 w-4 text-blue-400" />
                <span>Attendance</span>
              </Link>
            </Button>

            <Button asChild size="sm" variant="outline" className="border-[#243356] text-[#F4F1DE] hover:bg-[#131C38] text-xs gap-1.5 h-10 font-mono">
              <Link href="/timetable">
                <Clock className="h-4 w-4 text-emerald-400" />
                <span>Timetable</span>
              </Link>
            </Button>

            <Button asChild size="sm" variant="outline" className="border-[#243356] text-[#F4F1DE] hover:bg-[#131C38] text-xs gap-1.5 h-10 font-mono">
              <Link href="/exams">
                <FileSpreadsheet className="h-4 w-4 text-purple-400" />
                <span>Exams</span>
              </Link>
            </Button>

            <Button asChild size="sm" variant="outline" className="border-[#243356] text-[#F4F1DE] hover:bg-[#131C38] text-xs gap-1.5 h-10 font-mono">
              <Link href="/placement">
                <Award className="h-4 w-4 text-indigo-400" />
                <span>Placement</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Grid: Student Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column (2 Cols): Attendance, Timetable, Exams */}
        <div className="lg:col-span-2 space-y-4">
          {/* Section: Attendance Summary */}
          <Card className="bg-[#0F1026] border-[#243356] text-[#F4F1DE]">
            <CardHeader className="p-4 border-b border-[#243356] bg-[#131C38]/60 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-mono font-bold uppercase tracking-wider text-[#FFD700] flex items-center gap-2">
                <CalendarCheck className="h-4 w-4 text-blue-400" />
                <span>Attendance Roster Summary</span>
              </CardTitle>
              <Link href="/attendance" className="text-xs font-mono text-[#C5A059] hover:text-[#FFD700] flex items-center gap-1">
                <span>View Roster</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between bg-[#131C38] p-3 rounded-lg border border-[#243356] font-mono">
                <span>Distributed Systems (CS301)</span>
                <span className="font-bold text-emerald-400">98% Attendance (28/29 sessions)</span>
              </div>
              <div className="flex items-center justify-between bg-[#131C38] p-3 rounded-lg border border-[#243356] font-mono">
                <span>Artificial Intelligence Labs (CS304)</span>
                <span className="font-bold text-emerald-400">95% Attendance (19/20 sessions)</span>
              </div>
            </CardContent>
          </Card>

          {/* Section: Today's Timetable */}
          <Card className="bg-[#0F1026] border-[#243356] text-[#F4F1DE]">
            <CardHeader className="p-4 border-b border-[#243356] bg-[#131C38]/60 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-mono font-bold uppercase tracking-wider text-[#FFD700] flex items-center gap-2">
                <Clock className="h-4 w-4 text-emerald-400" />
                <span>Today&apos;s Class Schedule &amp; Timetable</span>
              </CardTitle>
              <Link href="/timetable" className="text-xs font-mono text-[#C5A059] hover:text-[#FFD700] flex items-center gap-1">
                <span>Full Timetable</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </CardHeader>
            <CardContent className="p-4 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#131C38] border border-[#243356]">
                <div>
                  <span className="font-bold text-[#F4F1DE]">CS301 — Distributed Systems</span>
                  <p className="text-[10px] text-[#B8B5A3]">Prof. Sarah Jenkins · Room 204 Main Block</p>
                </div>
                <Badge className="bg-[#1C2541] text-[#FFD700] border-[#243356]">09:00 AM - 10:30 AM</Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-[#131C38] border border-[#243356]">
                <div>
                  <span className="font-bold text-[#F4F1DE]">CS304 — AI &amp; Robotics Lab</span>
                  <p className="text-[10px] text-[#B8B5A3]">Prof. Sarah Jenkins · Block D Lab 302</p>
                </div>
                <Badge className="bg-[#1C2541] text-[#FFD700] border-[#243356]">11:00 AM - 01:00 PM</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Section: Upcoming Exams */}
          <Card className="bg-[#0F1026] border-[#243356] text-[#F4F1DE]">
            <CardHeader className="p-4 border-b border-[#243356] bg-[#131C38]/60 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-mono font-bold uppercase tracking-wider text-[#FFD700] flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-purple-400" />
                <span>Exams &amp; Grades Assessment</span>
              </CardTitle>
              <Link href="/exams" className="text-xs font-mono text-[#C5A059] hover:text-[#FFD700] flex items-center gap-1">
                <span>Exams Portal</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </CardHeader>
            <CardContent className="p-4 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#131C38] border border-[#243356]">
                <div>
                  <span className="font-bold text-[#F4F1DE]">Final Semester — Distributed Systems (CS301)</span>
                  <p className="text-[10px] text-[#B8B5A3]">Date: Sep 28, 2026 · Duration: 3 Hours</p>
                </div>
                <Badge className="bg-purple-500/15 text-purple-300 border-purple-500/30 font-bold">Upcoming</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1 Col): Complaints, Safety, Placement, Announcements */}
        <div className="space-y-4">
          {/* Safety Status Card */}
          <Card className="bg-[#0F1026] border-[#243356] text-[#F4F1DE]">
            <CardHeader className="p-3.5 border-b border-[#243356] bg-[#131C38]/60">
              <CardTitle className="text-xs font-mono font-bold uppercase tracking-wider text-[#FFD700] flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Campus Safety &amp; Emergency</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3.5 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between p-2 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold">
                <span>Perimeter Posture</span>
                <span>SECURE</span>
              </div>
              <p className="text-[11px] text-[#B8B5A3]">
                Emergency SOS &amp; GPS beacon active on your account.
              </p>
            </CardContent>
          </Card>

          {/* Active Complaints */}
          <Card className="bg-[#0F1026] border-[#243356] text-[#F4F1DE]">
            <CardHeader className="p-3.5 border-b border-[#243356] bg-[#131C38]/60 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-mono font-bold uppercase tracking-wider text-[#FFD700] flex items-center gap-2">
                <MessageSquareWarning className="h-4 w-4 text-amber-400" />
                <span>Active Complaints</span>
              </CardTitle>
              <Link href="/complaints" className="text-[11px] font-mono text-[#C5A059] hover:text-[#FFD700]">
                View All ({activeComplaintsCount})
              </Link>
            </CardHeader>
            <CardContent className="p-3.5 space-y-2 text-xs font-mono">
              {complaints.slice(0, 2).map((c) => (
                <div key={c.id} className="p-2.5 rounded bg-[#131C38] border border-[#243356] space-y-1">
                  <div className="flex justify-between font-bold">
                    <span className="text-[#F4F1DE] truncate">{c.title}</span>
                    <span className="text-[#FFD700] text-[10px]">{c.status}</span>
                  </div>
                  <p className="text-[10px] text-[#B8B5A3]">Ticket: {c.ticketNumber} · {c.category}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Placement Drives */}
          <Card className="bg-[#0F1026] border-[#243356] text-[#F4F1DE]">
            <CardHeader className="p-3.5 border-b border-[#243356] bg-[#131C38]/60 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-mono font-bold uppercase tracking-wider text-[#FFD700] flex items-center gap-2">
                <Award className="h-4 w-4 text-indigo-400" />
                <span>Placement Drives</span>
              </CardTitle>
              <Link href="/placement" className="text-[11px] font-mono text-[#C5A059] hover:text-[#FFD700]">
                View Drives
              </Link>
            </CardHeader>
            <CardContent className="p-3.5 space-y-2 text-xs font-mono">
              {placementDrives.map((d) => (
                <div key={d.id} className="p-2.5 rounded bg-[#131C38] border border-[#243356] space-y-1">
                  <div className="flex justify-between font-bold text-[#F4F1DE]">
                    <span>{d.companyName}</span>
                    <span className="text-emerald-400 text-[10px]">{d.ctcPackage}</span>
                  </div>
                  <p className="text-[10px] text-[#B8B5A3]">{d.jobRole}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Campus Announcements */}
          <Card className="bg-[#0F1026] border-[#243356] text-[#F4F1DE]">
            <CardHeader className="p-3.5 border-b border-[#243356] bg-[#131C38]/60 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-mono font-bold uppercase tracking-wider text-[#FFD700] flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-[#FFD700]" />
                <span>Announcements</span>
              </CardTitle>
              <Link href="/announcements" className="text-[11px] font-mono text-[#C5A059] hover:text-[#FFD700]">
                View Feed
              </Link>
            </CardHeader>
            <CardContent className="p-3.5 space-y-2 text-xs font-mono">
              <div className="p-2.5 rounded bg-[#131C38] border border-[#243356] space-y-1">
                <div className="flex justify-between font-bold text-[#FFD700]">
                  <span>Fall Semester Mid-Term Examination Roster</span>
                  <span className="text-[10px] text-[#B8B5A3]">Today</span>
                </div>
                <p className="text-[10px] text-[#B8B5A3]">Official examination timetable published for CS &amp; AI departments.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
