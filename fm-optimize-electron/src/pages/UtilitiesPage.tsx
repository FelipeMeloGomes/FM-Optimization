import { FileText, HardDrive, Info, Play, Shield, Square, Wrench, Zap } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { ScriptEntry } from '../../electron/shared/ipc-types';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ScriptBadge } from '../components/ScriptBadge';
import { ScriptCardSkeleton } from '../components/ScriptCardSkeleton';
import { Badge, Button } from '../components/ui';
import { useScriptPage } from '../hooks/use-script-page';
import { cn } from '../lib/utils';

interface UtilSection {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  scriptIds: string[];
}

const UTIL_SECTIONS: UtilSection[] = [
  {
    id: 'maintenance',
    name: 'Manutenção do Sistema',
    description: 'Pacotes de manutenção e relatórios para manter o sistema saudável.',
    icon: Wrench,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20',
    scriptIds: ['util-1', 'util-3'],
  },
  {
    id: 'storage',
    name: 'Armazenamento',
    description: 'Otimização de SSD, compactação de sistema e limpeza de componentes.',
    icon: HardDrive,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    scriptIds: ['util-2', 'util-4', 'util-5', 'builtin-88', 'util-6'],
  },
  {
    id: 'repair',
    name: 'Reparo do Sistema',
    description: 'Verificação e reparo de integridade do sistema de arquivos e componentes.',
    icon: Shield,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    scriptIds: ['builtin-87', 'builtin-40', 'builtin-64'],
  },
  {
    id: 'memory',
    name: 'Memória e Processos',
    description: 'Libere RAM e encerre processos desnecessários para melhor performance.',
    icon: Zap,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    scriptIds: ['builtin-22', 'builtin-27'],
  },
  {
    id: 'guides',
    name: 'Guias',
    description: 'Guias explicativos sobre configurações avançadas do sistema.',
    icon: FileText,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/20',
    scriptIds: ['builtin-15'],
  },
];

const SSD_ONLY_IDS = ['util-4', 'builtin-88'];

function UtilSectionCard({
  section,
  scripts,
  hasSSD,
  activeExecution,
  _onExecute,
  onCancel,
  onConfirmExecute,
}: {
  section: UtilSection;
  scripts: ScriptEntry[];
  hasSSD: boolean | null;
  activeExecution: string | null;
  _onExecute: (id: string) => void;
  onCancel: (id: string) => void;
  onConfirmExecute: (script: ScriptEntry) => void;
}) {
  const Icon = section.icon;

  const sectionScripts = useMemo(
    () =>
      scripts.filter(
        (s) =>
          section.scriptIds.includes(s.id) && (hasSSD === true || !SSD_ONLY_IDS.includes(s.id))
      ),
    [scripts, section.scriptIds, hasSSD]
  );

  const isAnyExecuting = section.scriptIds.some((id) => activeExecution === id);
  const _executingScript = sectionScripts.find((s) => activeExecution === s.id);

  return (
    <div
      className={cn(
        'rounded-xl border bg-card transition-all duration-300 hover:shadow-lg overflow-hidden',
        section.borderColor,
        isAnyExecuting && 'ring-2 ring-primary/50'
      )}
    >
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn('flex size-10 items-center justify-center rounded-lg', section.bgColor)}
            >
              <Icon className={cn('size-5', section.color)} />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{section.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{section.description}</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-[10px] shrink-0">
            {sectionScripts.length} scripts
          </Badge>
        </div>

        <div className="mt-4 space-y-2">
          {sectionScripts.map((script) => {
            const isScriptExecuting = activeExecution === script.id;
            const isTxt = script.extension === 'txt';
            return (
              <div
                key={script.id}
                className={cn(
                  'flex items-center gap-3 rounded-lg border bg-background p-3 transition-all',
                  script.requiresAdmin && 'border-yellow-500/20',
                  isScriptExecuting && 'ring-2 ring-primary/50'
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{script.name}</p>
                    <ScriptBadge script={script} />
                    {isTxt && (
                      <Badge
                        variant="secondary"
                        className="gap-1 font-mono text-[10px] px-1.5 py-0 shrink-0"
                      >
                        <Info className="size-3" />
                        Guia
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {script.description}
                  </p>
                </div>
                <Button
                  variant={isScriptExecuting ? 'destructive' : 'secondary'}
                  size="sm"
                  onClick={() =>
                    isScriptExecuting ? onCancel(script.id) : onConfirmExecute(script)
                  }
                  className="gap-1.5 shrink-0"
                >
                  {isScriptExecuting ? (
                    <>
                      <Square className="size-3" />
                      Cancelar
                    </>
                  ) : isTxt ? (
                    <>
                      <FileText className="size-3" />
                      Abrir
                    </>
                  ) : (
                    <>
                      <Play className="size-3" />
                      Executar
                    </>
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function UtilitiesPage() {
  const {
    state,
    categoryScripts: utilScripts,
    activeExecution,
    handleExecute,
    handleCancel,
    handleConfirmExecute,
    confirmScript,
    setConfirmScript,
    handleConfirm,
  } = useScriptPage('Utilities');
  const [hasSSD, setHasSSD] = useState<boolean | null>(null);

  useEffect(() => {
    window.electronAPI
      .hasSSD()
      .then(setHasSSD)
      .catch(() => setHasSSD(false));
  }, []);

  if (state.status === 'loading') {
    return (
      <div className="space-y-4">
        <div className="h-24 rounded-xl bg-muted animate-pulse" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton placeholders, fixed count
            <ScriptCardSkeleton key={`skeleton-${i}`} />
          ))}
        </div>
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
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10">
          <Wrench className="size-28 text-primary" />
        </div>
        <div className="relative p-6">
          <div className="flex items-center gap-2 mb-2">
            <Wrench className="size-4 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
              Utilitários
            </span>
          </div>
          <h2 className="text-lg font-bold text-foreground">Ferramentas de manutenção e reparo</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-lg">
            Mantenha seu sistema saudável com ferramentas de manutenção, reparo de integridade,
            otimização de armazenamento e gerenciamento de memória.
          </p>
        </div>
      </div>

      {/* Util Sections */}
      {UTIL_SECTIONS.map((section) => (
        <UtilSectionCard
          key={section.id}
          section={section}
          scripts={utilScripts}
          hasSSD={hasSSD}
          activeExecution={activeExecution}
          _onExecute={handleExecute}
          onCancel={handleCancel}
          onConfirmExecute={handleConfirmExecute}
        />
      ))}

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={!!confirmScript}
        onOpenChange={(open) => {
          if (!open) setConfirmScript(null);
        }}
        script={confirmScript}
        onConfirm={handleConfirm}
        isExecuting={!!confirmScript && activeExecution === confirmScript.id}
      />
    </div>
  );
}
