import { Skeleton } from '@/components/ui/Skeleton';

export default function PracticeLoading() {
  return (
    <div className="space-y-8 animate-pulse max-w-4xl mx-auto" dir="rtl">
      {/* Section header */}
      <div className="space-y-2">
        <Skeleton variant="text" className="h-9 w-64" />
        <Skeleton variant="text" className="h-4 w-80" />
      </div>

      {/* Progress bar + XP pill */}
      <div className="flex items-center gap-4 bg-bg-secondary rounded-2xl p-4 border border-border-subtle">
        <Skeleton className="h-4 flex-1 rounded-full" />
        <Skeleton className="h-7 w-20 rounded-full" />
      </div>

      {/* Question card skeleton */}
      <div className="rounded-2xl bg-bg-secondary border border-border-subtle p-8 space-y-6">
        {/* Question text */}
        <div className="space-y-3">
          <Skeleton variant="text" className="h-6 w-full" />
          <Skeleton variant="text" className="h-6 w-4/5" />
          <Skeleton variant="text" className="h-6 w-3/5" />
        </div>

        {/* Answer choices */}
        <div className="space-y-3 pt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </div>
      </div>

      {/* Action buttons row */}
      <div className="flex gap-3 justify-end">
        <Skeleton className="h-11 w-24 rounded-xl" />
        <Skeleton className="h-11 w-32 rounded-xl" />
      </div>
    </div>
  );
}
