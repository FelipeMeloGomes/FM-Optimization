import { type HTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
}

export function Card({ className, hover, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card p-4',
        hover && 'transition-colors hover:border-primary/40 hover:shadow-[0_0_12px_rgba(0,68,255,0.15)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
