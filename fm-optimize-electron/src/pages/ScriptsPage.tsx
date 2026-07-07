import { useEffect } from 'react'
import { Star } from 'lucide-react'
import { cn } from '../lib/utils'
import { useScriptContext } from '../contexts/ScriptContext'
import { ScriptCard } from '../components/ScriptCard'
import { ScriptCardSkeleton } from '../components/ScriptCardSkeleton'

interface ScriptsPageProps {
  category: string
}

export default function ScriptsPage({ category }: ScriptsPageProps) {
  const {
    state,
    filteredScripts,
    favorites,
    activeExecution,
    setCategoryFilter,
    setSubcategoryFilter,
    toggleFavorite,
    showFavoritesOnly,
    setShowFavoritesOnly,
    subcategoryFilter,
    subcategories,
    execute,
    cancel
  } = useScriptContext()

  useEffect(() => {
    setCategoryFilter(category)
    setSubcategoryFilter('')
  }, [category, setCategoryFilter, setSubcategoryFilter])

  if (state.status === 'loading') {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ScriptCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (state.status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-sm">Erro ao carregar scripts</p>
        <p className="text-xs text-destructive mt-2">{state.error}</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <button
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-colors',
            showFavoritesOnly
              ? 'bg-yellow-400/20 text-yellow-400'
              : 'bg-muted text-muted-foreground hover:text-foreground'
          )}
        >
          <Star className={cn('h-3.5 w-3.5', showFavoritesOnly && 'fill-yellow-400')} />
          Favoritos
        </button>
        <span className="text-xs text-muted-foreground">
          {filteredScripts.length} scripts
        </span>
      </div>

      {subcategories.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSubcategoryFilter('')}
            className={cn(
              'rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors',
              !subcategoryFilter
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            )}
          >
            Todas
          </button>
          {subcategories.map((sub) => (
            <button
              key={sub}
              onClick={() => setSubcategoryFilter(sub)}
              className={cn(
                'rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors',
                subcategoryFilter === sub
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              )}
            >
              {sub}
            </button>
          ))}
        </div>
      )}

      {filteredScripts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <p className="text-sm">Nenhum script encontrado</p>
          <p className="text-xs mt-1">Tente ajustar sua busca ou filtro</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredScripts.map((script) => (
          <ScriptCard
            key={script.id}
            script={script}
            isFavorite={favorites.includes(script.id)}
            isExecuting={activeExecution === script.id}
            onExecute={() => execute(script.id)}
            onCancel={() => cancel(script.id)}
            onToggleFavorite={() => toggleFavorite(script.id)}
          />
          ))}
        </div>
      )}
    </div>
  )
}
