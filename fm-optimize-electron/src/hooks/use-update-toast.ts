import { useEffect } from 'react';
import { toast } from 'sonner';

export function useUpdateToast(): void {
  useEffect(() => {
    const unsubStatus = window.electronAPI.onUpdateStatus((status) => {
      if (status === 'ready') {
        toast.success('Atualização baixada!', {
          description: 'Reinicie para instalar a nova versão.',
          action: {
            label: 'Instalar',
            onClick: () => window.electronAPI.installUpdate(),
          },
          duration: Infinity,
        });
      }

      if (status === 'error') {
        toast.error('Erro ao verificar atualizações');
      }
    });

    const unsubInfo = window.electronAPI.onUpdateInfo((info) => {
      if (info.version) {
        toast.info(`Versão ${info.version} disponível`, {
          description: 'Uma nova versão foi encontrada.',
          action: {
            label: 'Baixar',
            onClick: () => window.electronAPI.downloadUpdate(),
          },
          duration: Infinity,
        });
      }
    });

    return () => {
      unsubStatus();
      unsubInfo();
    };
  }, []);
}
