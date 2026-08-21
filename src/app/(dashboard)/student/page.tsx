'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRole } from '@/lib/hooks/use-role';
import { useAcademic } from '@/lib/context/academic-context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Drawer } from '@/components/shared/drawer';
import {
  HeartPulse,
  Clock,
  CalendarCheck,
  Megaphone,
  ShieldCheck,
  CalendarDays,
  Phone,
  ChevronRight,
} from 'lucide-react';

export default function StudentDashboardPage() {
  const { user } = useRole();
  const { students } = useAcademic();

  const [timetableDrawer, setTimetableDrawer] = useState(false);

  const currentStudent =
    students.find(
      (s) =>
        (user?.email && s.email.toLowerCase() === user.email.toLowerCase()) ||
        (user?.full_name && s.name.toLowerCase() === user.full_name.toLowerCase())
    ) ||
    students[0] || {
      name: 'Student',
      rollNumber: '—',
      department: '',
      attendancePercentage: 95,
      cgpa: 9.2,
    };

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  const firstName = user?.full_name?.split(' ')[0] || currentStudent.name.split(' ')[0];

  return (
    <div className="space-y-6">
      {/* Greeting + identity */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#D6D8D5] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1F2933]">{greeting}, {firstName}</h1>
          <p className="mt-1 text-sm text-[#667085]">
            {currentStudent.department || 'Campus member'} · <span className="font-medium text-[#1F2933]">{currentStudent.rollNumber}</span>
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Badge variant="gold" className="text-xs">CGPA {currentStudent.cgpa?.toFixed(2) ?? '—'}</Badge>
          <Badge variant="safe" className="text-xs">Attendance {currentStudent.attendancePercentage ?? 0}%</Badge>
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