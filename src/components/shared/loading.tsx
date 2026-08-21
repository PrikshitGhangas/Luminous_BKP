import React from 'react';
import { Skeleton } from '../ui/skeleton';
import { Sparkles } from 'lucide-react';

export function LoadingSpinner({ text = 'Loading Luminous AI...' }: { text?: string }) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center space-y-4">
      <div className="relative flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-4 border-[#E8E9E7] border-t-[#D4AF37] animate-spin" />
        <Sparkles className="absolute h-5 w-5 text-[#8a6d1a] animate-pulse" />
      </div>
      <p className="text-sm font-medium text-[#667085] tracking-wider animate-pulse">{text}</p>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 bg-[#E8E9E7]" />
          <Skeleton className="h-4 w-72 bg-[#E8E9E7]" />
        </div>
        <Skeleton className="h-10 w-32 bg-[#E8E9E7]" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl bg-[#E8E9E7]" />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Skeleton className="h-96 rounded-xl lg:col-span-2 bg-[#E8E9E7]" />
        <Skeleton className="h-96 rounded-xl bg-[#E8E9E7]" />
      </div>
    </div>
  );
}
