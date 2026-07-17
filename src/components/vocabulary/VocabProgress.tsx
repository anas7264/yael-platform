'use client';

interface VocabProgressProps {
  cardsRemaining: number;
  sessionCorrect: number;
  sessionTotal: number;
  stats: {
    new: number;
    learning: number;
    review: number;
    relearning: number;
  };
}

export function VocabProgress({ cardsRemaining, sessionCorrect, sessionTotal, stats }: VocabProgressProps) {
  const accuracy = sessionTotal > 0 ? Math.round((sessionCorrect / sessionTotal) * 100) : 100;

  return (
    <div className="w-full max-w-3xl mx-auto mb-8 space-y-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-secondary">متبقي:</span>
          <span className="text-lg font-bold text-primary-500">{cardsRemaining}</span>
          <span className="text-sm text-text-secondary">بطاقة</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-secondary">دقة الجلسة:</span>
          <span className="text-lg font-bold text-emerald-500">{accuracy}%</span>
        </div>
      </div>

      {/* State Distribution Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 border border-blue-200 dark:border-blue-900 text-xs font-bold">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          جديد {stats.new}
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 border border-amber-200 dark:border-amber-900 text-xs font-bold">
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          قيد التعلم {stats.learning}
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-200 dark:border-emerald-900 text-xs font-bold">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          للمراجعة {stats.review}
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 border border-rose-200 dark:border-rose-900 text-xs font-bold">
          <div className="w-2 h-2 rounded-full bg-rose-500" />
          إعادة تعلم {stats.relearning}
        </div>
      </div>
    </div>
  );
}
