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
  const iconColors = {
    default: 'text-gray-500',
    critical: 'text-red-500',
    warning: 'text-amber-500',
    success: 'text-green-500',
    info: 'text-blue-500',
    primary: 'text-blue-600',
  };

  return (
    <Card className={cn('overflow-hidden border border-gray-200 bg-white shadow-sm', className)}>
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
          <div className={cn('flex items-center justify-center shrink-0', iconColors[variant])}>
            {icon}
          </div>
        </div>

        <div className="mt-2.5">
          <div className="text-2xl font-bold text-gray-900">
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

