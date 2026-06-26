import { useState } from 'react'
import { RefreshCw, Plus, Trash2, AlertTriangle } from 'lucide-react'
import { useRestorePointContext } from '../contexts/RestorePointContext'
import { Input, Button, Dialog } from '../components/ui'

export default function RestorePointsPage() {
  const { restorePoints, loading, error, creating, refresh, create, remove } = useRestorePointContext()
  const [newName, setNewName] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)

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
        <p className="text-sm">Erro ao carregar pontos de restauração</p>
        <p className="text-xs text-destructive mt-2">{error}</p>
        <Button variant="primary" size="sm" onClick={refresh} className="mt-4">
          Tentar novamente
        </Button>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <Input
          placeholder="Nome do ponto de restauração..."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          className="flex-1"
        />
        <Button
          variant="primary"
          size="sm"
          onClick={handleCreate}
          disabled={creating || !newName.trim()}
        >
          <Plus className="h-3.5 w-3.5" />
          {creating ? 'Criando...' : 'Criar'}
        </Button>
        <Button variant="outline" size="sm" onClick={refresh}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {restorePoints.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <p className="text-sm">Nenhum ponto de restauração encontrado</p>
          <p className="text-xs mt-1">Crie um ponto de restauração para começar</p>
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
                      onClick={() => setConfirmDelete(rp.sequenceNumber)}
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

      <Dialog
        open={confirmDelete !== null}
        onClose={() => setConfirmDelete(null)}
        className="max-w-sm"
      >
        <div className="mb-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <h2 className="text-base font-semibold">Confirmar Exclusão</h2>
        </div>
        <p className="mb-6 text-sm text-muted-foreground">
          Tem certeza que deseja excluir este ponto de restauração? Esta ação não pode ser desfeita.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setConfirmDelete(null)}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={async () => {
              await remove(confirmDelete!)
              setConfirmDelete(null)
            }}
          >
            Excluir
          </Button>
        </div>
      </Dialog>
    </div>
  )
}
