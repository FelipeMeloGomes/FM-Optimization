import { useState, useMemo } from 'react'
import { RefreshCw, Plus, Trash2, RotateCcw, AlertTriangle, Search } from 'lucide-react'
import { useRestorePointContext } from '../contexts/RestorePointContext'
import { EmptyState, Input, Button, Dialog, DialogContent, DialogHeader, DialogTitle, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui'

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('pt-BR')
}

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

  const restorePoints = state.status === 'success' ? state.data : []
  const filtered = useMemo(
    () => restorePoints.filter((rp) => rp.description.toLowerCase().includes(search.toLowerCase())),
    [restorePoints, search]
  )

  if (state.status === 'loading') {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (state.status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-20 text-muted-foreground">
        <p className="text-sm">Erro ao carregar pontos de restauração</p>
        <p className="text-xs text-destructive">{state.error}</p>
        <Button variant="outline" size="sm" onClick={refresh}>
          Tentar novamente
        </Button>
      </div>
    )
  }

  return (
    <div>
      <div className="relative mb-2">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input
          placeholder="Buscar pontos de restauração..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm pl-9"
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
          size="sm"
          onClick={handleCreate}
          disabled={creating || !newName.trim()}
        >
          <Plus className="size-3.5" />
          {creating ? 'Criando...' : 'Criar'}
        </Button>
        <Button variant="outline" size="sm" onClick={refresh}>
          <RefreshCw className="size-4" />
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={search ? 'Nenhum ponto encontrado para esta busca' : 'Nenhum ponto de restauração encontrado'}
          description={search ? 'Tente ajustar sua busca' : 'Crie um ponto de restauração para começar'}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((rp) => (
              <TableRow key={rp.sequenceNumber}>
                <TableCell>{rp.description}</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(rp.creationTime)}
                </TableCell>
                <TableCell className="text-muted-foreground">{rp.eventType}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setConfirmRestore(rp.sequenceNumber)}
                      title="Restaurar sistema para este ponto"
                    >
                      <RotateCcw className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setConfirmDelete(rp.sequenceNumber)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog
        open={confirmDelete !== null}
        onOpenChange={(open) => { if (!open) setConfirmDelete(null) }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-3">
            <AlertTriangle className="size-5 text-destructive" />
          </div>
          <p className="text-sm text-muted-foreground">
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
        </DialogContent>
      </Dialog>

      <Dialog
        open={confirmRestore !== null || restoreDone}
        onOpenChange={(open) => { if (!open) { setConfirmRestore(null); setRestoreDone(false) } }}
      >
        <DialogContent className="max-w-sm">
          {restoreDone ? (
            <>
              <DialogHeader>
                <DialogTitle>Restauração Iniciada</DialogTitle>
              </DialogHeader>
              <div className="flex items-center gap-3">
                <RefreshCw className="size-5 animate-spin text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                O sistema será restaurado e o computador será reiniciado em instantes.
              </p>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Confirmar Restauração</DialogTitle>
              </DialogHeader>
              <div className="flex items-center gap-3">
                <AlertTriangle className="size-5 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">
                Tem certeza que deseja restaurar o sistema para este ponto? O computador será reiniciado.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setConfirmRestore(null)}>
                  Cancelar
                </Button>
                <Button
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
        </DialogContent>
      </Dialog>
    </div>
  )
}
