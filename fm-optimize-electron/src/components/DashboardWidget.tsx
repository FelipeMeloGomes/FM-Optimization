import { cn } from '../lib/utils'
import type { LucideIcon } from 'lucide-react'

interface DashboardWidgetProps {
  icon: LucideIcon
  label: string
  value: string
  detail?: string
  className?: string
}

export function DashboardWidget({ icon: Icon, label, value, detail, className }: DashboardWidgetProps) {
  return (
    <div className={cn('rounded-xl border border-border bg-card p-4', className)}>
      <div className="mb-2 flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" aria-hidden="true" />
        <span className="text-xs uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-lg font-semibold text-foreground tabular-nums">{value || '—'}</div>
      {detail && <div className="mt-1 text-xs text-muted-foreground">{detail}</div>}
    </div>
  )
}
