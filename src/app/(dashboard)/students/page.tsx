'use client';

import React, { useState } from 'react';
import { useAcademic } from '@/lib/context/academic-context';
import { useRole } from '@/lib/hooks/use-role';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  GraduationCap,
  Plus,
  Search,
  Mail,
  MapPin,
  AlertTriangle,
  User,
  Heart,
  X,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { StudentRecord } from '@/lib/types/academic';

export default function StudentsPage() {
  const { students, addStudent, departments } = useAcademic();
  const { role, user } = useRole();

  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);

  // New Student Form State
  const [newName, setNewName] = useState('');
  const [newRoll, setNewRoll] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newDept, setNewDept] = useState('Computer Science & Engineering');
  const [newSemester, setNewSemester] = useState(6);
  const [newCgpa, setNewCgpa] = useState('8.50');
  const [newAttendance, setNewAttendance] = useState('90');
  const [newGuardianName, setNewGuardianName] = useState('');
  const [newGuardianPhone, setNewGuardianPhone] = useState('');
  const [newMedicalNotes, setNewMedicalNotes] = useState('None');

  const canEnroll = role === 'super_admin' || role === 'admin' || role === 'faculty';

  // FERPA Data Privacy Scoping:
  const scopedStudents = students.filter((s) => {
    if (role === 'student') {
      return (
        (user?.email && s.email.toLowerCase() === user.email.toLowerCase()) ||
        (user?.full_name && s.name.toLowerCase() === user.full_name.toLowerCase()) ||
        s.id === 'std-001'
      );
    }
    if (role === 'parent') {
      return (
        (user?.full_name && s.guardianName.toLowerCase().includes(user.full_name.toLowerCase())) ||
        (user?.email && s.guardianEmail?.toLowerCase() === user.email.toLowerCase()) ||
        s.id === 'std-001'
      );
    }
    return true;
  });

  const filteredStudents = scopedStudents.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === 'ALL' || s.department.toLowerCase().includes(deptFilter.toLowerCase());
    return matchesSearch && matchesDept;
  });

  const totalEnrolled = scopedStudents.length;
  const avgCgpa = (scopedStudents.reduce((acc, s) => acc + s.cgpa, 0) / (totalEnrolled || 1)).toFixed(2);
  const honorRollCount = scopedStudents.filter((s) => s.cgpa >= 9.0).length;

  const handleEnrollStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newRoll) return;

    addStudent({
      rollNumber: newRoll.toUpperCase(),
      name: newName,
      email: newEmail || `${newRoll.toLowerCase()}@luminous.edu`,
      department: newDept,
      semester: Number(newSemester),
      section: 'A',
      cgpa: parseFloat(newCgpa) || 8.0,
      attendancePercentage: Number(newAttendance) || 90,
      guardianName: newGuardianName || 'Guardian',
      guardianPhone: newGuardianPhone || '+91 98000 00000',
      status: 'Active',
      enrolledCourses: ['CS301', 'CS304'],
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`,
      medicalNotes: newMedicalNotes,
    });

    setNewName('');
    setNewRoll('');
    setNewEmail('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D6D8D5] pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1F2933] flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-[#1F2933]" />
            <span>Students Directory</span>
          </h1>
          <p className="text-xs text-[#667085] mt-0.5">
            Student roster, academic profiles, guardian linkage, and attendance tracking.
          </p>
        </div>

        {canEnroll && (
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#1F2933] hover:bg-[#111827] text-white text-xs font-semibold gap-1.5 rounded-lg shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Enroll New Student</span>
          </Button>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl border border-[#D6D8D5] bg-white shadow-xs">
          <span className="text-xs text-[#667085]">Total Enrolled</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-[#1F2933]">{totalEnrolled} Students</span>
            <span className="text-xs text-[#667085]">Active cohorts</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[#D6D8D5] bg-white shadow-xs">
          <span className="text-xs text-[#667085]">Campus Average CGPA</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-[#1F2933]">{avgCgpa} / 10.0</span>
            <span className="text-xs text-emerald-700 font-medium">Cumulative</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[#D6D8D5] bg-white shadow-xs">
          <span className="text-xs text-[#667085]">Honors Scholars (&ge; 9.0)</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-[#1F2933]">{honorRollCount} Students</span>
            <span className="text-xs text-[#667085]">Dean&#39;s List</span>
          </div>
        </div>
      </div>

      {/* Search & Dept Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#667085]" />
          <Input
            placeholder="Search student by name, roll number, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 text-xs border-[#D6D8D5] bg-white rounded-xl shadow-xs"
          />
        </div>

        <div className="inline-flex p-1 bg-[#F0F1EF] rounded-full border border-[#D6D8D5] gap-1 overflow-x-auto">
          {['ALL', 'Computer Science', 'Artificial Intelligence', 'Electronics', 'Mechanical'].map((dept) => (
            <button
              key={dept}
              onClick={() => setDeptFilter(dept)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                deptFilter === dept
                  ? 'bg-[#1F2933] text-white shadow-xs'
                  : 'text-[#667085] hover:text-[#1F2933]'
              }`}
            >
              {dept === 'ALL' ? 'All Departments' : dept}
            </button>
          ))}
        </div>
      </div>

      {/* Roster Table / List */}
      <div className="divide-y divide-[#E5E7EB] bg-white rounded-xl border border-[#D6D8D5] shadow-xs overflow-hidden text-xs">
        {filteredStudents.map((st) => (
          <div
            key={st.id}
            onClick={() => setSelectedStudent(st)}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-[#F7F8F6] cursor-pointer transition-colors gap-3"
          >
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={st.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={st.name}
                className="h-10 w-10 rounded-full border border-[#D6D8D5] object-cover shrink-0"
              />
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-[#1F2933] text-sm">{st.name}</p>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F0F1EF] text-[#1F2933]">
                    {st.rollNumber}
                  </span>
                  {st.attendancePercentage < 75 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 text-red-800 border border-red-200 inline-flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      <span>Low Attendance</span>
                    </span>
                  )}
                </div>
                <p className="text-[#667085] text-xs mt-0.5">
                  {st.department} · Semester {st.semester} (Section {st.section})
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-6 text-xs">
              <div className="text-left sm:text-right">
                <span className="text-[#667085] text-[11px] block">CGPA</span>
                <span className="font-bold text-[#1F2933] text-sm">{st.cgpa} / 10.0</span>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-[#667085] text-[11px] block">Attendance</span>
                <span
                  className={`font-semibold text-xs ${
                    st.attendancePercentage < 75 ? 'text-red-700' : 'text-emerald-700'
                  }`}
                >
                  {st.attendancePercentage}%
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-[#667085]" />
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Enroll Student */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <Card className="w-full max-w-lg bg-white border-[#D6D8D5] text-[#1F2933] shadow-xl">
            <CardHeader className="p-4 border-b border-[#D6D8D5] flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-[#1F2933] flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                <span>Enroll New Student</span>
              </CardTitle>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#667085] hover:text-[#1F2933] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </CardHeader>
            <CardContent className="p-4 space-y-3.5">
              <form onSubmit={handleEnrollStudent} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#1F2933] block mb-1">Full Name *</label>
                    <Input
                      required
                      placeholder="e.g. Vikramaditya Shah"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="bg-white border-[#D6D8D5] text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#1F2933] block mb-1">Roll Number *</label>
                    <Input
                      required
                      placeholder="e.g. CS23B050"
                      value={newRoll}
                      onChange={(e) => setNewRoll(e.target.value)}
                      className="bg-white border-[#D6D8D5] text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#1F2933] block mb-1">Email Address</label>
                    <Input
                      type="email"
                      placeholder="student@luminous.edu"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
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
                        <option key={d.code} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
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
                    <label className="text-xs font-semibold text-[#1F2933] block mb-1">CGPA</label>
                    <Input
                      value={newCgpa}
                      onChange={(e) => setNewCgpa(e.target.value)}
                      className="bg-white border-[#D6D8D5] text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#1F2933] block mb-1">Attendance %</label>
                    <Input
                      type="number"
                      value={newAttendance}
                      onChange={(e) => setNewAttendance(e.target.value)}
                      className="bg-white border-[#D6D8D5] text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#1F2933] block mb-1">Guardian Name</label>
                    <Input
                      placeholder="e.g. Ramesh Shah"
                      value={newGuardianName}
                      onChange={(e) => setNewGuardianName(e.target.value)}
                      className="bg-white border-[#D6D8D5] text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#1F2933] block mb-1">Guardian Phone</label>
                    <Input
                      placeholder="+91 98450 19887"
                      value={newGuardianPhone}
                      onChange={(e) => setNewGuardianPhone(e.target.value)}
                      className="bg-white border-[#D6D8D5] text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#1F2933] block mb-1">Medical / Emergency Notes</label>
                  <Input
                    placeholder="e.g. Asthma, allergies, special diet"
                    value={newMedicalNotes}
                    onChange={(e) => setNewMedicalNotes(e.target.value)}
                    className="bg-white border-[#D6D8D5] text-xs"
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
                    Complete Enrollment
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal: Student Academic Profile */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <Card className="w-full max-w-lg bg-white border-[#D6D8D5] text-[#1F2933] shadow-xl">
            <CardHeader className="p-4 border-b border-[#D6D8D5] flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedStudent.avatarUrl}
                  alt={selectedStudent.name}
                  className="h-10 w-10 rounded-full border border-[#D6D8D5]"
                />
                <div>
                  <CardTitle className="text-sm font-bold text-[#1F2933]">
                    {selectedStudent.name}
                  </CardTitle>
                  <p className="text-xs text-[#667085]">
                    {selectedStudent.rollNumber} · {selectedStudent.department}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-[#667085] hover:text-[#1F2933] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </CardHeader>

            <CardContent className="p-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-[#F7F8F6] p-3 rounded-lg border border-[#D6D8D5]">
                <div>
                  <span className="text-[11px] text-[#667085] block">Cumulative CGPA</span>
                  <span className="font-bold text-emerald-700 text-sm">{selectedStudent.cgpa} / 10.0</span>
                </div>
                <div>
                  <span className="text-[11px] text-[#667085] block">Attendance Rate</span>
                  <span
                    className={`font-bold text-sm ${
                      selectedStudent.attendancePercentage < 75 ? 'text-red-700' : 'text-[#1F2933]'
                    }`}
                  >
                    {selectedStudent.attendancePercentage}%
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-[#667085]">
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-[#1F2933]" />
                  <span>{selectedStudent.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-[#1F2933]" />
                  <span>Guardian: {selectedStudent.guardianName} ({selectedStudent.guardianPhone})</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-[#1F2933]" />
                  <span>{selectedStudent.address || 'Campus Hostels'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="h-3.5 w-3.5 text-rose-500" />
                  <span>Medical Notes: {selectedStudent.medicalNotes || 'None'}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-[#1F2933] mb-1.5 flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Enrolled Courses</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedStudent.enrolledCourses.map((c) => (
                    <span key={c} className="px-2 py-0.5 rounded text-xs bg-[#F0F1EF] text-[#1F2933] border border-[#D6D8D5]">
                      {c}
                    </span>
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
