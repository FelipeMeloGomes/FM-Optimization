# FM Optimize — Migração para Electron + React

## Visão Geral

Migrar o FM Optimize de WPF/.NET 9 para Electron + React + TypeScript, mantendo toda a funcionalidade existente (90+ scripts de otimização, dashboard de sistema, gerenciador de restore points, execução de scripts com log em tempo real) e modernizando o visual dark neon.

## Stack

| Tecnologia | Versão | Propósito |
|---|---|---|
| Electron | latest | Shell desktop |
| React | 19 | UI (renderer process) |
| TypeScript | 5 | Type safety |
| Vite | 6 | Bundler + HMR (via electron-vite) |
| Tailwind CSS | 4 | Estilização utilitária |
| shadcn/ui | latest | Componentes base (sidebar, dialog, card, button, input, etc.) |
| React Router | 7 | Navegação SPA entre páginas |
| React Context | — | Estado global (sem Zustand) |

## Arquitetura

```
┌─────────────────────────────────────────┐
│          Electron Main Process          │
│  (Node.js nativo, acesso ao SO)         │
│                                         │
│  ┌─────────────┐  ┌─────────────────┐   │
│  │ IPC         │  │ ScriptExecutor   │   │
│  │ Handlers    │  │ (child_process)  │   │
│  ├─────────────┤  ├─────────────────┤   │
│  │ WMI Info    │  │ ScriptRegistry   │   │
│  │ (node-wmi)  │  │ (JSON embutido)  │   │
│  ├─────────────┤  ├─────────────────┤   │
│  │ File I/O    │  │ AdminCheck      │   │
│  │ (fs)        │  │ (is-admin)      │   │
│  └─────────────┘  └─────────────────┘   │
└──────────────────┬──────────────────────┘
                   │ IPC (contextBridge)
┌──────────────────▼──────────────────────┐
│        Renderer Process (React)          │
│                                          │
│  ┌──────────┐  ┌─────────────────────┐   │
│  │ Pages    │  │ Components          │   │
│  ├──────────┤  ├─────────────────────┤   │
│  │ Dashboard│  │ Sidebar, TopBar      │   │
│  │ Tweaks   │  │ ScriptCard, LogPanel │   │
│  │ Cleaner  │  │ CircuitBackground    │   │
│  │ Utilities│  │ DashboardWidget      │   │
│  │ DNS      │  │ ScriptDetailDialog   │   │
│  │ Apps     │  │ EditScriptDialog     │   │
│  │ Settings │  │ RestorePointList     │   │
│  │ Restore  │  └─────────────────────┘   │
│  │ Points   │                            │
│  └──────────┘                            │
└─────────────────────────────────────────┘
```

### Processos

- **Main Process:** Node.js puro. Responsável por toda interação com o sistema operacional: executar scripts, consultar WMI, ler/escrever arquivos, verificar admin.
- **Renderer Process:** React SPA. UI pura, sem acesso direto ao sistema. Comunica-se com o main via `contextBridge` IPC tipado.
- **Preload:** Expõe `window.electronAPI` com métodos tipados. Ponte de segurança entre main e renderer.

### Fluxo de Dados

1. Renderer chama `window.electronAPI.getSystemInfo()` (exemplo)
2. Preload encaminha via `ipcRenderer.invoke('get-system-info')`
3. Main process recebe no `ipcMain.handle('get-system-info')`, executa a lógica Node.js
4. Resultado retorna como Promise pro renderer
5. Dados de output de script (stdout/stderr) fluem em tempo real via `webContents.send('script-output')` escutado no preload como callback

## Rotas

| Rota | Página | Descrição |
|---|---|---|
| `/` | Dashboard | Widgets de CPU, GPU, RAM, OS, disco, uptime |
| `/tweaks` | Scripts | Scripts de tweaks/desempenho |
| `/utilities` | Scripts | Scripts de utilitários do sistema |
| `/cleaner` | Scripts | Scripts de limpeza |
| `/restore-points` | RestorePoints | Gerenciador de restore points |
| `/dns` | Scripts | Scripts de rede/DNS |
| `/apps` | Scripts | Scripts de privacidade |
| `/settings` | Settings | Preferências do app |

