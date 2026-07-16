import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Cpu,
  AlertTriangle,
  Shield,
  Terminal,
  Play,
  Square,
  Zap,
  Gauge,
  RotateCcw
} from 'lucide-react'
import { cn } from '../lib/utils'
import { Button, Badge, Card, CardContent } from '../components/ui'
import { useScriptContext } from '../contexts/ScriptContext'
import { useScriptExecutionContext } from '../contexts/ScriptExecutionContext'
import { useSystemContext } from '../contexts/SystemContext'
import { useSettingsContext } from '../contexts/SettingsContext'
import { ScriptCardSkeleton } from '../components/ScriptCardSkeleton'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { detectCpuVendor, getCpuCategory, type CpuVendor } from '../lib/cpu-vendor'
import { RISK_STYLES } from '../components/ScriptCard'
import type { ScriptEntry } from '../../electron/shared/ipc-types'

export default function CpuPage() {
  const { state: systemState } = useSystemContext()
  const {
    state,
    filteredScripts,
    setCategoryFilter,
    setSubcategoryFilter,
  } = useScriptContext()
  const { activeExecution, execute, cancel } = useScriptExecutionContext()
  const { settings } = useSettingsContext()
  const [confirmScript, setConfirmScript] = useState<ScriptEntry | null>(null)

  const cpuVendor: CpuVendor = useMemo(() => {
    if (systemState.status !== 'success') return 'unknown'
    return detectCpuVendor(systemState.data.cpu.model)
  }, [systemState])

  const category = getCpuCategory(cpuVendor)

  const ramAmount = useMemo(() => {
    if (systemState.status !== 'success') return null
    const match = systemState.data.memory.total.match(/(\d+(?:\.\d+)?)/)
    return match ? parseFloat(match[1]) : null
  }, [systemState])

  const getRamScriptId = useCallback((vendor: CpuVendor, ramGb: number): string | null => {
    const prefix = vendor === 'amd' ? 'amd' : 'intel'
    if (ramGb <= 4) return `${prefix}-30`
    if (ramGb <= 6) return `${prefix}-31`
    if (ramGb <= 8) return `${prefix}-32`
    if (ramGb <= 12) return `${prefix}-33`
    if (ramGb <= 16) return `${prefix}-34`
    if (ramGb <= 32) return `${prefix}-35`
    return `${prefix}-36`
  }, [])

  const recommendedRamScriptId = useMemo(() => {
    if (!ramAmount || cpuVendor === 'unknown') return null
    return getRamScriptId(cpuVendor, ramAmount)
  }, [ramAmount, cpuVendor, getRamScriptId])

  useEffect(() => {
    if (category) {
      setCategoryFilter(category)
      setSubcategoryFilter('')
    }
  }, [category, setCategoryFilter, setSubcategoryFilter])

  const cpuScripts = useMemo(() => {
    const all = filteredScripts.filter(s => s.category === category)
    return all.filter(s => {
      if (s.subcategory === 'RAM') {
        return s.id === recommendedRamScriptId
      }
      return true
    })
  }, [filteredScripts, category, recommendedRamScriptId])

  const handleExecute = useCallback(
    (id: string) => execute(id),
    [execute]
  )
  const handleCancel = useCallback(
    (id: string) => cancel(id),
    [cancel]
  )

  const handleConfirmExecute = useCallback(
    (script: ScriptEntry) => {
      if (settings.confirmOnExecute) {
        setConfirmScript(script)
      } else {
        handleExecute(script.id)
      }
    },
    [settings.confirmOnExecute, handleExecute]
  )

  const handleConfirm = useCallback(() => {
    if (confirmScript) {
      handleExecute(confirmScript.id)
    }
  }, [confirmScript, handleExecute])

  if (systemState.status === 'loading') {
    return (
      <div className="space-y-4">
        <div className="h-32 rounded-xl bg-muted animate-pulse" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <ScriptCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (cpuVendor === 'unknown') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-muted-foreground">
        <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
          <AlertTriangle className="size-6 text-yellow-400" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium">Processador não identificado</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Não foi detectado um processador Intel ou AMD no sistema.
          </p>
          {systemState.status === 'success' && (
            <p className="mt-2 font-mono text-xs text-muted-foreground">
              Detectado: {systemState.data.cpu.model}
            </p>
          )}
        </div>
      </div>
    )
  }

  if (state.status === 'loading') {
    return (
      <div className="space-y-4">
        <div className="h-32 rounded-xl bg-muted animate-pulse" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <ScriptCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (state.status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-20 text-muted-foreground">
        <p className="text-sm">Erro ao carregar scripts</p>
        <p className="text-xs text-destructive">{state.error}</p>
      </div>
    )
  }

  const isAmd = cpuVendor === 'amd'

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className={cn(
        'relative overflow-hidden rounded-xl border bg-gradient-to-br to-transparent',
        isAmd ? 'border-red-500/20 from-red-500/10' : 'border-blue-500/20 from-blue-500/10'
      )}>
        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10">
          <Cpu className={cn('size-28', isAmd ? 'text-red-400' : 'text-blue-400')} />
        </div>
        <div className="relative p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Cpu className={cn('size-4', isAmd ? 'text-red-400' : 'text-blue-400')} />
                <span className={cn(
                  'text-xs font-semibold uppercase tracking-wider',
                  isAmd ? 'text-red-400' : 'text-blue-400'
                )}>
                  {isAmd ? 'AMD' : 'Intel'}
                </span>
              </div>
              <h2 className="text-lg font-bold text-foreground">
                Otimizações para {isAmd ? 'AMD' : 'Intel'}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {systemState.status === 'success' ? systemState.data.cpu.model : '—'}
              </p>
            </div>
            <Badge variant="secondary" className={cn(
              'text-xs px-3 py-1',
              isAmd ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'
            )}>
              {cpuScripts.length} scripts
            </Badge>
          </div>
        </div>
      </div>

      {/* CPU Info Card */}
      <Card className={cn(
        'border',
        isAmd ? 'border-red-500/20' : 'border-blue-500/20'
      )}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className={cn(
              'flex size-10 items-center justify-center rounded-lg',
              isAmd ? 'bg-red-500/10' : 'bg-blue-500/10'
            )}>
              <Cpu className={cn('size-5', isAmd ? 'text-red-400' : 'text-blue-400')} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Processador</p>
              <p className="text-sm font-medium">
                {systemState.status === 'success' ? systemState.data.cpu.model : '—'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Núcleos</p>
              <p className="text-sm font-medium">
                {systemState.status === 'success' ? systemState.data.cpu.cores : '—'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Threads</p>
              <p className="text-sm font-medium">
                {systemState.status === 'success' ? systemState.data.cpu.logicalProcessors : '—'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">RAM</p>
              <p className="text-sm font-medium">
                {ramAmount ? `${ramAmount} GB` : '—'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Uso</p>
              <p className={cn(
                'text-sm font-medium',
                systemState.status === 'success' && systemState.data.cpu.usage > 80
                  ? 'text-red-400'
                  : systemState.status === 'success' && systemState.data.cpu.usage > 50
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              )}>
                {systemState.status === 'success' ? `${systemState.data.cpu.usage}%` : '—'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scripts Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className={cn('size-1.5 rounded-full', isAmd ? 'bg-red-400' : 'bg-blue-400')} />
          <h3 className="text-sm font-semibold text-foreground">Scripts Disponíveis</h3>
        </div>

        {cpuScripts.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-20 text-muted-foreground">
            <p className="text-sm">Nenhum script encontrado</p>
            <p className="text-xs text-muted-foreground">Tente ajustar sua busca ou filtro</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {cpuScripts.map((script) => {
              const isExecuting = activeExecution === script.id
              return (
                <div
                  key={script.id}
                  className={cn(
                    'rounded-xl border bg-card p-4 transition-all duration-300 hover:shadow-lg',
                    script.requiresAdmin ? 'border-yellow-500/20' : 'border-border',
                    isExecuting && 'ring-2 ring-primary/50'
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'flex size-8 items-center justify-center rounded-lg',
                        script.requiresAdmin ? 'bg-yellow-500/10' : 'bg-muted'
                      )}>
                        <Terminal className={cn(
                          'size-4',
                          script.requiresAdmin ? 'text-yellow-400' : 'text-muted-foreground'
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-foreground truncate">{script.name}</h4>
                          {script.requiresAdmin && (
                            <Badge variant="destructive" className="gap-1 font-mono text-[10px] px-1.5 py-0 shrink-0">
                              <Shield className="size-3" />
                              Admin
                            </Badge>
                          )}
                          {script.requiresRestart && (
                            <Badge variant="outline" className="gap-1 font-mono text-[10px] px-1.5 py-0 shrink-0 border-amber-500/50 text-amber-400">
                              <RotateCcw className="size-3" />
                              Reiniciar
                            </Badge>
                          )}
                          {script.riskLevel && (
                            <Badge
                              variant="outline"
                              className={cn('gap-1 font-mono text-[10px] px-1.5 py-0', RISK_STYLES[script.riskLevel].className)}
                            >
                              {RISK_STYLES[script.riskLevel].label}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{script.description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    {isExecuting ? (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCancel(script.id)}
                        className="flex-1 gap-2"
                      >
                        <Square className="size-3.5" />
                        Cancelar
                      </Button>
                    ) : (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleConfirmExecute(script)}
                        className="flex-1 gap-2"
                      >
                        <Play className="size-3.5" />
                        Executar
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={!!confirmScript}
        onOpenChange={(open) => { if (!open) setConfirmScript(null) }}
        script={confirmScript}
        onConfirm={handleConfirm}
        isExecuting={!!confirmScript && activeExecution === confirmScript.id}
      />
    </div>
  )
}
