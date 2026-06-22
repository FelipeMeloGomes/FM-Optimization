import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

export interface LogEntry {
  id: string
  text: string
  level: 'info' | 'start' | 'end' | 'error' | 'warn'
  timestamp: Date
}

interface LogContextValue {
  entries: LogEntry[]
  addEntry: (text: string, level?: LogEntry['level']) => void
  clear: () => void
}

const LogContext = createContext<LogContextValue | null>(null)
let logCounter = 0

export function LogProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<LogEntry[]>([])

  useEffect(() => {
    const unsubOutput = window.electronAPI.onScriptOutput((data) => {
      addEntry(data.text, 'info')
    })
    const unsubError = window.electronAPI.onScriptError((data) => {
      addEntry(data.text, 'error')
    })
    const unsubEnded = window.electronAPI.onScriptEnded((data) => {
      addEntry(`Script finalizado (código: ${data.code})`, data.code === 0 ? 'end' : 'error')
    })

    return () => {
      unsubOutput()
      unsubError()
      unsubEnded()
    }
  }, [])

  const addEntry = useCallback((text: string, level: LogEntry['level'] = 'info') => {
    const entry: LogEntry = { id: `log-${++logCounter}`, text, level, timestamp: new Date() }
    setEntries((prev) => [...prev, entry])
  }, [])

  const clear = useCallback(() => setEntries([]), [])

  return (
    <LogContext.Provider value={{ entries, addEntry, clear }}>
      {children}
    </LogContext.Provider>
  )
}

export function useLogContext(): LogContextValue {
  const ctx = useContext(LogContext)
  if (!ctx) throw new Error('useLogContext must be used within LogProvider')
  return ctx
}