O componente `ScriptsPage` é reutilizável — recebe a categoria como parâmetro da rota e filtra os scripts automaticamente.

## Componentes

| Componente | Descrição | Base shadcn/ui |
|---|---|---|
| `Sidebar` | Nav vertical com ícones SVG, destaque rota ativa | `Sidebar` |
| `TopBar` | Título da página + search com glow | — |
| `ScriptCard` | Card do script: nome, badges, botão executar, favorito | `Card` + `Button` |
| `ScriptCardSkeleton` | Placeholder animado durante carregamento | `Skeleton` |
| `LogPanel` | Terminal output com scroll, cursor piscando, copy/clear | — |
| `DashboardWidget` | Card métrico (ícone, label, valor) | `Card` |
| `RestorePointList` | Lista de restore points + ações | `Table` + `Button` |
| `ScriptDetailDialog` | Modal com info do script + preview de código | `Dialog` |
| `EditScriptDialog` | Modal adicionar/editar script | `Dialog` |
| `CircuitBackground` | Canvas animado PCB (decorativo) | — |
| `SearchInput` | Input de busca com glow animation | `Input` |
| `FavoriteButton` | Botão estrela toggle | `Button` |

### Layout Base

```
┌──────────────────────────────────────────────────┐
│ Sidebar     │  TopBar (título + search)          │
│ (fixa,     ├─────────────────────────────────────┤
│  w-64)     │  Content Area (scroll)              │
│            │                                      │
│ Ícones     │  <Outlet /> (React Router)          │
│ verticais  │                                      │
│            ├─────────────────────────────────────┤
│ Dashboard  │  LogPanel (collapsível, opcional)    │
│ Tweaks     │  [stdout/stderr streaming]          │
│ Utilities  │                                      │
│ Cleaner    │                                      │
│ DNS        │                                      │
│ Apps       │                                      │
│ Settings   │                                      │
└────────────┴──────────────────────────────────────┘
```

## Tema Visual (shadcn/ui custom)

```css
@layer base {
  :root {
    --background: #0a0a0f;
    --foreground: #f0f0f5;
    --card: #12121a;
    --card-foreground: #f0f0f5;
    --popover: #12121a;
    --popover-foreground: #f0f0f5;
    --primary: #0044ff;
    --primary-foreground: #ffffff;
    --secondary: #1a1a2e;
    --secondary-foreground: #f0f0f5;
    --muted: #1f1f2e;
    --muted-foreground: #8888aa;
    --accent: #0033cc;
    --accent-foreground: #ffffff;
    --destructive: #ff3355;
    --destructive-foreground: #ffffff;
    --border: #1a1a2e;
    --input: #1a1a2e;
    --ring: #0044ff;
    --radius: 0.75rem;
    --sidebar-background: #0d0d14;
    --sidebar-foreground: #f0f0f5;
    --sidebar-primary: #0044ff;
    --sidebar-accent: #0033cc;
    --sidebar-border: #1a1a2e;
    --sidebar-ring: #0044ff;
    --font-sans: 'Inter', system-ui, sans-serif;
    --font-mono: 'JetBrains Mono', monospace;
  }
}
```

### Fontes

- **JetBrains Mono** — código, terminal, badges
- **Inter** — textos do sistema (padrão shadcn)

## Main Process — Serviços Node.js

### SystemInfoService

Obtém dados do sistema usando módulos nativos Node.js + `node-wmi`:

- **CPU:** `os.cpus()` — modelo, núcleos, arquitetura
- **GPU:** `node-wmi` query `Win32_VideoController` — nome, VRAM
- **RAM:** `os.totalmem()` / `os.freemem()` + WMI `Win32_PhysicalMemory` — tipo DDR, slots
- **OS:** `os.version()`, `os.release()` + registro Windows — edição, build
- **Disk:** `node-wmi` query `Win32_LogicalDisk` — tamanho, livre, tipo
- **Uptime:** `os.uptime()`

### ScriptRegistryService

Carrega os 90+ scripts de um JSON embutido no bundle (compilado como asset). Cada entrada:

```typescript
interface ScriptEntry {
  id: string
  name: string
  description: string
  category: string
  subcategory: string
  content: string      // Base64 do script
  extension: string    // bat, ps1, reg, exe
  requiresAdmin: boolean
  isBuiltIn: boolean
  tags: string[]
}
```

