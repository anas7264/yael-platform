import { Skeleton } from '@/components/ui/Skeleton';

export default function VocabularyLoading() {
  return (
    <div className="space-y-8 animate-pulse max-w-5xl mx-auto" dir="rtl">
      {/* Page header */}
      <div className="space-y-2">
        <Skeleton variant="text" className="h-9 w-48" />
        <Skeleton variant="text" className="h-4 w-72" />
      </div>

      {/* Search bar + filter row */}
      <div className="flex gap-3">
        <Skeleton className="h-12 flex-1 rounded-xl" />
        <Skeleton className="h-12 w-28 rounded-xl" />
        <Skeleton className="h-12 w-28 rounded-xl" />
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-bg-secondary border border-border-subtle p-5 space-y-2">
            <Skeleton variant="text" className="h-7 w-16" />
            <Skeleton variant="text" className="h-3 w-24" />
          </div>
        ))}
      </div>

      {/* Vocabulary word cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-bg-secondary border border-border-subtle p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <Skeleton variant="text" className="h-6 w-24" />
                <Skeleton variant="text" className="h-4 w-32" />
              </div>
              <Skeleton variant="circle" className="w-8 h-8 shrink-0" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
            <div className="flex gap-2 pt-1">
              <Skeleton className="h-7 w-20 rounded-full" />
              <Skeleton className="h-7 w-16 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
