import {
  AlertTriangle,
  Play,
  Shield,
  Terminal,
  X
} from 'lucide-react'
import { cn } from '../lib/utils'
import { Button, Badge, Dialog, DialogContent, DialogHeader, DialogTitle } from './ui'

interface ConfirmDialogItem {
  name: string
  description: string
  extension?: string
  requiresAdmin?: boolean
}

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  script: ConfirmDialogItem | null
  onConfirm: () => void
}

export function ConfirmDialog({
  open,
  onOpenChange,
  script,
  onConfirm
}: ConfirmDialogProps) {
  if (!script) return null

  const isTxt = script.extension === 'txt'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm p-0 overflow-hidden">
        {/* Header with icon */}
        <div className="relative bg-gradient-to-br from-primary/10 to-transparent p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
              {isTxt ? (
                <Terminal className="size-5 text-primary" />
              ) : (
                <Play className="size-5 text-primary" />
              )}
            </div>
            <div>
              <DialogTitle className="text-base">
                {isTxt ? 'Abrir Guia' : 'Confirmar Execução'}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isTxt ? 'Documento de referência' : 'Ação irreversível'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <div className="rounded-lg bg-muted/50 p-3 mb-4">
            <p className="text-sm font-semibold text-foreground mb-2">{script.name}</p>
            <div className="flex flex-wrap gap-1.5">
              {script.extension && (
                <Badge variant="secondary" className="gap-1 font-mono text-[10px] px-1.5 py-0">
                  <Terminal className="size-3" />
                  .{script.extension}
                </Badge>
              )}
              {script.requiresAdmin && (
                <Badge variant="destructive" className="gap-1 font-mono text-[10px] px-1.5 py-0">
                  <Shield className="size-3" />
                  Admin
                </Badge>
              )}
            </div>
          </div>

          <p className="text-[13px] leading-relaxed text-muted-foreground mb-4">
            {script.description}
          </p>

          {script.requiresAdmin && (
            <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 p-2.5 mb-4">
              <AlertTriangle className="size-3.5 text-amber-400 shrink-0" />
              <p className="text-[11px] text-amber-400/80">
                Este script requer privilégios de administrador para executar corretamente.
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={onConfirm}
              className={cn(
                'flex-1 gap-1.5',
                !isTxt && 'shadow-[0_0_15px_rgba(0,68,255,0.3)] hover:shadow-[0_0_20px_rgba(0,68,255,0.5)]'
              )}
            >
              {isTxt ? (
                <>
                  <Terminal className="size-3.5" />
                  Abrir
                </>
              ) : (
                <>
                  <Play className="size-3.5" />
                  Executar
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
