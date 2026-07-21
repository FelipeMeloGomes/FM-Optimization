import { useEffect } from 'react';
import { showEnhancedToast } from '../components/EnhancedToast';

export function useUpdateToast(): void {
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
        });
      }

      if (status === 'error') {
        showEnhancedToast({
          type: 'error',
          title: 'Erro ao verificar atualizacoes',
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
        });
      }
    });

    return () => {
      unsubStatus();
      unsubInfo();
    };
  }, []);
}
