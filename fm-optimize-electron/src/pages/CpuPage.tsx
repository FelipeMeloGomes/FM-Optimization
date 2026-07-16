import { useCallback, useEffect, useMemo } from 'react'
import { Cpu, AlertTriangle } from 'lucide-react'
import { cn } from '../lib/utils'
import { Button, Badge, Card, CardContent } from '../components/ui'
import { useScriptContext } from '../contexts/ScriptContext'
import { useScriptExecutionContext } from '../contexts/ScriptExecutionContext'
import { useSystemContext } from '../contexts/SystemContext'
import { ScriptCard } from '../components/ScriptCard'
import { ScriptCardSkeleton } from '../components/ScriptCardSkeleton'
import { detectCpuVendor, getCpuCategory, type CpuVendor } from '../lib/cpu-vendor'

export default function CpuPage() {
  const { state: systemState } = useSystemContext()
  const {
    state,
    filteredScripts,
    setCategoryFilter,
    setSubcategoryFilter,
    subcategoryFilter,
    subcategories,
  } = useScriptContext()
  const { activeExecution, execute, cancel } = useScriptExecutionContext()

  const cpuVendor: CpuVendor = useMemo(() => {
    if (systemState.status !== 'success') return 'unknown'
    return detectCpuVendor(systemState.data.cpu.model)
  }, [systemState])

  const category = getCpuCategory(cpuVendor)

  useEffect(() => {
    if (category) {
      setCategoryFilter(category)
      setSubcategoryFilter('')
    }
  }, [category, setCategoryFilter, setSubcategoryFilter])

  const handleExecute = useCallback(
    (id: string) => execute(id),
    [execute]
  )
  const handleCancel = useCallback(
    (id: string) => cancel(id),
    [cancel]
  )

  if (systemState.status === 'loading') {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <ScriptCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (cpuVendor === 'unknown') {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-muted-foreground">
        <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
          <AlertTriangle className="size-6 text-yellow-400" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium">Processador não identificado</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Não foi detectado um processador Intel ou AMD no sistema.
          </p>
          {systemState.status === 'success' && (
            <p className="mt-2 font-mono text-xs text-muted-foreground">
              Detectado: {systemState.data.cpu.model}
            </p>
          )}
        </div>
      </div>
    )
  }

  if (state.status === 'loading') {
    return (
      <div className="space-y-4">
        <Card className="border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                <Cpu className="size-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Processador detectado</p>
                <p className="text-sm font-medium">Carregando...</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <ScriptCardSkeleton key={i} />
          ))}
        </div>
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
    <div className="space-y-4">
      <Card className="border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              'flex size-9 items-center justify-center rounded-lg',
              cpuVendor === 'amd' ? 'bg-red-500/10' : 'bg-blue-500/10'
            )}>
              <Cpu className={cn(
                'size-4',
                cpuVendor === 'amd' ? 'text-red-400' : 'text-blue-400'
              )} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Processador detectado</p>
              <p className="text-sm font-medium">
                {systemState.status === 'success' ? systemState.data.cpu.model : '—'}
              </p>
            </div>
            <Badge variant="secondary" className={cn(
              cpuVendor === 'amd' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'
            )}>
              {cpuVendor === 'amd' ? 'AMD' : 'Intel'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="mb-4 flex items-center gap-2">
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
        <div className="flex flex-col items-center justify-center gap-2 py-20 text-muted-foreground">
          <p className="text-sm">Nenhum script encontrado</p>
          <p className="text-xs text-muted-foreground">Tente ajustar sua busca ou filtro</p>
        </div>
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
  )
}
