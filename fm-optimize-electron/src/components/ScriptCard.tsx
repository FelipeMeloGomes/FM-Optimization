import { useState } from 'react'
import { Play, Square, Terminal, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react'
import { FavoriteButton } from './FavoriteButton'
import { Card, Button } from './ui'
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
  const [expanded, setExpanded] = useState(false)

  return (
    <Card hover className="group flex flex-col">
      <div className="mb-2 flex items-start justify-between">
        <h3
          onClick={() => setExpanded((v) => !v)}
          className="font-medium text-sm text-foreground cursor-pointer hover:text-primary transition-colors"
        >
          {script.name}
        </h3>
        <FavoriteButton isFavorite={isFavorite} onClick={onToggleFavorite} />
      </div>

      <div onClick={() => setExpanded((v) => !v)} className="cursor-pointer mb-1">
        <p
          className={`text-xs text-muted-foreground hover:text-foreground transition-colors ${!expanded ? 'line-clamp-2' : ''}`}
        >
          {script.description}
        </p>
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v) }}
          className="mt-0.5 flex items-center gap-1 text-xs text-primary/70 hover:text-primary transition-colors"
        >
          {expanded ? (
            <><ChevronUp className="h-3 w-3" aria-hidden="true" /> Menos</>
          ) : (
            <><ChevronDown className="h-3 w-3" aria-hidden="true" /> Mais</>
          )}
        </button>
      </div>

      <div className="mb-3 flex flex-wrap gap-1">
        <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground font-mono">
          <Terminal className="h-3 w-3" aria-hidden="true" />
          .{script.extension}
        </span>
        {script.requiresAdmin && (
          <span className="inline-flex items-center gap-1 rounded-md bg-destructive/10 px-2 py-0.5 text-xs text-destructive font-mono">
            <ShieldAlert className="h-3 w-3" aria-hidden="true" />
            Admin
          </span>
        )}
      </div>

      <div className="mt-auto flex gap-2">
        {isExecuting ? (
          <Button variant="destructive" size="sm" onClick={onCancel} aria-label="Cancelar execução">
            <Square className="h-3.5 w-3.5" aria-hidden="true" />
            Cancelar
          </Button>
        ) : (
          <Button variant="primary" size="sm" onClick={onExecute} aria-label="Executar script">
            <Play className="h-3.5 w-3.5" aria-hidden="true" />
            Executar
          </Button>
        )}
      </div>
    </Card>
  )
}
