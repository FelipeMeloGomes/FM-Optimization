import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { AsyncState, DashboardData } from '../../electron/shared/ipc-types'

interface SystemContextValue {
  state: AsyncState<DashboardData>
  refreshing: boolean
  refresh: () => void
}

const SystemContext = createContext<SystemContextValue | null>(null)

export function SystemProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AsyncState<DashboardData>>({ status: 'loading' })
  const [refreshing, setRefreshing] = useState(false)

  const refresh = useCallback(() => {
    const isInitialLoad = state.status === 'loading'
    if (!isInitialLoad) setRefreshing(true)

    window.electronAPI
      .getSystemInfo()
      .then((data) => setState({ status: 'success', data }))
      .catch((e) => setState({ status: 'error', error: typeof e === 'string' ? e : (e as Error).message }))
      .finally(() => setRefreshing(false))
  }, [state.status])

  useEffect(() => {
    refresh()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <SystemContext.Provider value={{ state, refreshing, refresh }}>
      {children}
    </SystemContext.Provider>
  )
}

export function useSystemContext(): SystemContextValue {
  const ctx = useContext(SystemContext)
  if (!ctx) throw new Error('useSystemContext must be used within SystemProvider')
  return ctx
}
