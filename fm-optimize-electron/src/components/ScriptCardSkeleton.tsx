import { Skeleton } from './ui'

export function ScriptCardSkeleton() {
  return (
    <div className="flex flex-col rounded-lg border border-border bg-card">
      <div className="flex items-start justify-between p-4 pb-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="size-4" />
      </div>
      <div className="flex-1 p-4 pt-0">
        <Skeleton className="mb-2 h-3 w-full" />
        <Skeleton className="mb-3 h-3 w-1/2" />
        <div className="flex gap-1">
          <Skeleton className="h-5 w-12 rounded-md" />
        </div>
      </div>
      <div className="p-4 pt-0">
        <Skeleton className="h-7 w-20 rounded-md" />
      </div>
    </div>
  )
}
