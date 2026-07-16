import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import type { AsyncState, RestorePointEntry } from '../../electron/shared/ipc-types';

interface RestorePointContextValue {
  state: AsyncState<RestorePointEntry[]>;
  creating: boolean;
  restoring: boolean;
  refresh: () => void;
  create: (name: string) => Promise<void>;
  remove: (seq: number) => Promise<void>;
  restore: (seq: number) => Promise<void>;
}

const RestorePointContext = createContext<RestorePointContextValue | null>(null);

export function RestorePointProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AsyncState<RestorePointEntry[]>>({ status: 'loading' });
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const refresh = useCallback(() => {
    setState({ status: 'loading' });
    window.electronAPI
      .getRestorePoints()
      .then((data) => setState({ status: 'success', data }))
      .catch((e) =>
        setState({ status: 'error', error: typeof e === 'string' ? e : (e as Error).message })
      );
  }, []);

  const create = useCallback(
    async (name: string) => {
      setCreating(true);
      try {
        await window.electronAPI.createRestorePoint(name);
        await refresh();
      } finally {
        setCreating(false);
      }
    },
    [refresh]
  );

  const remove = useCallback(
    async (seq: number) => {
      try {
        await window.electronAPI.deleteRestorePoint(seq);
        await refresh();
      } catch (e) {
        setState({
          status: 'error',
          error: typeof e === 'string' ? e : 'Falha ao excluir ponto de restauração',
        });
      }
    },
    [refresh]
  );

  const restore = useCallback(async (seq: number) => {
    setRestoring(true);
    try {
      await window.electronAPI.restoreSystem(seq);
    } catch (e) {
      setState({
        status: 'error',
        error: typeof e === 'string' ? e : 'Falha ao restaurar sistema',
      });
    } finally {
      setRestoring(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <RestorePointContext.Provider
      value={{ state, creating, restoring, refresh, create, remove, restore }}
    >
      {children}
    </RestorePointContext.Provider>
  );
}

export function useRestorePointContext(): RestorePointContextValue {
  const ctx = useContext(RestorePointContext);
  if (!ctx) throw new Error('useRestorePointContext must be used within RestorePointProvider');
  return ctx;
}
