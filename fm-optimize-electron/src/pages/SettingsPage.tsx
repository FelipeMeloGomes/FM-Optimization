import { useSettingsContext } from '../contexts/SettingsContext'
import { Toggle } from '../components/ui'

export default function SettingsPage() {
  const { settings, update } = useSettingsContext()

  return (
    <div className="max-w-lg">
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
      </div>
    </div>
  )
}
