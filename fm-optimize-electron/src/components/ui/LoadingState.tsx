interface LoadingStateProps {
  count?: number
}

export function LoadingState({ count = 6 }: LoadingStateProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-32 animate-pulse rounded-xl border border-border bg-card p-4"
        >
          <div className="mb-3 h-4 w-3/4 rounded bg-muted" />
          <div className="h-3 w-1/2 rounded bg-muted" />
        </div>
      ))}
    </div>
  )
}
