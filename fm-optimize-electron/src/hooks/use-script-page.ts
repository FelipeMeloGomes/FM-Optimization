import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ScriptEntry } from '../../electron/shared/ipc-types';
import { useScriptContext } from '../contexts/ScriptContext';
import { useScriptExecutionContext } from '../contexts/ScriptExecutionContext';
import { useSettingsContext } from '../contexts/SettingsContext';

export function useScriptPage(category: string) {
  const { state, filteredScripts, setCategoryFilter, setSubcategoryFilter } = useScriptContext();
  const { activeExecution, execute, cancel } = useScriptExecutionContext();
  const { settings } = useSettingsContext();
  const [confirmScript, setConfirmScript] = useState<ScriptEntry | null>(null);

  useEffect(() => {
    setCategoryFilter(category);
    setSubcategoryFilter('');
  }, [category, setCategoryFilter, setSubcategoryFilter]);

  const categoryScripts = useMemo(
    () => filteredScripts.filter((s) => s.category === category),
    [filteredScripts, category]
  );

  const handleExecute = useCallback((id: string) => execute(id), [execute]);
  const handleCancel = useCallback((id: string) => cancel(id), [cancel]);

  const handleConfirmExecute = useCallback(
    (script: ScriptEntry) => {
      if (settings.confirmOnExecute) {
        setConfirmScript(script);
      } else {
        handleExecute(script.id);
      }
    },
    [settings.confirmOnExecute, handleExecute]
  );

  const handleConfirm = useCallback(() => {
    if (confirmScript) {
      handleExecute(confirmScript.id);
    }
  }, [confirmScript, handleExecute]);

  return {
    state,
    categoryScripts,
    activeExecution,
    handleExecute,
    handleCancel,
    handleConfirmExecute,
    confirmScript,
    setConfirmScript,
    handleConfirm,
  };
}
