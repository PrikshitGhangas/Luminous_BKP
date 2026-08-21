'use client';

import React, { useState } from 'react';
import { useCampusServices } from '@/lib/context/campus-services-context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/shared/stat-card';
import {
  Award,
  Briefcase,
  Building,
  DollarSign,
  FileCheck,
  X,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { PlacementDrive } from '@/lib/types';

export default function PlacementPage() {
  const {
    placementCompanies,
    placementDrives,
    placementApplications,
    applyForDrive,
  } = useCampusServices();

  const [activeTab, setActiveTab] = useState<'drives' | 'companies' | 'applications' | 'eligibility' | 'status'>('drives');
  const [selectedDrive, setSelectedDrive] = useState<PlacementDrive | null>(null);

  // Student profile mock for eligibility check
  const studentProfile = {
    name: 'Aanya Patel',
    rollNumber: 'CS23B042',
    department: 'Computer Science & Engineering',
    cgpa: 9.28,
    activeBacklogs: 0,
  };

  const handleApplyClick = (drive: PlacementDrive) => {
    applyForDrive(
      drive.id,
      studentProfile.name,
      studentProfile.rollNumber,
      studentProfile.cgpa,
      studentProfile.department
    );
    setSelectedDrive(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#243356] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F4F1DE] font-mono flex items-center gap-2.5">
            <Award className="h-6 w-6 text-[#FFD700]" />
            <span>CAMPUS PLACEMENTS &amp; CORPORATE CAREER CELL</span>
          </h1>
          <p className="text-xs text-[#B8B5A3] mt-1 font-sans">
            Recruitment drives, company eligibility criteria, salary CTC packages, job applications, and placement metrics
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <StatCard
          title="Active Drives"
          value={placementDrives.length.toString()}
          description="Open for Student Applications"
          icon={<Briefcase className="h-5 w-5" />}
          variant="primary"
        />
        <StatCard
          title="Top CTC Package"
          value="$180,000 / yr"
          description="Google DeepMind (AI Research)"
          icon={<DollarSign className="h-5 w-5" />}
          variant="success"
        />
        <StatCard
          title="Partner Companies"
          value={placementCompanies.length.toString()}
          description="Marquee &amp; Tech Giants"
          icon={<Building className="h-5 w-5" />}
          variant="warning"
        />
        <StatCard
          title="Placement Rate"
          value="94.8%"
          description="Batch 2026 Graduating Class"
          icon={<Award className="h-5 w-5" />}
          variant="primary"
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#243356] pb-2 overflow-x-auto">
        {[
          { id: 'drives', label: 'Recruitment Drives', icon: Briefcase },
          { id: 'companies', label: 'Corporate Partners', icon: Building },
          { id: 'applications', label: 'My Applications', icon: FileCheck, count: placementApplications.length },
          { id: 'eligibility', label: 'Eligibility Engine', icon: ShieldCheck },
          { id: 'status', label: 'Placement Statistics', icon: Award },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[#D4AF37] text-[#0B132B] shadow-md shadow-[#D4AF37]/20'
                  : 'bg-[#0F1026] text-[#B8B5A3] border border-[#243356] hover:text-white hover:border-[#D4AF37]/50'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold ${isActive ? 'bg-[#0B132B] text-[#FFD700]' : 'bg-[#1C2541] text-[#FFD700]'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: RECRUITMENT DRIVES */}
      {activeTab === 'drives' && (
        <div className="space-y-3">
          {placementDrives.map((d) => {
            const isApplied = placementApplications.some((a) => a.driveId === d.id);
            const isEligible = studentProfile.cgpa >= d.minCgpa && studentProfile.activeBacklogs <= d.maxBacklogs;

            return (
              <Card key={d.id} className="bg-[#0F1026] border-[#243356] text-[#F4F1DE]">
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-[#F4F1DE] font-sans">{d.companyName}</span>
                      <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30 text-[10px] font-bold">
                        {d.ctcPackage}
                      </Badge>
                      <Badge className="bg-[#1C2541] text-[#FFD700] border-[#243356] text-[10px]">
                        {d.driveCode}
                      </Badge>
                      {isEligible ? (
                        <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30 text-[9px]">
                          Eligible
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-500/15 text-amber-300 border-amber-500/30 text-[9px]">
                          Min CGPA: {d.minCgpa}
                        </Badge>
                      )}
                    </div>

                    <p className="text-[#FFD700] font-sans text-xs font-bold">{d.jobRole}</p>
                    <p className="text-[#B8B5A3] text-[11px]">
                      Drive Date: {d.driveDate} · Application Deadline: <strong className="text-amber-300">{d.deadlineDate}</strong>
                    </p>
                    <p className="text-[#B8B5A3] text-[11px]">Location: {d.location}</p>
                  </div>

                  <div className="flex flex-col sm:items-end gap-2 shrink-0">
                    {isApplied ? (
                      <Badge className="bg-purple-500/15 text-purple-300 border-purple-500/30 font-bold px-3 py-1">
                        ✓ APPLICATION SUBMITTED
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => setSelectedDrive(d)}
                        className="bg-[#D4AF37] hover:bg-[#C5A059] text-[#0B132B] font-bold text-xs gap-1"
                      >
                        <span>Check Eligibility &amp; Apply</span>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* TAB 2: CORPORATE PARTNERS */}
      {activeTab === 'companies' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {placementCompanies.map((c) => (
            <Card key={c.id} className="bg-[#0F1026] border-[#243356] text-[#F4F1DE]">
              <CardHeader className="p-4 border-b border-[#243356] bg-[#131C38]/60 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold font-mono text-[#F4F1DE]">{c.name}</CardTitle>
                  <p className="text-[11px] font-mono text-[#C5A059] mt-0.5">{c.industry}</p>
                </div>
                <Badge className="bg-indigo-500/15 text-indigo-300 border-indigo-500/30 font-mono text-[10px]">
                  {c.tier}
                </Badge>
              </CardHeader>
              <CardContent className="p-4 text-xs font-mono">
                <a
                  href={c.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#FFD700] hover:underline flex items-center gap-1 text-[11px]"
                >
                  <span>{c.website}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* TAB 3: MY APPLICATIONS */}
      {activeTab === 'applications' && (
        <div className="space-y-3">
          {placementApplications.map((app) => (
            <Card key={app.id} className="bg-[#0F1026] border-[#243356] text-[#F4F1DE]">
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#F4F1DE] font-sans">{app.companyName}</span>
                    <Badge className="bg-[#1C2541] text-[#FFD700] border-[#243356] text-[10px]">
                      {app.jobRole}
                    </Badge>
                  </div>
                  <p className="text-[#B8B5A3] text-[11px]">
                    Applicant: {app.studentName} ({app.rollNumber}) · CGPA: {app.cgpa}
                  </p>
                  <p className="text-[10px] text-[#C5A059]">Applied on: {new Date(app.appliedAt).toLocaleDateString()}</p>
                </div>
                <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30 font-bold self-start sm:self-center">
                  {app.status}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* TAB 4: ELIGIBILITY ENGINE */}
      {activeTab === 'eligibility' && (
        <Card className="bg-[#0F1026] border-[#243356] text-[#F4F1DE]">
          <CardHeader className="p-4 border-b border-[#243356] bg-[#131C38]/60">
            <CardTitle className="text-xs font-mono font-bold uppercase tracking-wider text-[#FFD700] flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              <span>Automated Academic Eligibility Engine</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4 text-xs font-mono">
            <div className="bg-[#131C38] p-3 rounded-lg border border-[#243356] space-y-1">
              <span className="font-bold text-[#F4F1DE]">Active Student Profile Verified:</span>
              <p className="text-[11px] text-[#B8B5A3]">
                {studentProfile.name} ({studentProfile.rollNumber}) · Department: {studentProfile.department}
              </p>
              <p className="text-[#FFD700] text-[11px] font-bold">
                CGPA: {studentProfile.cgpa} / 10.0 · Active Backlogs: {studentProfile.activeBacklogs}
              </p>
            </div>

            <div className="space-y-2">
              {placementDrives.map((d) => {
                const isEligible = studentProfile.cgpa >= d.minCgpa && studentProfile.activeBacklogs <= d.maxBacklogs;
                return (
                  <div key={d.id} className="p-3 rounded-lg bg-[#131C38] border border-[#243356] flex justify-between items-center">
                    <div>
                      <span className="font-bold text-[#F4F1DE]">{d.companyName} — {d.jobRole}</span>
                      <p className="text-[10px] text-[#B8B5A3]">Requirement: Min CGPA {d.minCgpa} · Max Backlogs: {d.maxBacklogs}</p>
                    </div>
                    <Badge className={isEligible ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : 'bg-red-500/15 text-red-300 border-red-500/30'}>
                      {isEligible ? 'ELIGIBLE TO APPLY' : 'INELIGIBLE'}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 5: PLACEMENT STATISTICS */}
      {activeTab === 'status' && (
        <Card className="bg-[#0F1026] border-[#243356] text-[#F4F1DE]">
          <CardHeader className="p-4 border-b border-[#243356] bg-[#131C38]/60">
            <CardTitle className="text-xs font-mono font-bold uppercase tracking-wider text-[#FFD700] flex items-center gap-2">
              <Award className="h-4 w-4" />
              <span>Graduating Class Placement Statistics &amp; Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-xs font-mono">
            <div className="grid grid-cols-3 gap-3 bg-[#131C38] p-3 rounded-lg border border-[#243356] text-center">
              <div>
                <span className="text-[10px] text-[#C5A059] block">TOTAL OFFERS</span>
                <span className="font-bold text-[#F4F1DE] text-base">342</span>
              </div>
              <div>
                <span className="text-[10px] text-[#C5A059] block">HIGHEST CTC</span>
                <span className="font-bold text-emerald-400 text-base">$180,000</span>
              </div>
              <div>
                <span className="text-[10px] text-[#C5A059] block">AVERAGE CTC</span>
                <span className="font-bold text-[#FFD700] text-base">$112,000</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal: DRIVE ELIGIBILITY CHECK & APPLY */}
      {selectedDrive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <Card className="w-full max-w-md bg-[#0F1026] border-[#243356] text-[#F4F1DE]">
            <CardHeader className="p-4 border-b border-[#243356] flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold font-mono text-[#FFD700] flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                <span>{selectedDrive.companyName} — Application Verification</span>
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedDrive(null)}
                className="h-6 w-6 text-[#B8B5A3] hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-xs font-mono">
              <div className="bg-[#131C38] p-3 rounded-lg border border-[#243356] space-y-1">
                <p className="font-bold text-sm text-[#F4F1DE] font-sans">{selectedDrive.jobRole}</p>
                <p className="text-emerald-400 font-bold">CTC Package: {selectedDrive.ctcPackage}</p>
                <p className="text-[#B8B5A3] text-[11px]">Location: {selectedDrive.location}</p>
              </div>

              <div className="space-y-1 text-[11px] text-[#B8B5A3]">
                <p className="text-[#C5A059] font-bold">Eligibility Rule Verification:</p>
                <p>• Min Required CGPA: {selectedDrive.minCgpa} (Your CGPA: <strong className="text-emerald-400">{studentProfile.cgpa}</strong> ✓)</p>
                <p>• Max Backlogs: {selectedDrive.maxBacklogs} (Your Backlogs: <strong className="text-emerald-400">{studentProfile.activeBacklogs}</strong> ✓)</p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#243356]">
                <Button
                  variant="outline"
                  onClick={() => setSelectedDrive(null)}
                  className="text-xs border-[#243356]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleApplyClick(selectedDrive)}
                  className="bg-[#D4AF37] hover:bg-[#C5A059] text-[#0B132B] font-bold text-xs"
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
