'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

/** Right-hand side panel for secondary details (progressive disclosure). */
export function Drawer({ open, onClose, title, children, footer, className }: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label={title || 'Details'}>
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-xs"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={cn(
          'absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-xl border-l border-[#D6D8D5] animate-in slide-in-from-right duration-200',
          className
        )}
      >
        {title && (
          <div className="flex items-center justify-between border-b border-[#D6D8D5] px-5 py-4">
            <h2 className="text-base font-bold text-[#1F2933]">{title}</h2>
            <button
              onClick={onClose}
              aria-label="Close"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#8A9199] hover:bg-[#F0F1EF] hover:text-[#1F2933] transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
        {footer && (
          <div className="border-t border-[#D6D8D5] px-5 py-4">{footer}</div>
        )}
      </div>
    </div>
  );
}