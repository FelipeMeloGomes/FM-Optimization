# FM Optimize - UX Overhaul Design

**Date:** 2026-07-20
**Version:** 2.5.5
**Status:** Approved

---

## Overview

Complete UX improvement for FM Optimize covering 4 areas: global search, keyboard shortcuts, export/import, and enhanced notifications. Goal: make the app faster to use and more polished.

---

## 1. Command Palette (Global Search)

### Component

CommandPalette - modal overlay triggered by Ctrl+K or sidebar search button.

### Behavior

- Opens centered on screen with dark overlay
- Input field auto-focused, placeholder "Buscar scripts..."
- Filters scripts by name and category (case-insensitive)
- Results show: icon, script name, category label, badges (admin/restart/risk)
- Up/Down arrows navigate, Enter navigates to scripts page, Escape closes
- Shows "Nenhum resultado" when no matches

### Data Flow

CommandPalette reads ScriptContext.filteredScripts (all categories), local state for query string + selectedIndex, filters scripts matching query by name/category. On select: maps script category to page route (tweaks, cpu, cleaner, rede, input-lag, utilities, apps) and navigates via React Router.

### Files

- src/components/CommandPalette.tsx - NEW - modal + search + results
- src/hooks/use-command-palette.ts - NEW - open/close state, keyboard listener
- src/layout/Sidebar.tsx - EDIT - add search button triggering palette
- src/layout/AppLayout.tsx - EDIT - render CommandPalette

### Styling

- Modal: fixed inset-0 z-50 with bg-black/50 backdrop
- Content: max-w-lg mx-auto mt-[20vh] card with rounded-xl shadow-2xl
- Results: scrollable list, max-height 60vh
- Active item: bg-primary/10 highlight
- Badges: reuse existing ScriptBadge component

---

## 2. Keyboard Shortcuts

### Global Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+K | Open command palette |
| Ctrl+Shift+R | Create restore point |
| Ctrl+, | Open settings |
| Ctrl+1-9 | Navigate to pages 1-9 |
| Escape | Close modal/dialog |

### Implementation

- Hook use-keyboard-shortcuts.ts registers global keydown listener
- Checks ctrlKey/shiftKey + key
- Prevents default browser behavior for registered shortcuts
- Sidebar shows shortcut hints (e.g., "1" badge next to Dashboard)

### Files

- src/hooks/use-keyboard-shortcuts.ts - NEW - global shortcut listener
- src/layout/Sidebar.tsx - EDIT - show shortcut badges
- src/components/CommandPalette.tsx - EDIT - handle arrows internally

---

## 3. Export/Import

### Data Format

```json
{
  "version": "2.5.5",
  "exportedAt": "2026-07-20T21:00:00Z",
  "settings": { "theme": "dark", "confirmBeforeExecute": true, "autoRestorePoint": true },
  "history": [{ "id": "...", "scriptId": "...", "startedAt": "...", "endedAt": "...", "exitCode": 0 }]
}
```

### Export Flow

1. User clicks "Exportar" in SettingsPage
2. Electron dialog.showSaveDialog() - suggest fm-optimize-backup-YYYY-MM-DD.json
3. Main process serializes settings + history
4. Writes JSON to selected path
5. Toast: "Dados exportados com sucesso"

### Import Flow

1. User clicks "Importar" in SettingsPage
2. Electron dialog.showOpenDialog() - filter .json
3. Main process reads file, validates with Zod schema
4. If invalid: toast error "Arquivo invalido"
5. If valid: merge settings (overwrite), append history (dedup by id)
6. Toast: "Dados importados com sucesso"

### Files

- electron/main/ipc-handlers.ts - EDIT - add export-data and import-data channels
- electron/preload/index.ts - EDIT - expose exportData() and importData()
- electron/shared/ipc-types.ts - EDIT - add ExportData type
- electron/main/validation.ts - EDIT - add ExportDataSchema
- src/pages/SettingsPage.tsx - EDIT - add export/import section
- src/contexts/SettingsContext.tsx - EDIT - expose import/export methods

---

## 4. Enhanced Notifications

### Toast Variants

| Type | Icon | Action | Duration |
|------|------|--------|----------|
| Success | Check | "Ver historico" link | 4s |
| Error | X | Expandivel com stderr | 8s |
| Info | Info | Nenhum | 3s |
| Warning | AlertTriangle | "Desfazer" (quando aplicavel) | 6s |

### New Settings

```typescript
interface AppSettings {
  soundEnabled: boolean;      // default: false
  toastDuration: "short" | "medium" | "long";  // default: "medium"
}
```

### Enhanced Flows

- Script completion: success toast with "Historico" link, error toast with expandible stderr
- Download progress: Toast with Progress bar, percentage, ETA
- Restore point created: Toast with "Desfazer" action button

### Files

- src/components/EnhancedToast.tsx - NEW - wrapper with action buttons
- src/hooks/use-update-toast.ts - EDIT - use enhanced toast
- src/contexts/SettingsContext.tsx - EDIT - add new settings fields
- src/pages/SettingsPage.tsx - EDIT - add sound/duration toggles
- electron/shared/ipc-types.ts - EDIT - extend AppSettings type

---

## Implementation Order

1. Command Palette (highest impact, standalone)
2. Keyboard Shortcuts (depends on palette for Ctrl+K)
3. Export/Import (independent, backend + frontend)
4. Enhanced Notifications (polish, depends on existing toast)

## Testing Strategy

- Command Palette: component test with React Testing Library
- Keyboard Shortcuts: integration test simulating key events
- Export/Import: unit test for Zod validation + integration test for IPC flow
- Enhanced Notifications: visual verification (manual)

## Risks

- Ctrl+K conflict: Browser default is open devtools. Override with event.preventDefault().
- Export file size: History capped at 200 entries, max ~50KB JSON. No concern.
- Import race condition: Settings save is atomic (tmp+rename). Safe.