### ScriptExecutionService

Executa scripts via `child_process.spawn()`:

| Extensão | Comando |
|---|---|
| `.bat` / `.cmd` | `cmd.exe /c "<path>"` |
| `.ps1` | `powershell.exe -ExecutionPolicy Bypass -File "<path>"` |
| `.reg` | `regedit.exe /s "<path>"` |
| `.exe` | `Process.Start()` direto |

- **Streaming de output:** stdout/stderr em tempo real via `stream` events, enviados ao renderer via IPC
- **Cancelamento:** `process.kill(tree: true)` no PID
- **Timeout:** Opcional por script

### RestorePointService

Usa `child_process.exec()` com PowerShell:

- **Listar:** `Get-ComputerRestorePoint`
- **Criar:** `Checkpoint-Computer -Description "<nome>"`
- **Restaurar:** `Restore-Computer -RestorePoint <seq>`
- **Deletar:** Remove do registro (compatível com WPF atual)

### DataService

Persistência JSON para dados mutáveis do app:

- `scripts_data.json` — favoritos, scripts do usuário (path ou conteúdo inline)
- **Portable:** salvo ao lado do executável
- **Instalado:** `%APPDATA%\FMOptimize\scripts_data.json`

## IPC API (typings compartilhadas)

```typescript
// shared/ipc-types.ts

export interface DashboardData {
  cpu: CpuInfo
  gpu: GpuInfo
  memory: MemoryInfo
  os: OsInfo
  disk: DiskInfo
  uptime: number
}

export interface ScriptOutput {
  scriptId: string
  type: 'stdout' | 'stderr'
  text: string
}

export interface ElectronAPI {
  getSystemInfo(): Promise<DashboardData>
  getScripts(): Promise<ScriptEntry[]>
  extractScripts(): Promise<{ id: string; path: string }[]>
  executeScript(id: string): Promise<void>
  cancelExecution(id: string): Promise<void>
  getRestorePoints(): Promise<RestorePointEntry[]>
  createRestorePoint(name: string): Promise<void>
  deleteRestorePoint(seq: number): Promise<void>
  restoreSystem(seq: number): Promise<void>
  isAdmin(): Promise<boolean>
  getSettings(): Promise<AppSettings>
  saveSettings(s: AppSettings): Promise<void>
  getDataFilePath(): Promise<string>
  onScriptOutput(cb: (data: ScriptOutput) => void): () => void
  onScriptError(cb: (data: ScriptOutput) => void): () => void
  onScriptEnded(cb: (data: { id: string; code: number }) => void): () => void
}
```

## Context Providers

| Provider | Estado | Actions |
|---|---|---|
| `ScriptProvider` | scripts[], filtered[], favorites[], activeExecution | filter(), search(), toggleFavorite(), execute(), cancel() |
| `SystemProvider` | dashboardData, loading, error | refresh() |
| `RestorePointProvider` | restorePoints[], creating | list(), create(), restore(), delete() |
| `LogProvider` | entries[] | addEntry(), clear() |
| `SettingsProvider` | settings | update(), persist() |

## Estados de UI (Obrigatório)

Todos os componentes que carregam dados assíncronos (dashboard, scripts, restore points) devem implementar:

1. **Loading:** Skeleton/spinner enquanto carrega
2. **Empty:** Mensagem + ilustração quando lista vazia
3. **Error:** Mensagem de erro + botão retry
4. **Success:** Conteúdo normal

Exemplo: `DashboardPage` mostra `DashboardWidgetSkeleton` até `getSystemInfo` resolver.

## Tratamento de Erros

- **IPC errors:** todo `ipcMain.handle` retorna `{ success: boolean, data?: T, error?: string }`
- **Script execution:** erros de processo (exit code != 0) vão pro LogPanel como `Warn`/`Error`
- **WMI failures:** se `node-wmi` falhar em uma query, loga o erro mas não quebra o app — mostra "N/A" no widget
- **Arquivos corrompidos:** `DataService` valida JSON antes de parsear; se inválido, faz backup (`scripts_data.json.bak`) e reinicia com estado padrão

## Performance

