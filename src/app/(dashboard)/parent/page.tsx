'use client';

import React from 'react';
import { useAcademic } from '@/lib/context/academic-context';
import { useCampusServices } from '@/lib/context/campus-services-context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/shared/stat-card';
import {
  UserCheck,
  ShieldCheck,
  Award,
  CalendarCheck,
  Building2,
  Lock,
} from 'lucide-react';

export default function ParentPage() {
  const { students } = useAcademic();
  const { hostelRooms } = useCampusServices();

  // Linked Ward Privacy Scoping
  // Parent only sees information belonging to their linked student ward (Aanya Patel)
  const linkedWard = students.find((s) => s.rollNumber === 'CS23B042') || students[0] || {
    name: 'Aanya Patel',
    rollNumber: 'CS23B042',
    department: 'Computer Science & Engineering',
    semester: 6,
    section: 'A',
    cgpa: 9.28,
    attendancePercentage: 96.2,
    guardianName: 'Rajesh Patel',
    guardianPhone: '+1 (555) 015-8813',
  };

  const wardHostelRoom = hostelRooms.find((r) => r.occupants.some((o) => o.rollNumber === linkedWard.rollNumber));

  return (
    <div className="space-y-6">
      {/* Privacy & Linked Student Header */}
      <div className="bg-[#0F1026] border border-[#243356] p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F4F1DE] font-mono flex items-center gap-2.5">
              <UserCheck className="h-6 w-6 text-[#FFD700]" />
              <span>PARENT &amp; GUARDIAN OBSERVER PORTAL</span>
            </h1>
            <Badge className="bg-teal-500/15 text-teal-300 border-teal-500/30 text-[10px] font-mono gap-1">
              <Lock className="h-3 w-3" />
              <span>STRICTLY SCOPED TO LINKED WARD</span>
            </Badge>
          </div>
          <p className="text-xs text-[#B8B5A3] mt-1.5 font-mono">
            Linked Ward: <strong className="text-[#F4F1DE] text-sm">{linkedWard.name}</strong> ({linkedWard.department} · Roll: {linkedWard.rollNumber})
          </p>
        </div>

        <div className="bg-[#131C38] px-3.5 py-2.5 rounded-xl border border-[#243356] font-mono text-xs text-[#B8B5A3]">
          <span>Verified Guardian: <strong className="text-[#F4F1DE]">{linkedWard.guardianName}</strong></span>
          <p className="text-[10px] text-[#C5A059] mt-0.5">Contact Line: {linkedWard.guardianPhone}</p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Campus Safety Posture"
          value="SECURE"
          description="In Academic Block B (GPS Verified)"
          icon={<ShieldCheck className="h-5 w-5" />}
          variant="success"
        />
        <StatCard
          title="Attendance Metric"
          value={`${linkedWard.attendancePercentage}%`}
          description="Good Standing (Threshold: 75%)"
          icon={<CalendarCheck className="h-5 w-5" />}
          variant="primary"
        />
        <StatCard
          title="Academic CGPA"
          value={`${linkedWard.cgpa} / 10.0`}
          description="Dean's Honors List"
          icon={<Award className="h-5 w-5" />}
          variant="warning"
        />
      </div>

      {/* Linked Student Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Academic Roster & Attendance */}
        <Card className="bg-[#0F1026] border-[#243356] text-[#F4F1DE]">
          <CardHeader className="p-4 border-b border-[#243356] bg-[#131C38]/60">
            <CardTitle className="text-xs font-mono font-bold uppercase tracking-wider text-[#FFD700] flex items-center gap-2">
              <CalendarCheck className="h-4 w-4" />
              <span>Ward Academic Attendance &amp; Enrolled Roster</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-xs font-mono">
            <div className="flex justify-between py-2 border-b border-[#243356]">
              <span>Distributed Systems (CS301)</span>
              <span className="text-emerald-400 font-bold">Present (98% Attendance)</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#243356]">
              <span>AI &amp; Robotics Lab (CS304)</span>
              <span className="text-emerald-400 font-bold">Present (95% Attendance)</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#243356]">
              <span>Database Systems Core (CS302)</span>
              <span className="text-emerald-400 font-bold">Present (96% Attendance)</span>
            </div>
          </CardContent>
        </Card>

        {/* Hostel & Curfew Status */}
        <Card className="bg-[#0F1026] border-[#243356] text-[#F4F1DE]">
          <CardHeader className="p-4 border-b border-[#243356] bg-[#131C38]/60">
            <CardTitle className="text-xs font-mono font-bold uppercase tracking-wider text-[#FFD700] flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#FFD700]" />
              <span>Hostel Residence &amp; Biometric Gate Log</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-xs font-mono">
            {wardHostelRoom && (
              <div className="bg-[#131C38] p-3 rounded-lg border border-[#243356] space-y-1">
                <span className="font-bold text-[#F4F1DE]">Hostel Residence Assignment</span>
                <p className="text-[11px] text-[#B8B5A3]">
                  {wardHostelRoom.buildingCode} — Room {wardHostelRoom.roomNumber} ({wardHostelRoom.type} Occupancy)
                </p>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex justify-between py-1.5 border-b border-[#243356]">
                <span>Biometric Gate Check-In: Hostel Block B</span>
                <span className="text-[#FFD700]">Yesterday, 09:42 PM (Verified)</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#243356]">
                <span>Night-In Curfew Clearance</span>
                <span className="text-emerald-400 font-bold">In-Time Compliant</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
