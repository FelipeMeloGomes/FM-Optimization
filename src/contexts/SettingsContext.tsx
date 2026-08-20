import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { AppSettings } from '../../electron/shared/ipc-types';

interface SettingsContextValue {
  settings: AppSettings;
  update: (partial: Partial<AppSettings>) => void;
  loading: boolean;
  exportData: () => Promise<void>;
  importData: (file: File) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

const DEFAULT: AppSettings = {
  theme: 'dark',
  confirmOnExecute: true,
  autoRestorePoint: true,
  security: {
    enableIpcValidation: true,
    enableDenyListBlock: false,
    enablePathValidation: true,
    enablePsSanitize: true,
  },
  soundEnabled: true,
  toastDuration: 'medium',
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  useEffect(() => {
    window.electronAPI
      .getSettings()
      .then(setSettings)
      .catch((e) => console.error('Failed to load settings:', e))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'batman');
    if (settings.theme === 'dark') root.classList.add('dark');
    else if (settings.theme === 'batman') root.classList.add('batman');
  }, [settings.theme]);

  const update = useCallback((partial: Partial<AppSettings>) => {
    const next = { ...settingsRef.current, ...partial };
    setSettings(next);
    window.electronAPI
      .saveSettings(next)
      .catch((e) => console.error('Failed to save settings:', e));
  }, []);

  const exportData = useCallback(async () => {
    const data = await window.electronAPI.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fm-optimize-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const importData = useCallback(async (file: File) => {
    const text = await file.text();
    await window.electronAPI.importData(text);
  }, []);

  const contextValue = useMemo(
    () => ({ settings, update, loading, exportData, importData }),
    [settings, update, loading, exportData, importData]
  );

  return <SettingsContext.Provider value={contextValue}>{children}</SettingsContext.Provider>;
}

export function useSettingsContext(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettingsContext must be used within SettingsProvider');
  return ctx;
}
