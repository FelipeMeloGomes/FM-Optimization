import { useEffect } from 'react';
import { showEnhancedToast } from '../components/EnhancedToast';
import { useSettingsContext } from '../contexts/SettingsContext';

export function useScriptExecutionToast(): void {
  const { settings } = useSettingsContext();

  useEffect(() => {
    return window.electronAPI.onScriptEnded((data) => {
      if (data.code === 0 && data.scriptName) {
        showEnhancedToast({
          type: 'success',
          title: 'Tweak executado',
          description: data.scriptName,
          duration: 'medium',
          sound: settings.soundEnabled,
        });
      }
    });
  }, [settings.soundEnabled]);
}
