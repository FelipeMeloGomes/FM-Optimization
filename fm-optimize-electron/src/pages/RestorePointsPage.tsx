import { useState, useMemo } from 'react'
import { RefreshCw, Plus, Trash2, RotateCcw, AlertTriangle, Search } from 'lucide-react'
import { useRestorePointContext } from '../contexts/RestorePointContext'
import { Input, Button, Dialog } from '../components/ui'

export default function RestorePointsPage() {
  const { state, creating, restoring, refresh, create, remove, restore } = useRestorePointContext()
  const [newName, setNewName] = useState('')
  const [search, setSearch] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)
  const [confirmRestore, setConfirmRestore] = useState<number | null>(null)
  const [restoreDone, setRestoreDone] = useState(false)

  const handleCreate = async () => {
    if (!newName.trim()) return
    await create(newName.trim())
    setNewName('')
  }

  if (state.status === 'loading') {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (state.status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-sm">Erro ao carregar pontos de restauração</p>
        <p className="text-xs text-destructive mt-2">{state.error}</p>
        <Button variant="primary" size="sm" onClick={refresh} className="mt-4">
          Tentar novamente
        </Button>
      </div>
    )
  }

  const restorePoints = state.data
  const filtered = useMemo(
    () => restorePoints.filter((rp) => rp.description.toLowerCase().includes(search.toLowerCase())),
    [restorePoints, search]
  )

  return (
    <div>
      <div className="relative mb-2">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input
          placeholder="Buscar pontos de restauração..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm pl-9"
        />
      </div>

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

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <p className="text-sm">
            {search ? 'Nenhum ponto encontrado para esta busca' : 'Nenhum ponto de restauração encontrado'}
          </p>
          <p className="text-xs mt-1">
            {search ? 'Tente ajustar sua busca' : 'Crie um ponto de restauração para começar'}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-card text-muted-foreground text-xs uppercase">
                <th className="px-4 py-3 text-left">Descrição</th>
                <th className="px-4 py-3 text-left">Data</th>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((rp) => (
                <tr key={rp.sequenceNumber} className="hover:bg-card/50 transition-colors">
                  <td className="px-4 py-3">{rp.description}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(rp.creationTime).toLocaleString('pt-BR')}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{rp.eventType}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setConfirmRestore(rp.sequenceNumber)}
                        className="text-muted-foreground hover:text-primary transition-colors"
                        title="Restaurar sistema para este ponto"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(rp.sequenceNumber)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
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

      <Dialog
        open={confirmRestore !== null || restoreDone}
        onClose={() => { setConfirmRestore(null); setRestoreDone(false) }}
        className="max-w-sm"
      >
        {restoreDone ? (
          <>
            <div className="mb-4 flex items-center gap-3">
              <RefreshCw className="h-5 w-5 text-primary animate-spin" />
              <h2 className="text-base font-semibold">Restauração Iniciada</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              O sistema será restaurado e o computador será reiniciado em instantes.
            </p>
          </>
        ) : (
          <>
            <div className="mb-4 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-primary" />
              <h2 className="text-base font-semibold">Confirmar Restauração</h2>
            </div>
            <p className="mb-6 text-sm text-muted-foreground">
              Tem certeza que deseja restaurar o sistema para este ponto? O computador será reiniciado.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setConfirmRestore(null)}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={restoring}
                onClick={async () => {
                  await restore(confirmRestore!)
                  setConfirmRestore(null)
                  setRestoreDone(true)
                }}
              >
                {restoring ? 'Restaurando...' : 'Restaurar'}
              </Button>
            </div>
          </>
        )}
      </Dialog>
    </div>
  )
}
