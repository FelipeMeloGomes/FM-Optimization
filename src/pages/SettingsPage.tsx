import {
  AlertTriangle,
  Check,
  Download,
  ExternalLink,
  FileDown,
  FileUp,
  RefreshCw,
  RotateCcw,
  Settings,
  Sparkles,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type { DownloadProgress, UpdateInfo, UpdateStatus } from '../../electron/shared/ipc-types';
import { Badge, Button, Progress, Toggle } from '../components/ui';
import { useSettingsContext } from '../contexts/SettingsContext';

const GITHUB_RELEASES = 'https://github.com/FelipeMeloGomes/FM_Optimization/releases/latest';

export default function SettingsPage() {
  const { settings, update, loading, exportData, importData } = useSettingsContext();
  const [appVersion, setAppVersion] = useState('');
  const [packaged, setPackaged] = useState(false);
  const [status, setStatus] = useState<UpdateStatus | null>(null);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    window.electronAPI.getAppVersion().then(setAppVersion);
    window.electronAPI.isPackaged().then(setPackaged);
  }, []);

  useEffect(() => {
    const unsubStatus = window.electronAPI.onUpdateStatus((s) => {
      setStatus(s);
      if (s === 'error') setErrorMsg('Falha ao verificar atualizações.');
    });
    const unsubInfo = window.electronAPI.onUpdateInfo((info) => {
      setUpdateInfo(info);
    });
    const unsubProgress = window.electronAPI.onDownloadProgress((p) => {
      setProgress(p);
      setStatus('downloading');
    });
    return () => {
      unsubStatus();
      unsubInfo();
      unsubProgress();
    };
  }, []);

  function handleCheck() {
    setStatus('checking');
    setUpdateInfo(null);
    setProgress(null);
    setErrorMsg('');
    window.electronAPI.checkForUpdate().catch(() => {
      setStatus(packaged ? 'error' : 'not-available');
      if (packaged) setErrorMsg('Falha ao verificar atualizações.');
    });
  }

  function handleDownload() {
    window.electronAPI.downloadUpdate().catch(() => {
      setStatus('error');
      setErrorMsg('Falha ao baixar atualização.');
    });
  }

  function handleInstall() {
    window.electronAPI.installUpdate();
  }

  function handleOpenRelease() {
    window.open(GITHUB_RELEASES, '_blank');
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-32 rounded-xl bg-muted animate-pulse" />
        <div className="h-48 rounded-xl bg-muted animate-pulse" />
        <div className="h-64 rounded-xl bg-muted animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-lg">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10">
          <Settings className="size-28 text-primary" />
        </div>
        <div className="relative p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Settings className="size-4 text-primary" />
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                  Configurações
                </span>
              </div>
              <h2 className="text-lg font-bold text-foreground">Preferências do Sistema</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Personalize o comportamento do FM Optimize.
              </p>
            </div>
            <Badge variant="secondary" className="text-xs px-3 py-1">
              v{appVersion || '...'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Preferences Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="size-1.5 rounded-full bg-primary" />
          <h3 className="text-sm font-semibold text-foreground">Preferências</h3>
        </div>
        <div className="rounded-xl border border-border bg-card divide-y divide-border">
          <div className="p-4 transition-all duration-200 hover:bg-muted/30">
            <Toggle
              id="dark-mode"
              label="Modo escuro"
              description="Alternar entre tema escuro e claro"
              checked={settings.theme === 'dark'}
              onChange={(e) => update({ theme: e.target.checked ? 'dark' : 'light' })}
            />
          </div>
          <div className="p-4 transition-all duration-200 hover:bg-muted/30">
            <Toggle
              id="confirm-execution"
              label="Confirmar Execução"
              description="Confirmar antes de executar tweaks"
              checked={settings.confirmOnExecute}
              onChange={(e) => update({ confirmOnExecute: e.target.checked })}
            />
          </div>
          <div className="p-4 transition-all duration-200 hover:bg-muted/30">
            <Toggle
              id="auto-restore-point"
              label="Restore Point Automático"
              description="Criar ponto de restauração antes de executar tweaks"
              checked={settings.autoRestorePoint}
              onChange={(e) => update({ autoRestorePoint: e.target.checked })}
            />
          </div>
        </div>
      </div>

      {/* Data Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="size-1.5 rounded-full bg-blue-400" />
          <h3 className="text-sm font-semibold text-foreground">Dados</h3>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm text-muted-foreground mb-4">
            Exporte ou importe suas configuracoes e historico.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={exportData}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <FileDown className="size-4" />
              Exportar Dados
            </button>
            <label className="flex items-center gap-2 cursor-pointer rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors">
              <FileUp className="size-4" />
              Importar Dados
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) importData(file);
                }}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="size-1.5 rounded-full bg-amber-400" />
          <h3 className="text-sm font-semibold text-foreground">Notificacoes</h3>
        </div>
        <div className="rounded-xl border border-border bg-card divide-y divide-border">
          <div className="p-4 transition-all duration-200 hover:bg-muted/30">
            <Toggle
              id="sound-enabled"
              label="Som nas notificacoes"
              description="Reproduzir som ao receber notificacoes"
              checked={settings.soundEnabled}
              onChange={(e) => update({ soundEnabled: e.target.checked })}
            />
          </div>
          <div className="p-4 transition-all duration-200 hover:bg-muted/30">
            <div className="flex items-center justify-between">
              <div>
                <label htmlFor="toast-duration" className="text-sm font-medium text-foreground">
                  Duracao dos toasts
                </label>
                <p className="text-xs text-muted-foreground">
                  Tempo que as notificacoes ficam visiveis
                </p>
              </div>
              <select
                id="toast-duration"
                value={settings.toastDuration}
                onChange={(e) =>
                  update({ toastDuration: e.target.value as 'short' | 'medium' | 'long' })
                }
                className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-foreground"
              >
                <option value="short">Curta (2s)</option>
                <option value="medium">Media (4s)</option>
                <option value="long">Longa (8s)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Updates Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="size-1.5 rounded-full bg-emerald-400" />
          <h3 className="text-sm font-semibold text-foreground">Atualizações</h3>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="size-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Versão atual</p>
              <p className="text-sm font-semibold text-foreground">{appVersion || '...'}</p>
            </div>
          </div>

          {status === 'checking' && (
            <div
              role="status"
              aria-live="polite"
              className="flex items-center gap-3 rounded-lg bg-muted/50 p-3"
            >
              <RefreshCw className="size-4 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Verificando atualizações...</p>
            </div>
          )}

          {status === 'not-available' && (
            <div
              role="status"
              aria-live="polite"
              className="flex items-center gap-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3"
            >
              <Check className="size-4 text-emerald-400" />
              <p className="text-sm text-emerald-400">Você já está na versão mais recente.</p>
            </div>
          )}

          {status === 'available' && updateInfo && (
            <div
              role="status"
              aria-live="polite"
              className="rounded-lg bg-primary/5 border border-primary/20 p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Download className="size-4 text-primary" />
                <p className="text-sm font-medium text-foreground">
                  Nova versão <span className="text-primary">v{updateInfo.version}</span>{' '}
                  disponível!
                </p>
              </div>
              <Button onClick={handleDownload} size="sm" className="gap-1.5">
                <Download className="size-3.5" />
                Baixar atualização
              </Button>
            </div>
          )}

          {status === 'downloading' && progress && (
            <div
              role="status"
              aria-live="polite"
              className="rounded-lg bg-primary/5 border border-primary/20 p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <RefreshCw className="size-4 animate-spin text-primary" />
                <p className="text-sm font-medium text-foreground">Baixando atualização...</p>
              </div>
              <Progress value={Math.round(progress.percent)} className="h-2 mb-2" />
              <p className="text-xs text-muted-foreground">
                {Math.round(progress.percent)}% ({(progress.transferred / 1024 / 1024).toFixed(1)}/
                {(progress.total / 1024 / 1024).toFixed(1)} MB)
              </p>
            </div>
          )}

          {status === 'ready' && (
            <div
              role="status"
              aria-live="polite"
              className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <Check className="size-4 text-emerald-400" />
                <p className="text-sm font-medium text-emerald-400">
                  Atualização baixada com sucesso!
                </p>
              </div>
              <Button onClick={handleInstall} size="sm" className="gap-1.5">
                <RotateCcw className="size-3.5" />
                Reiniciar e instalar
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div
              role="alert"
              className="rounded-lg bg-destructive/10 border border-destructive/20 p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="size-4 text-destructive" />
                <p className="text-sm font-medium text-destructive">{errorMsg}</p>
              </div>
              <Button onClick={handleCheck} variant="secondary" size="sm" className="gap-1.5">
                <RefreshCw className="size-3.5" />
                Tentar novamente
              </Button>
            </div>
          )}

          {status === null && (
            <div className="flex gap-2">
              <Button onClick={handleCheck} size="sm" className="gap-1.5">
                <RefreshCw className="size-3.5" />
                Verificar atualizações
              </Button>
              {!packaged && (
                <Button onClick={handleOpenRelease} variant="outline" size="sm" className="gap-1.5">
                  <ExternalLink className="size-3.5" />
                  Página de download
                </Button>
              )}
            </div>
          )}

          {(status === 'not-available' || status === 'error') && (
            <div className="flex gap-2 mt-3">
              <Button onClick={handleCheck} variant="outline" size="sm" className="gap-1.5">
                <RefreshCw className="size-3.5" />
                Verificar novamente
              </Button>
              {!packaged && (
                <Button onClick={handleOpenRelease} variant="ghost" size="sm" className="gap-1.5">
                  <ExternalLink className="size-3.5" />
                  Página de download
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
