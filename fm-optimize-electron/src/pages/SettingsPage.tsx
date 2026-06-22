import { useSettingsContext } from '../contexts/SettingsContext'

export default function SettingsPage() {
  const { settings, update } = useSettingsContext()

  return (
    <div className="max-w-lg">
      <h2 className="mb-6 text-lg font-semibold">Preferências</h2>

      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
          <div>
            <p className="text-sm font-medium">Auto-abrir Log</p>
            <p className="text-xs text-muted-foreground">Abrir painel de log automaticamente</p>
          </div>
          <label className="relative inline-flex h-5 w-9 cursor-pointer items-center">
            <input
              type="checkbox"
              checked={settings.autoOpenLog}
              onChange={(e) => update({ autoOpenLog: e.target.checked })}
              className="peer sr-only"
            />
            <div className="h-5 w-9 rounded-full bg-muted after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-muted-foreground after:transition-all peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:bg-white" />
          </label>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
          <div>
            <p className="text-sm font-medium">Confirmar Execução</p>
            <p className="text-xs text-muted-foreground">Confirmar antes de executar scripts</p>
          </div>
          <label className="relative inline-flex h-5 w-9 cursor-pointer items-center">
            <input
              type="checkbox"
              checked={settings.confirmOnExecute}
              onChange={(e) => update({ confirmOnExecute: e.target.checked })}
              className="peer sr-only"
            />
            <div className="h-5 w-9 rounded-full bg-muted after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-muted-foreground after:transition-all peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:bg-white" />
          </label>
        </div>
      </div>
    </div>
  )
}
