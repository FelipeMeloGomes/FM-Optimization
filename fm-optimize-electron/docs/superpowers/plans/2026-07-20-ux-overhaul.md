# UX Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Add command palette, keyboard shortcuts, export/import, and enhanced notifications to FM Optimize.

**Architecture:** 4 independent features built incrementally. Command Palette first (highest impact), then shortcuts (depends on palette), then export/import (backend+frontend), then notifications (polish).

**Tech Stack:** React 19, TypeScript, Electron 35, Zod 4, Sonner, Tailwind CSS 4

---

## File Structure

### New Files
- src/components/CommandPalette.tsx - Modal with search input + filtered results list
- src/hooks/use-command-palette.ts - Open/close state + global Ctrl+K listener
- src/hooks/use-keyboard-shortcuts.ts - Global shortcut listener for all keybindings
- src/components/EnhancedToast.tsx - Toast wrapper with action buttons
- src/lib/category-routes.ts - Maps script categories to page routes

### Modified Files
- src/layout/Sidebar.tsx - Add search button + shortcut badges
- src/layout/AppLayout.tsx - Render CommandPalette
- src/pages/SettingsPage.tsx - Add export/import section + notification settings
- src/contexts/SettingsContext.tsx - New settings fields + import/export methods
- electron/main/ipc-handlers.ts - Add export-data, import-data channels
- electron/preload/index.ts - Expose exportData(), importData()
- electron/shared/ipc-types.ts - Add ExportData type, extend AppSettings
- electron/main/validation.ts - Add ExportDataSchema
- src/hooks/use-update-toast.ts - Use enhanced toast

---

## Task 1: Category-to-Route Mapping

**Files:**
- Create: src/lib/category-routes.ts

- [ ] Step 1: Create category route mapping

```typescript
// src/lib/category-routes.ts
export const CATEGORY_ROUTES: Record<string, string> = {
  Tweaks: '/tweaks',
  AMD: '/cpu',
  Intel: '/cpu',
  Cleaner: '/cleaner',
  Internet: '/rede',
  'DNS Manager': '/rede',
  'Input Lag': '/input-lag',
  Utilities: '/utilities',
  Apps: '/apps',
};

export function getCategoryRoute(category: string): string {
  return CATEGORY_ROUTES[category] || '/';
}
```

- [ ] Step 2: Commit

```bash
git add src/lib/category-routes.ts
git commit -m "feat: add category-to-route mapping for command palette"
```

---

## Task 2: Command Palette Component

**Files:**
- Create: src/components/CommandPalette.tsx
- Create: src/hooks/use-command-palette.ts

- [ ] Step 1: Create useCommandPalette hook

```typescript
// src/hooks/use-command-palette.ts
import { useState, useEffect, useCallback } from 'react';

export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        toggle();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggle]);

  return { isOpen, open, close, toggle };
}
```

- [ ] Step 2: Commit hook

```bash
git add src/hooks/use-command-palette.ts
git commit -m "feat: add useCommandPalette hook"
```

- [ ] Step 3: Create CommandPalette component

```tsx
// src/components/CommandPalette.tsx
import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Terminal } from 'lucide-react';
import { getCategoryRoute } from '../lib/category-routes';
import { useScripts } from '../contexts/ScriptContext';
import { ScriptBadge } from './ScriptBadge';
import { cn } from '../lib/utils';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const scripts = useScripts();

  const filtered = useMemo(() => {
    if (!query.trim()) return scripts;
    const q = query.toLowerCase();
    return scripts.filter(
      s => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)
    );
  }, [scripts, query]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => { setSelectedIndex(0); }, [query]);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(i => Math.min(i + 1, filtered.length - 1)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(i => Math.max(i - 1, 0)); }
      else if (e.key === 'Enter' && filtered[selectedIndex]) {
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
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-xl border border-border bg-card shadow-2xl">
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input ref={inputRef} type="text" placeholder="Buscar scripts..." value={query} onChange={e => setQuery(e.target.value)} className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" />
          <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">ESC</kbd>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">Nenhum resultado encontrado</div>
          ) : (
            filtered.map((script, index) => (
              <button key={script.id} className={cn('flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors', index === selectedIndex ? 'bg-primary/10 text-foreground' : 'text-foreground hover:bg-muted')} onClick={() => { navigate(getCategoryRoute(script.category)); onClose(); }} onMouseEnter={() => setSelectedIndex(index)}>
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
```

