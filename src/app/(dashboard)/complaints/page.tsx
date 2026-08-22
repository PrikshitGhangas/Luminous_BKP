'use client';

import React, { useState } from 'react';
import { useCampusServices } from '@/lib/context/campus-services-context';
import { useRole } from '@/lib/hooks/use-role';
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
  const { isSuperAdmin, isAdmin, role } = useRole();
  const canManageTickets = isSuperAdmin || isAdmin || role === 'faculty' || role === 'security';

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
    { id: 'faculty', label: 'Faculty' },
    { id: 'it', label: 'IT' },
    { id: 'safety', label: 'Safety' },
    { id: 'other', label: 'Other' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D6D8D5] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1F2933] flex items-center gap-2.5">
            <MessageSquareWarning className="h-6 w-6 text-[#8a6d1a]" />
            <span>Complaints &amp; Grievances</span>
          </h1>
          <p className="text-xs text-[#667085] mt-1 font-sans">
            Submit and track campus service requests, facility issues, and student grievances.
          </p>
        </div>

        <Button
          onClick={() => setIsLodgeModalOpen(true)}
          size="sm"
          className="bg-[#1F2933] hover:bg-[#111827] text-white text-xs font-semibold gap-1.5 rounded-lg shadow-xs cursor-pointer"
        >
          <MessageSquareWarning className="h-4 w-4" />
          <span>Submit Grievance</span>
        </Button>
      </div>

      {/* Category Filter Badges (Segmented Pills) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <div className="inline-flex p-1 bg-[#F0F1EF] rounded-full border border-[#D6D8D5] gap-1">
          {categoriesList.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                categoryFilter === cat.id
                  ? 'bg-[#1F2933] text-white shadow-xs'
                  : 'text-[#667085] hover:text-[#1F2933]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search & Status Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2.5 bg-white px-3.5 py-2 rounded-xl border border-[#D6D8D5] shadow-xs">
          <Search className="h-4 w-4 text-[#667085] shrink-0" />
          <Input
            placeholder="Search grievances by ticket ID, title, or student..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-0 text-xs text-[#1F2933] placeholder:text-[#667085] focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl bg-white border border-[#D6D8D5] text-xs text-[#1F2933] px-3.5 py-2 shadow-xs focus:outline-none"
        >
          <option value="ALL">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Escalated">Escalated</option>
        </select>
      </div>

      {/* Complaints List */}
      <div className="space-y-3">
        {filteredComplaints.map((c) => (
          <div
            key={c.id}
            onClick={() => setSelectedTicket(c)}
            className="p-4 rounded-xl border border-[#D6D8D5] bg-white hover:border-[#1F2933] transition-all cursor-pointer space-y-2.5 shadow-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-[#1F2933]">{c.ticketNumber}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[#F0F1EF] text-[#667085] border border-[#D6D8D5] capitalize">
                    {c.category}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      c.priority === 'URGENT' || c.priority === 'HIGH'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}
                  >
                    {c.priority}
                  </span>
                </div>

                <h3 className="font-bold text-[#1F2933] text-sm">{c.title}</h3>
                <p className="text-[#667085] line-clamp-2 text-xs leading-relaxed">{c.description}</p>
                <div className="flex flex-wrap items-center gap-3 text-xs text-[#667085]">
                  <span>Filed by: <strong className="text-[#1F2933]">{c.reportedBy}</strong> ({c.reporterRole})</span>
                  <span>Assigned: <strong className="text-[#1F2933]">{c.assignedDepartment}</strong></span>
                </div>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                    c.status === 'Resolved'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : c.status === 'In Progress'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : c.status === 'Escalated'
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}
                >
                  {c.status}
                </span>
                <p className="text-[11px] text-[#667085] mt-1">
                  {new Date(c.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: TICKET DETAIL & RESOLUTION */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md z-[100] p-4">
          <Card className="w-full max-w-lg bg-white border-[#D6D8D5] text-[#1F2933] shadow-xl">
            <CardHeader className="p-4 border-b border-[#D6D8D5] flex flex-row items-center justify-between">
              <div className="space-y-0.5">
                <CardTitle className="text-sm font-bold text-[#1F2933] flex items-center gap-2">
                  <span>Ticket {selectedTicket.ticketNumber}</span>
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-[#F0F1EF] text-[#1F2933] capitalize">
                    {selectedTicket.category}
                  </span>
                </CardTitle>
                <p className="text-xs text-[#667085]">
                  Filed by {selectedTicket.reportedBy} on {new Date(selectedTicket.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-[#667085] hover:text-[#1F2933] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </CardHeader>

            <CardContent className="p-4 space-y-4 text-xs">
              <div className="space-y-1">
                <h3 className="font-bold text-[#1F2933] text-sm">{selectedTicket.title}</h3>
                <p className="text-[#667085] text-xs bg-[#F7F8F6] p-3 rounded-lg border border-[#D6D8D5] leading-relaxed">
                  {selectedTicket.description}
                </p>
              </div>

              {/* Triage Summary */}
              {selectedTicket.aiSummary && (
                <div className="bg-[#F7F8F6] border border-[#D6D8D5] rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center gap-2 text-[#1F2933] font-semibold text-xs">
                    <Bot className="h-4 w-4 text-[#667085]" />
                    <span>Automated Routing &amp; Triage Summary</span>
                  </div>
                  <p className="text-xs text-[#667085] italic">&ldquo;{selectedTicket.aiSummary}&rdquo;</p>

                  {selectedTicket.aiRecommendedActions && selectedTicket.aiRecommendedActions.length > 0 && (
                    <div className="text-xs text-[#667085] space-y-1 pt-1">
                      <p className="text-[#1F2933] font-medium">Recommended Action Steps:</p>
                      {selectedTicket.aiRecommendedActions.map((act, idx) => (
                        <p key={idx} className="text-xs text-[#667085]"> {act}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between border-t border-[#D6D8D5] pt-3">
                <span className="text-xs text-[#667085]">Update Ticket Status:</span>
                <div className="flex gap-2">
                  {selectedTicket.status !== 'In Progress' && (
                    <Button
                      size="sm"
                      onClick={() => {
                        updateComplaintStatus(selectedTicket.id, 'In Progress');
                        setSelectedTicket(null);
                      }}
                      className="text-xs bg-amber-600 hover:bg-amber-700 text-white font-medium h-7 cursor-pointer"
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
                      className="text-xs bg-[#1F2933] hover:bg-[#111827] text-white font-medium h-7 cursor-pointer"
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

      {/* Modal: LODGE GRIEVANCE */}
      {isLodgeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md z-[100] p-4">
          <Card className="w-full max-w-lg bg-white border-[#D6D8D5] text-[#1F2933] shadow-xl">
            <CardHeader className="p-4 border-b border-[#D6D8D5] flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-[#1F2933] flex items-center gap-2">
                <MessageSquareWarning className="h-4 w-4" />
                <span>Submit Grievance / Service Request</span>
              </CardTitle>
              <button
                onClick={() => setIsLodgeModalOpen(false)}
                className="text-[#667085] hover:text-[#1F2933] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </CardHeader>
            <CardContent className="p-4 space-y-3.5">
              <form onSubmit={handleLodgeSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="text-xs font-semibold text-[#1F2933] block mb-1">Subject / Issue Title *</label>
                  <Input
                    required
                    placeholder="e.g. Hostel Wi-Fi downtime / Library AC noise / Grade query"
                    value={ticketTitle}
                    onChange={(e) => setTicketTitle(e.target.value)}
                    className="bg-white border-[#D6D8D5] text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#1F2933] block mb-1">Location / Premises</label>
                    <Input
                      placeholder="e.g. Hostel Block B Floor 3"
                      value={ticketLocation}
                      onChange={(e) => setTicketLocation(e.target.value)}
                      className="bg-white border-[#D6D8D5] text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#1F2933] block mb-1">Category (Optional)</label>
                    <select
                      value={ticketCategoryHint}
                      onChange={(e) => setTicketCategoryHint(e.target.value as ComplaintCategory)}
                      className="w-full rounded-lg bg-white border border-[#D6D8D5] p-2 text-xs text-[#1F2933] cursor-pointer"
                    >
                      <option value="academic">Academic</option>
                      <option value="hostel">Hostel</option>
                      <option value="infrastructure">Infrastructure</option>
                      <option value="faculty">Faculty</option>
                      <option value="it">IT</option>
                      <option value="safety">Safety</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#1F2933] block mb-1">Detailed Description *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe the complaint in detail so the relevant department can triage and resolve it promptly..."
                    value={ticketDesc}
                    onChange={(e) => setTicketDesc(e.target.value)}
                    className="w-full rounded-lg bg-white border border-[#D6D8D5] p-2 text-xs text-[#1F2933]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#D6D8D5]">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsLodgeModalOpen(false)}
                    className="text-xs cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isAiLoading}
                    className="bg-[#1F2933] hover:bg-[#111827] text-white font-semibold text-xs gap-1.5 cursor-pointer"
                  >
                    {isAiLoading ? (
                      <span>Processing Request...</span>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        <span>Submit Grievance</span>
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
