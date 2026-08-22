'use client';

import React, { useState } from 'react';
import { useAcademic } from '@/lib/context/academic-context';
import { useRole } from '@/lib/hooks/use-role';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Landmark,
  Plus,
  Search,
  Users,
  GraduationCap,
  BookOpen,
  FlaskConical,
  X,
  ChevronRight,
} from 'lucide-react';
import { Department } from '@/lib/types/academic';

export default function DepartmentsPage() {
  const { departments, addDepartment, faculty } = useAcademic();
  const { role } = useRole();

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);

  // New Department Form State
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptCode, setNewDeptCode] = useState('');
  const [newHOD, setNewHOD] = useState('');
  const [newBudget, setNewBudget] = useState('₹50 Lakhs');
  const [newLabs, setNewLabs] = useState(4);
  const [newEstYear, setNewEstYear] = useState(2024);
  const [newDescription, setNewDescription] = useState('');

  const canManage = role === 'super_admin' || role === 'admin';

  const filteredDepts = departments.filter(
    (d) =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.headOfDepartment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalFaculty = departments.reduce((acc, d) => acc + d.facultyCount, 0);
  const totalStudents = departments.reduce((acc, d) => acc + d.studentCount, 0);
  const totalLabs = departments.reduce((acc, d) => acc + d.labCount, 0);

  const handleCreateDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName || !newDeptCode) return;

    addDepartment({
      code: newDeptCode.toUpperCase(),
      name: newDeptName,
      headOfDepartment: newHOD || 'Dr. Assigned Chair',
      facultyCount: 12,
      studentCount: 150,
      coursesCount: 10,
      budget: newBudget,
      labCount: Number(newLabs),
      establishedYear: Number(newEstYear),
      description: newDescription || 'Academic department pursuing technical education and research.',
    });

    setNewDeptName('');
    setNewDeptCode('');
    setNewHOD('');
    setNewDescription('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D6D8D5] pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1F2933] flex items-center gap-2">
            <Landmark className="h-6 w-6 text-[#1F2933]" />
            <span>Academic Departments</span>
          </h1>
          <p className="text-xs text-[#667085] mt-0.5">
            Institutional governance, department heads, research laboratories, and budget allocations.
          </p>
        </div>

        {canManage && (
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#1F2933] hover:bg-[#111827] text-white text-xs font-semibold gap-1.5 rounded-lg shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Create Department</span>
          </Button>
        )}
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl border border-[#D6D8D5] bg-white shadow-xs">
          <span className="text-xs text-[#667085]">Active Departments</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-[#1F2933]">{departments.length}</span>
            <span className="text-xs text-[#667085]">Academic divisions</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[#D6D8D5] bg-white shadow-xs">
          <span className="text-xs text-[#667085]">Total Enrolled Students</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-[#1F2933]">{totalStudents}</span>
            <span className="text-xs text-emerald-700 font-medium">{totalFaculty} Faculty Members</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[#D6D8D5] bg-white shadow-xs">
          <span className="text-xs text-[#667085]">Research Laboratories</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-[#1F2933]">{totalLabs}</span>
            <span className="text-xs text-[#667085]">Active specialized labs</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-[#667085]" />
        <Input
          placeholder="Search department by name, code, or Head of Department..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 text-xs border-[#D6D8D5] bg-white rounded-xl shadow-xs"
        />
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDepts.map((dept) => (
          <div
            key={dept.id}
            className="p-4 rounded-xl border border-[#D6D8D5] bg-white shadow-xs hover:border-[#1F2933] transition-all flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-start justify-between gap-2 border-b border-[#D6D8D5] pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-[#F0F1EF] text-[#1F2933] border border-[#D6D8D5]">
                      {dept.code}
                    </span>
                    <span className="text-xs text-[#667085]">Estd. {dept.establishedYear}</span>
                  </div>
                  <h3 className="text-sm font-bold text-[#1F2933] mt-1.5">{dept.name}</h3>
                </div>
                <button
                  onClick={() => setSelectedDept(dept)}
                  className="p-1 rounded hover:bg-[#F0F1EF] text-[#667085] hover:text-[#1F2933] cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <p className="text-[#667085] text-xs line-clamp-2 leading-relaxed mt-2">{dept.description}</p>

              <div className="bg-[#F7F8F6] p-2.5 rounded-lg border border-[#D6D8D5] space-y-0.5 mt-3">
                <span className="text-[11px] text-[#667085] block">Head of Department</span>
                <p className="font-semibold text-xs text-[#1F2933]">{dept.headOfDepartment}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[#D6D8D5]">
              <div className="bg-[#F7F8F6] p-2 rounded-lg border border-[#D6D8D5]">
                <span className="text-[#667085] block text-[10px]">Students</span>
                <span className="font-bold text-[#1F2933]">{dept.studentCount}</span>
              </div>
              <div className="bg-[#F7F8F6] p-2 rounded-lg border border-[#D6D8D5]">
                <span className="text-[#667085] block text-[10px]">Faculty</span>
                <span className="font-bold text-[#1F2933]">{dept.facultyCount}</span>
              </div>
              <div className="bg-[#F7F8F6] p-2 rounded-lg border border-[#D6D8D5]">
                <span className="text-[#667085] block text-[10px]">Courses</span>
                <span className="font-bold text-[#1F2933]">{dept.coursesCount}</span>
              </div>
              <div className="bg-[#F7F8F6] p-2 rounded-lg border border-[#D6D8D5]">
                <span className="text-[#667085] block text-[10px]">Labs</span>
                <span className="font-bold text-[#1F2933]">{dept.labCount} Labs</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Department Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <Card className="w-full max-w-lg bg-white border-[#D6D8D5] text-[#1F2933] shadow-xl">
            <CardHeader className="p-4 border-b border-[#D6D8D5] flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-[#1F2933] flex items-center gap-2">
                <Landmark className="h-4 w-4" />
                <span>Establish Academic Department</span>
              </CardTitle>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#667085] hover:text-[#1F2933] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <form onSubmit={handleCreateDepartment} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#1F2933] block mb-1">
                      Department Code *
                    </label>
                    <Input
                      required
                      placeholder="e.g. BME"
                      value={newDeptCode}
                      onChange={(e) => setNewDeptCode(e.target.value)}
                      className="bg-white border-[#D6D8D5] text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#1F2933] block mb-1">
                      Department Name *
                    </label>
                    <Input
                      required
                      placeholder="e.g. Biomedical Engineering"
                      value={newDeptName}
                      onChange={(e) => setNewDeptName(e.target.value)}
                      className="bg-white border-[#D6D8D5] text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#1F2933] block mb-1">
                    Head of Department (HOD)
                  </label>
                  <Input
                    placeholder="e.g. Dr. Arthur Pendelton"
                    value={newHOD}
                    onChange={(e) => setNewHOD(e.target.value)}
                    className="bg-white border-[#D6D8D5] text-xs"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#1F2933] block mb-1">
                      Annual Budget
                    </label>
                    <Input
                      placeholder="₹50 Lakhs"
                      value={newBudget}
                      onChange={(e) => setNewBudget(e.target.value)}
                      className="bg-white border-[#D6D8D5] text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#1F2933] block mb-1">
                      Lab Count
                    </label>
                    <Input
                      type="number"
                      value={newLabs}
                      onChange={(e) => setNewLabs(Number(e.target.value))}
                      className="bg-white border-[#D6D8D5] text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#1F2933] block mb-1">
                      Established Year
                    </label>
                    <Input
                      type="number"
                      value={newEstYear}
                      onChange={(e) => setNewEstYear(Number(e.target.value))}
                      className="bg-white border-[#D6D8D5] text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#1F2933] block mb-1">
                    Department Overview
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Brief description of research focus and academic goals..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full rounded-lg bg-white border border-[#D6D8D5] p-2 text-xs text-[#1F2933]"
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
                    Save &amp; Create
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Department Detail Modal */}
      {selectedDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <Card className="w-full max-w-xl bg-white border-[#D6D8D5] text-[#1F2933] shadow-xl">
            <CardHeader className="p-4 border-b border-[#D6D8D5] flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-[#F0F1EF] text-[#1F2933]">
                  {selectedDept.code}
                </span>
                <CardTitle className="text-sm font-bold text-[#1F2933]">
                  {selectedDept.name}
                </CardTitle>
              </div>
              <button
                onClick={() => setSelectedDept(null)}
                className="text-[#667085] hover:text-[#1F2933] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-xs">
              <p className="text-[#667085] leading-relaxed">{selectedDept.description}</p>

              <div className="grid grid-cols-2 gap-3 bg-[#F7F8F6] p-3 rounded-lg border border-[#D6D8D5]">
                <div>
                  <span className="text-[11px] text-[#667085] block">Head of Department</span>
                  <span className="font-semibold text-[#1F2933] text-xs">{selectedDept.headOfDepartment}</span>
                </div>
                <div>
                  <span className="text-[11px] text-[#667085] block">Annual Budget</span>
                  <span className="font-semibold text-[#1F2933] text-xs">{selectedDept.budget}</span>
                </div>
                <div>
                  <span className="text-[11px] text-[#667085] block">Established</span>
                  <span className="font-semibold text-[#1F2933] text-xs">{selectedDept.establishedYear}</span>
                </div>
                <div>
                  <span className="text-[11px] text-[#667085] block">Research Laboratories</span>
                  <span className="font-semibold text-emerald-700 text-xs">{selectedDept.labCount} Active Labs</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-[#1F2933] mb-2 flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  <span>Assigned Faculty Members</span>
                </h4>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {faculty
                    .filter((f) => f.department.toLowerCase().includes(selectedDept.name.toLowerCase()))
                    .map((f) => (
                      <div
                        key={f.id}
                        className="flex items-center justify-between bg-[#F7F8F6] p-2 rounded-lg border border-[#D6D8D5]"
                      >
                        <div>
                          <span className="font-semibold text-[#1F2933]">{f.name}</span>
                          <span className="text-[11px] text-[#667085] block">{f.employeeId} · {f.officeRoom}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-800 border border-purple-200">
                          {f.designation}
                        </span>
                      </div>
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