- **Script execution:** streaming IPC a cada ~100ms (não por linha) pra evitar flood no renderer
- **Search:** debounce de 150ms (igual WPF atual)
- **Dashboard:** cache de 30 segundos — refresh manual via botão
- **Virtualização:** se lista de scripts crescer muito (>100), virtualizar com `react-window` ou `virtua`

## Testes

- **Main process:** Vitest comum (Node.js puro, sem Electron)
- **Renderer:** Vitest + React Testing Library
- **Testes de integração:** Playwright + Electron (e2e)

## Estrutura de Diretórios

```
fm-optimize-electron/
├── electron/
│   ├── main/
│   │   ├── index.ts              # Entry point, app lifecycle, window creation
│   │   ├── ipc-handlers.ts       # Registro de todos os ipcMain.handle
│   │   └── services/
│   │       ├── system-info.ts
│   │       ├── script-executor.ts
│   │       ├── script-registry.ts
│   │       ├── restore-points.ts
│   │       └── data-service.ts
│   ├── preload/
│   │   └── index.ts              # contextBridge expondo electronAPI
│   └── shared/
│       └── ipc-types.ts          # Tipos compartilhados main/renderer
│
├── src/
│   ├── main.tsx                  # Entry React + Router
│   ├── App.tsx                   # Providers + Layout
│   ├── layout/
│   │   ├── AppLayout.tsx         # Sidebar + TopBar + Outlet + LogPanel
│   │   ├── Sidebar.tsx
│   │   └── TopBar.tsx
│   ├── pages/
│   │   ├── DashboardPage.tsx
│   │   ├── ScriptsPage.tsx       # Reutilizável por categoria
│   │   ├── RestorePointsPage.tsx
│   │   └── SettingsPage.tsx
│   ├── components/
│   │   ├── ScriptCard.tsx
│   │   ├── ScriptCardSkeleton.tsx
│   │   ├── DashboardWidget.tsx
│   │   ├── LogPanel.tsx
│   │   ├── CircuitBackground.tsx
│   │   ├── SearchInput.tsx
│   │   ├── FavoriteButton.tsx
│   │   ├── RestorePointList.tsx
│   │   ├── ScriptDetailDialog.tsx
│   │   └── EditScriptDialog.tsx
│   ├── contexts/
│   │   ├── ScriptContext.tsx
│   │   ├── SystemContext.tsx
│   │   ├── RestorePointContext.tsx
│   │   ├── LogContext.tsx
│   │   └── SettingsContext.tsx
│   ├── hooks/
│   │   ├── use-electron-api.ts   # Tipagem do window.electronAPI
│   │   └── use-debounce.ts
│   ├── lib/
│   │   └── utils.ts              # cn() do shadcn
│   ├── components/ui/            # shadcn/ui components gerados
│   └── styles/
│       └── globals.css           # Tailwind + tema custom
│
├── resources/
│   ├── icon.ico
│   └── scripts.json              # 90+ scripts embutidos
│
├── electron.vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── package.json
└── electron-builder.yml
```

## Dependências npm

```json
{
  "dependencies": {
    "react": "^19",
    "react-dom": "^19",
    "react-router-dom": "^7",
    "class-variance-authority": "^0.7",
    "clsx": "^2",
    "tailwind-merge": "^3",
    "lucide-react": "^0.400",
    "@radix-ui/*": "*",
    "is-admin": "^3",
    "node-wmi": "^3"
  },
  "devDependencies": {
    "electron": "^35",
    "electron-vite": "^3",
    "electron-builder": "^25",
    "@electron-toolkit/preload": "^3",
    "@electron-toolkit/utils": "^3",
    "typescript": "^5",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "tailwindcss": "^4",
    "postcss": "^8",
    "autoprefixer": "^10",
    "vitest": "^3",
    "@testing-library/react": "^16",
    "playwright": "^1"
  }
}
```

## Build

**Portátil (standalone):**
```bash
npm run build            # electron-vite build
npx electron-builder --win portable
# Gera FM.Optimize.Setup.exe portátil
```

**Instalável:**
```bash
npm run build
npx electron-builder --win nsis
# Gera FM.Optimize.Setup.exe instalador
```

Dados salvos:
- Portátil: ao lado do executável
- Instalado: `%APPDATA%\FM Optimize\`
