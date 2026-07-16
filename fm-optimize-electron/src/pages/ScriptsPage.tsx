import { useCallback, useEffect } from 'react';
import { ScriptCard } from '../components/ScriptCard';
import { ScriptCardSkeleton } from '../components/ScriptCardSkeleton';
import { Badge, Button, EmptyState } from '../components/ui';
import { useScriptContext } from '../contexts/ScriptContext';
import { useScriptExecutionContext } from '../contexts/ScriptExecutionContext';

interface ScriptsPageProps {
  category: string;
}

export default function ScriptsPage({ category }: ScriptsPageProps) {
  const {
    state,
    filteredScripts,
    setCategoryFilter,
    setSubcategoryFilter,
    subcategoryFilter,
    subcategories,
  } = useScriptContext();
  const { activeExecution, execute, cancel } = useScriptExecutionContext();

  useEffect(() => {
    setCategoryFilter(category);
    setSubcategoryFilter('');
  }, [category, setCategoryFilter, setSubcategoryFilter]);

  const handleExecute = useCallback((id: string) => execute(id), [execute]);
  const handleCancel = useCallback((id: string) => cancel(id), [cancel]);

  if (state.status === 'loading') {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 8 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton placeholders, fixed count
          <ScriptCardSkeleton key={`skeleton-${i}`} />
        ))}
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-20 text-muted-foreground">
        <p className="text-sm">Erro ao carregar scripts</p>
        <p className="text-xs text-destructive">{state.error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <Badge variant="secondary">{filteredScripts.length} scripts</Badge>
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
              isExecuting={activeExecution === script.id}
              onExecute={() => handleExecute(script.id)}
              onCancel={() => handleCancel(script.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
