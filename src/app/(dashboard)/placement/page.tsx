'use client';

import React, { useState } from 'react';
import { useCampusServices } from '@/lib/context/campus-services-context';
import { useRole } from '@/lib/hooks/use-role';
import { useAcademic } from '@/lib/context/academic-context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Award,
  Briefcase,
  Building,
  FileCheck,
  X,
  ExternalLink,
  ShieldCheck,
  Plus,
  Users,
  Search,
  CheckCircle,
  Clock,
  Filter,
} from 'lucide-react';
import { PlacementDrive, PlacementApplication } from '@/lib/types';

export default function PlacementPage() {
  const { user, isSuperAdmin, isAdmin, isFaculty } = useRole();
  const {
    placementCompanies,
    placementDrives,
    placementApplications,
    applyForDrive,
    updatePlacementApplicationStatus,
    createPlacementDrive,
  } = useCampusServices();
  const { students } = useAcademic();

  const isStaff = isSuperAdmin || isAdmin || isFaculty || user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'faculty';

  const [activeTab, setActiveTab] = useState<string>('drives');
  const [selectedDrive, setSelectedDrive] = useState<PlacementDrive | null>(null);
  const [selectedDriveForRoster, setSelectedDriveForRoster] = useState<string>('ALL');
  const [applicantSearch, setApplicantSearch] = useState('');
  const [isAddDriveModalOpen, setIsAddDriveModalOpen] = useState(false);

  // New Drive Form State
  const [newCompany, setNewCompany] = useState('Google DeepMind');
  const [newRole, setNewRole] = useState('');
  const [newCtc, setNewCtc] = useState('₹24.0 LPA');
  const [newLocation, setNewLocation] = useState('Bangalore / Hybrid');
  const [newDriveDate, setNewDriveDate] = useState('2026-10-15');
  const [newDeadline, setNewDeadline] = useState('2026-10-05');
  const [newMinCgpa, setNewMinCgpa] = useState(7.5);
  const [newMaxBacklogs, setNewMaxBacklogs] = useState(0);

  // Active student profile if student is viewing
  const activeStudent = students.find((s) => s.email?.toLowerCase() === user?.email?.toLowerCase()) || students[0] || {
    id: 'std-001',
    name: user?.full_name || 'Aanya Patel',
    rollNumber: 'CS23B042',
    department: 'Computer Science & Engineering',
    cgpa: 9.28,
    activeBacklogs: 0,
  };

  const handleStudentApply = (drive: PlacementDrive) => {
    applyForDrive(
      drive.id,
      activeStudent.name,
      activeStudent.rollNumber,
      activeStudent.cgpa,
      activeStudent.department
    );
    setSelectedDrive(null);
  };

  const handleCreateDriveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany || !newRole) return;

    if (createPlacementDrive) {
      createPlacementDrive({
        driveCode: `DRV-2026-${String(placementDrives.length + 1).padStart(3, '0')}`,
        companyId: placementCompanies.find((c) => c.name === newCompany)?.id || 'comp-custom',
        companyName: newCompany,
        jobRole: newRole,
        ctcPackage: newCtc,
        location: newLocation,
        driveDate: newDriveDate,
        deadlineDate: newDeadline,
        minCgpa: Number(newMinCgpa),
        maxBacklogs: Number(newMaxBacklogs),
        allowedDepartments: ['Computer Science & Engineering', 'Artificial Intelligence & ML', 'Electronics & Comm'],
        status: 'Applications Open',
      });
    }

    setNewRole('');
    setIsAddDriveModalOpen(false);
  };

  // Filtered applicants for Admin roster
  const filteredApplications = placementApplications.filter((app) => {
    const matchesDrive = selectedDriveForRoster === 'ALL' || app.driveId === selectedDriveForRoster;
    const matchesQuery =
      app.studentName.toLowerCase().includes(applicantSearch.toLowerCase()) ||
      app.rollNumber.toLowerCase().includes(applicantSearch.toLowerCase()) ||
      app.companyName.toLowerCase().includes(applicantSearch.toLowerCase()) ||
      app.jobRole.toLowerCase().includes(applicantSearch.toLowerCase());
    return matchesDrive && matchesQuery;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D6D8D5] pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1F2933] flex items-center gap-2">
            <Award className="h-6 w-6 text-[#1F2933]" />
            <span>
              {isStaff ? 'Campus Placement Directorate' : 'Campus Placements Portal'}
            </span>
          </h1>
          <p className="text-xs text-[#667085] mt-0.5">
            {isStaff
              ? 'Administrator & Faculty View: Manage company recruitment drives, applicant rosters, and shortlists.'
              : 'Student View: Browse active placement drives, verify eligibility, and submit job applications.'}
          </p>
        </div>

        {isStaff && (
          <Button
            onClick={() => setIsAddDriveModalOpen(true)}
            className="bg-[#1F2933] hover:bg-[#111827] text-white text-xs font-semibold gap-1.5 rounded-lg shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Post Recruitment Drive</span>
          </Button>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl border border-[#D6D8D5] bg-white shadow-xs">
          <span className="text-xs text-[#667085]">Active Placement Drives</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-[#1F2933]">{placementDrives.length} Drives</span>
            <span className="text-xs text-emerald-700 font-medium">
              {placementCompanies.length} Partner Companies
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[#D6D8D5] bg-white shadow-xs">
          <span className="text-xs text-[#667085]">Highest CTC Package</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-[#1F2933]">₹48.0 LPA</span>
            <span className="text-xs text-[#667085]">Google Research</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-[#D6D8D5] bg-white shadow-xs">
          <span className="text-xs text-[#667085]">Batch Placement Rate</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-[#1F2933]">94.8%</span>
            <span className="text-xs text-emerald-700 font-medium">342 Total Offers</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs (Segmented Pills) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <div className="inline-flex p-1 bg-[#F0F1EF] rounded-full border border-[#D6D8D5] gap-1">
          {isStaff ? (
            // Staff / Admin Tabs
            [
              { id: 'drives', label: 'Recruitment Drives', icon: Briefcase },
              { id: 'applicants', label: 'Applicant Rosters', icon: Users, count: placementApplications.length },
              { id: 'companies', label: 'Corporate Partners', icon: Building },
              { id: 'status', label: 'Placement Statistics', icon: Award },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#1F2933] text-white shadow-xs'
                      : 'text-[#667085] hover:text-[#1F2933]'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-semibold ${isActive ? 'bg-white/20 text-white' : 'bg-[#E8E9E7] text-[#1F2933]'}`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })
          ) : (
            // Student Tabs
            [
              { id: 'drives', label: 'Open Drives', icon: Briefcase },
              { id: 'applications', label: 'My Applications', icon: FileCheck, count: placementApplications.length },
              { id: 'eligibility', label: 'Eligibility Check', icon: ShieldCheck },
              { id: 'companies', label: 'Corporate Partners', icon: Building },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#1F2933] text-white shadow-xs'
                      : 'text-[#667085] hover:text-[#1F2933]'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-semibold ${isActive ? 'bg-white/20 text-white' : 'bg-[#E8E9E7] text-[#1F2933]'}`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* TAB: RECRUITMENT DRIVES */}
      {activeTab === 'drives' && (
        <div className="space-y-3">
          {placementDrives.map((d) => {
            const driveApps = placementApplications.filter((a) => a.driveId === d.id);
            const isApplied = driveApps.some((a) => a.rollNumber === activeStudent.rollNumber);
            const isEligible = activeStudent.cgpa >= d.minCgpa && (activeStudent.activeBacklogs || 0) <= d.maxBacklogs;

            return (
              <div
                key={d.id}
                className="p-4 rounded-xl border border-[#D6D8D5] bg-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-sm text-[#1F2933]">{d.companyName}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {d.ctcPackage}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F0F1EF] text-[#1F2933] border border-[#D6D8D5]">
                      {d.driveCode}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                      {d.status}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-[#1F2933]">{d.jobRole}</p>
                  <p className="text-[#667085] text-xs">
                    Drive Date: <strong className="text-[#1F2933]">{d.driveDate}</strong> · Deadline: <strong className="text-[#1F2933]">{d.deadlineDate}</strong> · Location: {d.location}
                  </p>
                  <p className="text-[#667085] text-[11px]">
                    Criteria: Min CGPA {d.minCgpa} · Max Backlogs: {d.maxBacklogs} · Eligible Depts: {d.allowedDepartments?.join(', ')}
                  </p>
                </div>

                <div className="flex flex-col sm:items-end gap-2 shrink-0">
                  {isStaff ? (
                    // Admin Action: View & Manage Applicants Roster
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedDriveForRoster(d.id);
                        setActiveTab('applicants');
                      }}
                      className="bg-[#1F2933] hover:bg-[#111827] text-white font-semibold text-xs rounded-lg cursor-pointer flex items-center gap-1.5"
                    >
                      <Users className="h-3.5 w-3.5" />
                      <span>Manage Applicants ({driveApps.length})</span>
                    </Button>
                  ) : (
                    // Student Action: Check & Apply
                    isApplied ? (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200">
                         Application Submitted
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => setSelectedDrive(d)}
                        className="bg-[#1F2933] hover:bg-[#111827] text-white font-semibold text-xs rounded-lg cursor-pointer"
                      >
                        <span>Check Eligibility &amp; Apply</span>
                      </Button>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB: APPLICANTS ROSTER (Admin View) */}
      {isStaff && activeTab === 'applicants' && (
        <div className="space-y-4">
          {/* Controls: Search and Drive Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#667085]" />
              <Input
                placeholder="Search applicants by name, roll number, or role..."
                value={applicantSearch}
                onChange={(e) => setApplicantSearch(e.target.value)}
                className="pl-9 text-xs border-[#D6D8D5] bg-white rounded-xl shadow-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[#667085] whitespace-nowrap">Filter Drive:</span>
              <select
                value={selectedDriveForRoster}
                onChange={(e) => setSelectedDriveForRoster(e.target.value)}
                className="text-xs bg-white border border-[#D6D8D5] rounded-xl px-3 py-2 text-[#1F2933] shadow-xs cursor-pointer focus:outline-none"
              >
                <option value="ALL">All Drives ({placementApplications.length})</option>
                {placementDrives.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.companyName} — {d.jobRole}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Applicant Roster List */}
          <div className="space-y-3">
            {filteredApplications.length === 0 ? (
              <div className="p-12 text-center text-xs text-[#667085] bg-white border border-[#D6D8D5] rounded-xl shadow-xs">
                No student applications found matching the selected criteria.
              </div>
            ) : (
              filteredApplications.map((app) => (
                <div
                  key={app.id}
                  className="p-4 rounded-xl border border-[#D6D8D5] bg-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#1F2933]">{app.studentName}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F0F1EF] text-[#1F2933] border border-[#D6D8D5]">
                        {app.rollNumber}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                        CGPA {app.cgpa}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-[#1F2933]">
                      Applied for: {app.companyName} — {app.jobRole}
                    </p>
                    <p className="text-[#667085] text-xs">
                      Department: {app.department} · Applied: {new Date(app.appliedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <span className="text-xs text-[#667085] mr-1">Status:</span>
                    <select
                      value={app.status}
                      onChange={(e) => {
                        if (updatePlacementApplicationStatus) {
                          updatePlacementApplicationStatus(app.id, e.target.value as PlacementApplication['status']);
                        }
                      }}
                      className="text-xs font-medium bg-[#F7F8F6] border border-[#D6D8D5] rounded-lg px-2.5 py-1 text-[#1F2933] cursor-pointer"
                    >
                      <option value="Applied">Applied</option>
                      <option value="Shortlisted">Shortlisted</option>
                      <option value="Interview Scheduled">Interview Scheduled</option>
                      <option value="Offered">Offered</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB: MY APPLICATIONS (Student View) */}
      {!isStaff && activeTab === 'applications' && (
        <div className="space-y-3">
          {placementApplications.map((app) => (
            <div
              key={app.id}
              className="p-4 rounded-xl border border-[#D6D8D5] bg-white shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[#1F2933]">{app.companyName}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F0F1EF] text-[#1F2933] border border-[#D6D8D5]">
                    {app.jobRole}
                  </span>
                </div>
                <p className="text-[#667085] text-xs">
                  Applicant: {app.studentName} ({app.rollNumber}) · CGPA: {app.cgpa}
                </p>
                <p className="text-[11px] text-[#667085]">Applied on: {new Date(app.appliedAt).toLocaleDateString()}</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 self-start sm:self-center">
                {app.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* TAB: ELIGIBILITY CHECKER (Student View) */}
      {!isStaff && activeTab === 'eligibility' && (
        <div className="p-5 rounded-xl border border-[#D6D8D5] bg-white shadow-xs space-y-4">
          <div>
            <h2 className="text-sm font-bold text-[#1F2933] flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              <span>Academic Eligibility Engine</span>
            </h2>
            <p className="text-xs text-[#667085] mt-0.5">Automated screening against minimum CGPA and active backlog rules.</p>
          </div>

          <div className="bg-[#F7F8F6] p-3 rounded-lg border border-[#D6D8D5] space-y-1 text-xs">
            <span className="font-semibold text-[#1F2933]">Verified Student Profile:</span>
            <p className="text-xs text-[#667085]">
              {activeStudent.name} ({activeStudent.rollNumber}) · Department: {activeStudent.department}
            </p>
            <p className="text-xs text-[#1F2933] font-medium">
              CGPA: {activeStudent.cgpa} / 10.0 · Active Backlogs: {activeStudent.activeBacklogs || 0}
            </p>
          </div>

          <div className="space-y-2">
            {placementDrives.map((d) => {
              const isEligible = activeStudent.cgpa >= d.minCgpa && (activeStudent.activeBacklogs || 0) <= d.maxBacklogs;
              return (
                <div key={d.id} className="p-3 rounded-lg bg-white border border-[#D6D8D5] flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-[#1F2933]">{d.companyName} — {d.jobRole}</span>
                    <p className="text-xs text-[#667085]">Requirement: Min CGPA {d.minCgpa} · Max Backlogs: {d.maxBacklogs}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${isEligible ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                    {isEligible ? 'Eligible' : 'Ineligible'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB: CORPORATE PARTNERS */}
      {activeTab === 'companies' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {placementCompanies.map((c) => (
            <div key={c.id} className="p-4 rounded-xl border border-[#D6D8D5] bg-white shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-[#D6D8D5] pb-2">
                <div>
                  <h3 className="text-sm font-bold text-[#1F2933]">{c.name}</h3>
                  <p className="text-xs text-[#667085] mt-0.5">{c.industry}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
                  {c.tier}
                </span>
              </div>
              <div className="text-xs">
                <a
                  href={c.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#1F2933] hover:underline flex items-center gap-1 text-xs font-medium"
                >
                  <span>{c.website}</span>
                  <ExternalLink className="h-3 w-3 text-[#667085]" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB: PLACEMENT STATISTICS */}
      {activeTab === 'status' && (
        <div className="p-5 rounded-xl border border-[#D6D8D5] bg-white shadow-xs space-y-4">
          <div>
            <h2 className="text-sm font-bold text-[#1F2933] flex items-center gap-2">
              <Award className="h-4 w-4" />
              <span>Graduating Class Placement Statistics</span>
            </h2>
            <p className="text-xs text-[#667085] mt-0.5">Recruitment outcomes for the graduating batch.</p>
          </div>

          <div className="grid grid-cols-3 gap-3 bg-[#F7F8F6] p-4 rounded-lg border border-[#D6D8D5] text-center text-xs">
            <div>
              <span className="text-[#667085] block text-[11px]">Total Offers</span>
              <span className="font-bold text-[#1F2933] text-base">342</span>
            </div>
            <div>
              <span className="text-[#667085] block text-[11px]">Highest CTC</span>
              <span className="font-bold text-emerald-700 text-base">₹48.0 LPA</span>
            </div>
            <div>
              <span className="text-[#667085] block text-[11px]">Average CTC</span>
              <span className="font-bold text-[#1F2933] text-base">₹14.2 LPA</span>
            </div>
          </div>
        </div>
      )}

      {/* Modal: POST RECRUITMENT DRIVE (Admin View) */}
      {isAddDriveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <Card className="w-full max-w-lg bg-white border-[#D6D8D5] text-[#1F2933] shadow-xl">
            <CardHeader className="p-4 border-b border-[#D6D8D5] flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-[#1F2933] flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                <span>Establish New Recruitment Drive</span>
              </CardTitle>
              <button
                onClick={() => setIsAddDriveModalOpen(false)}
                className="text-[#667085] hover:text-[#1F2933] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <form onSubmit={handleCreateDriveSubmit} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#1F2933] block mb-1">Company *</label>
                    <select
                      value={newCompany}
                      onChange={(e) => setNewCompany(e.target.value)}
                      className="w-full rounded-lg bg-white border border-[#D6D8D5] p-2 text-xs text-[#1F2933] cursor-pointer"
                    >
                      {placementCompanies.map((c) => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#1F2933] block mb-1">Job Role *</label>
                    <Input
                      required
                      placeholder="e.g. Software Engineer"
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="bg-white border-[#D6D8D5] text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#1F2933] block mb-1">CTC Package *</label>
                    <Input
                      placeholder="₹24.0 LPA"
                      value={newCtc}
                      onChange={(e) => setNewCtc(e.target.value)}
                      className="bg-white border-[#D6D8D5] text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#1F2933] block mb-1">Location *</label>
                    <Input
                      placeholder="Bangalore / Hybrid"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      className="bg-white border-[#D6D8D5] text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#1F2933] block mb-1">Drive Date</label>
                    <Input
                      type="date"
                      value={newDriveDate}
                      onChange={(e) => setNewDriveDate(e.target.value)}
                      className="bg-white border-[#D6D8D5] text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#1F2933] block mb-1">Application Deadline</label>
                    <Input
                      type="date"
                      value={newDeadline}
                      onChange={(e) => setNewDeadline(e.target.value)}
                      className="bg-white border-[#D6D8D5] text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#1F2933] block mb-1">Min CGPA Required</label>
                    <Input
                      type="number"
                      step="0.1"
                      value={newMinCgpa}
                      onChange={(e) => setNewMinCgpa(Number(e.target.value))}
                      className="bg-white border-[#D6D8D5] text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#1F2933] block mb-1">Max Active Backlogs</label>
                    <Input
                      type="number"
                      value={newMaxBacklogs}
                      onChange={(e) => setNewMaxBacklogs(Number(e.target.value))}
                      className="bg-white border-[#D6D8D5] text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#D6D8D5]">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddDriveModalOpen(false)}
                    className="text-xs cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-[#1F2933] hover:bg-[#111827] text-white font-semibold text-xs cursor-pointer"
                  >
                    Establish Drive
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal: STUDENT APPLY FOR DRIVE (Student View) */}
      {!isStaff && selectedDrive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <Card className="w-full max-w-md bg-white border-[#D6D8D5] text-[#1F2933] shadow-xl">
            <CardHeader className="p-4 border-b border-[#D6D8D5] flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-[#1F2933] flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                <span>{selectedDrive.companyName} Application</span>
              </CardTitle>
              <button
                onClick={() => setSelectedDrive(null)}
                className="text-[#667085] hover:text-[#1F2933] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-xs">
              <div className="bg-[#F7F8F6] p-3 rounded-lg border border-[#D6D8D5] space-y-1">
                <p className="font-bold text-sm text-[#1F2933]">{selectedDrive.jobRole}</p>
                <p className="text-emerald-700 font-semibold">CTC Package: {selectedDrive.ctcPackage}</p>
                <p className="text-[#667085] text-xs">Location: {selectedDrive.location}</p>
              </div>

              <div className="space-y-1 text-xs text-[#667085]">
                <p className="text-[#1F2933] font-semibold">Eligibility Verification:</p>
                <p>• Min Required CGPA: {selectedDrive.minCgpa} (Your CGPA: <strong className="text-emerald-700">{activeStudent.cgpa}</strong> )</p>
                <p>• Max Backlogs: {selectedDrive.maxBacklogs} (Your Backlogs: <strong className="text-emerald-700">{activeStudent.activeBacklogs || 0}</strong> )</p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#D6D8D5]">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDrive(null)}
                  className="text-xs cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleStudentApply(selectedDrive)}
                  className="bg-[#1F2933] hover:bg-[#111827] text-white font-semibold text-xs cursor-pointer"
                >
                  Confirm &amp; Submit Application
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
