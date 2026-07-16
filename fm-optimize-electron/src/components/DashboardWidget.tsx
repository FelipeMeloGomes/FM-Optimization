import { memo } from 'react'
import { cn } from '../lib/utils'
import { Card, CardContent, Progress } from './ui'
import type { LucideIcon } from 'lucide-react'

interface DashboardWidgetProps {
  icon: LucideIcon
  label: string
  value: string
  detail?: string
  progress?: number
  status?: 'default' | 'good' | 'warning' | 'danger'
  className?: string
}

const STATUS_STYLES = {
  default: {
    iconBg: 'bg-muted',
    iconColor: 'text-muted-foreground',
    border: 'hover:border-primary/30'
  },
  good: {
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-400',
    border: 'hover:border-emerald-500/30'
  },
  warning: {
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-400',
    border: 'hover:border-amber-500/30'
  },
  danger: {
    iconBg: 'bg-red-500/10',
    iconColor: 'text-red-400',
    border: 'hover:border-red-500/30'
  }
}

export const DashboardWidget = memo(function DashboardWidget({
  icon: Icon,
  label,
  value,
  detail,
  progress,
  status = 'default',
  className
}: DashboardWidgetProps) {
  const styles = STATUS_STYLES[status]

  return (
    <Card className={cn(
      'transition-all duration-300',
      styles.border,
      status === 'good' && 'hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]',
      status === 'warning' && 'hover:shadow-[0_0_20px_rgba(245,158,11,0.1)]',
      status === 'danger' && 'hover:shadow-[0_0_20px_rgba(239,68,68,0.1)]',
      status === 'default' && 'hover:shadow-[0_0_20px_rgba(0,68,255,0.1)]',
      className
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className={cn(
            'flex size-9 items-center justify-center rounded-lg',
            styles.iconBg
          )}>
            <Icon className={cn('size-4', styles.iconColor)} aria-hidden="true" />
          </div>
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
        </div>
        <div className="mt-3">
          <div className="text-base font-semibold text-foreground tabular-nums leading-tight">
            {value || '—'}
          </div>
          {detail && (
            <div className="mt-1 text-xs text-muted-foreground leading-relaxed">
              {detail}
            </div>
          )}
        </div>
        {progress !== undefined && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-muted-foreground">Uso</span>
              <span className="text-[10px] font-medium text-muted-foreground tabular-nums">{progress}%</span>
            </div>
            <Progress
              value={progress}
              className={cn(
                'h-1.5',
                progress > 90 && '[&>div]:bg-red-500',
                progress > 70 && progress <= 90 && '[&>div]:bg-amber-500',
                progress <= 70 && '[&>div]:bg-emerald-500'
              )}
              aria-label={`${label}: ${value}`}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
})
