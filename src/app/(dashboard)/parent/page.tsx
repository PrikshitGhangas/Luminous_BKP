'use client';

import React from 'react';
import { useAcademic } from '@/lib/context/academic-context';
import { useCampusServices } from '@/lib/context/campus-services-context';
import { useRole } from '@/lib/hooks/use-role';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { StatCard } from '@/components/shared/stat-card';
import {
  Users,
  ShieldCheck,
  Award,
  CalendarCheck,
  Building2,
  Phone,
  UserCheck,
} from 'lucide-react';

export default function ParentPage() {
  const { students } = useAcademic();
  const { hostelRooms } = useCampusServices();
  const { user, role } = useRole();

  // Strict role check: ONLY Parents are authorized to access Parent Portal
  if (role !== 'parent') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-8 bg-[#F7F8F6] border border-[#D6D8D5] rounded-xl space-y-3">
        <div className="h-10 w-10 rounded-full bg-[#F0F1EF] border border-[#D6D8D5] flex items-center justify-center text-[#1F2933]">
          <UserCheck className="h-5 w-5" />
        </div>
        <h2 className="text-base font-bold text-[#1F2933]">Parent &amp; Guardian Access Only</h2>
        <p className="text-xs text-[#667085] max-w-sm">
          This portal is reserved exclusively for registered parents and legal guardians. Administrators should inspect student records via the Student Directory or Student Dashboard.
        </p>
      </div>
    );
  }

  // Resolve student ward linked to parent
  const currentStudent =
    students.find(
      (s) =>
        (user?.full_name && s.guardianName.toLowerCase().includes(user.full_name.toLowerCase())) ||
        (user?.email && s.guardianEmail?.toLowerCase() === user.email.toLowerCase())
    ) ||
    students[0] || {
      id: 'std-001',
      name: 'Aanya Patel',
      rollNumber: 'CS23B042',
      department: 'Computer Science & Engineering',
      semester: 6,
      section: 'A',
      cgpa: 9.28,
      attendancePercentage: 96.2,
      guardianName: 'Rajesh Patel',
      guardianPhone: '+91 98454 15882',
      guardianEmail: 'rajesh.patel@gmail.com',
    };

  const wardHostelRoom = hostelRooms.find((r) =>
    r.occupants.some((o) => o.rollNumber === currentStudent.rollNumber)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D6D8D5] pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1F2933] flex items-center gap-2">
            <UserCheck className="h-6 w-6 text-[#1F2933]" />
            <span>Parent &amp; Guardian Portal</span>
          </h1>
          <p className="text-xs text-[#667085] mt-0.5">
            Observing attendance, academic milestones, and campus residency for {currentStudent.name}.
          </p>
        </div>
      </div>

      {/* Student & Guardian Summary Card */}
      <div className="p-4 rounded-xl border border-[#D6D8D5] bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-[#1F2933]">
              {currentStudent.name}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#F0F1EF] text-[#667085] border border-[#D6D8D5]">
              Roll: {currentStudent.rollNumber}
            </span>
          </div>
          <p className="text-xs text-[#667085]">
            {currentStudent.department} · Semester {currentStudent.semester} (Section {currentStudent.section})
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs text-[#667085] border-t md:border-t-0 md:border-l md:pl-6 border-[#D6D8D5] pt-3 md:pt-0">
          <div>
            <span className="block text-[11px] text-[#667085]">Guardian:</span>
            <strong className="text-[#1F2933]">{currentStudent.guardianName}</strong>
          </div>
          <div>
            <span className="block text-[11px] text-[#667085]">Phone:</span>
            <a href={`tel:${currentStudent.guardianPhone}`} className="text-[#1F2933] font-medium hover:underline flex items-center gap-1">
              <Phone className="h-3 w-3 text-[#667085]" />
              <span>{currentStudent.guardianPhone}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Campus Safety Status"
          value="Normal"
          description="GPS verified on campus"
          icon={<ShieldCheck className="h-5 w-5" />}
          variant="success"
        />
        <StatCard
          title="Overall Attendance"
          value={`${currentStudent.attendancePercentage}%`}
          description="Required minimum: 75%"
          icon={<CalendarCheck className="h-5 w-5" />}
          variant="primary"
        />
        <StatCard
          title="Academic CGPA"
          value={`${currentStudent.cgpa} / 10.0`}
          description="Good Academic Standing"
          icon={<Award className="h-5 w-5" />}
          variant="default"
        />
      </div>

      {/* Academic Courses & Hostel Residency */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Academic Course Attendance */}
        <div className="p-4 rounded-xl border border-[#D6D8D5] bg-white space-y-3 shadow-xs">
          <div className="flex items-center gap-2 pb-2 border-b border-[#D6D8D5]">
            <CalendarCheck className="h-4 w-4 text-[#1F2933]" />
            <h3 className="text-xs font-bold text-[#1F2933]">
              Enrolled Courses &amp; Attendance
            </h3>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-2 border-b border-[#D6D8D5]">
              <span className="text-[#1F2933]">Distributed Systems (CS301)</span>
              <span className="text-emerald-700 font-semibold">98% Attendance</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[#D6D8D5]">
              <span className="text-[#1F2933]">AI &amp; Robotics Lab (CS304)</span>
              <span className="text-emerald-700 font-semibold">95% Attendance</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-[#1F2933]">Database Systems Core (CS302)</span>
              <span className="text-emerald-700 font-semibold">96% Attendance</span>
            </div>
          </div>
        </div>

        {/* Hostel & Curfew Status */}
        <div className="p-4 rounded-xl border border-[#D6D8D5] bg-white space-y-3 shadow-xs">
          <div className="flex items-center gap-2 pb-2 border-b border-[#D6D8D5]">
            <Building2 className="h-4 w-4 text-[#1F2933]" />
            <h3 className="text-xs font-bold text-[#1F2933]">
              Hostel Accommodation &amp; Curfew Status
            </h3>
          </div>
          <div className="space-y-2.5 text-xs">
            {wardHostelRoom ? (
              <div className="p-2.5 rounded-lg bg-[#F7F8F6] border border-[#D6D8D5] space-y-0.5">
                <span className="font-semibold text-[#1F2933]">Room Assignment</span>
                <p className="text-[11px] text-[#667085]">
                  {wardHostelRoom.buildingCode} — Room {wardHostelRoom.roomNumber} ({wardHostelRoom.type} Occupancy)
                </p>
              </div>
            ) : (
              <div className="p-2.5 rounded-lg bg-[#F7F8F6] border border-[#D6D8D5] text-[11px] text-[#667085]">
                Day Scholar / Off-Campus Residence
              </div>
            )}

            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between py-1 border-b border-[#D6D8D5]">
                <span className="text-[#667085]">Last Biometric Gate Entry:</span>
                <span className="font-semibold text-[#1F2933]">Yesterday, 09:42 PM</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#667085]">Curfew Status:</span>
                <span className="text-emerald-700 font-semibold">Checked In On Time</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
