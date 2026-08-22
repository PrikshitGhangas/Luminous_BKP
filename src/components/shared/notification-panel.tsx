'use client';

import React from 'react';
import { useSafety } from '@/lib/context/safety-context';
import { formatTimeAgo } from '@/lib/utils';
import { Bell, CheckCheck, AlertOctagon, Flame, BookOpen, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const {
    notifications,
    unreadNotificationsCount: unreadCount,
    markNotificationAsRead: markAsRead,
    markAllNotificationsAsRead: markAllAsRead,
  } = useSafety();

  if (!isOpen) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'emergency':
        return <AlertOctagon className="h-4 w-4 text-[#C94C4C]" />;
      case 'incident':
        return <Flame className="h-4 w-4 text-[#B7791F]" />;
      case 'academic':
        return <BookOpen className="h-4 w-4 text-[#8a6d1a]" />;
      default:
        return <Bell className="h-4 w-4 text-[#667085]" />;
    }
  };

  return (
    <div className="absolute right-0 top-full mt-2 z-50 w-80 sm:w-96 rounded-xl border border-[#D6D8D5] bg-white text-[#1F2933] shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
      <div className="flex items-center justify-between border-b border-[#D6D8D5] bg-[#F7F8F6] px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-[#1F2933]">Notifications</span>
            {unreadCount > 0 && (
              <span className="rounded-full bg-[#EAB308] px-1.5 py-0.2 text-[11px] font-bold text-[#111827]">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1 text-xs text-[#8a6d1a] hover:text-[#B45309] font-medium"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              <span>Mark all read</span>
            </button>
          )}
        </div>

        <div className="max-h-[380px] overflow-y-auto divide-y divide-[#E8E9E7]">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-sm text-[#8A9199]">No notifications</div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markAsRead(n.id)}
                className={`p-3.5 transition-colors hover:bg-[#F7F8F6] cursor-pointer ${
                  !n.read ? 'bg-[#EAB308]/10' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0 p-1.5 rounded-md bg-[#F0F1EF] border border-[#D6D8D5]">
                    {getTypeIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-semibold text-[#1F2933] truncate">
                        {n.title}
                      </p>
                      <span className="text-[10px] text-[#8A9199]">
                        {formatTimeAgo(n.created_at)}
                      </span>
                    </div>
                    <p className="text-xs text-[#667085] line-clamp-2 mt-0.5">
                      {n.message}
                    </p>
                    {n.link && (
                      <Link
                        href={n.link}
                        onClick={onClose}
                        className="inline-flex items-center gap-1 text-[11px] text-[#8a6d1a] font-medium mt-1.5 hover:underline"
                      >
                        <span>View details</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-[#D6D8D5] bg-[#F7F8F6] p-2 text-center">
          <Link
            href="/safety/emergency"
            onClick={onClose}
            className="text-xs text-[#8a6d1a] hover:text-[#B45309] font-medium"
          >
            View Safety Announcements &amp; Alerts →
          </Link>
        </div>
      </div>
  );
}
