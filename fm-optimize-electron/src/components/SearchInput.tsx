import { Search, X } from 'lucide-react'
import { useScriptContext } from '../contexts/ScriptContext'

export function SearchInput() {
  const { search, setSearch } = useScriptContext()

  return (
    <div className="relative flex items-center">
      <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
      <label htmlFor="search-scripts" className="sr-only">Buscar scripts</label>
      <input
        id="search-scripts"
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar scripts..."
        className="h-9 w-full max-w-64 rounded-lg border border-input bg-background pl-9 pr-8 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      {search && (
        <button onClick={() => setSearch('')} className="absolute right-2" aria-label="Limpar busca">
          <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
        </button>
      )}
    </div>
  )
}
