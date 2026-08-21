import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EAB308] focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-[#EAB308] via-[#F4C430] to-[#D4AF37] text-[#111827] font-bold shadow-sm shadow-[#D4AF37]/25 hover:brightness-110 active:scale-98',
        gold:
          'bg-[#EAB308] text-[#111827] font-bold shadow-sm shadow-[#D4AF37]/25 hover:bg-[#F4C430] active:scale-98',
        destructive:
          'bg-[#C94C4C] text-white hover:bg-[#b84343] active:bg-[#a63c3c] shadow-sm border border-[#C94C4C]/40 font-bold',
        outline:
          'border border-[#D6D8D5] bg-white text-[#1F2933] hover:bg-[#E8E9E7] hover:border-[#EAB308] hover:text-[#8a6d1a] shadow-xs',
        secondary:
          'bg-[#E8E9E7] text-[#1F2933] hover:bg-[#dddfdc] border border-[#D6D8D5]',
        ghost:
          'text-[#667085] hover:bg-[#E8E9E7] hover:text-[#1F2933]',
        link: 'text-[#8a6d1a] underline-offset-4 hover:underline hover:text-[#B45309]',
        emergency:
          'bg-[#C94C4C] text-white hover:bg-[#b84343] shadow-sm shadow-red-500/40 animate-pulse font-bold border border-red-400',
      },
      size: {
        default: 'h-10 px-4 py-2 text-xs font-mono sm:text-sm',
        sm: 'h-8 rounded-md px-3 text-xs font-mono',
        lg: 'h-11 rounded-lg px-8 text-base font-bold',
        icon: 'h-9 w-9 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const combinedClassName = cn(buttonVariants({ variant, size, className }));

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<{ className?: string }>, {
        className: cn(combinedClassName, (children as React.ReactElement<{ className?: string }>).props.className),
        ...props,
      });
    }

    return (
      <button
        className={combinedClassName}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };

