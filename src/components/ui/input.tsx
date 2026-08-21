import * as React from 'react';
import { cn } from '@/lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-lg border border-[#D6D8D5] bg-white px-3 py-2 text-sm text-[#1F2933] ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#8A9199] focus-visible:outline-none focus-visible:border-[#EAB308] focus-visible:ring-1 focus-visible:ring-[#EAB308] disabled:cursor-not-allowed disabled:opacity-50 transition-all',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
