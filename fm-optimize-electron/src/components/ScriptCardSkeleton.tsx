export function ScriptCardSkeleton() {
  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-4 animate-pulse">
      <div className="mb-2 h-4 w-3/4 rounded bg-muted" />
      <div className="mb-3 h-3 w-full rounded bg-muted" />
      <div className="mb-3 h-3 w-1/2 rounded bg-muted" />
      <div className="mt-auto flex gap-2">
        <div className="h-7 w-20 rounded-lg bg-muted" />
      </div>
    </div>
  )
}
