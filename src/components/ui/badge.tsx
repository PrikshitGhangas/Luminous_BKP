import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold font-mono transition-colors focus:outline-none focus:ring-2 focus:ring-[#EAB308] focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-[#EAB308]/40 bg-[#EAB308]/15 text-[#8a6d1a]',
        gold:
          'border-[#EAB308] bg-gradient-to-r from-[#EAB308]/20 to-[#D4AF37]/20 text-[#7a5d14]',
        champagne:
          'border-[#EAB308]/40 bg-[#D4AF37]/15 text-[#8a6d1a]',
        secondary:
          'border-[#D6D8D5] bg-[#E8E9E7] text-[#667085]',
        destructive:
          'border-[#C94C4C]/40 bg-[#C94C4C]/10 text-[#C94C4C]',
        outline: 'text-[#1F2933] border-[#D6D8D5] bg-white',
        critical: 'border-[#C94C4C]/50 bg-[#C94C4C]/10 text-[#C94C4C] font-bold',
        high: 'border-[#B7791F]/50 bg-[#B7791F]/10 text-[#B7791F] font-bold',
        medium: 'border-[#2563EB]/40 bg-[#2563EB]/10 text-[#2563EB] font-bold',
        low: 'border-[#3F8F68]/40 bg-[#3F8F68]/10 text-[#3F8F68] font-bold',
        info: 'border-[#2563EB]/40 bg-[#2563EB]/10 text-[#2563EB]',
        safe: 'border-[#3F8F68]/40 bg-[#3F8F68]/10 text-[#3F8F68]',
        warning: 'border-[#B7791F]/50 bg-[#B7791F]/10 text-[#B7791F]',
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

