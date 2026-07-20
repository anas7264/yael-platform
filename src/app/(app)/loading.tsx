import { Skeleton } from '@/components/ui/Skeleton';

export default function AppLoading() {
  return (
    <div className="space-y-8 animate-pulse p-4 md:p-8" dir="rtl">
      {/* Hero skeleton */}
      <div className="rounded-2xl bg-bg-secondary border border-border-subtle p-8 space-y-4">
        <Skeleton variant="text" className="h-8 w-48" />
        <Skeleton variant="text" className="h-5 w-72" />
        <Skeleton className="h-4 w-full max-w-xs mt-2" />
        <div className="flex gap-3 mt-4">
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
      </div>

      {/* 4 Stat card skeletons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-bg-secondary border border-border-subtle p-5 space-y-3">
            <Skeleton variant="circle" className="w-10 h-10" />
            <Skeleton variant="text" className="h-7 w-16" />
            <Skeleton variant="text" className="h-3 w-full" />
          </div>
        ))}
      </div>

      {/* 4 Section card skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-bg-secondary border border-border-subtle p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton variant="circle" className="w-10 h-10" />
              <div className="flex-1 space-y-2">
                <Skeleton variant="text" className="h-5 w-32" />
                <Skeleton variant="text" className="h-3 w-48" />
              </div>
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
