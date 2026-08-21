'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRole } from '@/lib/hooks/use-role';
import { cn } from '@/lib/utils';
import {
  Heart,
  HeartPulse,
  User,
  Sparkles,
  Radio,
  Flame,
  MapPin,
  Bell,
  BarChart3,
  Users,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  CalendarCheck,
  FileSpreadsheet,
  Clock,
  Building2,
  Bus,
  MessageSquareWarning,
  Award,
  Megaphone,
  UserCheck,
  ScrollText,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  BookOpen,
  Landmark,
} from 'lucide-react';
import { UserRole } from '@/lib/types';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
  badge?: string | number;
  highlight?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'SAFETY & EMERGENCY',
    items: [
      {
        title: 'Hackathon Demo Hub',
        href: '/demo',
        icon: Sparkles,
        roles: ['super_admin', 'admin', 'security', 'faculty', 'student', 'warden', 'placement_officer', 'parent'],
        highlight: true,
        badge: 'DEMO',
      },
      {
        title: 'CampusShield Copilot',
        href: '/copilot',
        icon: Sparkles,
        roles: ['super_admin', 'admin', 'security', 'faculty', 'student', 'warden', 'placement_officer', 'parent'],
        highlight: true,
        badge: 'AI',
      },
      {
        title: 'Security Operations',
        href: '/security',
        icon: ShieldCheck,
        roles: ['security', 'super_admin', 'admin'],
        highlight: true,
      },
      {
        title: 'Emergency SOS',
        href: '/safety/sos',
        icon: HeartPulse,
        roles: ['student', 'faculty', 'super_admin', 'admin', 'warden', 'security', 'parent', 'placement_officer'],
        highlight: true,
      },
      {
        title: 'Emergency Alerts',
        href: '/safety/emergency',
        icon: Bell,
        roles: ['super_admin', 'admin', 'security', 'faculty', 'warden'],
      },
      {
        title: 'Command Center',
        href: '/safety/command-center',
        icon: Radio,
        roles: ['super_admin', 'admin', 'security'],
      },
      {
        title: 'Incidents Queue',
        href: '/incidents',
        icon: Flame,
        roles: ['super_admin', 'admin', 'security', 'faculty', 'student', 'warden', 'placement_officer'],
      },
      {
        title: 'Campus Map',
        href: '/campus-map',
        icon: MapPin,
        roles: ['super_admin', 'admin', 'security', 'faculty', 'student', 'warden', 'placement_officer'],
      },
      {
        title: 'Safety Analytics',
        href: '/analytics/safety',
        icon: BarChart3,
        roles: ['super_admin', 'admin', 'security', 'faculty', 'student', 'warden', 'placement_officer', 'parent'],
      },
      {
        title: 'Risk Intelligence',
        href: '/safety/risk-intelligence',
        icon: Sparkles,
        roles: ['super_admin', 'admin', 'security', 'faculty', 'warden'],
        highlight: true,
      },
    ],
  },
  {
    title: 'STUDENT & ACADEMIC ERP',
    items: [
      {
        title: 'Student Dashboard',
        href: '/student',
        icon: User,
        roles: ['student', 'super_admin', 'admin', 'faculty', 'parent'],
        highlight: true,
      },
      {
        title: 'Attendance',
        href: '/attendance',
        icon: CalendarCheck,
        roles: ['super_admin', 'admin', 'faculty', 'student', 'parent'],
      },
      {
        title: 'Timetable',
        href: '/timetable',
        icon: Clock,
        roles: ['super_admin', 'admin', 'faculty', 'student', 'parent', 'warden'],
      },
      {
        title: 'Exams & Grades',
        href: '/exams',
        icon: FileSpreadsheet,
        roles: ['super_admin', 'admin', 'faculty', 'student', 'parent'],
      },
      {
        title: 'Courses Catalog',
        href: '/courses',
        icon: BookOpen,
        roles: ['super_admin', 'admin', 'faculty', 'student', 'parent'],
      },
      {
        title: 'Departments',
        href: '/departments',
        icon: Landmark,
        roles: ['super_admin', 'admin', 'faculty', 'student'],
      },
      {
        title: 'Students Directory',
        href: '/students',
        icon: GraduationCap,
        roles: ['super_admin', 'admin', 'faculty', 'student', 'parent'],
      },
      {
        title: 'Faculty Directory',
        href: '/faculty',
        icon: Briefcase,
        roles: ['super_admin', 'admin', 'faculty', 'student'],
      },
    ],
  },
  {
    title: 'SECONDARY CAMPUS SERVICES',
    items: [
      {
        title: 'Hostel Quarters',
        href: '/hostel',
        icon: Building2,
        roles: ['super_admin', 'admin', 'warden', 'student', 'faculty', 'parent'],
      },
      {
        title: 'Transport Routes',
        href: '/transport',
        icon: Bus,
        roles: ['super_admin', 'admin', 'student', 'parent', 'faculty', 'warden'],
      },
      {
        title: 'Placements Portal',
        href: '/placement',
        icon: Award,
        roles: ['super_admin', 'admin', 'placement_officer', 'student'],
      },
      {
        title: 'Complaints Redressal',
        href: '/complaints',
        icon: MessageSquareWarning,
        roles: ['super_admin', 'admin', 'faculty', 'student', 'warden', 'placement_officer'],
      },
      {
        title: 'Parent Portal',
        href: '/parent',
        icon: UserCheck,
        roles: ['parent', 'super_admin', 'admin'],
      },
      {
        title: 'Student Wellbeing',
        href: '/wellbeing',
        icon: Heart,
        roles: ['student', 'faculty', 'super_admin', 'admin', 'warden', 'parent'],
      },
    ],
  },
  {
    title: 'COMMUNICATION & ADMIN',
    items: [
      {
        title: 'Announcements',
        href: '/announcements',
        icon: Megaphone,
        roles: ['super_admin', 'admin', 'faculty', 'student', 'parent', 'warden', 'placement_officer', 'security'],
      },
      {
        title: 'Audit Logs',
        href: '/audit-logs',
        icon: ScrollText,
        roles: ['super_admin', 'admin'],
      },
      {
        title: 'Settings',
        href: '/settings',
        icon: Settings,
        roles: ['super_admin', 'admin', 'faculty', 'student', 'parent', 'security', 'warden', 'placement_officer'],
      },
    ],
  },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

