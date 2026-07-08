import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react'

interface ScriptExecutionContextValue {
  activeExecution: string | null
  execute: (id: string) => Promise<void>
  cancel: (id: string) => Promise<void>
}

const ScriptExecutionContext = createContext<ScriptExecutionContextValue | null>(null)

export function ScriptExecutionProvider({ children }: { children: ReactNode }) {
  const [activeExecution, setActiveExecution] = useState<string | null>(null)
  const activeRef = useRef<string | null>(null)

  useEffect(() => {
    return window.electronAPI.onScriptEnded((data) => {
      setActiveExecution((prev) => prev === data.id ? null : prev)
      if (activeRef.current === data.id) activeRef.current = null
    })
  }, [])

  const execute = useCallback(async (id: string) => {
    activeRef.current = id
    setActiveExecution(id)
    try {
      await window.electronAPI.executeScript(id)
    } catch (e) {
      console.error('Failed to execute script:', e)
    }
  }, [])

  const cancel = useCallback(async (id: string) => {
    try {
      await window.electronAPI.cancelExecution(id)
    } catch (e) {
      console.error('Failed to cancel script:', e)
    }
    setActiveExecution((prev) => prev === id ? null : prev)
    if (activeRef.current === id) activeRef.current = null
  }, [])

  return (
    <ScriptExecutionContext.Provider value={{ activeExecution, execute, cancel }}>
      {children}
    </ScriptExecutionContext.Provider>
  )
}

export function useScriptExecutionContext(): ScriptExecutionContextValue {
  const ctx = useContext(ScriptExecutionContext)
  if (!ctx) throw new Error('useScriptExecutionContext must be used within ScriptExecutionProvider')
  return ctx
}
