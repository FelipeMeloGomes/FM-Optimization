import { Search, Terminal } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScriptContext } from '../contexts/ScriptContext';
import { useCpuContext, useMemoryContext } from '../contexts/SystemContext';
import { getCategoryRoute } from '../lib/category-routes';
import { type CpuVendor, detectCpuVendor } from '../lib/cpu-vendor';
import { cn } from '../lib/utils';
import { ScriptBadge } from './ScriptBadge';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { state, filteredScripts } = useScriptContext();
  const { state: cpuState } = useCpuContext();
  const { state: memoryState } = useMemoryContext();

  const cpuVendor: CpuVendor = useMemo(() => {
    if (cpuState.status !== 'success') return 'unknown';
    return detectCpuVendor(cpuState.data.model);
  }, [cpuState]);

  const userRamGb = useMemo<number | null>(() => {
    if (memoryState.status !== 'success') return null;
    const match = memoryState.data.total.match(/(\d+(?:\.\d+)?)/);
    return match ? parseFloat(match[1]) : null;
  }, [memoryState]);

  const getRamScriptId = useCallback((vendor: CpuVendor, ramGb: number): string => {
    const prefix = vendor === 'amd' ? 'amd' : 'intel';
    if (ramGb <= 4) return `${prefix}-30`;
    if (ramGb <= 6) return `${prefix}-31`;
    if (ramGb <= 8) return `${prefix}-32`;
    if (ramGb <= 12) return `${prefix}-33`;
    if (ramGb <= 16) return `${prefix}-34`;
    if (ramGb <= 32) return `${prefix}-35`;
    return `${prefix}-36`;
  }, []);

  const recommendedRamScriptId = useMemo<string | null>(() => {
    if (!userRamGb || cpuVendor === 'unknown') return null;
    return getRamScriptId(cpuVendor, userRamGb);
  }, [userRamGb, cpuVendor, getRamScriptId]);

  const scripts = useMemo(() => {
    if (state.status !== 'success') return [];

    return filteredScripts.filter((script) => {
      // --- Filtro VENDOR (categoria AMD/Intel + tags) ---
      if (script.category === 'AMD' && cpuVendor !== 'amd') return false;
      if (script.category === 'Intel' && cpuVendor !== 'intel') return false;

      const isAmdSpecific = script.tags.includes('amd');
      const isIntelSpecific = script.tags.includes('intel');

      if (isAmdSpecific && cpuVendor !== 'amd') return false;
      if (isIntelSpecific && cpuVendor !== 'intel') return false;

      // --- Filtro RAM (subcategory RAM) ---
      if (script.subcategory === 'RAM') {
        // Script de reset (amd-37/intel-37) sempre visível
        if (script.id === 'amd-37' || script.id === 'intel-37') return true;

        // Só mostrar script da tier exata do usuário
        if (recommendedRamScriptId && script.id !== recommendedRamScriptId) {
          return false;
        }

        // Se não conseguiu detectar RAM, esconder scripts RAM-specific (exceto reset)
        if (!userRamGb) return false;
      }

      return true;
    });
  }, [state.status, filteredScripts, cpuVendor, userRamGb, recommendedRamScriptId]);

  const filtered = useMemo(() => {
    if (!query.trim()) return scripts;
    const q = query.toLowerCase();
    return scripts.filter(
      (s) => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)
    );
  }, [scripts, query]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && filtered[selectedIndex]) {
        navigate(getCategoryRoute(filtered[selectedIndex].category));
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, navigate, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-xl border border-border bg-card shadow-2xl">
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar tweaks..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
            ESC
          </kbd>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Nenhum resultado encontrado
            </div>
          ) : (
            filtered.map((script, index) => (
              <button
                type="button"
                key={script.id}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                  index === selectedIndex
                    ? 'bg-primary/10 text-foreground'
                    : 'text-foreground hover:bg-muted'
                )}
                onClick={() => {
                  navigate(getCategoryRoute(script.category));
                  onClose();
                }}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <Terminal className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <div className="truncate font-medium">{script.name}</div>
                  <div className="truncate text-xs text-muted-foreground">{script.category}</div>
                </div>
                <ScriptBadge script={script} />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
