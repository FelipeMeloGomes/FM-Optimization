import { Minus, X } from 'lucide-react'
import { cn } from '../lib/utils'

interface WindowControlsProps {
  className?: string
}

export function WindowControls({ className }: WindowControlsProps) {
  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      <button
        onClick={() => window.electronAPI.minimizeWindow()}
        className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Minimizar"
      >
        <Minus className="size-4" />
      </button>
      <button
        onClick={() => window.electronAPI.closeWindow()}
        className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/90 hover:text-destructive-foreground"
        aria-label="Fechar"
      >
        <X className="size-4" />
      </button>
    </div>
  )
}
