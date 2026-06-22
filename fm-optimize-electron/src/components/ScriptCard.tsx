import { Play, Square, Terminal, ShieldAlert } from 'lucide-react'
import { FavoriteButton } from './FavoriteButton'
import type { ScriptEntry } from '../../electron/shared/ipc-types'

interface ScriptCardProps {
  script: ScriptEntry
  isFavorite: boolean
  isExecuting: boolean
  onExecute: () => void
  onCancel: () => void
  onToggleFavorite: () => void
}

export function ScriptCard({
  script,
  isFavorite,
  isExecuting,
  onExecute,
  onCancel,
  onToggleFavorite
}: ScriptCardProps) {
  return (
    <div className="group relative flex flex-col rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-[0_0_12px_rgba(0,68,255,0.15)]">
      <div className="mb-2 flex items-start justify-between">
        <h3 className="font-medium text-sm text-foreground line-clamp-2">{script.name}</h3>
        <FavoriteButton isFavorite={isFavorite} onClick={onToggleFavorite} />
      </div>

      <p className="mb-3 text-xs text-muted-foreground line-clamp-2">{script.description}</p>

      <div className="mb-3 flex flex-wrap gap-1">
        <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[10px] text-muted-foreground font-mono">
          <Terminal className="h-3 w-3" />
          .{script.extension}
        </span>
        {script.requiresAdmin && (
          <span className="inline-flex items-center gap-1 rounded-md bg-destructive/10 px-2 py-0.5 text-[10px] text-destructive font-mono">
            <ShieldAlert className="h-3 w-3" />
            Admin
          </span>
        )}
      </div>

      <div className="mt-auto flex gap-2">
        {isExecuting ? (
          <button
            onClick={onCancel}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground transition-colors hover:bg-destructive/90"
          >
            <Square className="h-3.5 w-3.5" />
            Cancelar
          </button>
        ) : (
          <button
            onClick={onExecute}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Play className="h-3.5 w-3.5" />
            Executar
          </button>
        )}
      </div>
    </div>
  )
}
