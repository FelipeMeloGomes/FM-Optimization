import { memo } from 'react'
import { cn } from '../lib/utils'
import { Card, CardHeader, CardTitle, CardContent, Progress } from './ui'
import type { LucideIcon } from 'lucide-react'

interface DashboardWidgetProps {
  icon: LucideIcon
  label: string
  value: string
  detail?: string
  progress?: number
  className?: string
}

export const DashboardWidget = memo(function DashboardWidget({ icon: Icon, label, value, detail, progress, className }: DashboardWidgetProps) {
  return (
    <Card className={cn('transition-all duration-200 hover:border-primary/50 hover:shadow-[0_0_15px_rgba(0,68,255,0.15)]', className)}>
      <CardHeader className="flex-row items-center gap-2 p-4 pb-2">
        <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
        <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="text-lg font-semibold text-foreground tabular-nums">{value || '—'}</div>
        {detail && <div className="mt-1 text-xs text-muted-foreground">{detail}</div>}
        {progress !== undefined && (
          <Progress
            value={progress}
            className="mt-2 h-1.5"
            aria-label={`${label}: ${value}`}
          />
        )}
      </CardContent>
    </Card>
  )
})