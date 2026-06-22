import { useEffect, useState } from 'react'
import { X, Terminal, ShieldAlert, Copy, Check } from 'lucide-react'
import type { ScriptEntry } from '../../electron/shared/ipc-types'

interface ScriptDetailDialogProps {
  script: ScriptEntry | null
  onClose: () => void
}

export function ScriptDetailDialog({ script, onClose }: ScriptDetailDialogProps) {
  const [content, setContent] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (script) {
      window.electronAPI.getScriptContent(script.id).then(setContent).catch(() => setContent(''))
    }
  }, [script])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (script) window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [script, onClose])

  if (!script) return null

  const copyCode = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-xl border border-border bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold">{script.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{script.description}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs font-mono text-muted-foreground">
            <Terminal className="h-3 w-3" /> .{script.extension}
          </span>
          {script.requiresAdmin && (
            <span className="inline-flex items-center gap-1 rounded-md bg-destructive/10 px-2 py-0.5 text-xs font-mono text-destructive">
              <ShieldAlert className="h-3 w-3" /> Requer Admin
            </span>
          )}
        </div>

        <div className="relative">
          <pre className="max-h-80 overflow-auto rounded-lg bg-background p-4 font-mono text-xs leading-relaxed text-foreground">
            {content || 'Carregando...'}
          </pre>
          <button
            onClick={copyCode}
            className="absolute top-2 right-2 rounded-md bg-muted p-1.5 text-muted-foreground hover:text-foreground"
          >
            {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  )
}
