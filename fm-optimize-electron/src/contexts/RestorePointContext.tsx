import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { RestorePointEntry } from '../../electron/shared/ipc-types'

interface RestorePointContextValue {
  restorePoints: RestorePointEntry[]
  loading: boolean
  error: string | null
  creating: boolean
  refresh: () => void
  create: (name: string) => Promise<void>
  remove: (seq: number) => Promise<void>
}

const RestorePointContext = createContext<RestorePointContextValue | null>(null)

export function RestorePointProvider({ children }: { children: ReactNode }) {
  const [restorePoints, setRestorePoints] = useState<RestorePointEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const refresh = useCallback(() => {
    setLoading(true)
    setError(null)
    window.electronAPI
      .getRestorePoints()
      .then(setRestorePoints)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const create = useCallback(async (name: string) => {
    setCreating(true)
    try {
      await window.electronAPI.createRestorePoint(name)
      await refresh()
    } finally {
      setCreating(false)
    }
  }, [refresh])

  const remove = useCallback(async (seq: number) => {
    await window.electronAPI.deleteRestorePoint(seq)
    await refresh()
  }, [refresh])

  useEffect(() => { refresh() }, [refresh])

  return (
    <RestorePointContext.Provider value={{ restorePoints, loading, error, creating, refresh, create, remove }}>
      {children}
    </RestorePointContext.Provider>
  )
}

export function useRestorePointContext(): RestorePointContextValue {
  const ctx = useContext(RestorePointContext)
  if (!ctx) throw new Error('useRestorePointContext must be used within RestorePointProvider')
  return ctx
}
