import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'xp' | 'streak';
  size?: 'sm' | 'md';
}

const variantStyles = {
  default: 'bg-bg-tertiary text-text-primary',
  success: 'bg-accent-emerald/10 text-accent-emerald',
  warning: 'bg-accent-gold/10 text-accent-gold',
  danger: 'bg-accent-rose/10 text-accent-rose',
  info: 'bg-primary-500/10 text-primary-500',
  xp: 'bg-gradient-gold text-white',
  streak: 'bg-accent-rose/10 text-accent-rose',
};

const sizeStyles = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-3 py-1',
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'sm', children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'rounded-full inline-flex items-center font-medium',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);
Badge.displayName = 'Badge';
