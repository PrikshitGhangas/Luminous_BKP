'use client';

import React, { useState } from 'react';
import { useCampusServices } from '@/lib/context/campus-services-context';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquareWarning,
  Sparkles,
  Search,
  X,
  Bot,
  Send,
} from 'lucide-react';
import { Complaint, ComplaintCategory } from '@/lib/types';

export default function ComplaintsPage() {
  const { complaints, lodgeComplaint, updateComplaintStatus } = useCampusServices();

  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [isLodgeModalOpen, setIsLodgeModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Complaint | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Form State
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');
  const [ticketLocation, setTicketLocation] = useState('');
  const [ticketCategoryHint, setTicketCategoryHint] = useState<ComplaintCategory>('other');

  const filteredComplaints = complaints.filter((c) => {
    const matchesCat = categoryFilter === 'ALL' || c.category === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.reportedBy.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesStatus && matchesSearch;
  });

  const handleLodgeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketTitle || !ticketDesc) return;

    setIsAiLoading(true);
    try {
      await lodgeComplaint({
        title: ticketTitle,
        description: ticketDesc,
        location: ticketLocation,
        categoryHint: ticketCategoryHint,
      });

      setTicketTitle('');
      setTicketDesc('');
      setTicketLocation('');
      setIsLodgeModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const categoriesList: { id: ComplaintCategory | 'ALL'; label: string }[] = [
    { id: 'ALL', label: 'All Categories' },
    { id: 'academic', label: 'Academic' },
    { id: 'hostel', label: 'Hostel' },
    { id: 'infrastructure', label: 'Infrastructure' },
    { id: 'transport', label: 'Transport' },
    { id: 'faculty', label: 'Faculty' },
    { id: 'it', label: 'IT' },
    { id: 'safety', label: 'Safety' },
    { id: 'other', label: 'Other' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#243356] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F4F1DE] font-mono flex items-center gap-2.5">
            <MessageSquareWarning className="h-6 w-6 text-[#FFD700]" />
            <span>GRIEVANCE &amp; COMPLAINTS REDRESSAL</span>
          </h1>
          <p className="text-xs text-[#B8B5A3] mt-1 font-sans">
            Student &amp; staff ticket resolution platform powered by <strong className="text-[#FFD700] font-mono">Gemini AI Autonomous Triage</strong>
          </p>
        </div>

        <Button
          onClick={() => setIsLodgeModalOpen(true)}
          size="sm"
          className="bg-gradient-to-r from-[#D4AF37] to-[#C5A059] hover:opacity-90 text-[#0B132B] font-bold text-xs gap-1.5 shadow-md shadow-[#D4AF37]/20"
        >
          <Sparkles className="h-4 w-4" />
          <span>Lodge Grievance (AI Assisted)</span>
        </Button>
      </div>

      {/* Category Filter Badges */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {categoriesList.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategoryFilter(cat.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all whitespace-nowrap ${
              categoryFilter === cat.id
                ? 'bg-[#D4AF37] text-[#0B132B]'
                : 'bg-[#0F1026] text-[#B8B5A3] border border-[#243356] hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Search & Status Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-3 bg-[#0F1026] p-3 rounded-xl border border-[#243356]">
          <Search className="h-4 w-4 text-[#C5A059] shrink-0" />
          <Input
            placeholder="Search complaint title, ticket ID, or reporter name..."
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
          <option value="Pending">Pending Triage</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Escalated">Escalated</option>
        </select>
      </div>

      {/* Ticket List */}
      <div className="space-y-3">
        {filteredComplaints.map((c) => (
          <Card
            key={c.id}
            onClick={() => setSelectedTicket(c)}
            className="bg-[#0F1026] border-[#243356] hover:border-[#D4AF37]/50 transition-colors cursor-pointer text-[#F4F1DE]"
          >
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2 font-mono">
                  <span className="font-bold text-[#FFD700]">{c.ticketNumber}</span>
                  <Badge className="bg-[#1C2541] text-[#F4F1DE] border-[#243356] text-[10px] uppercase font-bold">
                    {c.category}
                  </Badge>
                  <Badge
                    className={`text-[10px] font-bold ${
                      c.priority === 'URGENT'
                        ? 'bg-red-500/15 text-red-300 border-red-500/30'
                        : c.priority === 'HIGH'
                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        : 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                    }`}
                  >
                    {c.priority} PRIORITY
                  </Badge>
                  {c.aiClassifiedCategory && (
                    <span className="text-[10px] text-[#C5A059] flex items-center gap-1 font-bold">
                      <Bot className="h-3 w-3 text-[#FFD700]" />
                      <span>Gemini Classified</span>
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-[#F4F1DE] text-sm">{c.title}</h3>
                <p className="text-[#B8B5A3] line-clamp-2 text-[11px]">{c.description}</p>
                <div className="flex flex-wrap items-center gap-3 text-[10px] text-[#B8B5A3] font-mono">
                  <span>Filed by: {c.reportedBy} ({c.reporterRole})</span>
                  <span>Assigned Dept: <strong className="text-[#F4F1DE]">{c.assignedDepartment}</strong></span>
                </div>
              </div>

              <div className="text-left sm:text-right font-mono shrink-0">
                <Badge
                  className={`font-bold text-xs ${
                    c.status === 'Resolved'
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : c.status === 'In Progress'
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      : c.status === 'Escalated'
                      ? 'bg-red-500/15 text-red-300 border-red-500/30'
                      : 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                  }`}
                >
                  {c.status}
                </Badge>
                <p className="text-[10px] text-[#B8B5A3] mt-1">
                  {new Date(c.createdAt).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal: TICKET DETAIL & RESOLUTION */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <Card className="w-full max-w-lg bg-[#0F1026] border-[#243356] text-[#F4F1DE]">
            <CardHeader className="p-4 border-b border-[#243356] flex flex-row items-center justify-between">
              <div className="space-y-0.5">
                <CardTitle className="text-sm font-bold font-mono text-[#FFD700] flex items-center gap-2">
                  <span>Ticket {selectedTicket.ticketNumber}</span>
                  <Badge className="bg-[#1C2541] text-[#F4F1DE] text-[10px]">{selectedTicket.category}</Badge>
                </CardTitle>
                <p className="text-[11px] text-[#B8B5A3] font-mono">Filed by {selectedTicket.reportedBy} on {new Date(selectedTicket.createdAt).toLocaleString()}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedTicket(null)}
                className="h-6 w-6 text-[#B8B5A3] hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent className="p-4 space-y-4 text-xs font-mono">
              <div className="space-y-1">
                <h3 className="font-bold text-[#F4F1DE] text-sm font-sans">{selectedTicket.title}</h3>
                <p className="text-[#B8B5A3] text-xs font-sans bg-[#131C38] p-3 rounded-lg border border-[#243356]">{selectedTicket.description}</p>
              </div>

              {/* Gemini AI Intelligence Triage Card */}
              {selectedTicket.aiSummary && (
                <div className="bg-[#131C38]/90 border border-[#D4AF37]/40 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center gap-2 text-[#FFD700] font-bold">
                    <Bot className="h-4 w-4" />
                    <span>Gemini 3.7 Flash AI Autonomous Triage Summary</span>
                  </div>
                  <p className="text-[11px] text-[#F4F1DE] font-sans italic">&ldquo;{selectedTicket.aiSummary}&rdquo;</p>

                  <div className="text-[11px] text-[#B8B5A3] space-y-1 pt-1">
                    <p className="text-[#C5A059] font-bold">AI Recommended Operational Actions:</p>
                    {selectedTicket.aiRecommendedActions?.map((act, idx) => (
                      <p key={idx} className="text-[10px] text-[#F4F1DE]">✓ {act}</p>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-[#243356] pt-3">
                <span className="text-[#B8B5A3]">Update Ticket Resolution Status:</span>
                <div className="flex gap-2">
                  {selectedTicket.status !== 'In Progress' && (
                    <Button
                      size="sm"
                      onClick={() => {
                        updateComplaintStatus(selectedTicket.id, 'In Progress');
                        setSelectedTicket(null);
                      }}
                      className="text-xs bg-amber-600 hover:bg-amber-500 text-white font-bold h-7"
                    >
                      Set In Progress
                    </Button>
                  )}
                  {selectedTicket.status !== 'Resolved' && (
                    <Button
                      size="sm"
                      onClick={() => {
                        updateComplaintStatus(selectedTicket.id, 'Resolved', 'Resolved by department officer');
                        setSelectedTicket(null);
                      }}
                      className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-7"
                    >
                      Mark Resolved
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal: LODGE GRIEVANCE WITH GEMINI AI */}
      {isLodgeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <Card className="w-full max-w-lg bg-[#0F1026] border-[#243356] text-[#F4F1DE]">
            <CardHeader className="p-4 border-b border-[#243356] flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold font-mono text-[#FFD700] flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#FFD700]" />
                <span>Lodge Grievance with Gemini AI Triage</span>
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsLodgeModalOpen(false)}
                className="h-6 w-6 text-[#B8B5A3] hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-4 space-y-3.5">
              <form onSubmit={handleLodgeSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="text-[10px] font-mono text-[#C5A059] uppercase block mb-1">Grievance Subject / Title *</label>
                  <Input
                    required
                    placeholder="e.g. Hostel Block B Wi-Fi downtime / Library AC noise / Exam grade discrepancy"
                    value={ticketTitle}
                    onChange={(e) => setTicketTitle(e.target.value)}
                    className="bg-[#131C38] border-[#243356] text-xs text-[#F4F1DE]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-[#C5A059] uppercase block mb-1">Location Premises</label>
                    <Input
                      placeholder="e.g. Hostel Block B Floor 3"
                      value={ticketLocation}
                      onChange={(e) => setTicketLocation(e.target.value)}
                      className="bg-[#131C38] border-[#243356] text-xs text-[#F4F1DE]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-[#C5A059] uppercase block mb-1">Category Hint (Optional)</label>
                    <select
                      value={ticketCategoryHint}
                      onChange={(e) => setTicketCategoryHint(e.target.value as ComplaintCategory)}
                      className="w-full rounded-md bg-[#131C38] border border-[#243356] p-2 text-xs text-[#F4F1DE]"
                    >
                      <option value="academic">Academic</option>
                      <option value="hostel">Hostel</option>
                      <option value="infrastructure">Infrastructure</option>
                      <option value="transport">Transport</option>
                      <option value="faculty">Faculty</option>
                      <option value="it">IT</option>
                      <option value="safety">Safety</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-[#C5A059] uppercase block mb-1">Detailed Description *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe the complaint in detail. Gemini AI will evaluate category, priority, and assign the appropriate department automatically..."
                    value={ticketDesc}
                    onChange={(e) => setTicketDesc(e.target.value)}
                    className="w-full rounded-md bg-[#131C38] border border-[#243356] p-2 text-xs text-[#F4F1DE]"
                  />
                </div>

                <div className="bg-[#131C38] p-3 rounded-lg border border-[#243356] text-[11px] text-[#B8B5A3] space-y-1 font-mono">
                  <div className="font-bold text-[#FFD700] flex items-center gap-1.5">
                    <Bot className="h-4 w-4" />
                    <span>Gemini AI Classification Active</span>
                  </div>
                  <p className="text-[10px]">
                    Submitting this ticket invokes Gemini 3.7 Flash to automatically determine category (Academic, Hostel, Infrastructure, Transport, Faculty, IT, Safety, Other), priority level, and suggested resolution directives.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#243356]">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsLodgeModalOpen(false)}
                    className="text-xs border-[#243356]"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isAiLoading}
                    className="bg-gradient-to-r from-[#D4AF37] to-[#C5A059] hover:opacity-90 text-[#0B132B] font-bold text-xs gap-1.5"
                  >
                    {isAiLoading ? (
                      <span>Classifying with Gemini AI...</span>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        <span>Submit Ticket with AI Triage</span>
                      </>
                    )}
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
