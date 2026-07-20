import { Skeleton } from '@/components/ui/Skeleton';

export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse" dir="rtl">
      {/* Hero / Welcome banner skeleton */}
      <div className="rounded-2xl bg-bg-secondary border border-border-subtle p-8 space-y-3">
        <Skeleton variant="text" className="h-7 w-52" />
        <Skeleton variant="text" className="h-4 w-80" />
        <div className="flex items-center gap-3 mt-4">
          <Skeleton className="h-3 flex-1 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-md" />
        </div>
      </div>

      {/* 4 Stat metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-bg-secondary border border-border-subtle p-5 flex flex-col items-center gap-3">
            <Skeleton variant="circle" className="w-12 h-12" />
            <Skeleton variant="text" className="h-8 w-16" />
            <Skeleton variant="text" className="h-3 w-20" />
          </div>
        ))}
      </div>

      {/* 4 Subject/section practice cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-bg-secondary border border-border-subtle p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Skeleton variant="circle" className="w-10 h-10" />
                <div className="space-y-2">
                  <Skeleton variant="text" className="h-5 w-28" />
                  <Skeleton variant="text" className="h-3 w-40" />
                </div>
              </div>
              <Skeleton className="h-6 w-12 rounded-full" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
