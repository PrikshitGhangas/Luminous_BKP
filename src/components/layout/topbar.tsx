'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useRole } from '@/lib/hooks/use-role';
import { useSafety } from '@/lib/context/safety-context';
import { useAuth } from '@/lib/context/auth-context';
import { NotificationPanel } from '../shared/notification-panel';
import {
  Bell,
  Search,
  ChevronRight,
  Menu,
  Sparkles,
  HeartPulse,
  LayoutDashboard,
  Settings,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import Link from 'next/link';

interface TopbarProps {
  onToggleMobileMenu?: () => void;
}

export function Topbar({ onToggleMobileMenu }: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { role, user, roleMeta } = useRole();
  const { logout } = useAuth();
  const { unreadNotificationsCount } = useSafety();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileOpen && profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (isNotifOpen && notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setProfileOpen(false);
        setIsNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [profileOpen, isNotifOpen]);

  const handleLogout = async () => {
    setProfileOpen(false);
    await logout();
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbTitle =
    segments.length === 0
      ? 'Overview'
      : segments[segments.length - 1]
          .split('-')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#D6D8D5] bg-white/95 px-4 backdrop-blur-md text-[#1F2933]">
      {/* Left: Mobile Toggle & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#D6D8D5] text-[#667085] hover:bg-[#E8E9E7] hover:text-[#1F2933] md:hidden"
          aria-label="Toggle Navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <nav className="flex items-center gap-1.5 text-xs text-[#667085]">
          <Link href="/" className="hover:text-[#1F2933] font-semibold">
            Luminous AI
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-[#8a9199]" />
          <span className="font-bold text-[#8a6d1a]">
            {breadcrumbTitle}
          </span>
        </nav>
      </div>

      {/* Center: Search & Live Security Ping */}
      <div className="hidden lg:flex items-center gap-4">
        <div className="relative w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#8a9199]" />
          <input
            type="text"
            placeholder="Search incidents, intelligence, records..."
            className="h-9 w-full rounded-lg border border-[#D6D8D5] bg-[#F7F8F6] pl-9 pr-3 text-xs text-[#1F2933] placeholder:text-[#8A9199] focus:border-[#EAB308] focus:outline-none focus:ring-1 focus:ring-[#EAB308]"
          />
        </div>

      </div>

      {/* Right: Actions, SOS link, Notifications, User Badge */}
      <div className="flex items-center gap-3">
        {/* Quick Emergency SOS CTA */}
        {role && ['student', 'faculty', 'super_admin', 'admin'].includes(role) && (
          <Link
            href="/safety/sos"
            className="flex items-center gap-1.5 rounded-lg bg-[#C94C4C] px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-[#b84343] transition-colors animate-pulse border border-red-400"
          >
            <HeartPulse className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Emergency SOS</span>
          </Link>
        )}

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[#D6D8D5] bg-white text-[#667085] hover:bg-[#E8E9E7] hover:text-[#1F2933] hover:border-[#EAB308]/50 transition-colors cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4 text-[#667085]" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#EAB308] text-[10px] font-bold text-[#111827] ring-2 ring-white">
                {unreadNotificationsCount}
              </span>
            )}
          </button>
          <NotificationPanel isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
        </div>

        {/* Profile Menu */}
        {user && (
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen((o) => !o)}
              aria-haspopup="menu"
              aria-expanded={profileOpen}
              aria-label="Account menu"
              className="flex items-center gap-2 rounded-lg px-1.5 py-1 transition-colors hover:bg-[#F0F1EF] cursor-pointer"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={user.full_name}
                className="h-8 w-8 rounded-full border border-[#EAB308]/60 object-cover"
              />
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-[#1F2933] truncate max-w-[110px]">
                  {user.full_name.split(' ')[0]}
                </span>
                <span className="text-[10px] font-bold text-[#8a6d1a]">
                  {roleMeta?.label}
                </span>
              </div>
              <ChevronDown className="hidden md:block h-3.5 w-3.5 text-[#8A9199]" />
            </button>

            {profileOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full z-40 mt-1.5 w-64 rounded-xl border border-[#D6D8D5] bg-white p-1 shadow-lg shadow-black/10"
              >
                <div className="border-b border-[#D6D8D5] px-3 py-3">
                  <p className="truncate text-sm font-bold text-[#1F2933]">{user.full_name}</p>
                  <p className="truncate text-xs text-[#667085]">{user.email}</p>
                  <span className="mt-1.5 inline-block rounded px-1.5 py-0.5 text-[10px] font-bold text-[#8a6d1a] bg-[#EAB308]/15 border border-[#EAB308]/30">
                    {roleMeta?.name}
                  </span>
                </div>

                <div className="py-1">
                  <button
                    role="menuitem"
                    onClick={() => {
                      setProfileOpen(false);
                      router.push(roleMeta?.defaultPath || '/');
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-[#1F2933] hover:bg-[#F0F1EF] cursor-pointer"
                  >
                    <LayoutDashboard className="h-4 w-4 text-[#667085]" />
                    Dashboard
                  </button>
                  <button
                    role="menuitem"
                    onClick={() => {
                      setProfileOpen(false);
                      router.push('/settings');
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-[#1F2933] hover:bg-[#F0F1EF] cursor-pointer"
                  >
                    <Settings className="h-4 w-4 text-[#667085]" />
                    Settings
                  </button>
                </div>

                <div className="border-t border-[#D6D8D5] py-1">
                  <button
                    role="menuitem"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-[#C94C4C] hover:bg-[#C94C4C]/10 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}