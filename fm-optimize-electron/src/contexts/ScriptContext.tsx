import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { ScriptEntry } from '../../electron/shared/ipc-types'

interface ScriptContextValue {
  scripts: ScriptEntry[]
  filteredScripts: ScriptEntry[]
  favorites: string[]
  activeExecution: string | null
  search: string
  categoryFilter: string
  loading: boolean
  error: string | null
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
  const [scripts, setScripts] = useState<ScriptEntry[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [activeExecution, setActiveExecution] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    window.electronAPI
      .getScripts()
      .then(setScripts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const filteredScripts = scripts.filter((s) => {
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
  })

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
      return next
    })
  }, [])

  const execute = useCallback(async (id: string) => {
    setActiveExecution(id)
    try {
      await window.electronAPI.executeScript(id)
    } finally {
      setActiveExecution(null)
    }
  }, [])

  const cancel = useCallback(async (id: string) => {
    await window.electronAPI.cancelExecution(id)
    setActiveExecution(null)
  }, [])

  return (
    <ScriptContext.Provider
      value={{
        scripts,
        filteredScripts,
        favorites,
        activeExecution,
        search,
        categoryFilter,
        loading,
        error,
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
