import { Skeleton } from './ui';

export function CleanerCardSkeleton() {
  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-lg" />
          <div>
            <Skeleton className="mb-1.5 h-4 w-32" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-16 rounded-md" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </div>
      </div>

      <Skeleton className="mt-3 h-3 w-full" />
      <Skeleton className="mt-1 h-3 w-3/4" />

      <div className="mt-3 space-y-2">
        <div className="flex items-center gap-1.5 rounded-md bg-muted/50 px-2.5 py-1.5">
          <Skeleton className="size-3" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-1.5 w-full rounded-full" />
        <Skeleton className="h-3 w-16" />
      </div>

      <div className="mt-4 space-y-1.5">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-3 w-36" />
      </div>

      <div className="mt-4 flex gap-2">
        <Skeleton className="h-7 flex-1 rounded-md" />
      </div>
    </div>
  );
}
