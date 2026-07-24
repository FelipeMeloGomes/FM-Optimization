import { useEffect } from 'react';
import { showEnhancedToast } from '../components/EnhancedToast';
import { useSettingsContext } from '../contexts/SettingsContext';

export function useUpdateToast(): void {
  const { settings } = useSettingsContext();

  useEffect(() => {
    const unsubStatus = window.electronAPI.onUpdateStatus((status) => {
      if (status === 'ready') {
        showEnhancedToast({
          type: 'success',
          title: 'Atualizacao baixada!',
          description: 'Reinicie para instalar a nova versao.',
          action: {
            label: 'Instalar',
            onClick: () => window.electronAPI.installUpdate(),
          },
          duration: 'long',
          sound: settings.soundEnabled,
        });
      }

      if (status === 'error') {
        showEnhancedToast({
          type: 'error',
          title: 'Erro ao verificar atualizacoes',
          sound: settings.soundEnabled,
        });
      }
    });

    const unsubInfo = window.electronAPI.onUpdateInfo((info) => {
      if (info.version) {
        showEnhancedToast({
          type: 'info',
          title: `Versao ${info.version} disponivel`,
          description: 'Uma nova versao foi encontrada.',
          action: {
            label: 'Baixar',
            onClick: () => window.electronAPI.downloadUpdate(),
          },
          duration: 'long',
          sound: settings.soundEnabled,
        });
      }
    });

    return () => {
      unsubStatus();
      unsubInfo();
    };
  }, [settings.soundEnabled]);
}
