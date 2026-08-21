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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D0D1D6] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#202226] font-mono flex items-center gap-2.5">
            <Award className="h-6 w-6 text-[#B45309]" />
            <span>CAMPUS PLACEMENTS &amp; CORPORATE CAREER CELL</span>
          </h1>
          <p className="text-xs text-[#555960] mt-1 font-sans">
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
      <div className="flex items-center gap-2 border-b border-[#D0D1D6] pb-2 overflow-x-auto">
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
                  ? 'bg-[#EAB308] text-[#0B132B] shadow-md shadow-[#D4AF37]/20'
                  : 'bg-[#F4F5F6] text-[#555960] border border-[#D0D1D6] hover:text-white hover:border-[#EAB308]/50'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-bold ${isActive ? 'bg-white text-[#B45309]' : 'bg-[#E7E8EB] text-[#B45309]'}`}>
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
              <Card key={d.id} className="bg-[#F4F5F6] border-[#D0D1D6] text-[#202226]">
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-[#202226] font-sans">{d.companyName}</span>
                      <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30 text-[10px] font-bold">
                        {d.ctcPackage}
                      </Badge>
                      <Badge className="bg-[#E7E8EB] text-[#B45309] border-[#D0D1D6] text-[10px]">
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

                    <p className="text-[#B45309] font-sans text-xs font-bold">{d.jobRole}</p>
                    <p className="text-[#555960] text-[11px]">
                      Drive Date: {d.driveDate} · Application Deadline: <strong className="text-amber-300">{d.deadlineDate}</strong>
                    </p>
                    <p className="text-[#555960] text-[11px]">Location: {d.location}</p>
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
                        className="bg-[#EAB308] hover:bg-[#D4AF37] text-[#0B132B] font-bold text-xs gap-1"
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
            <Card key={c.id} className="bg-[#F4F5F6] border-[#D0D1D6] text-[#202226]">
              <CardHeader className="p-4 border-b border-[#D0D1D6] bg-white/60 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold font-mono text-[#202226]">{c.name}</CardTitle>
                  <p className="text-[11px] font-mono text-[#B45309] mt-0.5">{c.industry}</p>
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
                  className="text-[#B45309] hover:underline flex items-center gap-1 text-[11px]"
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
            <Card key={app.id} className="bg-[#F4F5F6] border-[#D0D1D6] text-[#202226]">
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#202226] font-sans">{app.companyName}</span>
                    <Badge className="bg-[#E7E8EB] text-[#B45309] border-[#D0D1D6] text-[10px]">
                      {app.jobRole}
                    </Badge>
                  </div>
                  <p className="text-[#555960] text-[11px]">
                    Applicant: {app.studentName} ({app.rollNumber}) · CGPA: {app.cgpa}
                  </p>
                  <p className="text-[10px] text-[#B45309]">Applied on: {new Date(app.appliedAt).toLocaleDateString()}</p>
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
        <Card className="bg-[#F4F5F6] border-[#D0D1D6] text-[#202226]">
          <CardHeader className="p-4 border-b border-[#D0D1D6] bg-white/60">
            <CardTitle className="text-xs font-mono font-bold uppercase tracking-wider text-[#B45309] flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              <span>Automated Academic Eligibility Engine</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4 text-xs font-mono">
            <div className="bg-white p-3 rounded-lg border border-[#D0D1D6] space-y-1">
              <span className="font-bold text-[#202226]">Active Student Profile Verified:</span>
              <p className="text-[11px] text-[#555960]">
                {studentProfile.name} ({studentProfile.rollNumber}) · Department: {studentProfile.department}
              </p>
              <p className="text-[#B45309] text-[11px] font-bold">
                CGPA: {studentProfile.cgpa} / 10.0 · Active Backlogs: {studentProfile.activeBacklogs}
              </p>
            </div>

            <div className="space-y-2">
              {placementDrives.map((d) => {
                const isEligible = studentProfile.cgpa >= d.minCgpa && studentProfile.activeBacklogs <= d.maxBacklogs;
                return (
                  <div key={d.id} className="p-3 rounded-lg bg-white border border-[#D0D1D6] flex justify-between items-center">
                    <div>
                      <span className="font-bold text-[#202226]">{d.companyName} — {d.jobRole}</span>
                      <p className="text-[10px] text-[#555960]">Requirement: Min CGPA {d.minCgpa} · Max Backlogs: {d.maxBacklogs}</p>
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
        <Card className="bg-[#F4F5F6] border-[#D0D1D6] text-[#202226]">
          <CardHeader className="p-4 border-b border-[#D0D1D6] bg-white/60">
            <CardTitle className="text-xs font-mono font-bold uppercase tracking-wider text-[#B45309] flex items-center gap-2">
              <Award className="h-4 w-4" />
              <span>Graduating Class Placement Statistics &amp; Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3 text-xs font-mono">
            <div className="grid grid-cols-3 gap-3 bg-white p-3 rounded-lg border border-[#D0D1D6] text-center">
              <div>
                <span className="text-[10px] text-[#B45309] block">TOTAL OFFERS</span>
                <span className="font-bold text-[#202226] text-base">342</span>
              </div>
              <div>
                <span className="text-[10px] text-[#B45309] block">HIGHEST CTC</span>
                <span className="font-bold text-emerald-400 text-base">$180,000</span>
              </div>
              <div>
                <span className="text-[10px] text-[#B45309] block">AVERAGE CTC</span>
                <span className="font-bold text-[#B45309] text-base">$112,000</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal: DRIVE ELIGIBILITY CHECK & APPLY */}
      {selectedDrive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <Card className="w-full max-w-md bg-[#F4F5F6] border-[#D0D1D6] text-[#202226]">
            <CardHeader className="p-4 border-b border-[#D0D1D6] flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold font-mono text-[#B45309] flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                <span>{selectedDrive.companyName} — Application Verification</span>
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedDrive(null)}
                className="h-6 w-6 text-[#555960] hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-xs font-mono">
              <div className="bg-white p-3 rounded-lg border border-[#D0D1D6] space-y-1">
                <p className="font-bold text-sm text-[#202226] font-sans">{selectedDrive.jobRole}</p>
                <p className="text-emerald-400 font-bold">CTC Package: {selectedDrive.ctcPackage}</p>
                <p className="text-[#555960] text-[11px]">Location: {selectedDrive.location}</p>
              </div>

              <div className="space-y-1 text-[11px] text-[#555960]">
                <p className="text-[#B45309] font-bold">Eligibility Rule Verification:</p>
                <p>• Min Required CGPA: {selectedDrive.minCgpa} (Your CGPA: <strong className="text-emerald-400">{studentProfile.cgpa}</strong> ✓)</p>
                <p>• Max Backlogs: {selectedDrive.maxBacklogs} (Your Backlogs: <strong className="text-emerald-400">{studentProfile.activeBacklogs}</strong> ✓)</p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#D0D1D6]">
                <Button
                  variant="outline"
                  onClick={() => setSelectedDrive(null)}
                  className="text-xs border-[#D0D1D6]"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleApplyClick(selectedDrive)}
                  className="bg-[#EAB308] hover:bg-[#D4AF37] text-[#0B132B] font-bold text-xs"
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
