import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { AsyncState, DashboardData } from '../../electron/shared/ipc-types'

interface SystemContextValue {
  state: AsyncState<DashboardData>
  refresh: () => void
}

const SystemContext = createContext<SystemContextValue | null>(null)

export function SystemProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AsyncState<DashboardData>>({ status: 'loading' })

  const refresh = useCallback(() => {
    setState({ status: 'loading' })
    window.electronAPI
      .getSystemInfo()
      .then((data) => setState({ status: 'success', data }))
      .catch((e) => setState({ status: 'error', error: typeof e === 'string' ? e : (e as Error).message }))
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return (
    <SystemContext.Provider value={{ state, refresh }}>
      {children}
    </SystemContext.Provider>
  )
}

export function useSystemContext(): SystemContextValue {
  const ctx = useContext(SystemContext)
  if (!ctx) throw new Error('useSystemContext must be used within SystemProvider')
  return ctx
}
