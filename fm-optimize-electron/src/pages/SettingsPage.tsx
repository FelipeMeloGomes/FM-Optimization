import { useState, useEffect } from 'react'
import { useSettingsContext } from '../contexts/SettingsContext'
import { Toggle, Button, Skeleton, Progress } from '../components/ui'
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
        <Skeleton className="size-6 rounded-full" />
      </div>
    )
  }

  return (
    <div className="flex max-w-lg flex-col gap-8">
      <section>
        <h2 className="mb-6 text-lg font-semibold tracking-tight">Preferências</h2>
        <div className="flex flex-col gap-3">
          <div className="rounded-lg border border-border bg-card p-4 transition-all duration-200 hover:border-primary/30 hover:bg-card/80">
            <Toggle
              id="dark-mode"
              label="Modo escuro"
              description="Alternar entre tema escuro e claro"
              checked={settings.theme === 'dark'}
              onChange={(e) => update({ theme: e.target.checked ? 'dark' : 'light' })}
            />
          </div>

          <div className="rounded-lg border border-border bg-card p-4 transition-all duration-200 hover:border-primary/30 hover:bg-card/80">
            <Toggle
              id="confirm-execution"
              label="Confirmar Execução"
              description="Confirmar antes de executar scripts"
              checked={settings.confirmOnExecute}
              onChange={(e) => update({ confirmOnExecute: e.target.checked })}
            />
          </div>

          <div className="rounded-lg border border-border bg-card p-4 transition-all duration-200 hover:border-primary/30 hover:bg-card/80">
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
        <h2 className="mb-6 text-lg font-semibold tracking-tight">Atualizações</h2>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="mb-3 text-sm text-muted-foreground">
            Versão atual: <span className="font-medium text-foreground">{appVersion || '...'}</span>
          </div>

          {status === 'checking' && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Skeleton className="size-4 rounded-full" />
              Verificando atualizações...
            </div>
          )}

          {status === 'not-available' && (
            <p className="mb-3 text-sm text-green-500">
              Você já está na versão mais recente.
            </p>
          )}

          {status === 'available' && updateInfo && (
            <div className="flex flex-col gap-3">
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
            <div className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">Baixando atualização...</p>
              <Progress value={Math.round(progress.percent)} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {Math.round(progress.percent)}% (
                {(progress.transferred / 1024 / 1024).toFixed(1)}/
                {(progress.total / 1024 / 1024).toFixed(1)} MB)
              </p>
            </div>
          )}

          {status === 'ready' && (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-green-500">
                Atualização baixada com sucesso!
              </p>
              <Button onClick={handleInstall} size="sm">
                Reiniciar e instalar
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col gap-3">
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