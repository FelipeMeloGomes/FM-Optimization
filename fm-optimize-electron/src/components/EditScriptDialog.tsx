import { useState } from 'react'
import { Dialog, Input, Button } from './ui'

interface EditScriptDialogProps {
  onClose: () => void
  onSave: (script: { name: string; content: string; extension: string }) => void
}

export function EditScriptDialog({ onClose, onSave }: EditScriptDialogProps) {
  const [name, setName] = useState('')
  const [content, setContent] = useState('')
  const [extension, setExtension] = useState('bat')

  return (
    <Dialog open onClose={onClose} title="Adicionar Script">
      <div className="space-y-4">
        <div>
          <Input
            id="script-name"
            label="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-muted-foreground" htmlFor="script-type">Tipo</label>
          <select
            id="script-type"
            value={extension}
            onChange={(e) => setExtension(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
          >
            <option value="bat">Batch (.bat)</option>
            <option value="ps1">PowerShell (.ps1)</option>
            <option value="cmd">Command (.cmd)</option>
            <option value="reg">Registry (.reg)</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs text-muted-foreground" htmlFor="script-code">Código</label>
          <textarea
            id="script-code"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            className="flex w-full rounded-lg border border-input bg-background p-3 font-mono text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onSave({ name, content, extension })}
            disabled={!name || !content}
          >
            Salvar
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
