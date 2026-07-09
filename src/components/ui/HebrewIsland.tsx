'use client';
import { cn } from '@/lib/utils/cn';

interface HebrewIslandProps {
  children: React.ReactNode;
  className?: string;
  inline?: boolean;
}

export function HebrewIsland({ children, className, inline = false }: HebrewIslandProps) {
  const Tag = inline ? 'span' : 'div';
  return (
    <Tag
      dir="ltr"
      lang="he"
      className={cn('hebrew-island', className)}
      style={inline ? { unicodeBidi: 'isolate' } : undefined}
    >
      {children}
    </Tag>
  );
}
