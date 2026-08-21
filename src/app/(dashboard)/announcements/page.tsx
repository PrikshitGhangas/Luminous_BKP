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
      author: 'Capt. Vikram Sharma',
      authorRole: 'Security Chief',
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D0D1D6] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#202226] font-mono flex items-center gap-2.5">
            <Megaphone className="h-6 w-6 text-[#B45309]" />
            <span>CAMPUS ANNOUNCEMENTS &amp; BROADCAST FEED</span>
          </h1>
          <p className="text-xs text-[#555960] mt-1 font-sans">
            Official institutional notices, emergency advisories, academic updates, and placement drive bulletins
          </p>
        </div>

        <Button
          onClick={() => setIsPostModalOpen(true)}
          size="sm"
          className="bg-gradient-to-r from-[#EAB308] to-[#D4AF37] hover:opacity-90 text-[#0B132B] font-bold text-xs gap-1.5 shadow-md shadow-[#D4AF37]/20"
        >
          <Plus className="h-4 w-4" />
          <span>Post Official Announcement</span>
        </Button>
      </div>

      {/* Category Badges */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {['ALL', 'Safety', 'Academic', 'Administrative', 'Placement', 'Hostel'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all whitespace-nowrap ${
              categoryFilter === cat
                ? 'bg-[#EAB308] text-[#0B132B]'
                : 'bg-[#F4F5F6] text-[#555960] border border-[#D0D1D6] hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 bg-[#F4F5F6] p-3 rounded-xl border border-[#D0D1D6]">
        <Search className="h-4 w-4 text-[#B45309] shrink-0" />
        <Input
          placeholder="Search announcements by title or keyword..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent border-0 text-xs text-[#202226] placeholder:text-[#555960]/60 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>

      {/* Announcements Feed */}
      <div className="space-y-4">
        {filteredAnnouncements.map((a) => (
          <Card key={a.id} className={`bg-[#F4F5F6] border-[#D0D1D6] text-[#202226] ${a.isUrgent ? 'border-2 border-amber-500/60 shadow-lg shadow-amber-950/20' : ''}`}>
            <CardHeader className="p-4 border-b border-[#D0D1D6] bg-white/60 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                {a.isUrgent && <Pin className="h-4 w-4 text-amber-400 shrink-0" />}
                <CardTitle className="text-sm font-bold font-mono text-[#202226]">{a.title}</CardTitle>
              </div>
              <Badge className={`font-mono text-[10px] ${a.category === 'Safety' ? 'bg-red-500/15 text-red-300 border-red-500/30' : a.category === 'Academic' ? 'bg-blue-500/15 text-blue-300 border-blue-500/30' : 'bg-purple-500/15 text-purple-300 border-purple-500/30'}`}>
                {a.category.toUpperCase()}
              </Badge>
            </CardHeader>
            <CardContent className="p-4 space-y-2 text-xs font-mono">
              <p className="text-[#202226] font-sans text-xs sm:text-sm leading-relaxed">{a.content}</p>
              <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-[#555960] pt-2 border-t border-[#D0D1D6]">
                <span>Author: <strong className="text-[#B45309]">{a.author}</strong> ({a.authorRole})</span>
                <span>Audience: {a.targetAudience} · Posted: {a.postedAt}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal: POST ANNOUNCEMENT */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <Card className="w-full max-w-lg bg-[#F4F5F6] border-[#D0D1D6] text-[#202226]">
            <CardHeader className="p-4 border-b border-[#D0D1D6] flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold font-mono text-[#B45309] flex items-center gap-2">
                <Megaphone className="h-4 w-4" />
                <span>Post Official Campus Announcement</span>
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsPostModalOpen(false)}
                className="h-6 w-6 text-[#555960] hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-4 space-y-3.5">
              <form onSubmit={handlePostSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="text-[10px] font-mono text-[#B45309] uppercase block mb-1">Announcement Title *</label>
                  <Input
                    required
                    placeholder="e.g. Mid-Term Examination Schedule or Security Notice"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="bg-white border-[#D0D1D6] text-xs text-[#202226]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-[#B45309] uppercase block mb-1">Category *</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as typeof newCategory)}
                      className="w-full rounded-md bg-white border border-[#D0D1D6] p-2 text-xs text-[#202226]"
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
                      className="h-4 w-4 rounded border-[#D0D1D6] bg-white text-[#B45309] focus:ring-0"
                    />
                    <label htmlFor="urgentCheck" className="text-xs font-mono text-[#B45309] font-bold">
                      Flag as Urgent Advisory
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-[#B45309] uppercase block mb-1">Announcement Body *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Write announcement text..."
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className="w-full rounded-md bg-white border border-[#D0D1D6] p-2 text-xs text-[#202226]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#D0D1D6]">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsPostModalOpen(false)}
                    className="text-xs border-[#D0D1D6]"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#EAB308] hover:bg-[#D4AF37] text-[#0B132B] font-bold text-xs"
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
