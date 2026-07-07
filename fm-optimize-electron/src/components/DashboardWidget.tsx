import { memo } from 'react'
import { cn } from '../lib/utils'
import type { LucideIcon } from 'lucide-react'

interface DashboardWidgetProps {
  icon: LucideIcon
  label: string
  value: string
  detail?: string
  progress?: number
  className?: string
}

const progressColor = (p: number): string => {
  if (p >= 90) return 'bg-red-500'
  if (p >= 70) return 'bg-yellow-500'
  return 'bg-green-500'
}

export const DashboardWidget = memo(function DashboardWidget({ icon: Icon, label, value, detail, progress, className }: DashboardWidgetProps) {
  return (
    <div className={cn('rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:shadow-[0_0_12px_rgba(0,68,255,0.15)]', className)}>
      <div className="mb-2 flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" aria-hidden="true" />
        <span className="text-xs uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-lg font-semibold text-foreground tabular-nums">{value || '—'}</div>
      {detail && <div className="mt-1 text-xs text-muted-foreground">{detail}</div>}
      {progress !== undefined && (
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn('h-full rounded-full transition-all', progressColor(progress))}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      )}
    </div>
  )
})
