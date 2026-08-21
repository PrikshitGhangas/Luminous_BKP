import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold font-mono transition-colors focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-[#D4AF37]/40 bg-[#D4AF37]/15 text-[#FFD700]',
        gold:
          'border-[#D4AF37] bg-gradient-to-r from-[#D4AF37]/20 to-[#C5A059]/20 text-[#FFD700]',
        champagne:
          'border-[#C5A059]/40 bg-[#C5A059]/15 text-[#C5A059]',
        secondary:
          'border-[#243356] bg-[#1C2541] text-[#F4F1DE]',
        destructive:
          'border-red-500/40 bg-red-950/70 text-red-300',
        outline: 'text-[#F4F1DE] border-[#243356]',
        critical: 'border-red-500/50 bg-red-950/80 text-red-300 font-bold',
        high: 'border-amber-500/50 bg-amber-950/80 text-amber-300 font-bold',
        medium: 'border-blue-500/40 bg-blue-950/70 text-blue-300 font-bold',
        low: 'border-emerald-500/40 bg-emerald-950/70 text-emerald-300 font-bold',
        info: 'border-blue-500/40 bg-blue-950/70 text-blue-300',
        safe: 'border-emerald-500/40 bg-emerald-950/70 text-emerald-300',
        warning: 'border-amber-500/50 bg-amber-950/80 text-amber-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

