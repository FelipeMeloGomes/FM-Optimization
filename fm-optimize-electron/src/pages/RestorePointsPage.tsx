import { useState } from 'react'
import { RefreshCw, Plus, Trash2 } from 'lucide-react'
import { useRestorePointContext } from '../contexts/RestorePointContext'

export default function RestorePointsPage() {
  const { restorePoints, loading, error, creating, refresh, create, remove } = useRestorePointContext()
  const [newName, setNewName] = useState('')

  const handleCreate = async () => {
    if (!newName.trim()) return
    await create(newName.trim())
    setNewName('')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-sm">Erro ao carregar restore points</p>
        <p className="text-xs text-destructive mt-2">{error}</p>
        <button onClick={refresh} className="mt-4 rounded-lg bg-primary px-4 py-2 text-xs text-primary-foreground">
          Tentar novamente
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nome do restore point..."
          className="flex-1 h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
        />
        <button
          onClick={handleCreate}
          disabled={creating || !newName.trim()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" />
          {creating ? 'Criando...' : 'Criar'}
        </button>
        <button onClick={refresh} className="rounded-lg border border-border p-2 text-muted-foreground hover:text-foreground">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {restorePoints.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <p className="text-sm">Nenhum restore point encontrado</p>
          <p className="text-xs mt-1">Crie um restore point para começar</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-card text-muted-foreground text-xs uppercase">
                <th className="px-4 py-3 text-left">Descrição</th>
                <th className="px-4 py-3 text-left">Data</th>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {restorePoints.map((rp) => (
                <tr key={rp.sequenceNumber} className="hover:bg-card/50 transition-colors">
                  <td className="px-4 py-3">{rp.description}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(rp.creationTime).toLocaleString('pt-BR')}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{rp.eventType}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => remove(rp.sequenceNumber)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
