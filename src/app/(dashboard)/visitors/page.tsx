'use client';

import React, { useState } from 'react';
import { useCampusServices } from '@/lib/context/campus-services-context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Plus,
  QrCode,
  CheckCircle2,
  ShieldCheck,
  Search,
  Check,
  X,
  LogOut,
  LogIn,
  UserCheck,
} from 'lucide-react';
import { VisitorPass } from '@/lib/types';

export default function VisitorsPage() {
  const {
    visitorPasses,
    submitVisitorRequest,
    approveVisitorHost,
    rejectVisitorHost,
    approveVisitorSecurity,
    checkInVisitorGate,
    checkOutVisitorGate,
  } = useCampusServices();
  const [activeTab, setActiveTab] = useState<'passes' | 'request' | 'host_approvals' | 'security_clearance'>('passes');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Selected Pass for Digital QR Badge Modal
  const [selectedPass, setSelectedPass] = useState<VisitorPass | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  // Form State
  const [vName, setVName] = useState('');
  const [vPhone, setVPhone] = useState('');
  const [vCompany, setVCompany] = useState('');
  const [vPurpose, setVPurpose] = useState('');
  const [vHostName, setVHostName] = useState('Prof. Sarah Jenkins');
  const [vHostDept, setVHostDept] = useState('Computer Science & Engineering');
  const [vBuilding, setVBuilding] = useState('Main Academic Block A');
  const [vDate, setVDate] = useState('2026-08-22');
  const [vTime, setVTime] = useState('10:00 AM - 01:00 PM');
  const [vVehicle, setVVehicle] = useState('');

  const filteredPasses = visitorPasses.filter((vp) => {
    const matchesSearch =
      vp.visitor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vp.pass_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vp.host_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || vp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vName || !vPhone || !vPurpose) return;

    submitVisitorRequest({
      visitorName: vName,
      visitorPhone: vPhone,
      visitorCompany: vCompany,
      purpose: vPurpose,
      hostName: vHostName,
      hostDepartment: vHostDept,
      destinationBuilding: vBuilding,
      visitDate: vDate,
      visitTimeSlot: vTime,
      vehicleNumber: vVehicle,
    });

    setVName('');
    setVPhone('');
    setVCompany('');
    setVPurpose('');
    setIsRequestModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#243356] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F4F1DE] font-mono flex items-center gap-2.5">
            <Users className="h-6 w-6 text-[#FFD700]" />
            <span>VISITOR PASS MANAGEMENT &amp; ACCESS CONTROL</span>
          </h1>
          <p className="text-xs text-[#B8B5A3] mt-1 font-sans">
            Digital visitor badges, host approvals, security clearance, QR pass cards, and gate entry/exit logs
          </p>
        </div>

        <Button
          onClick={() => setIsRequestModalOpen(true)}
          size="sm"
          className="bg-gradient-to-r from-[#D4AF37] to-[#C5A059] hover:opacity-90 text-[#0B132B] font-bold text-xs gap-1.5 shadow-md shadow-[#D4AF37]/20"
        >
          <Plus className="h-4 w-4" />
          <span>Apply for Visitor Pass</span>
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#243356] pb-2 overflow-x-auto">
        {[
          { id: 'passes', label: 'All Visitor Badges & Passes', icon: QrCode },
          { id: 'host_approvals', label: 'Host Approval Desk', icon: UserCheck, count: visitorPasses.filter(v => v.status === 'pending_host').length },
          { id: 'security_clearance', label: 'Security Clearance Desk', icon: ShieldCheck, count: visitorPasses.filter(v => v.status === 'approved_host').length },
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

      {/* TAB 1: ALL PASSES */}
      {activeTab === 'passes' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center gap-3 bg-[#0F1026] p-3 rounded-xl border border-[#243356]">
              <Search className="h-4 w-4 text-[#C5A059] shrink-0" />
              <Input
                placeholder="Search visitor name, pass number, or host..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-0 text-xs text-[#F4F1DE] placeholder:text-[#B8B5A3]/60 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl bg-[#0F1026] border border-[#243356] text-xs text-[#F4F1DE] px-3 py-2 font-mono"
            >
              <option value="ALL">All Statuses</option>
              <option value="pending_host">Pending Host Approval</option>
              <option value="approved_host">Host Approved</option>
              <option value="approved_security">Security Cleared</option>
              <option value="checked_in">Checked In</option>
              <option value="checked_out">Checked Out</option>
            </select>
          </div>

          <div className="space-y-3">
            {filteredPasses.map((vp) => (
              <Card key={vp.id} className="bg-[#0F1026] border-[#243356] text-[#F4F1DE]">
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-[#131C38] border border-[#243356] text-[#FFD700] shrink-0 mt-0.5">
                      <QrCode className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#F4F1DE]">{vp.visitor_name}</span>
                        <span className="font-mono text-[10px] bg-[#1C2541] border border-[#243356] text-[#FFD700] px-2 py-0.5 rounded font-bold">
                          {vp.pass_number}
                        </span>
                        {vp.visitor_company && (
                          <span className="text-[#B8B5A3] font-mono text-[11px]">({vp.visitor_company})</span>
                        )}
                      </div>
                      <p className="text-[#B8B5A3] font-mono text-[11px]">
                        Host: <strong className="text-[#F4F1DE]">{vp.host_name}</strong> ({vp.host_department}) · Target: {vp.destination_building}
                      </p>
                      <p className="text-[#B8B5A3] text-[11px]">Purpose: {vp.purpose}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end gap-2 shrink-0 font-mono">
                    <Badge
                      className={`font-bold text-[10px] ${
                        vp.status === 'checked_in'
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : vp.status === 'approved_security'
                          ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                          : vp.status === 'approved_host'
                          ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                          : vp.status === 'checked_out'
                          ? 'bg-[#1C2541] text-[#B8B5A3] border-[#243356]'
                          : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {vp.status.toUpperCase().replace('_', ' ')}
                    </Badge>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedPass(vp)}
                        className="text-[11px] h-7 border-[#243356] text-[#FFD700] gap-1"
                      >
                        <QrCode className="h-3 w-3" />
                        <span>View Pass QR</span>
                      </Button>

                      {vp.status === 'approved_security' && (
                        <Button
                          size="sm"
                          onClick={() => checkInVisitorGate(vp.id)}
                          className="text-[11px] h-7 bg-emerald-600 hover:bg-emerald-500 text-white gap-1 font-bold"
                        >
                          <LogIn className="h-3 w-3" />
                          <span>Gate Entry Check-In</span>
                        </Button>
                      )}

                      {vp.status === 'checked_in' && (
                        <Button
                          size="sm"
                          onClick={() => checkOutVisitorGate(vp.id)}
                          className="text-[11px] h-7 bg-amber-600 hover:bg-amber-500 text-white gap-1 font-bold"
                        >
                          <LogOut className="h-3 w-3" />
                          <span>Gate Exit Check-Out</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: HOST APPROVAL DESK */}
      {activeTab === 'host_approvals' && (
        <div className="space-y-3">
          {visitorPasses.filter((v) => v.status === 'pending_host').length === 0 ? (
            <Card className="bg-[#0F1026] border-[#243356] p-8 text-center text-[#B8B5A3] font-mono">
              <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto mb-2" />
              <p>No pending visitor requests awaiting host approval.</p>
            </Card>
          ) : (
            visitorPasses
              .filter((v) => v.status === 'pending_host')
              .map((vp) => (
                <Card key={vp.id} className="bg-[#0F1026] border-[#243356] text-[#F4F1DE]">
                  <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm">{vp.visitor_name}</span>
                        <span className="text-[#C5A059] font-mono text-[11px]">({vp.visitor_company || 'Guest'})</span>
                      </div>
                      <p className="text-[#B8B5A3] font-mono text-[11px] mt-0.5">
                        Host Requested: <strong className="text-[#FFD700]">{vp.host_name}</strong> ({vp.host_department})
                      </p>
                      <p className="text-[#B8B5A3] text-[11px]">Visit Date: {vp.visit_date || 'Today'} · Slot: {vp.visit_time_slot || '09:00 AM'}</p>
                      <p className="text-[#F4F1DE] mt-1 font-mono text-[11px]">Purpose: {vp.purpose}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => rejectVisitorHost(vp.id)}
                        variant="outline"
                        className="text-xs border-red-500/30 text-red-400 hover:bg-red-950/40 gap-1 font-mono"
                      >
                        <X className="h-3.5 w-3.5" />
                        <span>Decline Visit</span>
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => approveVisitorHost(vp.id)}
                        className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-1 font-mono"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Host Approve Pass</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
          )}
        </div>
      )}

      {/* TAB 3: SECURITY CLEARANCE DESK */}
      {activeTab === 'security_clearance' && (
        <div className="space-y-3">
          {visitorPasses.filter((v) => v.status === 'approved_host').length === 0 ? (
            <Card className="bg-[#0F1026] border-[#243356] p-8 text-center text-[#B8B5A3] font-mono">
              <ShieldCheck className="h-10 w-10 text-[#FFD700] mx-auto mb-2" />
              <p>No host-approved passes currently awaiting security clearance.</p>
            </Card>
          ) : (
            visitorPasses
              .filter((v) => v.status === 'approved_host')
              .map((vp) => (
                <Card key={vp.id} className="bg-[#0F1026] border-[#243356] text-[#F4F1DE]">
                  <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#F4F1DE]">{vp.visitor_name}</span>
                        <Badge className="bg-purple-500/15 text-purple-300 border-purple-500/30 font-mono text-[10px]">
                          HOST APPROVED
                        </Badge>
                      </div>
                      <p className="text-[#B8B5A3] font-mono text-[11px] mt-0.5">
                        Host: {vp.host_name} · Destination: {vp.destination_building}
                      </p>
                      <p className="text-[#B8B5A3] text-[11px]">Phone: {vp.visitor_phone} · Vehicle: {vp.vehicle_number || 'N/A'}</p>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => approveVisitorSecurity(vp.id, `VIS-SEC-${Math.floor(100 + Math.random() * 900)}`)}
                      className="text-xs bg-[#D4AF37] hover:bg-[#C5A059] text-[#0B132B] font-bold gap-1 font-mono shrink-0"
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>Issue Security Clearance Badge</span>
                    </Button>
                  </CardContent>
                </Card>
              ))
          )}
        </div>
      )}

      {/* Modal: DIGITAL QR PASS BADGE */}
      {selectedPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <Card className="w-full max-w-sm bg-[#0F1026] border-2 border-[#D4AF37] text-[#F4F1DE] shadow-2xl shadow-[#D4AF37]/30">
            <CardHeader className="p-4 border-b border-[#243356] bg-[#131C38] text-center relative">
              <div className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-[#D4AF37]/20 text-[#FFD700] mb-1 mx-auto">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <CardTitle className="text-sm font-bold font-mono text-[#FFD700] uppercase tracking-wider">
                LUMINOUS UNIVERSITY DIGITAL VISITOR BADGE
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedPass(null)}
                className="absolute right-2 top-2 h-6 w-6 text-[#B8B5A3] hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-5 text-center space-y-4 text-xs font-mono">
              {/* QR Code Container */}
              <div className="mx-auto w-44 h-44 bg-white p-3 rounded-2xl flex flex-col items-center justify-center shadow-lg border-4 border-[#D4AF37]">
                <QrCode className="w-32 h-32 text-[#0B132B]" />
                <span className="text-[10px] text-[#0B132B] font-bold tracking-widest mt-1">
                  {selectedPass.pass_number}
                </span>
              </div>

              <div className="space-y-1 text-center">
                <h3 className="font-bold text-base text-[#F4F1DE] font-sans">{selectedPass.visitor_name}</h3>
                <p className="text-[#C5A059] text-xs">{selectedPass.visitor_company || 'Official Campus Guest'}</p>
                <span className="inline-block px-2 py-0.5 rounded bg-[#1C2541] border border-[#243356] text-[#FFD700] text-[10px] font-bold">
                  SECURITY BADGE ID: {selectedPass.badge_id}
                </span>
              </div>

              <div className="bg-[#131C38] p-3 rounded-xl border border-[#243356] text-left text-[11px] space-y-1 text-[#B8B5A3]">
                <p><strong className="text-[#F4F1DE]">Host:</strong> {selectedPass.host_name} ({selectedPass.host_department})</p>
                <p><strong className="text-[#F4F1DE]">Destination:</strong> {selectedPass.destination_building}</p>
                <p><strong className="text-[#F4F1DE]">Visit Window:</strong> {selectedPass.visit_date || 'Today'} ({selectedPass.visit_time_slot || 'All Day'})</p>
                <p><strong className="text-[#F4F1DE]">Status:</strong> <span className="text-[#FFD700] font-bold uppercase">{selectedPass.status}</span></p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal: APPLY FOR VISITOR PASS */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <Card className="w-full max-w-lg bg-[#0F1026] border-[#243356] text-[#F4F1DE]">
            <CardHeader className="p-4 border-b border-[#243356] flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold font-mono text-[#FFD700] flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span>Submit Digital Visitor Pass Request</span>
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsRequestModalOpen(false)}
                className="h-6 w-6 text-[#B8B5A3] hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-4 space-y-3.5">
              <form onSubmit={handleRequestSubmit} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-[#C5A059] uppercase block mb-1">Visitor Full Name *</label>
                    <Input
                      required
                      placeholder="e.g. Dr. Anita Roy"
                      value={vName}
                      onChange={(e) => setVName(e.target.value)}
                      className="bg-[#131C38] border-[#243356] text-xs text-[#F4F1DE]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-[#C5A059] uppercase block mb-1">Contact Phone *</label>
                    <Input
                      required
                      placeholder="e.g. +1 (555) 012-3399"
                      value={vPhone}
                      onChange={(e) => setVPhone(e.target.value)}
                      className="bg-[#131C38] border-[#243356] text-xs text-[#F4F1DE]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-[#C5A059] uppercase block mb-1">Organization / Company</label>
                    <Input
                      placeholder="e.g. Stanford AI Institute"
                      value={vCompany}
                      onChange={(e) => setVCompany(e.target.value)}
                      className="bg-[#131C38] border-[#243356] text-xs text-[#F4F1DE]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-[#C5A059] uppercase block mb-1">Vehicle Registration No.</label>
                    <Input
                      placeholder="e.g. KA-01-EQ-9921"
                      value={vVehicle}
                      onChange={(e) => setVVehicle(e.target.value)}
                      className="bg-[#131C38] border-[#243356] text-xs text-[#F4F1DE]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-[#C5A059] uppercase block mb-1">Host Faculty / Student *</label>
                    <Input
                      required
                      placeholder="e.g. Prof. Sarah Jenkins"
                      value={vHostName}
                      onChange={(e) => setVHostName(e.target.value)}
                      className="bg-[#131C38] border-[#243356] text-xs text-[#F4F1DE]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-[#C5A059] uppercase block mb-1">Host Department</label>
                    <Input
                      placeholder="e.g. Computer Science & Engineering"
                      value={vHostDept}
                      onChange={(e) => setVHostDept(e.target.value)}
                      className="bg-[#131C38] border-[#243356] text-xs text-[#F4F1DE]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-[#C5A059] uppercase block mb-1">Visit Date</label>
                    <Input
                      type="date"
                      value={vDate}
                      onChange={(e) => setVDate(e.target.value)}
                      className="bg-[#131C38] border-[#243356] text-xs text-[#F4F1DE]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-[#C5A059] uppercase block mb-1">Destination Building</label>
                    <Input
                      placeholder="e.g. Engineering Block D"
                      value={vBuilding}
                      onChange={(e) => setVBuilding(e.target.value)}
                      className="bg-[#131C38] border-[#243356] text-xs text-[#F4F1DE]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-[#C5A059] uppercase block mb-1">Time Slot Window</label>
                    <Input
                      placeholder="e.g. 10:00 AM - 01:00 PM"
                      value={vTime}
                      onChange={(e) => setVTime(e.target.value)}
                      className="bg-[#131C38] border-[#243356] text-xs text-[#F4F1DE]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-[#C5A059] uppercase block mb-1">Visit Purpose *</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="State full purpose of visit (e.g., Guest lecture, lab audit, student meeting)..."
                    value={vPurpose}
                    onChange={(e) => setVPurpose(e.target.value)}
                    className="w-full rounded-md bg-[#131C38] border border-[#243356] p-2 text-xs text-[#F4F1DE]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#243356]">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsRequestModalOpen(false)}
                    className="text-xs border-[#243356]"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#D4AF37] hover:bg-[#C5A059] text-[#0B132B] font-bold text-xs"
                  >
                    Submit Request
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
