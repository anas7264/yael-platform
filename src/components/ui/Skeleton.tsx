'use client';
import { cn } from '@/lib/utils/cn';

interface SkeletonProps {
  variant?: 'text' | 'circle' | 'card' | 'avatar';
  className?: string;
}

const variantStyles = {
  text: 'h-4 w-full',
  circle: 'rounded-full',
  card: 'h-32 w-full',
  avatar: 'h-10 w-10 rounded-full',
};

export function Skeleton({ variant = 'text', className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'bg-bg-tertiary rounded-md relative overflow-hidden',
        variantStyles[variant],
        className
      )}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}
