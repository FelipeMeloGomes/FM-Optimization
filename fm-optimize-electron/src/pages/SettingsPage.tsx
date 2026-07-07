import { useState, useEffect } from 'react'
import { useSettingsContext } from '../contexts/SettingsContext'
import { Toggle, Button } from '../components/ui'
import type { UpdateStatus, UpdateInfo, DownloadProgress } from '../../electron/shared/ipc-types'

const GITHUB_RELEASES = 'https://github.com/FelipeMeloGomes/FM-Optimization/releases/latest'

export default function SettingsPage() {
  const { settings, update, loading } = useSettingsContext()
  const [appVersion, setAppVersion] = useState('')
  const [packaged, setPackaged] = useState(false)
  const [status, setStatus] = useState<UpdateStatus | null>(null)
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null)
  const [progress, setProgress] = useState<DownloadProgress | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    window.electronAPI.getAppVersion().then(setAppVersion)
    window.electronAPI.isPackaged().then(setPackaged)
  }, [])

  useEffect(() => {
    const unsubStatus = window.electronAPI.onUpdateStatus((s) => {
      setStatus(s)
      if (s === 'error') setErrorMsg('Falha ao verificar atualizações.')
    })
    const unsubInfo = window.electronAPI.onUpdateInfo((info) => {
      setUpdateInfo(info)
    })
    const unsubProgress = window.electronAPI.onDownloadProgress((p) => {
      setProgress(p)
      setStatus('downloading')
    })
    return () => {
      unsubStatus()
      unsubInfo()
      unsubProgress()
    }
  }, [])

  function handleCheck() {
    setStatus('checking')
    setUpdateInfo(null)
    setProgress(null)
    setErrorMsg('')
    window.electronAPI.checkForUpdate().catch(() => {
      setStatus(packaged ? 'error' : 'not-available')
      if (packaged) setErrorMsg('Falha ao verificar atualizações.')
    })
  }

  function handleDownload() {
    window.electronAPI.downloadUpdate().catch(() => {
      setStatus('error')
      setErrorMsg('Falha ao baixar atualização.')
    })
  }

  function handleInstall() {
    window.electronAPI.installUpdate()
  }

  function handleOpenRelease() {
    window.open(GITHUB_RELEASES, '_blank')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="max-w-lg space-y-8">
      <section>
        <h2 className="mb-6 text-lg font-semibold">Preferências</h2>
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <Toggle
              id="dark-mode"
              label="Modo escuro"
              description="Alternar entre tema escuro e claro"
              checked={settings.theme === 'dark'}
              onChange={(e) => update({ theme: e.target.checked ? 'dark' : 'light' })}
            />
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <Toggle
              id="auto-open-log"
              label="Auto-abrir Log"
              description="Abrir painel de log automaticamente"
              checked={settings.autoOpenLog}
              onChange={(e) => update({ autoOpenLog: e.target.checked })}
            />
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <Toggle
              id="confirm-execution"
              label="Confirmar Execução"
              description="Confirmar antes de executar scripts"
              checked={settings.confirmOnExecute}
              onChange={(e) => update({ confirmOnExecute: e.target.checked })}
            />
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <Toggle
              id="auto-restore-point"
              label="Restore Point Automático"
              description="Criar ponto de restauração antes de executar scripts"
              checked={settings.autoRestorePoint}
              onChange={(e) => update({ autoRestorePoint: e.target.checked })}
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-6 text-lg font-semibold">Atualizações</h2>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="mb-3 text-sm text-muted-foreground">
            Versão atual: <span className="font-medium text-foreground">{appVersion || '...'}</span>
          </div>

          {status === 'checking' && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Verificando atualizações...
            </div>
          )}

          {status === 'not-available' && (
            <p className="mb-3 text-sm text-green-500">
              Você já está na versão mais recente.
            </p>
          )}

          {status === 'available' && updateInfo && (
            <div className="space-y-3">
              <p className="text-sm">
                Nova versão{' '}
                <span className="font-semibold text-primary">v{updateInfo.version}</span>
                {' '}disponível!
              </p>
              <Button onClick={handleDownload} size="sm">
                Baixar atualização
              </Button>
            </div>
          )}

          {status === 'downloading' && progress && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Baixando atualização...</p>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${Math.round(progress.percent)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {Math.round(progress.percent)}% (
                {(progress.transferred / 1024 / 1024).toFixed(1)}/
                {(progress.total / 1024 / 1024).toFixed(1)} MB)
              </p>
            </div>
          )}

          {status === 'ready' && (
            <div className="space-y-3">
              <p className="text-sm text-green-500">
                Atualização baixada com sucesso!
              </p>
              <Button onClick={handleInstall} size="sm">
                Reiniciar e instalar
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-3">
              <p className="text-sm text-destructive">{errorMsg}</p>
              <Button onClick={handleCheck} variant="secondary" size="sm">
                Tentar novamente
              </Button>
            </div>
          )}

          {status === null && (
            <div className="flex gap-2">
              <Button onClick={handleCheck} size="sm">
                Verificar atualizações
              </Button>
              {!packaged && (
                <Button onClick={handleOpenRelease} variant="outline" size="sm">
                  Abrir página de download
                </Button>
              )}
            </div>
          )}

          {(status === 'not-available' || status === 'error') && (
            <div className="flex gap-2">
              <Button onClick={handleCheck} variant="outline" size="sm">
                Verificar novamente
              </Button>
              {!packaged && (
                <Button onClick={handleOpenRelease} variant="ghost" size="sm">
                  Abrir página de download
                </Button>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