- [ ] Step 4: Commit component

```bash
git add src/components/CommandPalette.tsx
git commit -m "feat: add CommandPalette component"
```

---

## Task 3: Integrate Command Palette

**Files:**
- Modify: src/layout/AppLayout.tsx
- Modify: src/layout/Sidebar.tsx

- [ ] Step 1: Add CommandPalette to AppLayout

```tsx
// src/layout/AppLayout.tsx - add import and render
import { CommandPalette } from '../components/CommandPalette';
import { useCommandPalette } from '../hooks/use-command-palette';
// Inside component:
const { isOpen, open, close } = useCommandPalette();
// Add to JSX before closing div:
<CommandPalette isOpen={isOpen} onClose={close} />
```

- [ ] Step 2: Add search button to Sidebar

```tsx
// src/layout/Sidebar.tsx - add Search import and button at top
import { Search } from 'lucide-react';
// Add search button before nav items:
<button onClick={openCommandPalette} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
  <Search className="h-4 w-4" />
  <span>Buscar</span>
  <kbd className="ml-auto rounded border border-border bg-muted px-1.5 py-0.5 text-xs">Ctrl+K</kbd>
</button>
```

- [ ] Step 3: Commit integration

```bash
git add src/layout/AppLayout.tsx src/layout/Sidebar.tsx
git commit -m "feat: integrate CommandPalette in AppLayout and Sidebar"
```

---

## Task 4: Keyboard Shortcuts Hook

**Files:**
- Create: src/hooks/use-keyboard-shortcuts.ts
- Modify: src/layout/AppLayout.tsx

- [ ] Step 1: Create useKeyboardShortcuts hook

```typescript
// src/hooks/use-keyboard-shortcuts.ts
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PAGE_ROUTES = ['/', '/tweaks', '/cpu', '/cleaner', '/rede', '/input-lag', '/utilities', '/apps', '/restore-points'];

export function useKeyboardShortcuts() {
  const navigate = useNavigate();
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        const index = parseInt(e.key) - 1;
        if (PAGE_ROUTES[index]) navigate(PAGE_ROUTES[index]);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault();
        navigate('/settings');
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);
}
```

- [ ] Step 2: Commit hook

```bash
git add src/hooks/use-keyboard-shortcuts.ts
git commit -m "feat: add useKeyboardShortcuts hook"
```

- [ ] Step 3: Add hook to AppLayout

```tsx
// src/layout/AppLayout.tsx
import { useKeyboardShortcuts } from '../hooks/use-keyboard-shortcuts';
// Inside component:
useKeyboardShortcuts();
```

- [ ] Step 4: Commit integration

```bash
git add src/layout/AppLayout.tsx
git commit -m "feat: integrate keyboard shortcuts in AppLayout"
```

---

## Task 5: Export/Import Types and Validation

**Files:**
- Modify: electron/shared/ipc-types.ts
- Modify: electron/main/validation.ts

- [ ] Step 1: Add ExportData type and extend AppSettings

```typescript
// electron/shared/ipc-types.ts
export interface ExportData {
  version: string;
  exportedAt: string;
  settings?: Partial<AppSettings>;
  history?: ExecutionHistoryEntry[];
}
// Extend AppSettings:
export interface AppSettings {
  theme: 'dark' | 'light';
  confirmBeforeExecute: boolean;
  autoRestorePoint: boolean;
  soundEnabled: boolean;
  toastDuration: 'short' | 'medium' | 'long';
}
```

- [ ] Step 2: Add ExportDataSchema to validation.ts

```typescript
// electron/main/validation.ts
export const ExportDataSchema = z.object({
  version: z.string(),
  exportedAt: z.string(),
  settings: z.object({
    theme: z.enum(['dark', 'light']).optional(),
    confirmBeforeExecute: z.boolean().optional(),
    autoRestorePoint: z.boolean().optional(),
    soundEnabled: z.boolean().optional(),
    toastDuration: z.enum(['short', 'medium', 'long']).optional(),
  }).partial().optional(),
  history: z.array(z.object({
    id: z.string(),
    scriptId: z.string(),
    scriptName: z.string().optional(),
    category: z.string().optional(),
    startedAt: z.string(),
    endedAt: z.string().optional(),
    exitCode: z.number(),
    adminRequired: z.boolean().optional(),
  })).optional(),
});
```

- [ ] Step 3: Commit types and validation

