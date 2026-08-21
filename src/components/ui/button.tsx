import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B132B] disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#C5A059] text-[#0B132B] font-bold shadow-md shadow-[#D4AF37]/20 hover:brightness-110 active:scale-98',
        gold:
          'bg-[#D4AF37] text-[#0B132B] font-bold shadow-lg shadow-[#D4AF37]/25 hover:bg-[#FFD700] hover:shadow-[#D4AF37]/40 active:scale-98',
        destructive:
          'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm border border-red-500/40 font-bold',
        outline:
          'border border-[#243356] bg-[#131C38]/90 text-[#F4F1DE] hover:bg-[#1C2541] hover:border-[#D4AF37] hover:text-[#FFD700] shadow-xs',
        secondary:
          'bg-[#1C2541] text-[#F4F1DE] hover:bg-[#243356] border border-[#243356]',
        ghost:
          'text-[#B8B5A3] hover:bg-[#1C2541]/70 hover:text-[#FFD700]',
        link: 'text-[#D4AF37] underline-offset-4 hover:underline hover:text-[#FFD700]',
        emergency:
          'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/40 animate-pulse font-bold border border-red-400',
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

