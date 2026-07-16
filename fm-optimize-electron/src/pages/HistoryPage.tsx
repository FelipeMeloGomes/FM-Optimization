import { RefreshCw, Clock, XCircle, CheckCircle, AlertTriangle } from 'lucide-react'
import { useHistoryContext } from '../contexts/HistoryContext'
import { EmptyState, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui'

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('pt-BR')
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  const s = Math.floor(ms / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  return `${m}m ${s % 60}s`
}

export default function HistoryPage() {
  const { state } = useHistoryContext()

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
        <p className="text-sm">Erro ao carregar histórico</p>
        <p className="text-xs text-destructive">{state.error}</p>
      </div>
    )
  }

  const history = state.data

  return (
    <div>
      <div className="mb-4">
        <Badge variant="secondary">
          {history.length} execuções registradas
        </Badge>
      </div>

      {history.length === 0 ? (
        <EmptyState
          icon={<Clock className="size-8" />}
          title="Nenhuma execução registrada"
          description="Execute um script para vê-lo aqui"
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Script</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Duração</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="font-medium">{entry.scriptName}</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(entry.startTime)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {entry.wasCancelled ? '—' : formatDuration(entry.durationMs)}
                </TableCell>
                <TableCell>
                  {entry.wasCancelled && (
                    <Badge variant="secondary" className="gap-1 text-yellow-400">
                      <XCircle className="size-3" /> Cancelado
                    </Badge>
                  )}
                  {entry.exitCode === 0 && (
                    <Badge variant="secondary" className="gap-1 text-green-400">
                      <CheckCircle className="size-3" /> Sucesso
                    </Badge>
                  )}
                  {entry.exitCode != null && entry.exitCode > 0 && (
                    <Badge variant="destructive" className="gap-1">
                      <AlertTriangle className="size-3" /> Erro ({entry.exitCode})
                    </Badge>
                  )}
                  {entry.exitCode === null && !entry.wasCancelled && '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
