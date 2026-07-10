import { createContext, useContext, useState, useEffect, useCallback, useMemo, useDeferredValue, type ReactNode } from 'react'
import type { AsyncState, ScriptEntry } from '../../electron/shared/ipc-types'

interface ScriptContextValue {
  state: AsyncState<ScriptEntry[]>
  filteredScripts: ScriptEntry[]
  favorites: string[]
  search: string
  categoryFilter: string
  subcategoryFilter: string
  subcategories: string[]
  setSearch: (s: string) => void
  setCategoryFilter: (c: string) => void
  setSubcategoryFilter: (c: string) => void
  toggleFavorite: (id: string) => void
  showFavoritesOnly: boolean
  setShowFavoritesOnly: (v: boolean) => void
}

const ScriptContext = createContext<ScriptContextValue | null>(null)

export function ScriptProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AsyncState<ScriptEntry[]>>({ status: 'loading' })
  const [favorites, setFavorites] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const [categoryFilter, setCategoryFilter] = useState('')
  const [subcategoryFilter, setSubcategoryFilter] = useState('')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)

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

  const scripts = state.status === 'success' ? state.data : []

  const subcategories = useMemo(() => {
    const cats = new Set<string>()
    scripts.forEach((s) => {
      if (s.subcategory && (!categoryFilter || s.category === categoryFilter)) {
        cats.add(s.subcategory)
      }
    })
    return Array.from(cats).sort()
  }, [scripts, categoryFilter])

  const filteredScripts = useMemo(() => scripts.filter((s) => {
    if (showFavoritesOnly && !favorites.includes(s.id)) return false
    if (categoryFilter && s.category !== categoryFilter) return false
    if (subcategoryFilter && s.subcategory !== subcategoryFilter) return false
    if (deferredSearch) {
      const q = deferredSearch.toLowerCase()
      return (
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q))
      )
    }
    return true
  }), [scripts, showFavoritesOnly, favorites, categoryFilter, subcategoryFilter, deferredSearch])

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
      window.electronAPI.saveFavorites(next).catch((e) =>
        console.error('Failed to save favorites:', e)
      )
      return next
    })
  }, [])

  const contextValue = useMemo(() => ({
    state,
    filteredScripts,
    favorites,
    search,
    categoryFilter,
    subcategoryFilter,
    subcategories,
    setSearch,
    setCategoryFilter,
    setSubcategoryFilter,
    toggleFavorite,
    showFavoritesOnly,
    setShowFavoritesOnly
  }), [
    state,
    filteredScripts,
    favorites,
    search,
    categoryFilter,
    subcategoryFilter,
    subcategories,
    setSearch,
    setCategoryFilter,
    setSubcategoryFilter,
    toggleFavorite,
    showFavoritesOnly,
    setShowFavoritesOnly
  ])

  return (
    <ScriptContext.Provider value={contextValue}>
      {children}
    </ScriptContext.Provider>
  )
}

export function useScriptContext(): ScriptContextValue {
  const ctx = useContext(ScriptContext)
  if (!ctx) throw new Error('useScriptContext must be used within ScriptProvider')
  return ctx
}