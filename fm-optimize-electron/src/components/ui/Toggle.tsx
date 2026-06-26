import { type InputHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
  description?: string
}

export function Toggle({ label, description, id, className, ...props }: ToggleProps) {
  return (
    <label
      htmlFor={id}
      className={cn('flex cursor-pointer items-center justify-between gap-4', className)}
    >
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {description && <span className="text-xs text-muted-foreground">{description}</span>}
      </div>
      <div className="relative">
        <input type="checkbox" id={id} className="peer sr-only" {...props} />
        <div className="h-6 w-10 rounded-full border border-border bg-muted transition-colors peer-checked:bg-primary peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-1" />
        <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-foreground transition-transform peer-checked:translate-x-4" />
      </div>
    </label>
  )
}
