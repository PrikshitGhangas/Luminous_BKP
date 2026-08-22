'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Megaphone,
  Search,
  Plus,
  Pin,
  X,
} from 'lucide-react';

interface AnnouncementItem {
  id: string;
  title: string;
  category: 'Safety' | 'Academic' | 'Administrative' | 'Placement' | 'Hostel';
  author: string;
  authorRole: string;
  postedAt: string;
  isUrgent: boolean;
  content: string;
  targetAudience: string;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([
    {
      id: 'anc-1',
      title: 'Fall Semester Mid-Term Examination Roster & Schedule Published',
      category: 'Academic',
      author: 'Office of Controller of Examinations',
      authorRole: 'Academic Admin',
      postedAt: '2 hours ago',
      isUrgent: true,
      content: 'The official mid-term examination timetable for Computer Science, AI, and Electronics departments is now live on the Exams portal. All students are advised to check room assignments and duration.',
      targetAudience: 'All Students & Faculty',
    },
    {
      id: 'anc-2',
      title: 'Campus Perimeter Security Protocol & Night Curfew Reminder',
      category: 'Safety',
      author: 'Officer Vikram Sharma',
      authorRole: 'Security Officer',
      postedAt: '5 hours ago',
      isUrgent: true,
      content: 'Residential wardens and security officers will strictly enforce the 22:30 night entry curfew across Hostel Blocks A, B, C, & D. Biometric access logging remains mandatory at all gates.',
      targetAudience: 'All Hostel Residents & Security Staff',
    },
    {
      id: 'anc-3',
      title: 'Google DeepMind & Microsoft Campus Placement Drive Registration',
      category: 'Placement',
      author: 'Anil Deshmukh',
      authorRole: 'Placement Officer',
      postedAt: 'Yesterday',
      isUrgent: false,
      content: 'Registration window for Google DeepMind (AI Research Engineer) and Microsoft Systems cloud roles closes on September 15. Verify your eligibility CGPA on the Placements portal.',
      targetAudience: 'Final Year Graduating Batch 2026',
    },
  ]);

  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'Safety' | 'Academic' | 'Administrative' | 'Placement' | 'Hostel'>('Academic');
  const [newContent, setNewContent] = useState('');
  const [newUrgent, setNewUrgent] = useState(false);

  const filteredAnnouncements = announcements.filter((a) => {
    const matchesCat = categoryFilter === 'ALL' || a.category === categoryFilter;
    const matchesSearch =
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContent) return;

    const newAnc: AnnouncementItem = {
      id: `anc-${Date.now()}`,
      title: newTitle,
      category: newCategory,
      author: 'Campus Administration Desk',
      authorRole: 'Admin Dispatch',
      postedAt: 'Just now',
      isUrgent: newUrgent,
      content: newContent,
      targetAudience: 'Campus-wide',
    };

    setAnnouncements((prev) => [newAnc, ...prev]);
    setNewTitle('');
    setNewContent('');
    setIsPostModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D6D8D5] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1F2933] flex items-center gap-2.5">
            <Megaphone className="h-6 w-6 text-[#8a6d1a]" />
            <span>Announcements</span>
          </h1>
          <p className="text-xs text-[#667085] mt-1 font-sans">
            Official campus notices, academic updates, safety advisories, and administrative circulars.
          </p>
        </div>

        <Button
          onClick={() => setIsPostModalOpen(true)}
          size="sm"
          className="bg-[#1F2933] hover:bg-[#111827] text-white text-xs font-semibold gap-1.5 rounded-lg shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>New Announcement</span>
        </Button>
      </div>

      {/* Category Badges (Segmented Pills) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <div className="inline-flex p-1 bg-[#F0F1EF] rounded-full border border-[#D6D8D5] gap-1">
          {['ALL', 'Safety', 'Academic', 'Administrative', 'Placement', 'Hostel'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-[#1F2933] text-white shadow-xs'
                  : 'text-[#667085] hover:text-[#1F2933]'
              }`}
            >
              {cat === 'ALL' ? 'All Notices' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2.5 bg-white px-3.5 py-2.5 rounded-xl border border-[#D6D8D5] shadow-xs">
        <Search className="h-4 w-4 text-[#667085] shrink-0" />
        <Input
          placeholder="Search notices by title or keywords..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent border-0 text-xs text-[#1F2933] placeholder:text-[#667085] focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto"
        />
      </div>

      {/* Announcements Feed */}
      <div className="space-y-3">
        {filteredAnnouncements.map((a) => (
          <div
            key={a.id}
            className={`p-4 rounded-xl border bg-white space-y-2.5 shadow-xs transition-all ${
              a.isUrgent ? 'border-amber-300' : 'border-[#D6D8D5]'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                {a.isUrgent && <Pin className="h-4 w-4 text-amber-600 shrink-0" />}
                <h2 className="text-sm font-bold text-[#1F2933]">{a.title}</h2>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${
                  a.category === 'Safety'
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : a.category === 'Academic'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-[#F0F1EF] text-[#667085] border border-[#D6D8D5]'
                }`}
              >
                {a.category}
              </span>
            </div>

            <p className="text-xs text-[#667085] leading-relaxed">{a.content}</p>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#667085] pt-2 border-t border-[#D6D8D5]">
              <span>
                Posted by: <strong className="text-[#1F2933]">{a.author}</strong> ({a.authorRole})
              </span>
              <span>Audience: {a.targetAudience} · {a.postedAt}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: POST ANNOUNCEMENT */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <Card className="w-full max-w-lg bg-white border-[#D6D8D5] text-[#1F2933] shadow-xl">
            <CardHeader className="p-4 border-b border-[#D6D8D5] flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-[#1F2933] flex items-center gap-2">
                <Megaphone className="h-4 w-4" />
                <span>Post Official Campus Announcement</span>
              </CardTitle>
              <button
                onClick={() => setIsPostModalOpen(false)}
                className="text-[#667085] hover:text-[#1F2933] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </CardHeader>
            <CardContent className="p-4 space-y-3.5">
              <form onSubmit={handlePostSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="text-xs font-semibold text-[#1F2933] block mb-1">Announcement Title *</label>
                  <Input
                    required
                    placeholder="e.g. Mid-Term Examination Schedule or Security Notice"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="bg-white border-[#D6D8D5] text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#1F2933] block mb-1">Category *</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as typeof newCategory)}
                      className="w-full rounded-lg bg-white border border-[#D6D8D5] p-2 text-xs text-[#1F2933] cursor-pointer"
                    >
                      <option value="Academic">Academic</option>
                      <option value="Safety">Safety</option>
                      <option value="Administrative">Administrative</option>
                      <option value="Placement">Placement</option>
                      <option value="Hostel">Hostel</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 pt-5">
                    <input
                      type="checkbox"
                      id="urgentCheck"
                      checked={newUrgent}
                      onChange={(e) => setNewUrgent(e.target.checked)}
                      className="h-4 w-4 rounded border-[#D6D8D5] text-[#1F2933] focus:ring-0"
                    />
                    <label htmlFor="urgentCheck" className="text-xs font-semibold text-[#1F2933] cursor-pointer">
                      Flag as Urgent Advisory
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#1F2933] block mb-1">Announcement Body *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Write announcement text..."
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className="w-full rounded-lg bg-white border border-[#D6D8D5] p-2 text-xs text-[#1F2933]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#D6D8D5]">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsPostModalOpen(false)}
                    className="text-xs cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-[#1F2933] hover:bg-[#111827] text-white font-semibold text-xs cursor-pointer"
                  >
                    Broadcast Notice
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
