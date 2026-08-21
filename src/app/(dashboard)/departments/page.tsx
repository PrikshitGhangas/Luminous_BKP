'use client';

import React, { useState } from 'react';
import { useAcademic } from '@/lib/context/academic-context';
import { useRole } from '@/lib/hooks/use-role';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Landmark,
  Plus,
  Search,
  Users,
  GraduationCap,
  BookOpen,
  DollarSign,
  FlaskConical,
  X,
  ChevronRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Department } from '@/lib/types/academic';

const PIE_COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B'];

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
  const [newBudget, setNewBudget] = useState('$500K');
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
  const totalCourses = departments.reduce((acc, d) => acc + d.coursesCount, 0);
  const totalLabs = departments.reduce((acc, d) => acc + d.labCount, 0);

  // Chart data
  const barChartData = departments.map((d) => ({
    code: d.code,
    students: d.studentCount,
    faculty: d.facultyCount,
  }));

  const pieChartData = departments.map((d) => ({
    name: d.code,
    value: parseInt(d.budget.replace(/[^0-9]/g, '')) * (d.budget.includes('M') ? 1000 : 1),
  }));

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
      description: newDescription || 'Academic department pursuing education and technological research.',
    });

    setNewDeptName('');
    setNewDeptCode('');
    setNewHOD('');
    setNewDescription('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#243356] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F4F1DE] font-mono flex items-center gap-2.5">
            <Landmark className="h-6 w-6 text-[#FFD700]" />
            <span>ACADEMIC DEPARTMENTS</span>
          </h1>
          <p className="text-xs text-[#B8B5A3] mt-1 font-sans">
            Institutional governance, department heads, research lab allocation, and budget oversight
          </p>
        </div>

        {canManage && (
          <Button
            onClick={() => setIsAddModalOpen(true)}
            size="sm"
            className="bg-gradient-to-r from-[#D4AF37] to-[#C5A059] hover:opacity-90 text-[#0B132B] font-bold text-xs gap-1.5 shadow-md shadow-[#D4AF37]/20"
          >
            <Plus className="h-4 w-4" />
            <span>Create Department</span>
          </Button>
        )}
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <Card className="bg-[#0F1026] border-[#243356] text-[#F4F1DE]">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono text-[#C5A059] uppercase tracking-wider">Departments</p>
              <h3 className="text-xl font-bold font-mono mt-0.5 text-[#F4F1DE]">{departments.length}</h3>
            </div>
            <div className="h-9 w-9 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#FFD700]">
              <Landmark className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0F1026] border-[#243356] text-[#F4F1DE]">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono text-[#C5A059] uppercase tracking-wider">Total Students</p>
              <h3 className="text-xl font-bold font-mono mt-0.5 text-[#F4F1DE]">{totalStudents}</h3>
            </div>
            <div className="h-9 w-9 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <GraduationCap className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0F1026] border-[#243356] text-[#F4F1DE]">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono text-[#C5A059] uppercase tracking-wider">Total Faculty</p>
              <h3 className="text-xl font-bold font-mono mt-0.5 text-[#F4F1DE]">{totalFaculty}</h3>
            </div>
            <div className="h-9 w-9 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0F1026] border-[#243356] text-[#F4F1DE]">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono text-[#C5A059] uppercase tracking-wider">Active Courses</p>
              <h3 className="text-xl font-bold font-mono mt-0.5 text-[#F4F1DE]">{totalCourses}</h3>
            </div>
            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <BookOpen className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0F1026] border-[#243356] text-[#F4F1DE] col-span-2 lg:col-span-1">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-mono text-[#C5A059] uppercase tracking-wider">Research Labs</p>
              <h3 className="text-xl font-bold font-mono mt-0.5 text-[#F4F1DE]">{totalLabs}</h3>
            </div>
            <div className="h-9 w-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <FlaskConical className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visual Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#0F1026] border-[#243356] text-[#F4F1DE]">
          <CardHeader className="p-4 pb-2 border-b border-[#243356] bg-[#131C38]/60">
            <CardTitle className="text-xs font-mono font-bold uppercase tracking-wider text-[#FFD700] flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              <span>Student &amp; Faculty Distribution by Department</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData}>
                <XAxis dataKey="code" stroke="#B8B5A3" fontSize={11} />
                <YAxis stroke="#B8B5A3" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B132B', borderColor: '#243356', color: '#F4F1DE' }}
                />
                <Bar dataKey="students" fill="#3B82F6" name="Students" radius={[4, 4, 0, 0]} />
                <Bar dataKey="faculty" fill="#8B5CF6" name="Faculty" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-[#0F1026] border-[#243356] text-[#F4F1DE]">
          <CardHeader className="p-4 pb-2 border-b border-[#243356] bg-[#131C38]/60">
            <CardTitle className="text-xs font-mono font-bold uppercase tracking-wider text-[#FFD700] flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span>Departmental Budget Allocation ($K)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                >
                  {pieChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => `$${val}K`}
                  contentStyle={{ backgroundColor: '#0B132B', borderColor: '#243356', color: '#F4F1DE' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-[#0F1026] p-3 rounded-xl border border-[#243356]">
        <Search className="h-4 w-4 text-[#C5A059] shrink-0" />
        <Input
          placeholder="Search department by name, code, or HOD..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent border-0 text-xs text-[#F4F1DE] placeholder:text-[#B8B5A3]/60 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDepts.map((dept) => (
          <Card
            key={dept.id}
            className="bg-[#0F1026] border-[#243356] hover:border-[#D4AF37]/50 transition-all duration-200 text-[#F4F1DE] flex flex-col justify-between"
          >
            <CardHeader className="p-4 pb-3 border-b border-[#243356] bg-[#131C38]/40 flex flex-row items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-[#D4AF37]/15 text-[#FFD700] border-[#D4AF37]/30 font-mono text-[10px]">
                    {dept.code}
                  </Badge>
                  <span className="text-[10px] text-[#C5A059] font-mono">Estd. {dept.establishedYear}</span>
                </div>
                <h3 className="text-sm font-bold text-[#F4F1DE] mt-1 font-mono">{dept.name}</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedDept(dept)}
                className="h-7 w-7 text-[#B8B5A3] hover:text-[#FFD700] hover:bg-[#1C2541]"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent className="p-4 space-y-3 text-xs flex-1">
              <p className="text-[#B8B5A3] text-[11px] line-clamp-2 leading-relaxed">{dept.description}</p>

              <div className="bg-[#131C38] p-2.5 rounded-lg border border-[#243356] space-y-1">
                <span className="text-[10px] uppercase font-mono text-[#C5A059] block">Head of Department</span>
                <p className="font-bold text-[#F4F1DE]">{dept.headOfDepartment}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="bg-[#1C2541]/50 p-2 rounded border border-[#243356]/60">
                  <span className="text-[#B8B5A3] block text-[9px]">STUDENTS</span>
                  <span className="font-bold text-blue-400 text-sm">{dept.studentCount}</span>
                </div>
                <div className="bg-[#1C2541]/50 p-2 rounded border border-[#243356]/60">
                  <span className="text-[#B8B5A3] block text-[9px]">FACULTY</span>
                  <span className="font-bold text-purple-400 text-sm">{dept.facultyCount}</span>
                </div>
                <div className="bg-[#1C2541]/50 p-2 rounded border border-[#243356]/60">
                  <span className="text-[#B8B5A3] block text-[9px]">COURSES</span>
                  <span className="font-bold text-emerald-400 text-sm">{dept.coursesCount}</span>
                </div>
                <div className="bg-[#1C2541]/50 p-2 rounded border border-[#243356]/60">
                  <span className="text-[#B8B5A3] block text-[9px]">BUDGET</span>
                  <span className="font-bold text-[#FFD700] text-sm">{dept.budget}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Department Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <Card className="w-full max-w-lg bg-[#0F1026] border-[#243356] text-[#F4F1DE]">
            <CardHeader className="p-4 border-b border-[#243356] flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold font-mono text-[#FFD700] flex items-center gap-2">
                <Landmark className="h-4 w-4" />
                <span>Establish New Academic Department</span>
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
            <CardContent className="p-4 space-y-4">
              <form onSubmit={handleCreateDepartment} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-[#C5A059] uppercase block mb-1">
                      Department Code *
                    </label>
                    <Input
                      required
                      placeholder="e.g. BME"
                      value={newDeptCode}
                      onChange={(e) => setNewDeptCode(e.target.value)}
                      className="bg-[#131C38] border-[#243356] text-xs text-[#F4F1DE]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-[#C5A059] uppercase block mb-1">
                      Department Name *
                    </label>
                    <Input
                      required
                      placeholder="e.g. Biomedical Engineering"
                      value={newDeptName}
                      onChange={(e) => setNewDeptName(e.target.value)}
                      className="bg-[#131C38] border-[#243356] text-xs text-[#F4F1DE]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-[#C5A059] uppercase block mb-1">
                    Head of Department (HOD)
                  </label>
                  <Input
                    placeholder="e.g. Dr. Arthur Pendelton"
                    value={newHOD}
                    onChange={(e) => setNewHOD(e.target.value)}
                    className="bg-[#131C38] border-[#243356] text-xs text-[#F4F1DE]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-[#C5A059] uppercase block mb-1">
                      Annual Budget
                    </label>
                    <Input
                      placeholder="$600K"
                      value={newBudget}
                      onChange={(e) => setNewBudget(e.target.value)}
                      className="bg-[#131C38] border-[#243356] text-xs text-[#F4F1DE]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-[#C5A059] uppercase block mb-1">
                      Lab Count
                    </label>
                    <Input
                      type="number"
                      value={newLabs}
                      onChange={(e) => setNewLabs(Number(e.target.value))}
                      className="bg-[#131C38] border-[#243356] text-xs text-[#F4F1DE]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-[#C5A059] uppercase block mb-1">
                      Established Year
                    </label>
                    <Input
                      type="number"
                      value={newEstYear}
                      onChange={(e) => setNewEstYear(Number(e.target.value))}
                      className="bg-[#131C38] border-[#243356] text-xs text-[#F4F1DE]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-[#C5A059] uppercase block mb-1">
                    Department Overview
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Brief description of research focus and academic goals..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full rounded-md bg-[#131C38] border border-[#243356] p-2 text-xs text-[#F4F1DE] focus:outline-none focus:border-[#D4AF37]"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <Card className="w-full max-w-xl bg-[#0F1026] border-[#243356] text-[#F4F1DE]">
            <CardHeader className="p-4 border-b border-[#243356] flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className="bg-[#D4AF37]/20 text-[#FFD700] border-[#D4AF37]/40 font-mono">
                  {selectedDept.code}
                </Badge>
                <CardTitle className="text-sm font-bold font-mono text-[#F4F1DE]">
                  {selectedDept.name}
                </CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedDept(null)}
                className="h-6 w-6 text-[#B8B5A3] hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-xs">
              <p className="text-[#B8B5A3]">{selectedDept.description}</p>

              <div className="grid grid-cols-2 gap-3 bg-[#131C38] p-3 rounded-lg border border-[#243356]">
                <div>
                  <span className="text-[10px] text-[#C5A059] font-mono block uppercase">Head of Dept</span>
                  <span className="font-bold text-[#F4F1DE] text-xs">{selectedDept.headOfDepartment}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#C5A059] font-mono block uppercase">Annual Budget</span>
                  <span className="font-bold text-[#FFD700] text-xs">{selectedDept.budget}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#C5A059] font-mono block uppercase">Established</span>
                  <span className="font-bold text-[#F4F1DE] text-xs">{selectedDept.establishedYear}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#C5A059] font-mono block uppercase">Research Labs</span>
                  <span className="font-bold text-amber-400 text-xs">{selectedDept.labCount} Active Labs</span>
                </div>
              </div>

              <div>
                <h4 className="font-mono text-[11px] text-[#C5A059] uppercase font-bold mb-2">
                  Assigned Faculty Members in Dept
                </h4>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {faculty
                    .filter((f) => f.department.toLowerCase().includes(selectedDept.name.toLowerCase()))
                    .map((f) => (
                      <div
                        key={f.id}
                        className="flex items-center justify-between bg-[#1C2541]/40 p-2 rounded border border-[#243356]"
                      >
                        <div>
                          <span className="font-bold text-[#F4F1DE]">{f.name}</span>
                          <span className="text-[10px] text-[#B8B5A3] block font-mono">{f.employeeId} · {f.officeRoom}</span>
                        </div>
                        <Badge className="bg-purple-500/15 text-purple-300 border-purple-500/30 text-[10px] font-mono">
                          {f.designation}
                        </Badge>
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
