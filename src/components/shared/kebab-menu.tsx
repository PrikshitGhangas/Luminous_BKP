'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MoreVertical, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface KebabAction {
  label: string;
  onClick: () => void;
  danger?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}

interface KebabMenuProps {
  actions: KebabAction[];
  label?: string;
  align?: 'left' | 'right';
  horizontal?: boolean;
  className?: string;
}

/** Accessible three-dot / kebab context menu. */
export function KebabMenu({
  actions,
  label = 'More actions',
  align = 'right',
  horizontal = false,
  className,
}: KebabMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const Icon = horizontal ? MoreHorizontal : MoreVertical;

  return (
    <div ref={menuRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') setOpen((o) => !o);
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8A9199] hover:bg-[#F0F1EF] hover:text-[#1F2933] transition-colors cursor-pointer"
      >
        <Icon className="h-4 w-4" />
      </button>

      {open && (
        <div
          role="menu"
          className={cn(
            'absolute top-full z-40 mt-1 min-w-48 rounded-xl border border-[#D6D8D5] bg-white p-1 shadow-lg shadow-black/10',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          {actions.map((action, idx) => {
            const ActionIcon = action.icon;
            return (
              <button
                key={idx}
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  action.onClick();
                }}
                className={cn(
                  'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors cursor-pointer',
                  action.danger
                    ? 'text-[#C94C4C] hover:bg-[#C94C4C]/10'
                    : 'text-[#1F2933] hover:bg-[#F0F1EF]'
                )}
              >
                {ActionIcon && <ActionIcon className="h-4 w-4 shrink-0" />}
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}