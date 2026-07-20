'use client';
import { InputHTMLAttributes, forwardRef, useId } from 'react';
import { cn } from '@/lib/utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  startIcon?: React.ReactNode; // logical: inline-start icon (right in RTL)
  endIcon?: React.ReactNode;   // logical: inline-end icon (left in RTL)
  /** @deprecated use startIcon/endIcon. Kept for backward compat. */
  leftIcon?: React.ReactNode;
  /** @deprecated use startIcon/endIcon. Kept for backward compat. */
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, startIcon, endIcon, leftIcon, rightIcon, ...props }, ref) => {
    const inputId = useId();
    const errorId = useId();

    // Allow legacy leftIcon/rightIcon props mapped to logical equivalents
    const resolvedStart = startIcon ?? rightIcon;
    const resolvedEnd = endIcon ?? leftIcon;

    return (
      <div className="flex flex-col w-full">
        {label && (
          <label htmlFor={inputId} className="text-sm text-text-secondary mb-2">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {resolvedStart && (
            <span className="absolute inset-y-0 start-3 flex items-center justify-center text-text-tertiary pointer-events-none" aria-hidden="true">
              {resolvedStart}
            </span>
          )}
          <input
            id={inputId}
            ref={ref}
            aria-describedby={error ? errorId : undefined}
            aria-invalid={error ? 'true' : undefined}
            className={cn(
              'w-full h-12 bg-bg-tertiary border border-border-subtle rounded-md px-4 outline-none transition-all text-text-primary',
              'focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
              error && 'border-accent-rose focus:border-accent-rose focus:ring-accent-rose/20',
              resolvedStart && 'ps-10',
              resolvedEnd && 'pe-10',
              className
            )}
            {...props}
          />
          {resolvedEnd && (
            <span className="absolute inset-y-0 end-3 flex items-center justify-center text-text-tertiary pointer-events-none" aria-hidden="true">
              {resolvedEnd}
            </span>
          )}
        </div>
        {error && (
          <span
            id={errorId}
            role="alert"
            className="mt-1 text-accent-rose text-sm"
          >
            {error}
          </span>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
