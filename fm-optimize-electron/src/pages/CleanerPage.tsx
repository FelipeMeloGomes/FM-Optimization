import { useCallback, useMemo, useState } from 'react'
import {
  Zap,
  RefreshCw,
  Globe,
  Trash2,
  AlertTriangle,
  Shield,
  Clock,
  HardDrive,
  Terminal,
  ShieldAlert
} from 'lucide-react'
import { cn } from '../lib/utils'
import { Button, Badge, Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui'
import { useScriptContext } from '../contexts/ScriptContext'
import { useScriptExecutionContext } from '../contexts/ScriptExecutionContext'
import { useSettingsContext } from '../contexts/SettingsContext'
import { ScriptCardSkeleton } from '../components/ScriptCardSkeleton'

interface CleanerCard {
  id: string
  name: string
  description: string
  icon: React.ElementType
  color: string
  bgColor: string
  borderColor: string
  riskLevel: 'safe' | 'moderate' | 'deep'
  riskLabel: string
  frequency: string
  whatItCleans: string[]
}

const CLEANER_CARDS: CleanerCard[] = [
  {
    id: 'cleaner-1',
    name: 'Limpeza Rápida',
    description: 'Remove arquivos temporários, logs do sistema, prefetch e lixeira. Seguro para executar semanalmente.',
    icon: Zap,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
    riskLevel: 'safe',
    riskLabel: 'Seguro',
    frequency: 'Semanal',
    whatItCleans: [
      'Arquivos temporários do Windows',
      'Logs do sistema',
      'Prefetch',
      'Lixeira',
      'Cache de miniaturas'
    ]
  },
  {
    id: 'cleaner-2',
    name: 'Limpeza de Atualizações',
    description: 'Limpa cache do Windows Update, Windows Store e shaders DirectX. Use após instalar atualizadores drivers.',
    icon: RefreshCw,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    riskLevel: 'moderate',
    riskLabel: 'Moderado',
    frequency: 'Conforme necessário',
    whatItCleans: [
      'Cache do Windows Update',
      'Cache da Windows Store',
      'Shaders DirectX',
      'Cache de drivers temporários'
    ]
  },
  {
    id: 'cleaner-3',
    name: 'Limpeza de Navegadores',
    description: 'Apaga cache e dados temporários do Chrome, Edge, Firefox e Brave. Pode exigir login novamente.',
    icon: Globe,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    riskLevel: 'moderate',
    riskLabel: 'Moderado',
    frequency: 'Quando necessário',
    whatItCleans: [
      'Cache do Google Chrome',
      'Cache do Microsoft Edge',
      'Cache do Mozilla Firefox',
      'Cache do Brave Browser'
    ]
  },
  {
    id: 'cleaner-4',
    name: 'Limpeza Total',
    description: 'Faxina completa: temporários, logs, prefetch, lixeira, navegadores, Windows Update e mais. Execute 1 vez por mês.',
    icon: Trash2,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    riskLevel: 'deep',
    riskLabel: 'Completo',
    frequency: 'Mensal',
    whatItCleans: [
      'Todas as limpezas anteriores',
      'Cache de componentes do Windows',
      'Limpeza de disco avançada',
      'Limpeza profunda do sistema'
    ]
  }
]

const RISK_STYLES = {
  safe: 'bg-green-500/20 text-green-400 border-green-500/30',
  moderate: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  deep: 'bg-red-500/20 text-red-400 border-red-500/30'
}

export default function CleanerPage() {
  const {
    state,
    filteredScripts,
  } = useScriptContext()
  const { activeExecution, execute, cancel } = useScriptExecutionContext()
  const { settings } = useSettingsContext()
  const [confirmScript, setConfirmScript] = useState<CleanerCard | null>(null)

  const cleanerScripts = useMemo(
    () => filteredScripts.filter(s => s.category === 'Cleaner'),
    [filteredScripts]
  )

  const getScriptData = useCallback(
    (scriptId: string) => cleanerScripts.find(s => s.id === scriptId),
    [cleanerScripts]
  )

  const handleExecute = useCallback(
    (id: string) => execute(id),
    [execute]
  )
  const handleCancel = useCallback(
    (id: string) => cancel(id),
    [cancel]
  )

  const handleButtonClick = useCallback(
    (card: CleanerCard) => {
      if (settings.confirmOnExecute) {
        setConfirmScript(card)
      } else {
        handleExecute(card.id)
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Limpeza do Sistema</h2>
          <p className="text-sm text-muted-foreground">
            Mantenha seu Windows limpo e rápido
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {CLEANER_CARDS.map((card) => {
          const script = getScriptData(card.id)
          const isExecuting = activeExecution === card.id

          return (
            <div
              key={card.id}
              className={cn(
                'group relative rounded-xl border bg-card p-5 transition-all duration-300 hover:shadow-lg',
                card.borderColor,
                isExecuting && 'ring-2 ring-primary/50'
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'flex size-10 items-center justify-center rounded-lg',
                    card.bgColor
                  )}>
                    <card.icon className={cn('size-5', card.color)} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{card.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="outline"
                        className={cn('text-[10px] px-1.5 py-0', RISK_STYLES[card.riskLevel])}
                      >
                        {card.riskLabel}
                      </Badge>
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock className="size-3" />
                        {card.frequency}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                {card.description}
              </p>

              <div className="mt-4">
                <p className="text-xs font-medium text-foreground mb-2">O que limpa:</p>
                <ul className="space-y-1">
                  {card.whatItCleans.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="size-1 rounded-full bg-muted-foreground/50" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {script?.requiresAdmin && (
                <div className="mt-4 flex items-center gap-1.5 text-[10px] text-yellow-400/80">
                  <Shield className="size-3" />
                  <span>Requer administrador</span>
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleButtonClick(card)}
                  disabled={isExecuting}
                  className={cn(
                    'flex-1 gap-2',
                    isExecuting && 'animate-pulse'
                  )}
                >
                  {isExecuting ? (
                    <>
                      <span className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Executando...
                    </>
                  ) : (
                    <>
                      <card.icon className="size-3.5" />
                      Executar
                    </>
                  )}
                </Button>
                {isExecuting && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleCancel(card.id)}
                  >
                    Cancelar
                  </Button>
                )}
              </div>

              {card.riskLevel === 'deep' && (
                <div className="mt-3 flex items-start gap-2 rounded-lg bg-red-500/5 p-2 border border-red-500/10">
                  <AlertTriangle className="size-3.5 text-red-400 mt-0.5 shrink-0" />
                  <p className="text-[10px] text-red-400/80 leading-relaxed">
                    Esta limpeza é mais agressiva. Recomendada apenas uma vez por mês para manter o sistema estável.
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>

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
                      <Terminal className="size-3" aria-hidden="true" />
                      .bat
                    </Badge>
                    {getScriptData(confirmScript.id)?.requiresAdmin && (
                      <Badge variant="destructive" className="gap-1 font-mono text-xs">
                        <ShieldAlert className="size-3" aria-hidden="true" />
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
