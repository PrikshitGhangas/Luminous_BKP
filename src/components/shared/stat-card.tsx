import React from 'react';
import { Card, CardContent } from '../ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  icon: React.ReactNode;
  variant?: 'default' | 'critical' | 'warning' | 'success' | 'primary' | 'info';
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  trend,
  icon,
  variant = 'default',
  className,
}: StatCardProps) {
  const variantStyles = {
    default: 'border-[#243356] bg-[#131C38]/90 hover:border-[#D4AF37]/40',
    critical: 'border-l-4 border-l-red-500 border-[#243356] bg-gradient-to-br from-[#131C38] to-red-950/20',
    warning: 'border-l-4 border-l-amber-500 border-[#243356] bg-gradient-to-br from-[#131C38] to-amber-950/20',
    success: 'border-l-4 border-l-emerald-500 border-[#243356] bg-gradient-to-br from-[#131C38] to-emerald-950/20',
    info: 'border-l-4 border-l-blue-500 border-[#243356] bg-gradient-to-br from-[#131C38] to-blue-950/20',
    primary: 'border-l-4 border-l-[#D4AF37] border-[#243356] bg-gradient-to-br from-[#131C38] to-[#1C2541]',
  };

  const iconContainerStyles = {
    default: 'bg-[#1C2541] text-[#C5A059] border border-[#243356]',
    critical: 'bg-red-950/60 text-red-400 border border-red-800/60',
    warning: 'bg-amber-950/60 text-amber-400 border border-amber-800/60',
    success: 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60',
    info: 'bg-blue-950/60 text-blue-400 border border-blue-800/60',
    primary: 'bg-[#D4AF37]/15 text-[#FFD700] border border-[#D4AF37]/40 shadow-sm shadow-[#D4AF37]/15',
  };

  return (
    <Card className={cn('overflow-hidden transition-all duration-200 hover:shadow-xl hover:shadow-black/40', variantStyles[variant], className)}>
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#B8B5A3] font-mono truncate">{title}</p>
          <div className={cn('p-2 rounded-lg flex items-center justify-center shrink-0', iconContainerStyles[variant])}>
            {icon}
          </div>
        </div>

        <div className="mt-2.5">
          <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-[#F4F1DE] font-mono">
            {value}
          </div>

          {(description || trend) && (
            <div className="mt-1.5 flex items-center gap-2 text-xs">
              {trend && (
                <span
                  className={cn(
                    'font-medium font-mono shrink-0',
                    trend.isPositive ? 'text-emerald-400' : 'text-red-400'
                  )}
                >
                  {trend.isPositive ? '↑' : '↓'} {trend.value}
                </span>
              )}
              {description && (
                <span className="text-[#B8B5A3] text-[11px] truncate font-sans">{description}</span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

