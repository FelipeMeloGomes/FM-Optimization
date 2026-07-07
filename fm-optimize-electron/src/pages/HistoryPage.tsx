import { RefreshCw, Clock, XCircle, CheckCircle, AlertTriangle } from 'lucide-react'
import { useHistoryContext } from '../contexts/HistoryContext'
import { cn } from '../lib/utils'

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  const s = Math.floor(ms / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  return `${m}m ${s % 60}s`
}

export default function HistoryPage() {
  const { state, refresh } = useHistoryContext()

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
        <p className="text-sm">Erro ao carregar histórico</p>
        <p className="text-xs text-destructive mt-2">{state.error}</p>
      </div>
    )
  }

  const history = state.data

  return (
    <div>
      <div className="mb-4">
        <span className="text-xs text-muted-foreground">
          {history.length} execuções registradas
        </span>
      </div>

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Clock className="mb-2 h-8 w-8" />
          <p className="text-sm">Nenhuma execução registrada</p>
          <p className="text-xs mt-1">Execute um script para vê-lo aqui</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-card text-muted-foreground text-xs uppercase">
                <th className="px-4 py-3 text-left">Script</th>
                <th className="px-4 py-3 text-left">Data</th>
                <th className="px-4 py-3 text-left">Duração</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {history.map((entry) => (
                <tr key={entry.id} className="hover:bg-card/50 transition-colors">
                  <td className="px-4 py-3 font-medium">{entry.scriptName}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(entry.startTime).toLocaleString('pt-BR')}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {entry.wasCancelled ? '—' : formatDuration(entry.durationMs)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'inline-flex items-center gap-1 text-xs font-medium',
                      entry.wasCancelled && 'text-yellow-400',
                      entry.exitCode === 0 && 'text-green-400',
                      entry.exitCode && entry.exitCode > 0 && 'text-destructive',
                      entry.exitCode === null && !entry.wasCancelled && 'text-muted-foreground'
                    )}>
                      {entry.wasCancelled && <><XCircle className="h-3 w-3" /> Cancelado</>}
                      {entry.exitCode === 0 && <><CheckCircle className="h-3 w-3" /> Sucesso</>}
                      {entry.exitCode && entry.exitCode > 0 && <><AlertTriangle className="h-3 w-3" /> Erro ({entry.exitCode})</>}
                      {entry.exitCode === null && !entry.wasCancelled && '—'}
                    </span>
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
