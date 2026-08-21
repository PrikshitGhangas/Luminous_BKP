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
        'flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-[#D6D8D5] bg-white text-[#1F2933]',
        className
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F7F8F6] border border-[#EAB308]/30 text-[#8a6d1a] mb-3.5">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-bold text-[#1F2933]">{title}</h3>
      <p className="mt-1 text-xs text-[#667085] max-w-sm leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          size="sm"
          className="mt-4 text-xs"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

