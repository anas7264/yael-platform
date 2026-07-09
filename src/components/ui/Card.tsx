'use client';
import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'interactive' | 'highlighted';
}

const variantStyles = {
  default: '',
  elevated: 'shadow-md',
  interactive: 'hover:border-border-medium hover:-translate-y-0.5 cursor-pointer transition-all duration-200',
  highlighted: 'border-primary-500/30 bg-gradient-card',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-bg-secondary border border-border-subtle rounded-lg p-6',
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';
