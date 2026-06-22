import { useState } from 'react'
import { X } from 'lucide-react'

interface EditScriptDialogProps {
  onClose: () => void
  onSave: (script: { name: string; content: string; extension: string }) => void
}

export function EditScriptDialog({ onClose, onSave }: EditScriptDialogProps) {
  const [name, setName] = useState('')
  const [content, setContent] = useState('')
  const [extension, setExtension] = useState('bat')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Adicionar Script</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Tipo</label>
            <select
              value={extension}
              onChange={(e) => setExtension(e.target.value)}
              className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            >
              <option value="bat">Batch (.bat)</option>
              <option value="ps1">PowerShell (.ps1)</option>
              <option value="cmd">Command (.cmd)</option>
              <option value="reg">Registry (.reg)</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Código</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="w-full rounded-lg border border-input bg-background p-3 font-mono text-xs focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Cancelar
            </button>
            <button
              onClick={() => onSave({ name, content, extension })}
              disabled={!name || !content}
              className="rounded-lg bg-primary px-4 py-2 text-xs text-primary-foreground disabled:opacity-50"
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
