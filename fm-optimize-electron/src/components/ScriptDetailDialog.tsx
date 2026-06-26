import { Terminal, ShieldAlert } from 'lucide-react'
import { Dialog } from './ui'
import type { ScriptEntry } from '../../electron/shared/ipc-types'

interface ScriptDetailDialogProps {
  script: ScriptEntry | null
  onClose: () => void
}

export function ScriptDetailDialog({ script, onClose }: ScriptDetailDialogProps) {
  if (!script) return null

  return (
    <Dialog open={!!script} onClose={onClose} title={script.name} className="max-w-lg">
      <p className="mt-1 text-sm text-muted-foreground">{script.description}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs font-mono text-muted-foreground">
          <Terminal className="h-3 w-3" /> .{script.extension}
        </span>
        {script.requiresAdmin && (
          <span className="inline-flex items-center gap-1 rounded-md bg-destructive/10 px-2 py-0.5 text-xs font-mono text-destructive">
            <ShieldAlert className="h-3 w-3" /> Requer Administrador
          </span>
        )}
      </div>
    </Dialog>
  )
}