import { useSafety } from '@/lib/context/safety-context';
import { useAuth } from '@/lib/context/auth-context';

export function Sidebar({ isCollapsed, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const { role, user, roleMeta } = useRole();
  const { incidents, alerts } = useSafety();
  const { isDemoMode, logout } = useAuth();

  if (!role) return null;

  const activeIncidentsCount = incidents.filter(
    (i) => i.status !== 'resolved' && i.status !== 'closed'
  ).length;
  const activeAlertsCount = alerts.filter((a) => a.is_active).length;

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-[#D6D8D5] bg-white text-[#1F2933] transition-all duration-300 select-none shadow-md shadow-black/5',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header with Luminous AI Branding */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#D6D8D5] px-3.5 bg-white">
        <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#F4C430] via-[#EAB308] to-[#D4AF37] shadow-sm shadow-[#D4AF37]/30 text-[#111827]">
            <Sparkles className="h-5 w-5 font-bold" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight text-[#1F2933] flex items-center gap-1.5">
                Luminous <span className="text-[#8a6d1a] font-bold text-xs">AI</span>
              </span>
              <span className="text-[10px] text-[#667085] uppercase tracking-widest">
                Smart ERP &amp; Safety
              </span>
            </div>
          )}
        </Link>

        <button
          onClick={onToggleCollapse}
          className="flex h-7 w-7 items-center justify-center rounded-md text-[#8A9199] hover:bg-[#E8E9E7] hover:text-[#1F2933] transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* User & Role Badge */}
      {!isCollapsed && user && (
        <div className="border-b border-[#D6D8D5] bg-[#F7F8F6] p-3">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={user.full_name}
                className="h-8 w-8 rounded-full border border-[#EAB308]/50 object-cover"
              />
              <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-[#3F8F68] ring-2 ring-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-xs font-bold text-[#1F2933]">{user.full_name}</p>
              <div className="mt-0.5 flex items-center gap-1">
                <span className="inline-block px-1.5 py-0.2 text-[9px] font-bold rounded bg-[#EAB308]/15 text-[#8a6d1a] border border-[#EAB308]/30">
                  {roleMeta?.label}
                </span>
                {isDemoMode && (
                  <span className="inline-block px-1.5 py-0.2 text-[9px] font-bold rounded bg-[#B7791F]/10 text-[#8a5a14] border border-[#B7791F]/30">
                    DEMO
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-5">
        {NAV_SECTIONS.map((section) => {
          const visibleItems = section.items.filter((item) => item.roles.includes(role));
          if (visibleItems.length === 0) return null;

          return (
            <div key={section.title} className="space-y-1">
              {!isCollapsed && (
                <p className="px-2.5 text-[10px] font-bold tracking-widest text-[#8A9199]">
                  {section.title}
                </p>
              )}
              <div className="space-y-0.5">
                {visibleItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  const Icon = item.icon;
                  const itemBadge =
                    item.href === '/incidents'
                      ? activeIncidentsCount > 0
                        ? activeIncidentsCount
                        : undefined
                      : item.href === '/alerts'
                      ? activeAlertsCount > 0
                        ? activeAlertsCount
                        : undefined
                      : item.badge;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'group flex items-center gap-3 rounded-lg px-2.5 py-2 text-xs font-medium transition-all',
                        isActive
                          ? 'bg-gradient-to-r from-[#EAB308] to-[#D4AF37] text-[#111827] font-bold shadow-sm'
                          : 'text-[#667085] hover:bg-[#F0F1EF] hover:text-[#1F2933]',
                        item.highlight && !isActive && 'text-[#8a6d1a] hover:text-[#1F2933]',
                        isCollapsed && 'justify-center px-0 py-2.5'
                      )}
                      title={isCollapsed ? item.title : undefined}
                    >
                      <Icon
                        className={cn(
                          'h-4 w-4 shrink-0 transition-colors',
                          isActive ? 'text-[#111827]' : 'text-[#8A9199] group-hover:text-[#1F2933]',
                          item.highlight && !isActive && 'text-[#D4AF37]'
                        )}
                      />
                      {!isCollapsed && (
                        <div className="flex flex-1 items-center justify-between overflow-hidden">
                          <span className="truncate">{item.title}</span>
                          {itemBadge !== undefined && (
                            <span
                              className={cn(
                                'rounded px-1.5 py-0.2 text-[10px] font-bold',
                                isActive
                                  ? 'bg-[#111827] text-[#F4C430]'
                                  : 'bg-[#F0F1EF] text-[#667085] border border-[#D6D8D5]'
                              )}
                            >
                              {itemBadge}
                            </span>
                          )}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer / Logout */}
      <div className="shrink-0 border-t border-[#D6D8D5] p-2 bg-white">
        <button
          onClick={() => logout()}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-xs font-medium text-[#667085] hover:bg-[#F0F1EF] hover:text-[#1F2933] transition-colors cursor-pointer',
            isCollapsed && 'justify-center px-0'
          )}
          title="Sign Out"
        >
          <LogOut className="h-4 w-4 shrink-0 text-[#8A9199]" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}