```bash
git add electron/shared/ipc-types.ts electron/main/validation.ts
git commit -m "feat: add ExportData type and validation schema"
```

---

## Task 6: Export/Import IPC Handlers

**Files:**
- Modify: electron/main/ipc-handlers.ts
- Modify: electron/preload/index.ts

- [ ] Step 1: Add export-data handler

```typescript
// electron/main/ipc-handlers.ts
ipcMain.handle('export-data', async () => {
  const settings = dataService.getSettings();
  const history = dataService.getHistory();
  return { version: app.getVersion(), exportedAt: new Date().toISOString(), settings, history };
});
```

- [ ] Step 2: Add import-data handler

```typescript
// electron/main/ipc-handlers.ts
ipcMain.handle('import-data', async (_event, jsonData: string) => {
  const parsed = JSON.parse(jsonData);
  const validation = ExportDataSchema.safeParse(parsed);
  if (!validation.success) throw new Error('Invalid export file: ' + validation.error.message);
  const data = validation.data;
  if (data.settings) {
    const current = dataService.getSettings();
    dataService.saveSettings({ ...current, ...data.settings });
  }
  if (data.history) {
    const current = dataService.getHistory();
    const existingIds = new Set(current.map(h => h.id));
    const newEntries = data.history.filter(h => !existingIds.has(h.id));
    dataService.saveHistory([...current, ...newEntries]);
  }
  return { success: true };
});
```

- [ ] Step 3: Expose in preload and ElectronAPI

```typescript
// electron/preload/index.ts
exportData: () => ipcRenderer.invoke('export-data'),
importData: (jsonData: string) => ipcRenderer.invoke('import-data', jsonData),
// electron/shared/ipc-types.ts - add to ElectronAPI
exportData(): Promise<ExportData>;
importData(jsonData: string): Promise<{ success: boolean }>;
```

- [ ] Step 4: Commit IPC changes

```bash
git add electron/main/ipc-handlers.ts electron/preload/index.ts electron/shared/ipc-types.ts
git commit -m "feat: add export-data and import-data IPC handlers"
```

---

## Task 7: Export/Import UI

**Files:**
- Modify: src/pages/SettingsPage.tsx
- Modify: src/contexts/SettingsContext.tsx

- [ ] Step 1: Add export/import to SettingsContext and SettingsPage

```tsx
// src/contexts/SettingsContext.tsx - add methods
const exportData = async () => {
  const data = await window.electronAPI.exportData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'fm-optimize-backup-' + new Date().toISOString().split('T')[0] + '.json';
  a.click();
  URL.revokeObjectURL(url);
};
const importData = async (file: File) => {
  const text = await file.text();
  await window.electronAPI.importData(text);
};

// src/pages/SettingsPage.tsx - add section
<div className="space-y-4">
  <h3 className="text-lg font-semibold">Dados</h3>
  <div className="flex gap-4">
    <button onClick={exportData} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Exportar Dados</button>
    <label className="cursor-pointer rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted">
      Importar Dados
      <input type="file" accept=".json" className="hidden" onChange={e => { const file = e.target.files?.[0]; if (file) importData(file); }} />
    </label>
  </div>
</div>
```

- [ ] Step 2: Commit UI

```bash
git add src/pages/SettingsPage.tsx src/contexts/SettingsContext.tsx
git commit -m "feat: add export/import UI in SettingsPage"
```

---

## Task 8: Enhanced Toast Component

**Files:**
- Create: src/components/EnhancedToast.tsx
- Modify: src/hooks/use-update-toast.ts

- [ ] Step 1: Create EnhancedToast and update useUpdateToast

```tsx
// src/components/EnhancedToast.tsx
import { toast } from 'sonner';
import { CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';

const ICONS = { success: CheckCircle, error: XCircle, info: Info, warning: AlertTriangle };
const DURATIONS = { short: 2000, medium: 4000, long: 8000 };

export function showEnhancedToast({ type, title, description, action, duration = 'medium' }: {
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  duration?: 'short' | 'medium' | 'long';
}) {
  const Icon = ICONS[type];
  toast[type](title, { description, duration: DURATIONS[duration], action: action ? { label: action.label, onClick: action.onClick } : undefined, icon: Icon ? <Icon className="h-4 w-4" /> : undefined });
}
```

- [ ] Step 2: Commit component

```bash
git add src/components/EnhancedToast.tsx
git commit -m "feat: add EnhancedToast component"
```

