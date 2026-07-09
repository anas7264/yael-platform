'use client';
import { cn } from '@/lib/utils/cn';

interface ProgressBarProps {
  value: number; // 0 to 100
  variant?: 'primary' | 'success' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const variantStyles = {
  primary: 'bg-gradient-primary',
  success: 'bg-gradient-success',
  gold: 'bg-gradient-gold',
};

const sizeStyles = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

export function ProgressBar({ value, variant = 'primary', size = 'md', showLabel, className }: ProgressBarProps) {
  const safeValue = Math.min(Math.max(value, 0), 100);

  return (
    <div className={cn('w-full flex items-center gap-3', className)}>
      <div className={cn('w-full bg-bg-tertiary rounded-full overflow-hidden', sizeStyles[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-500 ease-out', variantStyles[variant])}
          style={{ width: `${safeValue}%` }}
        />
      </div>
      {showLabel && <span className="text-sm font-medium text-text-secondary w-8 text-left">{Math.round(safeValue)}%</span>}
    </div>
  );
}
