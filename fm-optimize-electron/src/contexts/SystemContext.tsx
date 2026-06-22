import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { DashboardData } from '../../electron/shared/ipc-types'

interface SystemContextValue {
  data: DashboardData | null
  loading: boolean
  error: string | null
  refresh: () => void
}

const SystemContext = createContext<SystemContextValue | null>(null)

export function SystemProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(() => {
    setLoading(true)
    setError(null)
    window.electronAPI
      .getSystemInfo()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return (
    <SystemContext.Provider value={{ data, loading, error, refresh }}>
      {children}
    </SystemContext.Provider>
  )
}

export function useSystemContext(): SystemContextValue {
  const ctx = useContext(SystemContext)
  if (!ctx) throw new Error('useSystemContext must be used within SystemProvider')
  return ctx
}
