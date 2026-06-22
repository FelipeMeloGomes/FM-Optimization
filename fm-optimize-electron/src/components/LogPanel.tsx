import { useEffect, useRef, useState } from 'react'
import { Terminal, Copy, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { useLogContext, type LogEntry } from '../contexts/LogContext'
import { cn } from '../lib/utils'

export function LogPanel() {
  const { entries, clear } = useLogContext()
  const [isOpen, setIsOpen] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [entries])

  const copyLog = () => {
    const text = entries.map((e) => `[${e.timestamp.toLocaleTimeString()}] [${e.level}] ${e.text}`).join('\n')
    navigator.clipboard.writeText(text)
  }

  const logColors: Record<LogEntry['level'], string> = {
    info: 'text-foreground',
    start: 'text-primary',
    end: 'text-green-400',
    error: 'text-destructive',
    warn: 'text-yellow-400'
  }

  return (
    <div className="border-t border-border">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between bg-card px-4 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <span className="flex items-center gap-2">
          <Terminal className="h-3.5 w-3.5" />
          Log ({entries.length})
        </span>
        {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
      </button>

      {isOpen && (
        <div
          ref={scrollRef}
          className="h-40 overflow-y-auto bg-background px-4 py-2 font-mono text-xs leading-relaxed"
        >
          {entries.length === 0 && (
            <span className="text-muted-foreground">[ System ready — aguardando execução... ]</span>
          )}
          {entries.map((entry) => (
            <div key={entry.id} className={cn(logColors[entry.level])}>
              <span className="text-muted-foreground">[{entry.timestamp.toLocaleTimeString()}]</span>{' '}
              {entry.text}
            </div>
          ))}
          <span className="inline-block h-4 w-2 animate-pulse bg-primary" />
        </div>
      )}

      {isOpen && entries.length > 0 && (
        <div className="flex gap-2 border-t border-border bg-card px-4 py-1.5">
          <button onClick={copyLog} className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground">
            <Copy className="h-3 w-3" /> Copiar
          </button>
          <button onClick={clear} className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground">
            <Trash2 className="h-3 w-3" /> Limpar
          </button>
        </div>
      )}
    </div>
  )
}
