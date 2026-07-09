'use client';
import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="flex flex-col w-full">
        {label && <label className="text-sm text-text-secondary mb-2">{label}</label>}
        <div className="relative flex items-center">
          {rightIcon && <span className="absolute right-3 flex items-center justify-center text-text-tertiary">{rightIcon}</span>}
          <input
            ref={ref}
            className={cn(
              'w-full h-12 bg-bg-tertiary border border-border-subtle rounded-md px-4 outline-none transition-all text-text-primary',
              'focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
              error && 'border-accent-rose focus:border-accent-rose focus:ring-accent-rose/20',
              rightIcon && 'pr-10',
              leftIcon && 'pl-10',
              className
            )}
            {...props}
          />
          {leftIcon && <span className="absolute left-3 flex items-center justify-center text-text-tertiary">{leftIcon}</span>}
        </div>
        {error && <span className="mt-1 text-accent-rose text-sm">{error}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';