- [ ] Step 3: Update useUpdateToast to use enhanced toast

```typescript
// src/hooks/use-update-toast.ts - replace toast calls
import { showEnhancedToast } from '../components/EnhancedToast';
// Replace toast.success/error with showEnhancedToast
```

- [ ] Step 4: Commit update

```bash
git add src/hooks/use-update-toast.ts
git commit -m "feat: use EnhancedToast in useUpdateToast"
```

---

## Task 9: Notification Settings

**Files:**
- Modify: src/pages/SettingsPage.tsx

- [ ] Step 1: Add notification settings section

```tsx
// src/pages/SettingsPage.tsx
<div className="space-y-4">
  <h3 className="text-lg font-semibold">Notificacoes</h3>
  <div className="flex items-center justify-between">
    <label className="text-sm">Som nas notificacoes</label>
    <Switch checked={settings.soundEnabled} onCheckedChange={v => saveSettings({ ...settings, soundEnabled: v })} />
  </div>
  <div className="flex items-center justify-between">
    <label className="text-sm">Duracao dos toasts</label>
    <select value={settings.toastDuration} onChange={e => saveSettings({ ...settings, toastDuration: e.target.value })}>
      <option value="short">Curta (2s)</option>
      <option value="medium">Media (4s)</option>
      <option value="long">Longa (8s)</option>
    </select>
  </div>
</div>
```

- [ ] Step 2: Commit settings

```bash
git add src/pages/SettingsPage.tsx
git commit -m "feat: add notification settings UI"
```

---

## Task 10: Sidebar Shortcut Badges

**Files:**
- Modify: src/layout/Sidebar.tsx

- [ ] Step 1: Add shortcut badges to nav items

```tsx
// src/layout/Sidebar.tsx - add shortcut numbers to NAV_ITEMS
const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, shortcut: '1' },
  { path: '/tweaks', label: 'Tweaks', icon: SlidersHorizontal, shortcut: '2' },
  { path: '/cpu', label: 'CPU', icon: Cpu, shortcut: '3' },
  { path: '/cleaner', label: 'Limpeza', icon: Trash2, shortcut: '4' },
  { path: '/rede', label: 'Rede', icon: Wifi, shortcut: '5' },
  { path: '/input-lag', label: 'Input Lag', icon: Mouse, shortcut: '6' },
  { path: '/utilities', label: 'Utilitarios', icon: Wrench, shortcut: '7' },
  { path: '/apps', label: 'Apps', icon: AppWindow, shortcut: '8' },
  { path: '/restore-points', label: 'Restore Points', icon: History, shortcut: '9' },
  { path: '/history', label: 'Historico', icon: Clock },
  { path: '/settings', label: 'Configuracoes', icon: Settings },
];
// In nav item render, add kbd element for shortcut
```

- [ ] Step 2: Commit sidebar

```bash
git add src/layout/Sidebar.tsx
git commit -m "feat: add keyboard shortcut badges to Sidebar"
```

---

## Task 11: Final Verification

- [ ] Step 1: Run typecheck

```bash
npm run typecheck
```
Expected: PASS

- [ ] Step 2: Run tests

```bash
npm run test
```
Expected: 32/32 PASS

- [ ] Step 3: Run dev mode and test manually

```bash
npm run dev
```
Test: Ctrl+K opens palette, search works, shortcuts navigate, export/import buttons work

- [ ] Step 4: Commit any fixes

```bash
git add -A && git commit -m "fix: address review feedback"
```

---

## Implementation Order

1. Task 1: Category-to-Route Mapping (foundation)
2. Task 2: Command Palette Component (core feature)
3. Task 3: Integrate Command Palette (wiring)
4. Task 4: Keyboard Shortcuts Hook (depends on palette)
5. Task 5: Export/Import Types (backend foundation)
6. Task 6: Export/Import IPC Handlers (backend)
7. Task 7: Export/Import UI (frontend)
8. Task 8: Enhanced Toast Component (notifications)
9. Task 9: Notification Settings (settings)
10. Task 10: Sidebar Shortcut Badges (polish)
11. Task 11: Final Verification

## Testing Strategy

- Command Palette: Manual test (Ctrl+K, search, navigate)
- Keyboard Shortcuts: Manual test (all shortcuts)
- Export/Import: Manual test (export, import, validation)
- Enhanced Notifications: Manual test (toast types, durations)
- All: Typecheck + existing 32 tests must pass
