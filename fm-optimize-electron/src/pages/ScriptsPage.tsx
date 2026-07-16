import { useCallback, useEffect } from 'react'
import { Star } from 'lucide-react'
import { cn } from '../lib/utils'
import { Button, EmptyState, Badge } from '../components/ui'
import { useScriptContext } from '../contexts/ScriptContext'
import { useScriptExecutionContext } from '../contexts/ScriptExecutionContext'
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
    setCategoryFilter,
    setSubcategoryFilter,
    toggleFavorite,
    showFavoritesOnly,
    setShowFavoritesOnly,
    subcategoryFilter,
    subcategories,
  } = useScriptContext()
  const { activeExecution, execute, cancel } = useScriptExecutionContext()

  useEffect(() => {
    setCategoryFilter(category)
    setSubcategoryFilter('')
  }, [category, setCategoryFilter, setSubcategoryFilter])

  const handleExecute = useCallback(
    (id: string) => execute(id),
    [execute]
  )
  const handleCancel = useCallback(
    (id: string) => cancel(id),
    [cancel]
  )

  if (state.status === 'loading') {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <ScriptCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (state.status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-20 text-muted-foreground">
        <p className="text-sm">Erro ao carregar scripts</p>
        <p className="text-xs text-destructive">{state.error}</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <Button
          variant={showFavoritesOnly ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className={cn(
            'gap-1.5',
            showFavoritesOnly && 'bg-yellow-400/20 text-yellow-400 hover:bg-yellow-400/30 hover:text-yellow-400'
          )}
        >
          <Star className={cn('size-3.5', showFavoritesOnly && 'fill-yellow-400')} />
          Favoritos
        </Button>
        <Badge variant="secondary">
          {filteredScripts.length} scripts
        </Badge>
      </div>

      {subcategories.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-1.5">
          <Button
            variant={!subcategoryFilter ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSubcategoryFilter('')}
            className="text-[11px]"
          >
            Todas
          </Button>
          {subcategories.map((sub) => (
            <Button
              key={sub}
              variant={subcategoryFilter === sub ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSubcategoryFilter(sub)}
              className="text-[11px]"
            >
              {sub}
            </Button>
          ))}
        </div>
      )}

      {filteredScripts.length === 0 ? (
        <EmptyState
          title="Nenhum script encontrado"
          description="Tente ajustar sua busca ou filtro"
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filteredScripts.map((script) => (
          <ScriptCard
            key={script.id}
            script={script}
            isFavorite={favorites.includes(script.id)}
            isExecuting={activeExecution === script.id}
            onExecute={() => handleExecute(script.id)}
            onCancel={() => handleCancel(script.id)}
            onToggleFavorite={() => toggleFavorite(script.id)}
          />
          ))}
        </div>
      )}
    </div>
  )
}
