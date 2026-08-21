'use client';

import React, { useState } from 'react';
import { useAcademic } from '@/lib/context/academic-context';
import { useRole } from '@/lib/hooks/use-role';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  GraduationCap,
  Plus,
  Search,
  Award,
  CalendarCheck,
  Mail,
  MapPin,
  AlertTriangle,
  User,
  Heart,
  X,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
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
  // Students may ONLY view their own record; Parents may ONLY view their linked child.
  const scopedStudents = students.filter((s) => {
    if (role === 'student') {
      return (
        (user?.email && s.email.toLowerCase() === user.email.toLowerCase()) ||
        (user?.full_name && s.name.toLowerCase() === user.full_name.toLowerCase()) ||
        s.id === 'std-001' // Demo default student identity (Aanya Patel)
      );
    }
    if (role === 'parent') {
      return (
        (user?.full_name && s.guardianName.toLowerCase().includes(user.full_name.toLowerCase())) ||
        (user?.email && s.guardianEmail?.toLowerCase() === user.email.toLowerCase()) ||
        s.id === 'std-001' // Demo default linked ward (Aanya Patel)
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
  const avgAttendance = Math.round(scopedStudents.reduce((acc, s) => acc + s.attendancePercentage, 0) / (totalEnrolled || 1));
  const honorRollCount = scopedStudents.filter((s) => s.cgpa >= 9.0).length;

  const cgpaChartData = [
    { range: '9.0 - 10.0', count: students.filter((s) => s.cgpa >= 9.0).length },
    { range: '8.0 - 8.9', count: students.filter((s) => s.cgpa >= 8.0 && s.cgpa < 9.0).length },
    { range: '7.0 - 7.9', count: students.filter((s) => s.cgpa >= 7.0 && s.cgpa < 8.0).length },
    { range: '< 7.0', count: students.filter((s) => s.cgpa < 7.0).length },
  ];

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
      guardianPhone: newGuardianPhone || '+1 (555) 000-0000',
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#243356] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F4F1DE] font-mono flex items-center gap-2.5">
            <GraduationCap className="h-6 w-6 text-[#FFD700]" />
            <span>STUDENTS DIRECTORY</span>
          </h1>
          <p className="text-xs text-[#B8B5A3] mt-1 font-sans">
            Enrolled student roster, academic profiles, guardian linkage, and attendance tracking
          </p>
        </div>

        {canEnroll && (
          <Button
            onClick={() => setIsAddModalOpen(true)}
            size="sm"
            className="bg-gradient-to-r from-[#D4AF37] to-[#C5A059] hover:opacity-90 text-[#0B132B] font-bold text-xs gap-1.5 shadow-md shadow-[#D4AF37]/20"
          >
            <Plus className="h-4 w-4" />
            <span>Enroll New Student</span>
          </Button>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Card className="bg-[#0F1026] border-[#243356] text-[#F4F1DE]">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono text-[#C5A059] uppercase tracking-wider">Total Enrolled</p>
              <h3 className="text-xl font-bold font-mono mt-0.5 text-[#F4F1DE]">{totalEnrolled}</h3>
            </div>
            <div className="h-9 w-9 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <GraduationCap className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0F1026] border-[#243356] text-[#F4F1DE]">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono text-[#C5A059] uppercase tracking-wider">Average CGPA</p>
              <h3 className="text-xl font-bold font-mono mt-0.5 text-emerald-400">{avgCgpa} / 10.0</h3>
            </div>
            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Award className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0F1026] border-[#243356] text-[#F4F1DE]">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono text-[#C5A059] uppercase tracking-wider">Avg Attendance</p>
              <h3 className="text-xl font-bold font-mono mt-0.5 text-[#FFD700]">{avgAttendance}%</h3>
            </div>
            <div className="h-9 w-9 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#FFD700]">
              <CalendarCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0F1026] border-[#243356] text-[#F4F1DE]">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono text-[#C5A059] uppercase tracking-wider">Honors Scholars</p>
              <h3 className="text-xl font-bold font-mono mt-0.5 text-purple-400">{honorRollCount} Students</h3>
            </div>
            <div className="h-9 w-9 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Award className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CGPA Chart */}
      <Card className="bg-[#0F1026] border-[#243356] text-[#F4F1DE]">
        <CardHeader className="p-4 pb-2 border-b border-[#243356] bg-[#131C38]/60">
          <CardTitle className="text-xs font-mono font-bold uppercase tracking-wider text-[#FFD700] flex items-center gap-2">
            <Award className="h-4 w-4" />
            <span>Cumulative CGPA Score Distribution</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cgpaChartData}>
              <XAxis dataKey="range" stroke="#B8B5A3" fontSize={11} />
              <YAxis stroke="#B8B5A3" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0B132B', borderColor: '#243356', color: '#F4F1DE' }}
              />
              <Bar dataKey="count" fill="#10B981" name="Students Count" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Search & Dept Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-3 bg-[#0F1026] p-3 rounded-xl border border-[#243356]">
          <Search className="h-4 w-4 text-[#C5A059] shrink-0" />
          <Input
            placeholder="Search student by name, roll number, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-0 text-xs text-[#F4F1DE] placeholder:text-[#B8B5A3]/60 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'Computer Science', 'Artificial Intelligence', 'Electronics', 'Mechanical', 'Civil'].map((dept) => (
            <button
              key={dept}
              onClick={() => setDeptFilter(dept)}
              className={`px-3 py-2 rounded-lg text-xs font-mono font-bold transition-all whitespace-nowrap ${
                deptFilter === dept
                  ? 'bg-[#D4AF37] text-[#0B132B]'
                  : 'bg-[#0F1026] text-[#B8B5A3] border border-[#243356] hover:text-white'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Roster Table / List */}
      <div className="divide-y divide-[#243356] bg-[#0F1026] rounded-xl border border-[#243356] overflow-hidden text-xs">
        {filteredStudents.map((st) => (
          <div
            key={st.id}
            onClick={() => setSelectedStudent(st)}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-[#131C38] cursor-pointer transition-colors gap-3"
          >
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={st.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={st.name}
                className="h-10 w-10 rounded-full border border-[#D4AF37]/40 object-cover shrink-0"
              />
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-[#F4F1DE] text-sm">{st.name}</p>
                  <Badge className="bg-[#D4AF37]/15 text-[#FFD700] border-[#D4AF37]/30 font-mono text-[10px]">
                    {st.rollNumber}
                  </Badge>
                  {st.attendancePercentage < 75 && (
                    <Badge className="bg-red-500/15 text-red-400 border-red-500/30 text-[9px] gap-1 font-mono">
                      <AlertTriangle className="h-3 w-3" />
                      <span>LOW ATTENDANCE</span>
                    </Badge>
                  )}
                </div>
                <p className="text-[#B8B5A3] font-mono text-[11px] mt-0.5">
                  {st.department} · Semester {st.semester} (Sec {st.section})
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-6 font-mono text-xs">
              <div className="text-left sm:text-right">
                <span className="text-[#B8B5A3] text-[10px] block">CGPA</span>
                <span className="font-bold text-emerald-400 text-sm">{st.cgpa} / 10.0</span>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-[#B8B5A3] text-[10px] block">ATTENDANCE</span>
                <span
                  className={`font-bold ${
                    st.attendancePercentage < 75 ? 'text-red-400' : 'text-[#FFD700]'
                  }`}
                >
                  {st.attendancePercentage}%
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-[#B8B5A3]" />
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Enroll Student */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <Card className="w-full max-w-lg bg-[#0F1026] border-[#243356] text-[#F4F1DE]">
            <CardHeader className="p-4 border-b border-[#243356] flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold font-mono text-[#FFD700] flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                <span>Enroll New Undergraduate Student</span>
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
              <form onSubmit={handleEnrollStudent} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-[#C5A059] uppercase block mb-1">Full Name *</label>
                    <Input
                      required
                      placeholder="e.g. Vikramaditya Shah"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="bg-[#131C38] border-[#243356] text-xs text-[#F4F1DE]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-[#C5A059] uppercase block mb-1">Roll Number *</label>
                    <Input
                      required
                      placeholder="e.g. CS23B050"
                      value={newRoll}
                      onChange={(e) => setNewRoll(e.target.value)}
                      className="bg-[#131C38] border-[#243356] text-xs text-[#F4F1DE]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-[#C5A059] uppercase block mb-1">Email Address</label>
                    <Input
                      type="email"
                      placeholder="student@luminous.edu"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
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
                        <option key={d.code} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
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
                    <label className="text-[10px] font-mono text-[#C5A059] uppercase block mb-1">Initial CGPA</label>
                    <Input
                      value={newCgpa}
                      onChange={(e) => setNewCgpa(e.target.value)}
                      className="bg-[#131C38] border-[#243356] text-xs text-[#F4F1DE]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-[#C5A059] uppercase block mb-1">Attendance %</label>
                    <Input
                      type="number"
                      value={newAttendance}
                      onChange={(e) => setNewAttendance(e.target.value)}
                      className="bg-[#131C38] border-[#243356] text-xs text-[#F4F1DE]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-[#C5A059] uppercase block mb-1">Guardian Name</label>
                    <Input
                      placeholder="e.g. Ramesh Shah"
                      value={newGuardianName}
                      onChange={(e) => setNewGuardianName(e.target.value)}
                      className="bg-[#131C38] border-[#243356] text-xs text-[#F4F1DE]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-[#C5A059] uppercase block mb-1">Guardian Phone</label>
                    <Input
                      placeholder="+1 (555) 019-8877"
                      value={newGuardianPhone}
                      onChange={(e) => setNewGuardianPhone(e.target.value)}
                      className="bg-[#131C38] border-[#243356] text-xs text-[#F4F1DE]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-[#C5A059] uppercase block mb-1">Medical / Emergency Notes</label>
                  <Input
                    placeholder="e.g. Asthma, allergies, special diet"
                    value={newMedicalNotes}
                    onChange={(e) => setNewMedicalNotes(e.target.value)}
                    className="bg-[#131C38] border-[#243356] text-xs text-[#F4F1DE]"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <Card className="w-full max-w-lg bg-[#0F1026] border-[#243356] text-[#F4F1DE]">
            <CardHeader className="p-4 border-b border-[#243356] flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedStudent.avatarUrl}
                  alt={selectedStudent.name}
                  className="h-10 w-10 rounded-full border border-[#D4AF37]"
                />
                <div>
                  <CardTitle className="text-sm font-bold font-mono text-[#F4F1DE]">
                    {selectedStudent.name}
                  </CardTitle>
                  <p className="text-[11px] font-mono text-[#C5A059]">
                    {selectedStudent.rollNumber} · {selectedStudent.department}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedStudent(null)}
                className="h-6 w-6 text-[#B8B5A3] hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent className="p-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-[#131C38] p-3 rounded-lg border border-[#243356]">
                <div>
                  <span className="text-[10px] text-[#C5A059] font-mono block">CUMULATIVE CGPA</span>
                  <span className="font-bold text-emerald-400 text-sm font-mono">{selectedStudent.cgpa} / 10.0</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#C5A059] font-mono block">ATTENDANCE RATE</span>
                  <span
                    className={`font-bold text-sm font-mono ${
                      selectedStudent.attendancePercentage < 75 ? 'text-red-400' : 'text-[#FFD700]'
                    }`}
                  >
                    {selectedStudent.attendancePercentage}%
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-[11px]">
                <div className="flex items-center gap-2 text-[#B8B5A3]">
                  <Mail className="h-3.5 w-3.5 text-[#C5A059]" />
                  <span>{selectedStudent.email}</span>
                </div>
                <div className="flex items-center gap-2 text-[#B8B5A3]">
                  <User className="h-3.5 w-3.5 text-[#C5A059]" />
                  <span>Guardian: {selectedStudent.guardianName} ({selectedStudent.guardianPhone})</span>
                </div>
                <div className="flex items-center gap-2 text-[#B8B5A3]">
                  <MapPin className="h-3.5 w-3.5 text-[#C5A059]" />
                  <span>{selectedStudent.address || 'Campus Quarter'}</span>
                </div>
                <div className="flex items-center gap-2 text-[#B8B5A3]">
                  <Heart className="h-3.5 w-3.5 text-rose-400" />
                  <span>Medical Notes: {selectedStudent.medicalNotes || 'None'}</span>
                </div>
              </div>

              <div>
                <h4 className="font-mono text-[10px] text-[#C5A059] uppercase font-bold mb-1.5 flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-[#FFD700]" />
                  <span>Enrolled Courses</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedStudent.enrolledCourses.map((c) => (
                    <Badge key={c} className="bg-[#1C2541] text-[#FFD700] border-[#243356] font-mono text-[10px]">
                      {c}
                    </Badge>
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
