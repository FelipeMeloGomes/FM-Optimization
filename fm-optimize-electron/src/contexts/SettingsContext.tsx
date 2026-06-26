import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { AppSettings } from '../../electron/shared/ipc-types'

interface SettingsContextValue {
  settings: AppSettings
  update: (partial: Partial<AppSettings>) => void
  loading: boolean
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

const DEFAULT: AppSettings = { theme: 'dark', autoOpenLog: true, confirmOnExecute: true }

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.electronAPI.getSettings().then(setSettings).catch(() => {}).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.theme === 'dark')
  }, [settings.theme])

  const update = useCallback((partial: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial }
      window.electronAPI.saveSettings(next).catch(() => {})
      return next
    })
  }, [])

  return (
    <SettingsContext.Provider value={{ settings, update, loading }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettingsContext(): SettingsContextValue {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettingsContext must be used within SettingsProvider')
  return ctx
}
