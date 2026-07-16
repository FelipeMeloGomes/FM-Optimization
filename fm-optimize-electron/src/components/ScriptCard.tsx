import { memo, useState } from 'react'
import {
  Play,
  Square,
  Terminal,
  ShieldAlert,
  Info,
  ChevronDown,
  FileText,
  Shield,
  Zap,
  Gauge,
  Wrench,
  Eraser,
  Globe,
  Smartphone,
  Wifi,
  MousePointerClick,
  Cpu,
  Settings
} from 'lucide-react'
import { cn } from '../lib/utils'
import { Button, Badge, Dialog, DialogContent, DialogHeader, DialogTitle } from './ui'
import { useSettingsContext } from '../contexts/SettingsContext'
import type { ScriptEntry } from '../../electron/shared/ipc-types'

interface ScriptCardProps {
  script: ScriptEntry
  isFavorite: boolean
  isExecuting: boolean
  onExecute: () => void
  onCancel: () => void
  onToggleFavorite: () => void
}

const CATEGORY_CONFIG: Record<string, { icon: React.ElementType; color: string; bgColor: string; borderColor: string }> = {
  Tweaks: { icon: Gauge, color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', borderColor: 'border-cyan-500/20' },
  Utilities: { icon: Wrench, color: 'text-orange-400', bgColor: 'bg-orange-500/10', borderColor: 'border-orange-500/20' },
  Cleaner: { icon: Eraser, color: 'text-green-400', bgColor: 'bg-green-500/10', borderColor: 'border-green-500/20' },
  Apps: { icon: Smartphone, color: 'text-pink-400', bgColor: 'bg-pink-500/10', borderColor: 'border-pink-500/20' },
  Internet: { icon: Wifi, color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/20' },
  'Input Lag': { icon: MousePointerClick, color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/20' },
  AMD: { icon: Cpu, color: 'text-red-400', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/20' },
  Intel: { icon: Cpu, color: 'text-blue-400', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/20' }
}

const DEFAULT_CONFIG = { icon: Zap, color: 'text-primary', bgColor: 'bg-primary/10', borderColor: 'border-primary/20' }

export const ScriptCard = memo(function ScriptCard({
  script,
  isFavorite,
  isExecuting,
  onExecute,
  onCancel,
  onToggleFavorite
}: ScriptCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const { settings } = useSettingsContext()
  const isTxt = script.extension === 'txt'

  const config = CATEGORY_CONFIG[script.category] || DEFAULT_CONFIG
  const Icon = config.icon

  function handleExecute() {
    if (isTxt) {
      onExecute()
    } else if (settings.confirmOnExecute) {
      setShowConfirm(true)
    } else {
      onExecute()
    }
  }

  return (
    <>
      <div
        className={cn(
          'group relative rounded-xl border bg-card p-5 transition-all duration-300 hover:shadow-lg',
          config.borderColor,
          isExecuting && 'ring-2 ring-primary/50'
        )}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              'flex size-10 items-center justify-center rounded-lg',
              config.bgColor
            )}>
              <Icon className={cn('size-5', config.color)} />
            </div>
            <div className="flex-1 min-w-0">
              <h3
                onClick={() => setExpanded((v) => !v)}
                className="cursor-pointer font-semibold text-foreground hover:text-primary transition-colors truncate"
              >
                {script.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="gap-1 font-mono text-[10px] px-1.5 py-0">
                  <Terminal className="size-3" aria-hidden="true" />
                  .{script.extension}
                </Badge>
                {script.requiresAdmin && (
                  <Badge variant="destructive" className="gap-1 font-mono text-[10px] px-1.5 py-0">
                    <ShieldAlert className="size-3" aria-hidden="true" />
                    Admin
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleFavorite}
            className="size-8 text-muted-foreground hover:text-yellow-400 shrink-0"
          >
            <span className={cn(
              'size-4',
              isFavorite && 'fill-yellow-400 text-yellow-400'
            )}>★</span>
          </Button>
        </div>

        <div onClick={() => setExpanded((v) => !v)} className="cursor-pointer mt-3">
          <p
            className={cn(
              'text-[13px] leading-relaxed text-muted-foreground hover:text-foreground transition-colors',
              !expanded && 'line-clamp-2'
            )}
          >
            {script.description}
          </p>
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v) }}
            className="mt-1 flex items-center gap-1 text-xs font-medium text-primary/70 hover:text-primary transition-colors"
          >
            <ChevronDown
              className={cn(
                'size-3 transition-transform duration-300',
                expanded ? 'rotate-180' : 'rotate-0'
              )}
              aria-hidden="true"
            />
            {expanded ? 'Menos' : 'Mais'}
          </button>
        </div>

        {script.guide && (
          <div className="mt-3">
            <button
              onClick={() => setShowGuide((v) => !v)}
              className="flex items-center gap-1.5 text-xs font-medium text-primary/70 hover:text-primary transition-colors"
            >
              <Info className="size-3.5" aria-hidden="true" />
              {showGuide ? 'Ocultar explicação' : 'Como funciona?'}
            </button>
            {showGuide && (
              <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
                {script.guide}
              </p>
            )}
          </div>
        )}

        {script.requiresAdmin && (
          <div className="mt-3 flex items-center gap-1.5 text-[10px] text-yellow-400/80">
            <Shield className="size-3" />
            <span>Requer administrador</span>
          </div>
        )}

        <div className="mt-4 flex gap-2">
          {isExecuting ? (
            <>
              <Button
                variant="destructive"
                size="sm"
                onClick={onCancel}
                className="flex-1 gap-2"
                aria-label="Cancelar execução"
              >
                <Square className="size-3.5" aria-hidden="true" />
                Cancelar
              </Button>
            </>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={handleExecute}
              className="flex-1 gap-2"
              aria-label={isTxt ? 'Abrir guia' : 'Executar script'}
            >
              {isTxt ? <FileText className="size-3.5" aria-hidden="true" /> : <Play className="size-3.5" aria-hidden="true" />}
              {isTxt ? 'Abrir' : 'Executar'}
            </Button>
          )}
        </div>
      </div>

      <Dialog open={showConfirm} onOpenChange={(open) => { if (!open) setShowConfirm(false) }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{isTxt ? 'Abrir guia' : 'Confirmar Execução'}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-sm font-semibold text-foreground">{script.name}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Badge variant="secondary" className="gap-1 font-mono text-xs">
                  <Terminal className="size-3" aria-hidden="true" />
                  .{script.extension}
                </Badge>
                {script.requiresAdmin && (
                  <Badge variant="destructive" className="gap-1 font-mono text-xs">
                    <ShieldAlert className="size-3" aria-hidden="true" />
                    Admin
                  </Badge>
                )}
              </div>
            </div>
            <p className="text-[13px] leading-relaxed text-muted-foreground">{script.description}</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowConfirm(false)}>
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setShowConfirm(false)
                  onExecute()
                }}
              >
                Confirmar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
})
