import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Gauge,
  Zap,
  Shield,
  Monitor,
  Cpu,
  Settings,
  Play,
  Square,
  Terminal,
  ChevronDown
} from 'lucide-react'
import { cn } from '../lib/utils'
import { Button, Badge, Card, CardContent, Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui'
import { useScriptContext } from '../contexts/ScriptContext'
import { useScriptExecutionContext } from '../contexts/ScriptExecutionContext'
import { useSettingsContext } from '../contexts/SettingsContext'
import { ScriptCardSkeleton } from '../components/ScriptCardSkeleton'
import type { ScriptEntry } from '../../electron/shared/ipc-types'

interface TweakSection {
  id: string
  name: string
  description: string
  icon: React.ElementType
  color: string
  bgColor: string
  borderColor: string
  scriptIds: string[]
}

const TWEAK_SECTIONS: TweakSection[] = [
  {
    id: 'visual',
    name: 'Otimização Visual',
    description: 'Ajuste efeitos visuais do Windows para melhor desempenho sem sacrificar a estética.',
    icon: Monitor,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/20',
    scriptIds: ['tweaks-1', 'tweaks-2', 'builtin-32', 'builtin-86']
  },
  {
    id: 'performance',
    name: 'Desempenho',
    description: 'Otimize hardware, planos de energia e serviços do sistema para máximo rendimento.',
    icon: Zap,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    scriptIds: ['tweaks-3', 'tweaks-4', 'tweaks-5', 'tweaks-6']
  },
  {
    id: 'network',
    name: 'Rede e Latência',
    description: 'Otimizações TCP/IP e configurações de rede para reduzir latência em jogos.',
    icon: Settings,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    scriptIds: ['builtin-18']
  },
  {
    id: 'amd',
    name: 'AMD Específico',
    description: 'Otimizações exclusivas para processadores AMD com ajustes de latência e frame rendering.',
    icon: Cpu,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    scriptIds: ['builtin-4', 'builtin-5', 'builtin-6', 'builtin-7']
  },
  {
    id: 'complete',
    name: 'Otimização Completa',
    description: 'Pacote completo que aplica todas as otimizações de uma vez. Para quem quer resultado rápido.',
    icon: Shield,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    scriptIds: ['builtin-13']
  }
]

function TweakSectionCard({
  section,
  scripts,
  activeExecution,
  onExecute,
  onCancel,
  onConfirmExecute
}: {
  section: TweakSection
  scripts: ScriptEntry[]
  activeExecution: string | null
  onExecute: (id: string) => void
  onCancel: (id: string) => void
  onConfirmExecute: (script: ScriptEntry) => void
}) {
  const Icon = section.icon

  const sectionScripts = useMemo(
    () => scripts.filter(s => section.scriptIds.includes(s.id)),
    [scripts, section.scriptIds]
  )

  const isAnyExecuting = section.scriptIds.some(id => activeExecution === id)
  const executingScript = sectionScripts.find(s => activeExecution === s.id)

  return (
    <div
      className={cn(
        'rounded-xl border bg-card transition-all duration-300 hover:shadow-lg overflow-hidden',
        section.borderColor,
        isAnyExecuting && 'ring-2 ring-primary/50'
      )}
    >
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              'flex size-10 items-center justify-center rounded-lg',
              section.bgColor
            )}>
              <Icon className={cn('size-5', section.color)} />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{section.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{section.description}</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-[10px] shrink-0">
            {sectionScripts.length} scripts
          </Badge>
        </div>

        <div className="mt-4 space-y-2">
          {sectionScripts.map((script) => {
            const isScriptExecuting = activeExecution === script.id
            return (
              <div
                key={script.id}
                className={cn(
                  'flex items-center gap-3 rounded-lg border bg-background p-3 transition-all',
                  script.requiresAdmin && 'border-yellow-500/20',
                  isScriptExecuting && 'ring-2 ring-primary/50'
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{script.name}</p>
                    {script.requiresAdmin && (
                      <Badge variant="destructive" className="gap-1 font-mono text-[10px] px-1.5 py-0 shrink-0">
                        <Shield className="size-3" />
                        Admin
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{script.description}</p>
                </div>
                <Button
                  variant={isScriptExecuting ? 'destructive' : 'secondary'}
                  size="sm"
                  onClick={() => isScriptExecuting ? onCancel(script.id) : onConfirmExecute(script)}
                  className="gap-1.5 shrink-0"
                >
                  {isScriptExecuting ? (
                    <>
                      <Square className="size-3" />
                      Cancelar
                    </>
                  ) : (
                    <>
                      <Play className="size-3" />
                      Executar
                    </>
                  )}
                </Button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function TweaksPage() {
  const {
    state,
    filteredScripts,
    setCategoryFilter,
    setSubcategoryFilter,
  } = useScriptContext()
  const { activeExecution, execute, cancel } = useScriptExecutionContext()
  const { settings } = useSettingsContext()
  const [confirmScript, setConfirmScript] = useState<ScriptEntry | null>(null)

  useEffect(() => {
    setCategoryFilter('Tweaks')
    setSubcategoryFilter('')
  }, [setCategoryFilter, setSubcategoryFilter])

  const tweaksScripts = useMemo(
    () => filteredScripts.filter(s => s.category === 'Tweaks'),
    [filteredScripts]
  )

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
      setConfirmScript(null)
    }
  }, [confirmScript, handleExecute])

  if (state.status === 'loading') {
    return (
      <div className="space-y-4">
        <div className="h-24 rounded-xl bg-muted animate-pulse" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
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

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10">
          <Gauge className="size-28 text-primary" />
        </div>
        <div className="relative p-6">
          <div className="flex items-center gap-2 mb-2">
            <Gauge className="size-4 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">Ajustes e Desempenho</span>
          </div>
          <h2 className="text-lg font-bold text-foreground">
            Otimize seu Windows para máximo desempenho
          </h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-lg">
            Ajustes visuais, otimizações de hardware e configurações de sistema para extrair
            o máximo do seu computador em jogos e aplicações.
          </p>
        </div>
      </div>

      {/* Tweak Sections */}
      {TWEAK_SECTIONS.map((section) => (
        <TweakSectionCard
          key={section.id}
          section={section}
          scripts={tweaksScripts}
          activeExecution={activeExecution}
          onExecute={handleExecute}
          onCancel={handleCancel}
          onConfirmExecute={handleConfirmExecute}
        />
      ))}

      {/* Confirm Dialog */}
      <Dialog open={!!confirmScript} onOpenChange={(open) => { if (!open) setConfirmScript(null) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirmar Execução</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            {confirmScript && (
              <>
                <div>
                  <p className="text-sm font-semibold text-foreground">{confirmScript.name}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Badge variant="secondary" className="gap-1 font-mono text-xs">
                      <Terminal className="size-3" />
                      .{confirmScript.extension}
                    </Badge>
                    {confirmScript.requiresAdmin && (
                      <Badge variant="destructive" className="gap-1 font-mono text-xs">
                        <Shield className="size-3" />
                        Admin
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-[13px] leading-relaxed text-muted-foreground">{confirmScript.description}</p>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setConfirmScript(null)}>
                    Cancelar
                  </Button>
                  <Button size="sm" onClick={handleConfirm}>
                    Confirmar
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
