'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useRole } from '@/lib/hooks/use-role';
import { useSafety } from '@/lib/context/safety-context';
import { NotificationPanel } from '../shared/notification-panel';
import {
  Bell,
  Search,
  ChevronRight,
  Menu,
  Sparkles,
  HeartPulse,
} from 'lucide-react';
import Link from 'next/link';

interface TopbarProps {
  onToggleMobileMenu?: () => void;
}

export function Topbar({ onToggleMobileMenu }: TopbarProps) {
  const pathname = usePathname();
  const { role, user, roleMeta } = useRole();
  const { unreadNotificationsCount } = useSafety();
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbTitle =
    segments.length === 0
      ? 'Overview'
      : segments[segments.length - 1]
          .split('-')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#243356] bg-[#0B132B]/95 px-4 backdrop-blur-md text-[#F4F1DE]">
      {/* Left: Mobile Toggle & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#243356] text-[#B8B5A3] hover:bg-[#1C2541] hover:text-[#FFD700] md:hidden"
          aria-label="Toggle Navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <nav className="flex items-center gap-1.5 text-xs text-[#B8B5A3]">
          <Link href="/" className="hover:text-[#FFD700] font-semibold tracking-wider font-mono">
            Luminous AI
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-[#C5A059]" />
          <span className="font-bold text-[#FFD700] font-mono">
            {breadcrumbTitle}
          </span>
        </nav>
      </div>

      {/* Center: Search & Live Security Ping */}
      <div className="hidden lg:flex items-center gap-4">
        <div className="relative w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#C5A059]" />
          <input
            type="text"
            placeholder="Search incidents, intelligence, records..."
            className="h-9 w-full rounded-lg border border-[#243356] bg-[#0F1026] pl-9 pr-3 text-xs text-[#F4F1DE] placeholder:text-[#7A786B] focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
          />
        </div>

        <div className="flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3 py-1 text-[11px] font-bold text-[#FFD700] font-mono">
          <span className="h-2 w-2 rounded-full bg-[#FFD700] animate-pulse" />
          <span>LUMINOUS REALTIME ACTIVE</span>
        </div>
      </div>

      {/* Right: Actions, SOS link, Notifications, User Badge */}
      <div className="flex items-center gap-3">
        {/* Quick Emergency SOS CTA */}
        {role && ['student', 'faculty', 'super_admin', 'admin'].includes(role) && (
          <Link
            href="/sos"
            className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-md shadow-red-600/30 hover:bg-red-700 transition-colors animate-pulse border border-red-400 font-mono"
          >
            <HeartPulse className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">EMERGENCY SOS</span>
          </Link>
        )}

        {/* AI Copilot Quick Access */}
        <Link
          href="/copilot"
          className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-[#FFD700] bg-[#1C2541] hover:bg-[#243356] hover:border-[#D4AF37] px-2.5 py-1 rounded-md border border-[#243356] font-mono transition-colors shadow-sm"
        >
          <Sparkles className="h-3.5 w-3.5 text-[#FFD700] animate-pulse" />
          <span>Gemini 3.7 Copilot</span>
        </Link>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[#243356] bg-[#131C38] text-[#B8B5A3] hover:bg-[#1C2541] hover:text-[#FFD700] hover:border-[#D4AF37]/50 transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4 text-[#C5A059]" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#D4AF37] text-[10px] font-bold text-[#0B132B] ring-2 ring-[#0B132B]">
                {unreadNotificationsCount}
              </span>
            )}
          </button>
          <NotificationPanel isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
        </div>

        {/* Role Badge & Profile */}
        {user && (
          <div className="flex items-center gap-2.5 pl-2 border-l border-[#243356]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={user.full_name}
              className="h-8 w-8 rounded-full border border-[#D4AF37]/60 object-cover"
            />
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-[#F4F1DE] truncate max-w-[120px]">
                {user.full_name.split(' ')[0]}
              </span>
              <span className="text-[10px] font-mono font-bold text-[#FFD700]">
                {roleMeta?.label}
              </span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
