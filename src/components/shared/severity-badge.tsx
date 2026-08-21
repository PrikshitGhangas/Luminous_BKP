import React from 'react';
import { IncidentSeverity } from '@/lib/types';
import { Badge } from '../ui/badge';
import { AlertOctagon, AlertTriangle, Info, CheckCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SeverityBadgeProps {
  severity: IncidentSeverity;
  isAiClassified?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function SeverityBadge({
  severity,
  isAiClassified = false,
  className,
  size = 'md',
}: SeverityBadgeProps) {
  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2 font-bold',
  };

  const getIcon = () => {
    switch (severity) {
      case 'critical':
        return <AlertOctagon className={size === 'sm' ? 'w-3 h-3 text-red-400' : 'w-3.5 h-3.5 text-red-400'} />;
      case 'high':
        return <AlertTriangle className={size === 'sm' ? 'w-3 h-3 text-amber-400' : 'w-3.5 h-3.5 text-amber-400'} />;
      case 'medium':
        return <Info className={size === 'sm' ? 'w-3 h-3 text-blue-400' : 'w-3.5 h-3.5 text-blue-400'} />;
      case 'low':
        return <CheckCircle className={size === 'sm' ? 'w-3 h-3 text-emerald-400' : 'w-3.5 h-3.5 text-emerald-400'} />;
    }
  };

  return (
    <Badge
      variant={severity}
      className={cn(
        'font-mono uppercase tracking-wider items-center font-bold shrink-0',
        sizeClasses[size],
        className
      )}
    >
      {isAiClassified ? (
        <Sparkles className={size === 'sm' ? 'w-3 h-3 text-[#FFD700]' : 'w-3.5 h-3.5 text-[#FFD700]'} />
      ) : (
        getIcon()
      )}
      <span>{severity}</span>
    </Badge>
  );
}

