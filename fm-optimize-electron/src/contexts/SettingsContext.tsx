import { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo, type ReactNode } from 'react'
import type { AppSettings } from '../../electron/shared/ipc-types'

interface SettingsContextValue {
  settings: AppSettings
  update: (partial: Partial<AppSettings>) => void
  loading: boolean
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

const DEFAULT: AppSettings = { theme: 'dark', confirmOnExecute: true, autoRestorePoint: true }

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT)
  const [loading, setLoading] = useState(true)
  const settingsRef = useRef(settings)
  settingsRef.current = settings

  useEffect(() => {
    window.electronAPI.getSettings().then(setSettings).catch((e) =>
      console.error('Failed to load settings:', e)
    ).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.theme === 'dark')
  }, [settings.theme])

  const update = useCallback((partial: Partial<AppSettings>) => {
    const next = { ...settingsRef.current, ...partial }
    setSettings(next)
    window.electronAPI.saveSettings(next).catch((e) =>
      console.error('Failed to save settings:', e)
    )
  }, [])

  const contextValue = useMemo(() => ({ settings, update, loading }), [settings, update, loading])

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettingsContext(): SettingsContextValue {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettingsContext must be used within SettingsProvider')
  return ctx
}
