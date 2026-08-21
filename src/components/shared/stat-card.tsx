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
    default: 'border-[#D6D8D5] bg-white hover:border-[#EAB308]/50',
    critical: 'border-l-4 border-l-[#C94C4C] border-[#D6D8D5] bg-white',
    warning: 'border-l-4 border-l-[#B7791F] border-[#D6D8D5] bg-white',
    success: 'border-l-4 border-l-[#3F8F68] border-[#D6D8D5] bg-white',
    info: 'border-l-4 border-l-[#2563EB] border-[#D6D8D5] bg-white',
    primary: 'border-l-4 border-l-[#D4AF37] border-[#D6D8D5] bg-white',
  };

  const iconContainerStyles = {
    default: 'bg-[#F0F1EF] text-[#8a6d1a] border border-[#D6D8D5]',
    critical: 'bg-[#C94C4C]/10 text-[#C94C4C] border border-[#C94C4C]/30',
    warning: 'bg-[#B7791F]/10 text-[#B7791F] border border-[#B7791F]/30',
    success: 'bg-[#3F8F68]/10 text-[#3F8F68] border border-[#3F8F68]/30',
    info: 'bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/30',
    primary: 'bg-[#EAB308]/15 text-[#8a6d1a] border border-[#EAB308]/40',
  };

  return (
    <Card className={cn('overflow-hidden transition-all duration-200 hover:shadow-md', variantStyles[variant], className)}>
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#667085] truncate">{title}</p>
          <div className={cn('p-2 rounded-lg flex items-center justify-center shrink-0', iconContainerStyles[variant])}>
            {icon}
          </div>
        </div>

        <div className="mt-2.5">
          <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-[#1F2933]">
            {value}
          </div>

          {(description || trend) && (
            <div className="mt-1.5 flex items-center gap-2 text-xs">
              {trend && (
                <span
                  className={cn(
                    'font-medium shrink-0',
                    trend.isPositive ? 'text-[#3F8F68]' : 'text-[#C94C4C]'
                  )}
                >
                  {trend.isPositive ? '↑' : '↓'} {trend.value}
                </span>
              )}
              {description && (
                <span className="text-[#8A9199] text-[11px] truncate">{description}</span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

