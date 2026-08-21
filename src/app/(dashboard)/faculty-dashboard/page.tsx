'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRole } from '@/lib/hooks/use-role';
import { useAcademic } from '@/lib/context/academic-context';
import { useSafety } from '@/lib/context/safety-context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Drawer } from '@/components/shared/drawer';
import {
  CalendarClock,
  Users,
  Flame,
  Megaphone,
  GraduationCap,
  CalendarCheck,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export default function FacultyDashboardPage() {
  const { user, roleMeta } = useRole();
  const { students } = useAcademic();
  const { incidents } = useSafety();

  const [studentDrawer, setStudentDrawer] = useState(false);
  const [scheduleDrawer, setScheduleDrawer] = useState(false);

  const myStudents = students.slice(0, 6);
  const avgAttendance = students.length
    ? Math.round(students.reduce((acc, s) => acc + (s.attendancePercentage ?? 0), 0) / students.length)
    : 96;
  const attendanceRate = avgAttendance;

  const importantAlerts = incidents.filter(
    (i) => (i.severity === 'high' || i.severity === 'critical') && i.status !== 'resolved'
  ).slice(0, 3);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  const firstName = user?.full_name?.split(' ')[0] || 'Professor';

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="border-b border-[#D6D8D5] pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-[#1F2933]">
          {greeting}, {firstName}
        </h1>
        <p className="mt-1 text-sm text-[#667085]">
          Teaching overview · <span className="font-medium text-[#1F2933]">{roleMeta?.label}</span>
        </p>
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap items-center gap-2.5">
        <Button asChild size="sm" className="gap-1.5">
          <Link href="/attendance"><CalendarCheck className="h-4 w-4" /> Take Attendance</Link>
        </Button>
        <Button asChild size="sm" variant="outline" className="gap-1.5">
          <Link href="/students"><Users className="h-4 w-4" /> View Students</Link>
        </Button>
        <Button asChild size="sm" variant="outline" className="gap-1.5">
          <Link href="/incidents"><Flame className="h-4 w-4" /> Report Incident</Link>
        </Button>
        <Button asChild size="sm" variant="outline" className="gap-1.5">
          <Link href="/announcements"><Megaphone className="h-4 w-4" /> Send Announcement</Link>
        </Button>
      </div>

      {/* Today's schedule + attendance summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between border-b border-[#D6D8D5] p-4">
            <CardTitle className="flex items-center gap-2 text-sm font-bold text-[#1F2933]">
              <CalendarClock className="h-4 w-4 text-[#8a6d1a]" />
              Today&apos;s Schedule
            </CardTitle>
            <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => setScheduleDrawer(true)}>
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
            <div className="flex items-center justify-between rounded-lg border border-[#D6D8D5] p-3">
              <div>
                <p className="text-sm font-semibold text-[#1F2933]">Office Hours</p>
                <p className="text-xs text-[#667085]">Room 302 · Tech Building</p>
              </div>
              <Badge variant="secondary" className="text-xs">14:00 – 16:00</Badge>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-5">
          {/* Attendance summary */}
          <Card>
            <CardHeader className="border-b border-[#D6D8D5] p-4">
              <CardTitle className="flex items-center gap-2 text-sm font-bold text-[#1F2933]">
                <CalendarCheck className="h-4 w-4 text-[#3F8F68]" />
                Attendance Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-[#1F2933]">{attendanceRate}%</div>
              <p className="text-xs text-[#667085] mt-0.5">Present today</p>
              <div className="mt-3 h-2 w-full rounded-full bg-[#E8E9E7]">
                <div
                  className="h-2 rounded-full bg-[#3F8F68]"
                  style={{ width: `${attendanceRate}%` }}
                />
              </div>
              <Link href="/attendance" className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[#8a6d1a] hover:underline">
                View details <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </CardContent>
          </Card>

          {/* Safety status */}
          <Card>
            <CardHeader className="border-b border-[#D6D8D5] p-4">
              <CardTitle className="flex items-center gap-2 text-sm font-bold text-[#1F2933]">
                <ShieldCheck className="h-4 w-4 text-[#3F8F68]" />
                Campus Safety
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <p className="text-sm font-semibold text-[#3F8F68]">● Secure</p>
              <p className="mt-1 text-xs text-[#667085]">
                {importantAlerts.length} important issue{importantAlerts.length === 1 ? '' : 's'} requiring attention.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Important student alerts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b border-[#D6D8D5] p-4">
          <CardTitle className="flex items-center gap-2 text-sm font-bold text-[#1F2933]">
            <Flame className="h-4 w-4 text-[#B7791F]" />
            Important Student Alerts
          </CardTitle>
          <Link href="/incidents" className="flex items-center gap-1 text-xs font-medium text-[#8a6d1a] hover:underline">
            View all <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        <CardContent className="p-4">
          {importantAlerts.length === 0 ? (
            <p className="py-6 text-center text-sm text-[#8A9199]">No important incidents right now.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {importantAlerts.map((al) => (
                <div key={al.id} className="rounded-lg border border-[#D6D8D5] p-3">
                  <p className="truncate text-sm font-semibold text-[#1F2933]">{al.title}</p>
                  <Badge variant={al.severity === 'critical' ? 'critical' : 'high'} className="mt-1.5">
                    {al.severity}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* My students (frequent) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b border-[#D6D8D5] p-4">
          <CardTitle className="flex items-center gap-2 text-sm font-bold text-[#1F2933]">
            <GraduationCap className="h-4 w-4 text-[#4338ca]" />
            My Students
          </CardTitle>
          <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => setStudentDrawer(true)}>
            View all <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {myStudents.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border border-[#D6D8D5] p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#1F2933]">{s.name}</p>
                  <p className="text-[11px] text-[#667085]">{s.rollNumber}</p>
                </div>
                <Badge variant={(s.attendancePercentage ?? 0) >= 90 ? 'safe' : 'warning'} className="text-[10px]">
                  {s.attendancePercentage ?? 0}%
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent announcements */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b border-[#D6D8D5] p-4">
          <CardTitle className="flex items-center gap-2 text-sm font-bold text-[#1F2933]">
            <Megaphone className="h-4 w-4 text-[#8a6d1a]" />
            Recent Announcements
          </CardTitle>
          <Link href="/announcements" className="flex items-center gap-1 text-xs font-medium text-[#8a6d1a] hover:underline">
            View all <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="rounded-lg border border-[#D6D8D5] p-3">
              <p className="text-sm font-semibold text-[#1F2933]">Mid-term examination roster published</p>
              <p className="text-xs text-[#667085] mt-0.5">Official timetable for CS &amp; AI departments.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students drawer */}
      <Drawer
        open={studentDrawer}
        onClose={() => setStudentDrawer(false)}
        title="All Students"
        footer={
          <Button asChild variant="outline" size="sm" className="w-full gap-1.5">
            <Link href="/students"><Users className="h-4 w-4" /> Open Students Directory</Link>
          </Button>
        }
      >
        <div className="space-y-2">
          {students.map((s) => (
            <div key={s.id} className="flex items-center justify-between rounded-lg border border-[#D6D8D5] p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[#1F2933]">{s.name}</p>
                <p className="text-[11px] text-[#667085]">{s.rollNumber} · {s.department}</p>
              </div>
              <Badge variant={(s.attendancePercentage ?? 0) >= 90 ? 'safe' : 'warning'} className="text-[10px]">
                {(s.attendancePercentage ?? 0)}%
              </Badge>
            </div>
          ))}
          {students.length === 0 && (
            <p className="py-8 text-center text-sm text-[#8A9199]">No students available.</p>
          )}
        </div>
      </Drawer>

      {/* Schedule drawer */}
      <Drawer
        open={scheduleDrawer}
        onClose={() => setScheduleDrawer(false)}
        title="Weekly Timetable"
        footer={
          <Button asChild variant="outline" size="sm" className="w-full gap-1.5">
            <Link href="/timetable"><CalendarClock className="h-4 w-4" /> Open Timetable</Link>
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