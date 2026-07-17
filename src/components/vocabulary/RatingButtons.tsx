'use client';

import { Button } from '@/components/ui/Button';

interface RatingButtonsProps {
  onRate: (rating: number) => void;
  disabled?: boolean;
}

export function RatingButtons({ onRate, disabled = false }: RatingButtonsProps) {
  return (
    <div className="grid grid-cols-4 gap-3 max-w-lg mx-auto mt-8 animate-slide-up">
      <Button
        variant="ghost"
        onClick={() => onRate(1)}
        disabled={disabled}
        className="flex flex-col h-auto py-3 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 hover:text-rose-700 border border-rose-200 dark:border-rose-900"
      >
        <span className="font-bold text-base mb-1">مجدداً</span>
        <span className="text-xs opacity-70" dir="ltr">{'<'} 1m</span>
      </Button>

      <Button
        variant="ghost"
        onClick={() => onRate(2)}
        disabled={disabled}
        className="flex flex-col h-auto py-3 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 hover:text-amber-700 border border-amber-200 dark:border-amber-900"
      >
        <span className="font-bold text-base mb-1">صعب</span>
        <span className="text-xs opacity-70" dir="ltr">10m</span>
      </Button>

      <Button
        variant="ghost"
        onClick={() => onRate(3)}
        disabled={disabled}
        className="flex flex-col h-auto py-3 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 hover:text-emerald-700 border border-emerald-200 dark:border-emerald-900"
      >
        <span className="font-bold text-base mb-1">جيد</span>
        <span className="text-xs opacity-70" dir="ltr">1d</span>
      </Button>

      <Button
        variant="ghost"
        onClick={() => onRate(4)}
        disabled={disabled}
        className="flex flex-col h-auto py-3 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 hover:text-blue-700 border border-blue-200 dark:border-blue-900"
      >
        <span className="font-bold text-base mb-1">سهل</span>
        <span className="text-xs opacity-70" dir="ltr">4d</span>
      </Button>
    </div>
  );
}
