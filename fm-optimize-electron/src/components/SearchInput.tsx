import { Search, X } from 'lucide-react'
import { useScriptContext } from '../contexts/ScriptContext'
import { Input } from './ui'

export function SearchInput() {
  const { search, setSearch } = useScriptContext()

  return (
    <div className="relative flex items-center">
      <Search className="absolute left-3 size-4 text-muted-foreground" />
      <label htmlFor="search-scripts" className="sr-only">Buscar scripts</label>
      <Input
        id="search-scripts"
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar scripts..."
        className="h-9 max-w-64 pl-9 pr-8"
      />
      {search && (
        <button onClick={() => setSearch('')} className="absolute right-2" aria-label="Limpar busca">
          <X className="size-4 text-muted-foreground hover:text-foreground" />
        </button>
      )}
    </div>
  )
}
