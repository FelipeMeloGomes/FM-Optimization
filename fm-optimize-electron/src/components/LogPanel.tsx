import { useEffect, useRef, useState, useMemo } from 'react'
import { Terminal, Copy, Trash2, ChevronDown, ChevronUp, WrapText } from 'lucide-react'
import { useLogContext, type LogEntry } from '../contexts/LogContext'
import { useSettingsContext } from '../contexts/SettingsContext'
import { cn } from '../lib/utils'

type LogLevel = 'all' | 'info' | 'warn' | 'error'

const FILTERS = [
  { key: 'all' as const, label: 'Todos' },
  { key: 'info' as const, label: 'Info' },
  { key: 'warn' as const, label: 'Warn' },
  { key: 'error' as const, label: 'Error' },
] as const

const logColors: Record<LogEntry['level'], string> = {
  info: 'text-foreground',
  start: 'text-primary',
  end: 'text-green-400',
  error: 'text-destructive',
  warn: 'text-yellow-400'
}

export function LogPanel() {
  const { entries, clear } = useLogContext()
  const { settings } = useSettingsContext()
  const [isOpen, setIsOpen] = useState(() => settings.autoOpenLog)
  const [levelFilter, setLevelFilter] = useState<LogLevel>('all')
  const [wrap, setWrap] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const userScrolledUpRef = useRef(false)

  useEffect(() => {
    const el = scrollRef.current
    if (!el || userScrolledUpRef.current) return
    el.scrollTop = el.scrollHeight
  }, [entries])

  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50
    userScrolledUpRef.current = !atBottom
  }

  const copyLog = () => {
    const text = entries.map((e) => `[${e.timestamp.toLocaleTimeString()}] [${e.level}] ${e.text}`).join('\n')
    navigator.clipboard.writeText(text)
  }

  const filteredEntries = useMemo(
    () => levelFilter === 'all' ? entries : entries.filter((e) => e.level === levelFilter),
    [entries, levelFilter]
  )

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
        <>
          <div className="flex items-center gap-1 border-b border-border bg-card px-4 py-1.5">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setLevelFilter(f.key)}
                className={cn(
                  'rounded px-2 py-0.5 text-[10px] font-medium transition-colors',
                  levelFilter === f.key
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {f.label}
              </button>
            ))}
            <button
              onClick={() => setWrap(!wrap)}
              className={cn(
                'ml-auto rounded p-1 transition-colors',
                wrap ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
              title={wrap ? 'Quebrar linhas' : 'Não quebrar linhas'}
            >
              <WrapText className="h-3.5 w-3.5" />
            </button>
          </div>

          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className={cn(
              'max-h-40 overflow-y-auto bg-background px-4 py-2 font-mono text-sm leading-relaxed',
              wrap ? 'whitespace-pre-wrap' : 'whitespace-nowrap'
            )}
          >
            {entries.length === 0 && (
              <span className="text-muted-foreground">[ Sistema pronto — aguardando execução... ]</span>
            )}
            {filteredEntries.map((entry) => (
              <div key={entry.id} className={cn(logColors[entry.level])}>
                <span className="text-muted-foreground">[{entry.timestamp.toLocaleTimeString()}]</span>{' '}
                {entry.text}
              </div>
            ))}
            <span className="inline-block h-4 w-2 animate-pulse bg-primary" />
          </div>
        </>
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


