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
        return <AlertOctagon className="h-4 w-4 text-red-400" />;
      case 'incident':
        return <Flame className="h-4 w-4 text-[#FFD700]" />;
      case 'academic':
        return <BookOpen className="h-4 w-4 text-[#C5A059]" />;
      default:
        return <Bell className="h-4 w-4 text-[#B8B5A3]" />;
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs" onClick={onClose} />
      <div className="fixed right-4 top-16 z-50 w-80 sm:w-96 rounded-xl border border-[#D4AF37]/30 bg-[#0F1026] text-[#F4F1DE] shadow-2xl shadow-black/60 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
        <div className="flex items-center justify-between border-b border-[#243356] bg-[#131C38] px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-[#F4F1DE] font-mono">Notifications</span>
            {unreadCount > 0 && (
              <span className="rounded-full bg-[#D4AF37] px-1.5 py-0.2 text-[11px] font-bold text-[#0B132B]">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1 text-xs text-[#D4AF37] hover:text-[#FFD700] font-medium"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              <span>Mark all read</span>
            </button>
          )}
        </div>

        <div className="max-h-[380px] overflow-y-auto divide-y divide-[#243356]">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-sm text-[#B8B5A3]">No notifications</div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markAsRead(n.id)}
                className={`p-3.5 transition-colors hover:bg-[#1C2541]/70 cursor-pointer ${
                  !n.read ? 'bg-[#D4AF37]/10' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0 p-1.5 rounded-md bg-[#1C2541] border border-[#243356]">
                    {getTypeIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-semibold text-[#F4F1DE] truncate">
                        {n.title}
                      </p>
                      <span className="text-[10px] text-[#C5A059] font-mono">
                        {formatTimeAgo(n.created_at)}
                      </span>
                    </div>
                    <p className="text-xs text-[#B8B5A3] line-clamp-2 mt-0.5">
                      {n.message}
                    </p>
                    {n.link && (
                      <Link
                        href={n.link}
                        onClick={onClose}
                        className="inline-flex items-center gap-1 text-[11px] text-[#FFD700] font-medium mt-1.5 hover:underline"
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

        <div className="border-t border-[#243356] bg-[#131C38] p-2 text-center">
          <Link
            href="/alerts"
            onClick={onClose}
            className="text-xs text-[#C5A059] hover:text-[#FFD700] font-medium font-mono"
          >
            View Alert Center →
          </Link>
        </div>
      </div>
    </>
  );
}
