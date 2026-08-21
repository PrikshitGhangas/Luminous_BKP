'use client';

import React, { useState } from 'react';
import { useAcademic } from '@/lib/context/academic-context';
import { useRole } from '@/lib/hooks/use-role';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Briefcase,
  Plus,
  Search,
  BookOpen,
  Mail,
  Phone,
  MapPin,
  Star,
  FileText,
  X,
  ChevronRight,
  UserCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { FacultyRecord } from '@/lib/types/academic';

export default function FacultyPage() {
  const { faculty, addFaculty, departments } = useAcademic();
  const { role } = useRole();

  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyRecord | null>(null);

  // New Faculty Form State
  const [newName, setNewName] = useState('');
  const [newEmpId, setNewEmpId] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newDept, setNewDept] = useState('Computer Science & Engineering');
  const [newDesignation, setNewDesignation] = useState<'Head of Department' | 'Professor' | 'Associate Professor' | 'Assistant Professor' | 'Visiting Lecturer'>('Professor');
  const [newSpecialization, setNewSpecialization] = useState('');
  const [newOffice, setNewOffice] = useState('Tech Building 302');
  const [newPhone, setNewPhone] = useState('+1 (555) 019-1029');

  const canManage = role === 'super_admin' || role === 'admin';

  const filteredFaculty = faculty.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.officeRoom.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === 'ALL' || f.department.toLowerCase().includes(deptFilter.toLowerCase());
    return matchesSearch && matchesDept;
  });

  const totalFaculty = faculty.length;
  const professorCount = faculty.filter((f) => f.designation === 'Professor' || f.designation === 'Head of Department').length;
  const totalPublications = faculty.reduce((acc, f) => acc + f.publicationsCount, 0);
  const avgRating = (faculty.reduce((acc, f) => acc + f.rating, 0) / (totalFaculty || 1)).toFixed(2);

  const chartData = [
    { dept: 'CSE', count: faculty.filter((f) => f.department.includes('Computer Science')).length },
    { dept: 'AI-DS', count: faculty.filter((f) => f.department.includes('Artificial Intelligence')).length },
    { dept: 'ECE', count: faculty.filter((f) => f.department.includes('Electronics')).length },
    { dept: 'MECH', count: faculty.filter((f) => f.department.includes('Mechanical')).length },
    { dept: 'CIVIL', count: faculty.filter((f) => f.department.includes('Civil')).length },
  ];

  const handleCreateFaculty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmpId) return;

    addFaculty({
      employeeId: newEmpId.toUpperCase(),
      name: newName,
      email: newEmail || `${newEmpId.toLowerCase()}@luminous.edu`,
      department: newDept,
      designation: newDesignation,
      specialization: newSpecialization || 'Computational Research',
      officeRoom: newOffice,
      phone: newPhone,
      status: 'Active',
      coursesTaught: ['CS301'],
      publicationsCount: 15,
      rating: 4.8,
      avatarUrl: `https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150`,
    });

    setNewName('');
    setNewEmpId('');
    setNewEmail('');
    setNewSpecialization('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D0D1D6] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#202226] font-mono flex items-center gap-2.5">
            <Briefcase className="h-6 w-6 text-[#B45309]" />
            <span>FACULTY &amp; INSTRUCTORS DIRECTORY</span>
          </h1>
          <p className="text-xs text-[#555960] mt-1 font-sans">
            Academic departmental faculty, research appointments, publication index, and office cabins
          </p>
        </div>

        {canManage && (
          <Button
            onClick={() => setIsAddModalOpen(true)}
            size="sm"
            className="bg-gradient-to-r from-[#EAB308] to-[#D4AF37] hover:opacity-90 text-[#0B132B] font-bold text-xs gap-1.5 shadow-md shadow-[#D4AF37]/20"
          >
            <Plus className="h-4 w-4" />
            <span>Add Faculty Member</span>
          </Button>
        )}
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <Card className="bg-[#F4F5F6] border-[#D0D1D6] text-[#202226]">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono text-[#B45309] uppercase tracking-wider">Total Instructors</p>
              <h3 className="text-xl font-bold font-mono mt-0.5 text-[#202226]">{totalFaculty}</h3>
            </div>
            <div className="h-9 w-9 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Briefcase className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#F4F5F6] border-[#D0D1D6] text-[#202226]">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono text-[#B45309] uppercase tracking-wider">Professors &amp; HODs</p>
              <h3 className="text-xl font-bold font-mono mt-0.5 text-blue-400">{professorCount}</h3>
            </div>
            <div className="h-9 w-9 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <UserCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#F4F5F6] border-[#D0D1D6] text-[#202226]">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono text-[#B45309] uppercase tracking-wider">Research Papers</p>
              <h3 className="text-xl font-bold font-mono mt-0.5 text-[#B45309]">{totalPublications}</h3>
            </div>
            <div className="h-9 w-9 rounded-lg bg-[#EAB308]/10 border border-[#EAB308]/30 flex items-center justify-center text-[#B45309]">
              <FileText className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#F4F5F6] border-[#D0D1D6] text-[#202226]">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono text-[#B45309] uppercase tracking-wider">Avg Student Rating</p>
              <h3 className="text-xl font-bold font-mono mt-0.5 text-amber-400">{avgRating} / 5.0</h3>
            </div>
            <div className="h-9 w-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Star className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart: Faculty Count by Department */}
      <Card className="bg-[#F4F5F6] border-[#D0D1D6] text-[#202226]">
        <CardHeader className="p-4 pb-2 border-b border-[#D0D1D6] bg-white/60">
          <CardTitle className="text-xs font-mono font-bold uppercase tracking-wider text-[#B45309] flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            <span>Faculty Distribution by Department</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="dept" stroke="#B8B5A3" fontSize={11} />
              <YAxis stroke="#B8B5A3" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0B132B', borderColor: '#243356', color: '#F4F1DE' }}
              />
              <Bar dataKey="count" fill="#8B5CF6" name="Faculty Members" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Search & Dept Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-3 bg-[#F4F5F6] p-3 rounded-xl border border-[#D0D1D6]">
          <Search className="h-4 w-4 text-[#B45309] shrink-0" />
          <Input
            placeholder="Search faculty by name, employee ID, specialization, or office room..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-0 text-xs text-[#202226] placeholder:text-[#555960]/60 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'Computer Science', 'Artificial Intelligence', 'Electronics', 'Mechanical', 'Civil'].map((dept) => (
            <button
              key={dept}
              onClick={() => setDeptFilter(dept)}
              className={`px-3 py-2 rounded-lg text-xs font-mono font-bold transition-all whitespace-nowrap ${
                deptFilter === dept
                  ? 'bg-[#EAB308] text-[#0B132B]'
                  : 'bg-[#F4F5F6] text-[#555960] border border-[#D0D1D6] hover:text-white'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Faculty Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFaculty.map((f) => (
          <Card
            key={f.id}
            className="bg-[#F4F5F6] border-[#D0D1D6] hover:border-[#EAB308]/50 transition-all duration-200 text-[#202226] flex flex-col justify-between"
          >
            <CardHeader className="p-4 pb-3 border-b border-[#D0D1D6] bg-white/40 flex flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={f.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100'}
                  alt={f.name}
                  className="h-10 w-10 rounded-full border border-[#EAB308]/40 object-cover shrink-0"
                />
                <div>
                  <h3 className="text-sm font-bold text-[#202226] font-mono">{f.name}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Badge className="bg-purple-500/15 text-purple-300 border-purple-500/30 text-[9px] font-mono">
                      {f.designation}
                    </Badge>
                    <span className="text-[10px] text-[#555960] font-mono">{f.employeeId}</span>
                  </div>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedFaculty(f)}
                className="h-7 w-7 text-[#555960] hover:text-[#B45309] hover:bg-[#E7E8EB]"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent className="p-4 space-y-3 text-xs flex-1">
              <p className="text-[#B45309] font-mono text-[11px] font-semibold">{f.department}</p>

              <div className="space-y-1 text-[#555960] text-[11px]">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-3.5 w-3.5 text-[#B45309]" />
                  <span className="truncate">Field: {f.specialization}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-[#B45309]" />
                  <span>Cabin: {f.officeRoom}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-[#B45309]" />
                  <span className="truncate">{f.email}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#D0D1D6] font-mono text-[10px]">
                <div className="bg-[#E7E8EB]/50 p-2 rounded border border-[#D0D1D6]">
                  <span className="text-[#555960] block text-[9px]">PUBLICATIONS</span>
                  <span className="font-bold text-[#B45309] text-xs">{f.publicationsCount} Papers</span>
                </div>
                <div className="bg-[#E7E8EB]/50 p-2 rounded border border-[#D0D1D6]">
                  <span className="text-[#555960] block text-[9px]">RATING</span>
                  <span className="font-bold text-amber-400 text-xs flex items-center gap-1">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    {f.rating} / 5.0
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal: Add Faculty */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <Card className="w-full max-w-lg bg-[#F4F5F6] border-[#D0D1D6] text-[#202226]">
            <CardHeader className="p-4 border-b border-[#D0D1D6] flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold font-mono text-[#B45309] flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                <span>Add Faculty Member &amp; Instructor</span>
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsAddModalOpen(false)}
                className="h-6 w-6 text-[#555960] hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-4 space-y-3.5">
              <form onSubmit={handleCreateFaculty} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-[#B45309] uppercase block mb-1">Full Name *</label>
                    <Input
                      required
                      placeholder="e.g. Dr. Jonathan Vance"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="bg-white border-[#D0D1D6] text-xs text-[#202226]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-[#B45309] uppercase block mb-1">Employee ID *</label>
                    <Input
                      required
                      placeholder="e.g. FAC-CSE-009"
                      value={newEmpId}
                      onChange={(e) => setNewEmpId(e.target.value)}
                      className="bg-white border-[#D0D1D6] text-xs text-[#202226]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-[#B45309] uppercase block mb-1">Email Address</label>
                    <Input
                      type="email"
                      placeholder="faculty@luminous.edu"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="bg-white border-[#D0D1D6] text-xs text-[#202226]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-[#B45309] uppercase block mb-1">Designation</label>
                    <select
                      value={newDesignation}
                      onChange={(e) => setNewDesignation(e.target.value as 'Head of Department' | 'Professor' | 'Associate Professor' | 'Assistant Professor' | 'Visiting Lecturer')}
                      className="w-full rounded-md bg-white border border-[#D0D1D6] p-2 text-xs text-[#202226]"
                    >
                      <option value="Head of Department">Head of Department</option>
                      <option value="Professor">Professor</option>
                      <option value="Associate Professor">Associate Professor</option>
                      <option value="Assistant Professor">Assistant Professor</option>
                      <option value="Visiting Lecturer">Visiting Lecturer</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-[#B45309] uppercase block mb-1">Department</label>
                  <select
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                    className="w-full rounded-md bg-white border border-[#D0D1D6] p-2 text-xs text-[#202226]"
                  >
                    {departments.map((d) => (
                      <option key={d.code} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-[#B45309] uppercase block mb-1">Specialization &amp; Research</label>
                  <Input
                    placeholder="e.g. Quantum Cryptography, Distributed Systems"
                    value={newSpecialization}
                    onChange={(e) => setNewSpecialization(e.target.value)}
                    className="bg-white border-[#D0D1D6] text-xs text-[#202226]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-[#B45309] uppercase block mb-1">Office Room</label>
                    <Input
                      value={newOffice}
                      onChange={(e) => setNewOffice(e.target.value)}
                      className="bg-white border-[#D0D1D6] text-xs text-[#202226]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-[#B45309] uppercase block mb-1">Phone Number</label>
                    <Input
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="bg-white border-[#D0D1D6] text-xs text-[#202226]"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#D0D1D6]">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddModalOpen(false)}
                    className="text-xs border-[#D0D1D6]"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#EAB308] hover:bg-[#D4AF37] text-[#0B132B] font-bold text-xs"
                  >
                    Add Instructor
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal: Faculty Details */}
      {selectedFaculty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <Card className="w-full max-w-lg bg-[#F4F5F6] border-[#D0D1D6] text-[#202226]">
            <CardHeader className="p-4 border-b border-[#D0D1D6] flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedFaculty.avatarUrl}
                  alt={selectedFaculty.name}
                  className="h-10 w-10 rounded-full border border-[#EAB308]"
                />
                <div>
                  <CardTitle className="text-sm font-bold font-mono text-[#202226]">
                    {selectedFaculty.name}
                  </CardTitle>
                  <p className="text-[11px] font-mono text-[#B45309]">
                    {selectedFaculty.employeeId} · {selectedFaculty.designation}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedFaculty(null)}
                className="h-6 w-6 text-[#555960] hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent className="p-4 space-y-4 text-xs">
              <div className="bg-white p-3 rounded-lg border border-[#D0D1D6] space-y-1">
                <span className="text-[10px] text-[#B45309] font-mono uppercase block">Department &amp; Research</span>
                <p className="font-bold text-[#202226]">{selectedFaculty.department}</p>
                <p className="text-[#555960] text-[11px]">Field: {selectedFaculty.specialization}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div className="flex items-center gap-2 text-[#555960]">
                  <Mail className="h-3.5 w-3.5 text-[#B45309]" />
                  <span className="truncate">{selectedFaculty.email}</span>
                </div>
                <div className="flex items-center gap-2 text-[#555960]">
                  <Phone className="h-3.5 w-3.5 text-[#B45309]" />
                  <span>{selectedFaculty.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-[#555960]">
                  <MapPin className="h-3.5 w-3.5 text-[#B45309]" />
                  <span>{selectedFaculty.officeRoom}</span>
                </div>
                <div className="flex items-center gap-2 text-[#B45309] font-bold font-mono">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span>Rating: {selectedFaculty.rating} / 5.0</span>
                </div>
              </div>

              <div>
                <h4 className="font-mono text-[10px] text-[#B45309] uppercase font-bold mb-1.5">
                  Assigned Courses Taught
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedFaculty.coursesTaught.map((c) => (
                    <Badge key={c} className="bg-[#E7E8EB] text-[#B45309] border-[#D0D1D6] font-mono text-[10px]">
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
