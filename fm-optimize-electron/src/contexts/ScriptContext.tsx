import { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo, type ReactNode } from 'react'
import type { AsyncState, ScriptEntry } from '../../electron/shared/ipc-types'

interface ScriptContextValue {
  state: AsyncState<ScriptEntry[]>
  filteredScripts: ScriptEntry[]
  favorites: string[]
  activeExecution: string | null
  search: string
  categoryFilter: string
  setSearch: (s: string) => void
  setCategoryFilter: (c: string) => void
  toggleFavorite: (id: string) => void
  showFavoritesOnly: boolean
  setShowFavoritesOnly: (v: boolean) => void
  execute: (id: string) => Promise<void>
  cancel: (id: string) => Promise<void>
}

const ScriptContext = createContext<ScriptContextValue | null>(null)

export function ScriptProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AsyncState<ScriptEntry[]>>({ status: 'loading' })
  const [favorites, setFavorites] = useState<string[]>([])
  const [activeExecution, setActiveExecution] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const activeRef = useRef<string | null>(null)

  useEffect(() => {
    Promise.all([
      window.electronAPI.getScripts(),
      window.electronAPI.getFavorites()
    ])
      .then(([scripts, favorites]) => {
        setState({ status: 'success', data: scripts })
        setFavorites(favorites)
      })
      .catch((e) => setState({ status: 'error', error: typeof e === 'string' ? e : (e as Error).message }))
  }, [])

  useEffect(() => {
    return window.electronAPI.onScriptEnded((data) => {
      setActiveExecution((prev) => prev === data.id ? null : prev)
      if (activeRef.current === data.id) activeRef.current = null
    })
  }, [])

  const scripts = state.status === 'success' ? state.data : []

  const filteredScripts = useMemo(() => scripts.filter((s) => {
    if (showFavoritesOnly && !favorites.includes(s.id)) return false
    if (categoryFilter && s.category !== categoryFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q))
      )
    }
    return true
  }), [scripts, showFavoritesOnly, favorites, categoryFilter, search])

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
      window.electronAPI.saveFavorites(next).catch((e) =>
        console.error('Failed to save favorites:', e)
      )
      return next
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
    <ScriptContext.Provider
      value={{
        state,
        filteredScripts,
        favorites,
        activeExecution,
        search,
        categoryFilter,
        setSearch,
        setCategoryFilter,
        toggleFavorite,
        showFavoritesOnly,
        setShowFavoritesOnly,
        execute,
        cancel
      }}
    >
      {children}
    </ScriptContext.Provider>
  )
}

export function useScriptContext(): ScriptContextValue {
  const ctx = useContext(ScriptContext)
  if (!ctx) throw new Error('useScriptContext must be used within ScriptProvider')
  return ctx
}
