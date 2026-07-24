import { useEffect } from 'react';
import { showEnhancedToast } from '../components/EnhancedToast';

export function useScriptExecutionToast(): void {
  useEffect(() => {
    return window.electronAPI.onScriptEnded((data) => {
      if (data.code === 0 && data.scriptName) {
        showEnhancedToast({
          type: 'success',
          title: 'Tweak executado',
          description: data.scriptName,
          duration: 'medium',
        });
      }
    });
  }, []);
}
