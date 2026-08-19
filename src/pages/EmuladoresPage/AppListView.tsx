import {
  ArrowLeft,
  Bookmark,
  ChevronDown,
  Download,
  Loader2,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { showEnhancedToast } from '../../components/EnhancedToast';
import {
  Badge,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Progress,
} from '../../components/ui';
import { useEmulatorContext } from '../../contexts/EmulatorContext';
import { useSettingsContext } from '../../contexts/SettingsContext';
import { APP_ICON_MAP } from '../../lib/app-icons';
import {
  BLOATWARE_PACKAGES,
  CRITICAL_PACKAGES,
  PRESETS,
  type PresetKey,
} from '../../lib/bloatware';
import { cn } from '../../lib/utils';

type FilterType = 'all' | 'system' | 'user' | 'disabled';

interface AppListViewProps {
  emulatorName: string;
  instanceName: string;
  deviceSerial: string;
  onBack: () => void;
}

function formatSize(bytes: number): string {
  if (bytes === 0) return '—';
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
}

export function AppListView({
  emulatorName,
  instanceName,
  deviceSerial,
  onBack,
}: AppListViewProps) {
  const {
    listaApps,
    appsSelecionados,
    carregando,
    toggleAppSelection,
    selectAllApps,
    clearSelection,
    setListaApps,
    setAppsSelecionados,
    setCarregando,
  } = useEmulatorContext();
  const { settings } = useSettingsContext();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [removalProgress, setRemovalProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);
  const [presetsOpen, setPresetsOpen] = useState(false);
  const presetsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (presetsRef.current && !presetsRef.current.contains(e.target as Node)) {
        setPresetsOpen(false);
      }
    }
    if (presetsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [presetsOpen]);

  const filteredApps = useMemo(() => {
    let result = listaApps;
    if (filter === 'system') result = result.filter((a) => a.isSystem);
    if (filter === 'user') result = result.filter((a) => !a.isSystem);
    if (filter === 'disabled') result = result.filter((a) => a.isDisabled);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) => a.packageName.toLowerCase().includes(q) || a.label.toLowerCase().includes(q)
      );
    }
    return result;
  }, [listaApps, filter, search]);

  const filterCounts = useMemo(
    () => ({
      all: listaApps.length,
      system: listaApps.filter((a) => a.isSystem).length,
      user: listaApps.filter((a) => !a.isSystem).length,
      disabled: listaApps.filter((a) => a.isDisabled).length,
    }),
    [listaApps]
  );

  const totalSize = useMemo(() => {
    return listaApps
      .filter((a) => appsSelecionados.has(a.packageName))
      .reduce((sum, a) => sum + (a.size > 0 ? a.size : 0), 0);
  }, [listaApps, appsSelecionados]);

  const allSelected =
    filteredApps.length > 0 && filteredApps.every((a) => appsSelecionados.has(a.packageName));

  const handleRefresh = useCallback(async () => {
    setCarregando(true);
    try {
      const apps = await window.electronAPI.adbListApps(deviceSerial);
      setListaApps(apps);
    } catch {
      /* handled by IPC */
    } finally {
      setCarregando(false);
    }
  }, [deviceSerial, setListaApps, setCarregando]);

  const handleSelectBloatware = useCallback(() => {
    const selected = listaApps
      .filter((a) => BLOATWARE_PACKAGES.has(a.packageName) && !CRITICAL_PACKAGES.has(a.packageName))
      .map((a) => a.packageName);
    setAppsSelecionados(new Set(selected));
    setPresetsOpen(false);
  }, [listaApps, setAppsSelecionados]);

  const handlePreset = useCallback(
    (key: PresetKey) => {
      const preset = PRESETS[key];
      const presetPkgs = preset.packages as readonly string[];
      const selected = listaApps
        .filter((a) => presetPkgs.includes(a.packageName))
        .map((a) => a.packageName);
      setAppsSelecionados(new Set(selected));
      setPresetsOpen(false);
    },
    [listaApps, setAppsSelecionados]
  );

  const handleRemove = useCallback(async () => {
    const pkgs = Array.from(appsSelecionados);
    setRemoving(true);
    setRemovalProgress({ current: 0, total: pkgs.length });
    let removedCount = 0;
    try {
      for (let i = 0; i < pkgs.length; i++) {
        setRemovalProgress({ current: i + 1, total: pkgs.length });
        await window.electronAPI.adbRemoveApp(deviceSerial, pkgs[i]);
        removedCount++;
      }
      showEnhancedToast({
        type: 'success',
        title: `${removedCount} ${removedCount === 1 ? 'app removido' : 'apps removidos'}`,
        duration: 'medium',
        sound: settings.soundEnabled,
      });
      clearSelection();
      setConfirmOpen(false);
    } catch {
      showEnhancedToast({
        type: 'error',
        title: 'Falha ao remover apps',
        description: removedCount > 0 ? `${removedCount} removidos antes do erro` : undefined,
        duration: 'medium',
        sound: settings.soundEnabled,
      });
    } finally {
      setRemoving(false);
      setRemovalProgress(null);
    }
  }, [appsSelecionados, deviceSerial, clearSelection, settings.soundEnabled]);

  const handleBackup = useCallback(async () => {
    const pkgs = Array.from(appsSelecionados);
    let backedUpCount = 0;
    try {
      for (const pkg of pkgs) {
        await window.electronAPI.adbBackupApp(deviceSerial, pkg);
        backedUpCount++;
      }
      showEnhancedToast({
        type: 'success',
        title: `${backedUpCount} ${backedUpCount === 1 ? 'app copiado' : 'apps copiados'}`,
        duration: 'medium',
        sound: settings.soundEnabled,
      });
    } catch {
      showEnhancedToast({
        type: 'error',
        title: 'Falha ao copiar apps',
        description: backedUpCount > 0 ? `${backedUpCount} copiados antes do erro` : undefined,
        duration: 'medium',
        sound: settings.soundEnabled,
      });
    }
  }, [appsSelecionados, deviceSerial, settings.soundEnabled]);

  const handleRestore = useCallback(async () => {
    const pkgs = Array.from(appsSelecionados);
    setRestoring(true);
    let restoredCount = 0;
    try {
      for (const pkg of pkgs) {
        await window.electronAPI.adbRestoreAppByName(deviceSerial, pkg);
        restoredCount++;
      }
      showEnhancedToast({
        type: 'success',
        title: `${restoredCount} ${restoredCount === 1 ? 'app restaurado' : 'apps restaurados'}`,
        duration: 'medium',
        sound: settings.soundEnabled,
      });
      clearSelection();
    } catch {
      showEnhancedToast({
        type: 'error',
        title: 'Falha ao restaurar apps',
        description: restoredCount > 0 ? `${restoredCount} restaurados antes do erro` : undefined,
        duration: 'medium',
        sound: settings.soundEnabled,
      });
    } finally {
      setRestoring(false);
    }
  }, [appsSelecionados, deviceSerial, clearSelection, settings.soundEnabled]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5">
          <ArrowLeft className="size-4" />
          Voltar
        </Button>
        <div className="flex-1">
          <h2 className="text-sm font-semibold text-foreground">{emulatorName}</h2>
          <p className="text-xs text-muted-foreground">{instanceName}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={carregando}
          className="gap-1.5"
        >
          <RefreshCw className={cn('size-4', carregando && 'animate-spin')} />
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Buscar apps..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Filter + Presets + Select All */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex gap-1.5 flex-wrap">
          {(['all', 'system', 'user', 'disabled'] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
              className="text-xs"
            >
              {f === 'all'
                ? `Todos (${filterCounts.all})`
                : f === 'system'
                  ? `Sistema (${filterCounts.system})`
                  : f === 'user'
                    ? `Usuário (${filterCounts.user})`
                    : `Desabilitados (${filterCounts.disabled})`}
            </Button>
          ))}
        </div>
        <div className="flex gap-1.5 relative" ref={presetsRef}>
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPresetsOpen(!presetsOpen)}
              className="gap-1.5 text-xs"
            >
              <Sparkles className="size-3.5" />
              Presets
              <ChevronDown
                className={cn('size-3 transition-transform', presetsOpen && 'rotate-180')}
              />
            </Button>
            {presetsOpen && (
              <div className="absolute right-0 top-full mt-1 z-50 bg-popover border border-border rounded-lg shadow-lg p-1 min-w-[200px]">
                <button
                  type="button"
                  onClick={handleSelectBloatware}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs text-left rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <ShieldCheck className="size-3.5 shrink-0" />
                  <div>
                    <p className="font-medium">Selecionar Bloatware</p>
                    <p className="text-muted-foreground text-[10px]">Todos os apps conhecidos</p>
                  </div>
                </button>
                <div className="h-px bg-border my-1" />
                {(Object.keys(PRESETS) as PresetKey[]).map((key) => {
                  const preset = PRESETS[key];
                  const presetPkgs = preset.packages as readonly string[];
                  const matchingCount = listaApps.filter((a) =>
                    presetPkgs.includes(a.packageName)
                  ).length;
                  return (
                    <button
                      type="button"
                      key={key}
                      onClick={() => handlePreset(key)}
                      className="flex items-center gap-2 w-full px-3 py-2 text-xs text-left rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      <Bookmark className="size-3.5 shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium">{preset.name}</p>
                        <p className="text-muted-foreground text-[10px]">{preset.description}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground tabular-nums">
                        {matchingCount}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={selectAllApps} className="text-xs">
            {allSelected ? 'Desmarcar Todos' : 'Selecionar Todos'}
          </Button>
        </div>
      </div>

      {/* App List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {carregando ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="size-5 animate-spin mb-2" />
            <p className="text-sm">Carregando apps...</p>
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground">
            <p className="text-sm">
              {listaApps.length === 0
                ? 'Nenhum app encontrado no dispositivo'
                : 'Nenhum app corresponde ao filtro'}
            </p>
          </div>
        ) : (
          filteredApps.map((app) => {
            const isCritical = CRITICAL_PACKAGES.has(app.packageName);
            return (
              <Card
                key={app.packageName}
                className={cn(
                  'transition-all duration-150',
                  isCritical ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
                  appsSelecionados.has(app.packageName) && 'border-primary/50 bg-primary/5'
                )}
                onClick={isCritical ? undefined : () => toggleAppSelection(app.packageName)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      checked={appsSelecionados.has(app.packageName)}
                      onChange={() => toggleAppSelection(app.packageName)}
                      onClick={(e) => e.stopPropagation()}
                      disabled={isCritical}
                      className="size-4 rounded border-muted-foreground accent-primary mt-0.5 shrink-0"
                    />
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="size-8 shrink-0 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                        {(() => {
                          const IconComp = APP_ICON_MAP[app.packageName];
                          if (IconComp) return <IconComp size={20} />;
                          return (
                            <span className="text-xs font-bold text-muted-foreground">
                              {app.label.charAt(0).toUpperCase()}
                            </span>
                          );
                        })()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-xs font-semibold truncate" title={app.label}>
                            {app.label}
                          </p>
                          {isCritical && (
                            <Badge
                              variant="secondary"
                              className="text-[9px] px-1 py-0 shrink-0 bg-red-500/15 text-red-400 border-red-500/30"
                            >
                              CRITICO
                            </Badge>
                          )}
                          {app.isSystem && (
                            <Badge variant="secondary" className="text-[9px] px-1 py-0 shrink-0">
                              SIST
                            </Badge>
                          )}
                          {app.isDisabled && (
                            <Badge
                              variant="secondary"
                              className="text-[9px] px-1 py-0 shrink-0 bg-orange-500/15 text-orange-400 border-orange-500/30"
                            >
                              DESAB
                            </Badge>
                          )}
                        </div>
                        <p
                          className="text-[10px] text-muted-foreground truncate mt-0.5"
                          title={app.packageName}
                        >
                          {app.packageName}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {app.size > 0 && (
                            <span className="text-[10px] text-muted-foreground">
                              {formatSize(app.size)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Removal Progress */}
      {removalProgress && (
        <div className="space-y-2 pt-2 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Removendo {removalProgress.current} de {removalProgress.total}...
            </span>
            <span className="text-xs text-muted-foreground">
              {Math.round((removalProgress.current / removalProgress.total) * 100)}%
            </span>
          </div>
          <Progress
            value={(removalProgress.current / removalProgress.total) * 100}
            className="h-1.5"
          />
        </div>
      )}

      {/* Selection Bar */}
      {appsSelecionados.size > 0 && (
        <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-primary">
              {appsSelecionados.size} selecionado{appsSelecionados.size !== 1 ? 's' : ''}
            </span>
            {totalSize > 0 && (
              <span className="text-xs text-muted-foreground">({formatSize(totalSize)})</span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={clearSelection}>
              Limpar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackup}
              disabled={removing || restoring}
              title="Copiar APKs selecionados"
            >
              <Download className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRestore}
              disabled={removing || restoring}
              title="Restaurar apps selecionados"
            >
              <RotateCcw className="size-4" />
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => setConfirmOpen(true)}
              disabled={removing || restoring}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar remoção</DialogTitle>
            <DialogDescription>
              Remover {appsSelecionados.size} app{appsSelecionados.size !== 1 ? 's' : ''}?
              {appsSelecionados.size > 0 && (
                <span className="block mt-1 text-xs text-muted-foreground">
                  {Array.from(appsSelecionados).slice(0, 5).join(', ')}
                  {appsSelecionados.size > 5 && ` e mais ${appsSelecionados.size - 5}...`}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleRemove} disabled={removing}>
              {removing ? 'Removendo...' : 'Remover'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
