import React from 'react';
import { Button } from '../ui/button';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-[#243356] bg-[#0F1026]/70 text-[#F4F1DE]',
        className
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#131C38] border border-[#D4AF37]/30 text-[#FFD700] mb-3.5 shadow-lg shadow-black/30">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-bold font-mono text-[#F4F1DE] uppercase tracking-wider">{title}</h3>
      <p className="mt-1 text-xs text-[#B8B5A3] max-w-sm leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          size="sm"
          className="mt-4 bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-[#0B132B] font-bold font-mono text-xs shadow-md shadow-[#D4AF37]/20"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

