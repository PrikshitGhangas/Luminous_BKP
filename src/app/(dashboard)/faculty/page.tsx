'use client';

import React, { useState } from 'react';
import { useAcademic } from '@/lib/context/academic-context';
import { useRole } from '@/lib/hooks/use-role';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Briefcase,
  Plus,
  Search,
  BookOpen,
  Mail,
  MapPin,
  Star,
  FileText,
  X,
  ChevronRight,
  UserCheck,
} from 'lucide-react';
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
  const [newPhone, setNewPhone] = useState('+91 98803 19102');

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
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D6D8D5] pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1F2933] flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-[#1F2933]" />
            <span>Faculty &amp; Instructors</span>
          </h1>
          <p className="text-xs text-[#667085] mt-0.5">
            Departmental professors, research chairs, office allocations, and publication index.
          </p>
        </div>

        {canManage && (
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#1F2933] hover:bg-[#111827] text-white text-xs font-semibold gap-1.5 rounded-lg shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Faculty Member</span>
          </Button>
        )}
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl border border-[#D6D8D5] bg-white shadow-xs">
          <span className="text-xs text-[#667085]">Total Faculty Members</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-[#1F2933]">{totalFaculty}</span>
            <span className="text-xs text-[#667085]">Active staff</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[#D6D8D5] bg-white shadow-xs">
          <span className="text-xs text-[#667085]">Professors &amp; Chairs</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-[#1F2933]">{professorCount}</span>
            <span className="text-xs text-emerald-700 font-medium">Senior leadership</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[#D6D8D5] bg-white shadow-xs">
          <span className="text-xs text-[#667085]">Total Publications</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-[#1F2933]">{totalPublications}</span>
            <span className="text-xs text-[#667085]">Indexed journals</span>
          </div>
        </div>
      </div>

      {/* Search & Dept Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#667085]" />
          <Input
            placeholder="Search faculty by name, employee ID, specialization, or room..."
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

      {/* Faculty Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFaculty.map((f) => (
          <div
            key={f.id}
            className="p-4 rounded-xl border border-[#D6D8D5] bg-white shadow-xs hover:border-[#1F2933] transition-all flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={f.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100'}
                    alt={f.name}
                    className="h-10 w-10 rounded-full border border-[#D6D8D5] object-cover shrink-0"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-[#1F2933]">{f.name}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-800 border border-purple-200">
                        {f.designation}
                      </span>
                      <span className="text-[10px] text-[#667085]">{f.employeeId}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedFaculty(f)}
                  className="p-1 rounded hover:bg-[#F0F1EF] text-[#667085] hover:text-[#1F2933] cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <p className="text-xs text-[#1F2933] font-medium mt-3">{f.department}</p>

              <div className="space-y-1 text-[#667085] text-xs mt-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-3.5 w-3.5 text-[#667085]" />
                  <span className="truncate">Field: {f.specialization}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-[#667085]" />
                  <span>Cabin: {f.officeRoom}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-[#667085]" />
                  <span className="truncate">{f.email}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#D6D8D5] text-xs">
              <div className="bg-[#F7F8F6] p-2 rounded-lg border border-[#D6D8D5]">
                <span className="text-[#667085] block text-[10px]">Publications</span>
                <span className="font-bold text-[#1F2933]">{f.publicationsCount} Papers</span>
              </div>
              <div className="bg-[#F7F8F6] p-2 rounded-lg border border-[#D6D8D5]">
                <span className="text-[#667085] block text-[10px]">Rating</span>
                <span className="font-bold text-[#1F2933] flex items-center gap-1">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {f.rating} / 5.0
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Add Faculty */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md z-[100] p-4">
          <Card className="w-full max-w-lg bg-white border-[#D6D8D5] text-[#1F2933] shadow-xl">
            <CardHeader className="p-4 border-b border-[#D6D8D5] flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-[#1F2933] flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                <span>Add Faculty Member</span>
              </CardTitle>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#667085] hover:text-[#1F2933] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </CardHeader>
            <CardContent className="p-4 space-y-3.5">
              <form onSubmit={handleCreateFaculty} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#1F2933] block mb-1">Full Name *</label>
                    <Input
                      required
                      placeholder="e.g. Dr. Ramesh Rao"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="bg-white border-[#D6D8D5] text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#1F2933] block mb-1">Employee ID *</label>
                    <Input
                      required
                      placeholder="e.g. FAC-CSE-012"
                      value={newEmpId}
                      onChange={(e) => setNewEmpId(e.target.value)}
                      className="bg-white border-[#D6D8D5] text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#1F2933] block mb-1">Designation</label>
                    <select
                      value={newDesignation}
                      onChange={(e) => setNewDesignation(e.target.value as any)}
                      className="w-full rounded-lg bg-white border border-[#D6D8D5] p-2 text-xs text-[#1F2933] cursor-pointer"
                    >
                      <option value="Head of Department">Head of Department</option>
                      <option value="Professor">Professor</option>
                      <option value="Associate Professor">Associate Professor</option>
                      <option value="Assistant Professor">Assistant Professor</option>
                      <option value="Visiting Lecturer">Visiting Lecturer</option>
                    </select>
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

                <div>
                  <label className="text-xs font-semibold text-[#1F2933] block mb-1">Research Specialization</label>
                  <Input
                    placeholder="e.g. Distributed Computing &amp; Machine Learning"
                    value={newSpecialization}
                    onChange={(e) => setNewSpecialization(e.target.value)}
                    className="bg-white border-[#D6D8D5] text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#1F2933] block mb-1">Email</label>
                    <Input
                      type="email"
                      placeholder="faculty@luminous.edu"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="bg-white border-[#D6D8D5] text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#1F2933] block mb-1">Office Room</label>
                    <Input
                      placeholder="e.g. Tech Hall 304"
                      value={newOffice}
                      onChange={(e) => setNewOffice(e.target.value)}
                      className="bg-white border-[#D6D8D5] text-xs"
                    />
                  </div>
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
                    Save Faculty Record
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal: Faculty Profile */}
      {selectedFaculty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md z-[100] p-4">
          <Card className="w-full max-w-lg bg-white border-[#D6D8D5] text-[#1F2933] shadow-xl">
            <CardHeader className="p-4 border-b border-[#D6D8D5] flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedFaculty.avatarUrl}
                  alt={selectedFaculty.name}
                  className="h-12 w-12 rounded-full border border-[#D6D8D5] object-cover"
                />
                <div>
                  <CardTitle className="text-base font-bold text-[#1F2933]">
                    {selectedFaculty.name}
                  </CardTitle>
                  <p className="text-xs text-[#667085]">
                    {selectedFaculty.designation} · {selectedFaculty.department}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedFaculty(null)}
                className="text-[#667085] hover:text-[#1F2933] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </CardHeader>

            <CardContent className="p-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-[#F7F8F6] p-3 rounded-lg border border-[#D6D8D5]">
                <div>
                  <span className="text-[#667085] block text-[10px]">Publications</span>
                  <span className="font-bold text-[#1F2933] text-sm">{selectedFaculty.publicationsCount} Indexed Papers</span>
                </div>
                <div>
                  <span className="text-[#667085] block text-[10px]">Student Rating</span>
                  <span className="font-bold text-amber-700 text-sm flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    {selectedFaculty.rating} / 5.0
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-[#667085]">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-3.5 w-3.5 text-[#1F2933]" />
                  <span>Specialization: <strong className="text-[#1F2933]">{selectedFaculty.specialization}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-[#1F2933]" />
                  <span>Email: {selectedFaculty.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-[#1F2933]" />
                  <span>Office: {selectedFaculty.officeRoom}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-[#1F2933] mb-1.5 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  <span>Courses Currently Taught</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedFaculty.coursesTaught.map((c) => (
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
