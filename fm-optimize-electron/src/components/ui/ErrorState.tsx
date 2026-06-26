interface ErrorStateProps {
  message: string
  onRetry?: () => void
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <p className="text-sm text-destructive">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-lg px-4 py-2 text-sm text-primary hover:bg-primary/10"
        >
          Tentar novamente
        </button>
      )}
    </div>
  )
}
