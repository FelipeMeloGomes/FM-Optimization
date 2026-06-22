# FM Optimize Electron Migration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the FM Optimize WPF/.NET 9 application to Electron + React + TypeScript with shadcn/ui.

**Architecture:** Electron main process (Node.js native) handles system operations (WMI, script execution, admin checks, file I/O) exposed via typed IPC. React renderer handles all UI with React Context for state. Preload script bridges via contextBridge.

**Tech Stack:** Electron 35, React 19, TypeScript 5, Vite 6 (electron-vite), Tailwind CSS 4, shadcn/ui, React Router 7, node-wmi, is-admin

---

### Task 1: Project Scaffolding & Dependencies

**Files:**
- Create: `fm-optimize-electron/package.json`
- Create: `fm-optimize-electron/tsconfig.json`
- Create: `fm-optimize-electron/tsconfig.node.json`
- Create: `fm-optimize-electron/tsconfig.web.json`
- Create: `fm-optimize-electron/electron.vite.config.ts`
- Create: `fm-optimize-electron/tailwind.config.ts`
- Create: `fm-optimize-electron/postcss.config.js`
- Create: `fm-optimize-electron/.gitignore`

- [ ] **Step 1: Create project root and package.json**

Run: `mkdir -p fm-optimize-electron`

```json:fm-optimize-electron/package.json
{
  "name": "fm-optimize",
  "version": "2.0.0",
  "description": "FM Optimize - Windows optimization toolkit",
  "main": "./out/main/index.js",
  "scripts": {
    "dev": "electron-vite dev",
    "build": "electron-vite build",
    "preview": "electron-vite preview",
    "postinstall": "electron-builder install-app-deps",
    "typecheck:node": "tsc --noEmit -p tsconfig.node.json",
    "typecheck:web": "tsc --noEmit -p tsconfig.web.json",
    "typecheck": "npm run typecheck:node && npm run typecheck:web",
    "test": "vitest"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^7.1.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.0.0",
    "lucide-react": "^0.400.0",
    "is-admin": "^3.0.1",
    "node-wmi": "^3.0.2"
  },
  "devDependencies": {
    "electron": "^35.0.0",
    "electron-vite": "^3.0.0",
    "electron-builder": "^25.0.0",
    "@electron-toolkit/preload": "^3.0.0",
    "@electron-toolkit/utils": "^3.0.0",
    "typescript": "^5.7.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@types/node": "^22.0.0",
    "tailwindcss": "^4.0.0",
    "postcss": "^8.5.0",
    "autoprefixer": "^10.4.0",
    "@tailwindcss/vite": "^4.0.0",
    "vitest": "^3.0.0",
    "@testing-library/react": "^16.0.0",
    "jsdom": "^26.0.0",
    "vite": "^6.0.0"
  }
}
```

- [ ] **Step 2: Create tsconfig files**

```json:fm-optimize-electron/tsconfig.json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.node.json" },
    { "path": "./tsconfig.web.json" }
  ]
}
```

```json:fm-optimize-electron/tsconfig.node.json
{
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "target": "ESNext",
    "lib": ["ESNext"],
    "outDir": "./out",
    "rootDir": ".",
    "strict": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "declaration": true
  },
  "include": [
    "electron/**/*.ts",
    "electron.vite.config.ts",
    "tailwind.config.ts",
    "postcss.config.js"
  ]
}
```

```json:fm-optimize-electron/tsconfig.web.json
{
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "target": "ESNext",
    "lib": ["ESNext", "DOM", "DOM.Iterable"],
    "outDir": "./out",
    "rootDir": ".",
    "strict": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "jsx": "react-jsx",
    "declaration": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.tsx",
    "electron/preload/*.ts",
    "electron/shared/*.ts"
  ]
}
```

- [ ] **Step 3: Create electron.vite.config.ts**

```typescript:fm-optimize-electron/electron.vite.config.ts
import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'electron/main/index.ts')
        }
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'electron/preload/index.ts')
        }
      }
    }
  },
  renderer: {
    root: '.',
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'index.html')
        }
      }
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },
    plugins: [react(), tailwindcss()]
  }
})
```

- [ ] **Step 4: Create Tailwind, PostCSS, and .gitignore**

```typescript:fm-optimize-electron/tailwind.config.ts
import type { Config } from 'tailwindcss'

export default {
  content: ['./src/**/*.{ts,tsx}', './index.html'],
  theme: {
    extend: {
      colors: {
        sidebar: {
          bg: '#0d0d14',
          fg: '#f0f0f5',
          primary: '#0044ff',
          accent: '#0033cc',
          border: '#1a1a2e'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      borderRadius: {
        xl: '0.75rem'
      }
    }
  },
  plugins: []
} satisfies Config
```

```javascript:fm-optimize-electron/postcss.config.js
export default {
  plugins: {
    '@tailwindcss/postcss': {}
  }
}
```

```
fm-optimize-electron/.gitignore:
node_modules/
out/
dist/
.DS_Store
*.log
```

- [ ] **Step 5: Create index.html entry**

```html:fm-optimize-electron/index.html
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>FM Optimize</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 6: Install dependencies**

Run: `cd fm-optimize-electron && npm install`

- [ ] **Step 7: Commit**

```bash
git add fm-optimize-electron/package.json fm-optimize-electron/tsconfig.json fm-optimize-electron/tsconfig.node.json fm-optimize-electron/tsconfig.web.json fm-optimize-electron/electron.vite.config.ts fm-optimize-electron/tailwind.config.ts fm-optimize-electron/postcss.config.js fm-optimize-electron/index.html fm-optimize-electron/.gitignore
git commit -m "feat: scaffold electron-react project"
```

---

### Task 2: Shared IPC Types

**Files:**
- Create: `fm-optimize-electron/electron/shared/ipc-types.ts`

- [ ] **Step 1: Create shared types file**

```typescript:fm-optimize-electron/electron/shared/ipc-types.ts
export interface CpuInfo {
  model: string
  cores: number
  logicalProcessors: number
  architecture: string
  usage: number
}

export interface GpuInfo {
  name: string
  vram: string
  driverVersion: string
}

export interface MemoryInfo {
  total: string
  used: string
  free: string
  type: string
  slots: number
}

export interface OsInfo {
  name: string
  version: string
  build: string
  edition: string
  installDate: string
}

export interface StorageDrive {
  letter: string
  label: string
  size: string
  free: string
  type: string
}

export interface DashboardData {
  cpu: CpuInfo
  gpu: GpuInfo
  memory: MemoryInfo
  os: OsInfo
  drives: StorageDrive[]
  uptime: number
}

export interface ScriptEntry {
  id: string
  name: string
  description: string
  category: string
  subcategory: string
  content: string
  extension: 'bat' | 'ps1' | 'reg' | 'exe' | 'cmd'
  requiresAdmin: boolean
  isBuiltIn: boolean
  tags: string[]
}

export interface RestorePointEntry {
  sequenceNumber: number
  description: string
  creationTime: string
  eventType: string
}

export interface AppSettings {
  theme: 'dark' | 'light'
  autoOpenLog: boolean
  confirmOnExecute: boolean
}

export interface ScriptOutput {
  scriptId: string
  type: 'stdout' | 'stderr'
  text: string
}

export interface ScriptEnded {
  id: string
  code: number | null
}

export interface IpcResult<T = void> {
  success: boolean
  data?: T
  error?: string
}

export interface ElectronAPI {
  getSystemInfo(): Promise<DashboardData>
  getScripts(): Promise<ScriptEntry[]>
  getScriptContent(id: string): Promise<string>
  extractScript(id: string): Promise<string>
  executeScript(id: string): Promise<void>
  cancelExecution(id: string): Promise<void>
  getRestorePoints(): Promise<RestorePointEntry[]>
  createRestorePoint(name: string): Promise<void>
  deleteRestorePoint(seq: number): Promise<void>
  isAdmin(): Promise<boolean>
  getSettings(): Promise<AppSettings>
  saveSettings(settings: AppSettings): Promise<void>
  getDataFilePath(): Promise<string>
  onScriptOutput(cb: (data: ScriptOutput) => void): () => void
  onScriptError(cb: (data: ScriptOutput) => void): () => void
  onScriptEnded(cb: (data: ScriptEnded) => void): () => void
}
```

- [ ] **Step 2: Commit**

```bash
git add fm-optimize-electron/electron/shared/ipc-types.ts
git commit -m "feat: add shared IPC types"
```

---

### Task 3: Script Registry JSON Asset

**Files:**
- Create: `fm-optimize-electron/resources/scripts.json`
- Source file to extract from: `FMOptimize/Services/ScriptRegistry.cs`

- [ ] **Step 1: Extract ScriptRegistry.cs source and convert to JSON**

Read `FMOptimize/Services/ScriptRegistry.cs` to extract all 90+ script entries with their properties (id, name, description, category, subcategory, content, extension, requiresAdmin, tags). Write as a JSON file.

Then run this to extract the data:

```bash
# Use the existing ScriptRegistry.cs to generate scripts.json
node -e "
const fs = require('fs');
const content = fs.readFileSync('FMOptimize/Services/ScriptRegistry.cs', 'utf-8');

// Extract all ScriptEntry records from the source
// Each entry follows: new ScriptEntry(\"...\", \"...\", ...)
const entries = [];
const regex = /new ScriptEntry\(([^)]+)\)/g;
let match;
while ((match = regex.exec(content)) !== null) {
  entries.push(match[1]);
}

// Write parsed JSON
const scripts = entries.map((entry, i) => {
  const parts = entry.split(',').map(s => s.trim().replace(/^\"|\"$/g, ''));
  return {
    id: \`script-\${i}\`,
    name: parts[0],
    description: parts[1],
    category: parts[2],
    subcategory: parts[3],
    content: parts[4],
    extension: parts[5],
    requiresAdmin: parts[6] === 'true',
    tags: []
  };
});

fs.writeFileSync('fm-optimize-electron/resources/scripts.json', JSON.stringify(scripts, null, 2));
console.log(\`Extracted \${scripts.length} scripts\`);
"
```

(If the above fails due to the complexity of parsing C# source, manually construct the JSON by copying entries from ScriptRegistry.cs.)

- [ ] **Step 2: Verify scripts.json is valid**

Run: `cd fm-optimize-electron && node -e "const s = require('./resources/scripts.json'); console.log(s.length, 'scripts loaded'); console.log(s[0].name)"`

Expected: prints count and first script name

- [ ] **Step 3: Commit**

```bash
git add fm-optimize-electron/resources/scripts.json
git commit -m "feat: add embedded scripts registry"
```

---

### Task 4: Main Process — ScriptRegistryService

**Files:**
- Create: `fm-optimize-electron/electron/main/services/script-registry.ts`

- [ ] **Step 1: Create ScriptRegistryService**

```typescript:fm-optimize-electron/electron/main/services/script-registry.ts
import { readFileSync, existsSync, writeFileSync } from 'fs'
import { resolve } from 'path'
import { app } from 'electron'
import type { ScriptEntry } from '../../shared/ipc-types'

let scriptsCache: ScriptEntry[] | null = null

function getResourcesPath(): string {
  return app.isPackaged
    ? resolve(process.resourcesPath, 'scripts.json')
    : resolve(__dirname, '../../../resources/scripts.json')
}

export function loadScripts(): ScriptEntry[] {
  if (scriptsCache) return scriptsCache

  const filePath = getResourcesPath()
  const raw = readFileSync(filePath, 'utf-8')
  const entries: ScriptEntry[] = JSON.parse(raw)

  // Assign deterministic IDs
  scriptsCache = entries.map((entry, i) => ({
    ...entry,
    id: entry.id || `builtin-${i}`
  }))

  return scriptsCache
}

export function getScriptById(id: string): ScriptEntry | undefined {
  const scripts = loadScripts()
  return scripts.find((s) => s.id === id)
}

export function getScriptsByCategory(category: string): ScriptEntry[] {
  return loadScripts().filter((s) => s.category === category)
}

export function getScriptContent(id: string): string {
  const script = getScriptById(id)
  if (!script) throw new Error(`Script not found: ${id}`)
  return Buffer.from(script.content, 'base64').toString('utf-8')
}

export function extractScriptToTemp(id: string): string {
  const script = getScriptById(id)
  if (!script) throw new Error(`Script not found: ${id}`)

  const tempDir = resolve(app.getPath('temp'), 'FMOptimize', 'scripts')
  if (!existsSync(tempDir)) {
    import('fs').then((fs) => fs.mkdirSync(tempDir, { recursive: true }))
  }

  const content = getScriptContent(id)
  const filePath = resolve(tempDir, `${script.name}.${script.extension}`)
  writeFileSync(filePath, content, 'utf-8')
  return filePath
}
```

- [ ] **Step 2: Commit**

```bash
git add fm-optimize-electron/electron/main/services/script-registry.ts
git commit -m "feat: add ScriptRegistryService"
```

---

### Task 5: Main Process — SystemInfoService

**Files:**
- Create: `fm-optimize-electron/electron/main/services/system-info.ts`

- [ ] **Step 1: Create SystemInfoService**

```typescript:fm-optimize-electron/electron/main/services/system-info.ts
import { cpus, totalmem, freemem, uptime, version, release, arch, type, hostname } from 'os'
import { execSync } from 'child_process'
import type { DashboardData, CpuInfo, GpuInfo, MemoryInfo, OsInfo, StorageDrive } from '../../shared/ipc-types'

function execPowerShell(script: string): string {
  try {
    return execSync(`powershell.exe -NoProfile -Command "${script.replace(/"/g, '\\"')}"`, {
      encoding: 'utf-8',
      timeout: 10000
    }).trim()
  } catch {
    return ''
  }
}

function formatBytes(bytes: number): string {
  const gb = bytes / (1024 * 1024 * 1024)
  return `${gb.toFixed(1)} GB`
}

function getCpuInfo(): CpuInfo {
  const cpu = cpus()[0]
  const model = cpu?.model || 'Unknown'
  const output = execPowerShell(
    '(Get-CimInstance Win32_Processor | Measure-Object -Property LoadPercentage -Average).Average'
  )
  const usage = output ? Math.round(parseFloat(output)) : 0

  return {
    model,
    cores: cpu ? cpus().length : 0,
    logicalProcessors: cpu ? cpus().length : 0,
    architecture: arch(),
    usage
  }
}

function getGpuInfo(): GpuInfo {
  const output = execPowerShell(
    'Get-CimInstance Win32_VideoController | Select-Object -First 1 Name,@{N="VRAM";E={$_.AdapterRAM/1GB}},DriverVersion | ConvertTo-Json'
  )
  if (!output) return { name: 'N/A', vram: 'N/A', driverVersion: 'N/A' }

  try {
    const parsed = JSON.parse(output)
    return {
      name: parsed.Name || 'N/A',
      vram: parsed.VRAM ? `${Math.round(parsed.VRAM)} GB` : 'N/A',
      driverVersion: parsed.DriverVersion || 'N/A'
    }
  } catch {
    return { name: 'N/A', vram: 'N/A', driverVersion: 'N/A' }
  }
}

function getMemoryInfo(): MemoryInfo {
  const total = totalmem()
  const free = freemem()
  const used = total - free

  const typeOutput = execPowerShell(
    '(Get-CimInstance Win32_PhysicalMemory | Select-Object -First 1).SMBIOSMemoryType'
  )
  const typeMap: Record<string, string> = {
    '20': 'DDR', '21': 'DDR2', '24': 'DDR3', '26': 'DDR4', '34': 'DDR5'
  }
  const memType = typeMap[typeOutput.trim()] || 'Unknown'

  const slotsOutput = execPowerShell(
    '(Get-CimInstance Win32_PhysicalMemory | Measure-Object).Count'
  )
  const slots = slotsOutput ? parseInt(slotsOutput.trim()) : 0

  return {
    total: formatBytes(total),
    used: formatBytes(used),
    free: formatBytes(free),
    type: memType,
    slots
  }
}

function getOsInfo(): OsInfo {
  const output = execPowerShell(
    'Get-CimInstance Win32_OperatingSystem | Select-Object Caption,Version,BuildNumber,InstallDate | ConvertTo-Json'
  )
  let name = `${type()} ${release()}`
  let build = release()
  let edition = version()
  let installDate = ''

  if (output) {
    try {
      const parsed = JSON.parse(output)
      if (parsed.Caption) name = parsed.Caption
      if (parsed.BuildNumber) build = parsed.BuildNumber
      if (parsed.Version) edition = parsed.Version
      if (parsed.InstallDate) installDate = parsed.InstallDate
    } catch { /* use defaults */ }
  }

  return { name, version: release(), build, edition, installDate }
}

function getStorageDrives(): StorageDrive[] {
  const output = execPowerShell(
    'Get-CimInstance Win32_LogicalDisk -Filter "DriveType=3" | Select-Object DeviceID,VolumeName,@{N="Size";E={$_.Size/1GB}},@{N="Free";E={$_.FreeSpace/1GB}},FileSystem | ConvertTo-Json'
  )
  if (!output) return []

  try {
    const parsed = JSON.parse(output)
    const items = Array.isArray(parsed) ? parsed : [parsed]
    return items.map((d: any) => ({
      letter: d.DeviceID || '',
      label: d.VolumeName || '',
      size: d.Size ? `${Math.round(parseFloat(d.Size))} GB` : 'N/A',
      free: d.Free ? `${Math.round(parseFloat(d.Free))} GB` : 'N/A',
      type: d.FileSystem || ''
    }))
  } catch {
    return []
  }
}

export function getSystemInfo(): DashboardData {
  return {
    cpu: getCpuInfo(),
    gpu: getGpuInfo(),
    memory: getMemoryInfo(),
    os: getOsInfo(),
    drives: getStorageDrives(),
    uptime: Math.floor(uptime())
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add fm-optimize-electron/electron/main/services/system-info.ts
git commit -m "feat: add SystemInfoService"
```

---

### Task 6: Main Process — ScriptExecutionService

**Files:**
- Create: `fm-optimize-electron/electron/main/services/script-executor.ts`

- [ ] **Step 1: Create ScriptExecutionService**

```typescript:fm-optimize-electron/electron/main/services/script-executor.ts
import { spawn, ChildProcess } from 'child_process'
import { BrowserWindow } from 'electron'
import { extractScriptToTemp } from './script-registry'
import type { ScriptOutput, ScriptEnded } from '../../shared/ipc-types'

const activeProcesses = new Map<string, ChildProcess>()

function sendOutput(win: BrowserWindow, data: ScriptOutput): void {
  if (!win.isDestroyed()) {
    win.webContents.send('script-output', JSON.stringify(data))
  }
}

function sendEnded(win: BrowserWindow, data: ScriptEnded): void {
  if (!win.isDestroyed()) {
    win.webContents.send('script-ended', JSON.stringify(data))
  }
}

export function executeScript(id: string): void {
  const win = BrowserWindow.getFocusedWindow()
  if (!win) return

  const filePath = extractScriptToTemp(id)
  const ext = filePath.split('.').pop()?.toLowerCase()

  const { command, args } = getCommand(ext, filePath)
  const proc = spawn(command, args, {
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe']
  })

  activeProcesses.set(id, proc)

  proc.stdout?.on('data', (data: Buffer) => {
    sendOutput(win, { scriptId: id, type: 'stdout', text: data.toString() })
  })

  proc.stderr?.on('data', (data: Buffer) => {
    sendOutput(win, { scriptId: id, type: 'stderr', text: data.toString() })
  })

  proc.on('close', (code) => {
    activeProcesses.delete(id)
    sendEnded(win, { id, code })
  })

  proc.on('error', (err) => {
    activeProcesses.delete(id)
    sendOutput(win, { scriptId: id, type: 'stderr', text: `Error: ${err.message}\n` })
    sendEnded(win, { id, code: -1 })
  })
}

export function cancelExecution(id: string): void {
  const proc = activeProcesses.get(id)
  if (proc) {
    try {
      process.kill(-proc.pid!, 'SIGTERM')
    } catch {
      try { proc.kill('SIGTERM') } catch { /* already dead */ }
    }
    activeProcesses.delete(id)
  }
}

function getCommand(ext: string | undefined, filePath: string): { command: string; args: string[] } {
  switch (ext) {
    case 'bat':
    case 'cmd':
      return { command: 'cmd.exe', args: ['/c', filePath] }
    case 'ps1':
      return {
        command: 'powershell.exe',
        args: ['-ExecutionPolicy', 'Bypass', '-File', filePath]
      }
    case 'reg':
      return { command: 'regedit.exe', args: ['/s', filePath] }
    case 'exe':
      return { command: filePath, args: [] }
    default:
      return { command: 'cmd.exe', args: ['/c', filePath] }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add fm-optimize-electron/electron/main/services/script-executor.ts
git commit -m "feat: add ScriptExecutionService"
```

---

### Task 7: Main Process — RestorePointService

**Files:**
- Create: `fm-optimize-electron/electron/main/services/restore-points.ts`

- [ ] **Step 1: Create RestorePointService**

```typescript:fm-optimize-electron/electron/main/services/restore-points.ts
import { execSync } from 'child_process'
import type { RestorePointEntry } from '../../shared/ipc-types'

function execPowerShell(script: string): string {
  try {
    return execSync(`powershell.exe -NoProfile -Command "${script.replace(/"/g, '\\"')}"`, {
      encoding: 'utf-8',
      timeout: 30000
    }).trim()
  } catch (e: any) {
    throw new Error(e.stderr || e.message)
  }
}

export function getRestorePoints(): RestorePointEntry[] {
  const output = execPowerShell(
    'Get-ComputerRestorePoint | Select-Object SequenceNumber,Description,CreationTime,EventType | ConvertTo-Json'
  )
  if (!output || output === 'null') return []

  try {
    const parsed = JSON.parse(output)
    const items = Array.isArray(parsed) ? parsed : [parsed]
    return items.map((rp: any) => ({
      sequenceNumber: rp.SequenceNumber,
      description: rp.Description,
      creationTime: rp.CreationTime,
      eventType: ['Application Install', 'Application Uninstall', 'Modify Settings', 'Scheduled', 'Manual'][rp.EventType - 1] || 'Unknown'
    }))
  } catch {
    return []
  }
}

export function createRestorePoint(name: string): void {
  execPowerShell(`Checkpoint-Computer -Description "${name.replace(/"/g, '\\"')}" -RestorePointType MODIFY_SETTINGS`)
}

export function deleteRestorePoint(seq: number): void {
  execPowerShell(
    `Get-ComputerRestorePoint | Where-Object { $_.SequenceNumber -eq ${seq} } | ForEach-Object { ` +
    'Remove-Item -Path "HKLM:\\System\\ControlSet001\\Control\\BackupRestore\\Points\\$($_.SequenceNumber)_$($_.CreationTime)" -Force -ErrorAction SilentlyContinue }'
  )
}

export function restoreSystem(seq: number): void {
  execPowerShell(`Restore-Computer -RestorePoint ${seq} -Confirm:$false`)
}
```

- [ ] **Step 2: Commit**

```bash
git add fm-optimize-electron/electron/main/services/restore-points.ts
git commit -m "feat: add RestorePointService"
```

---

### Task 8: Main Process — DataService

**Files:**
- Create: `fm-optimize-electron/electron/main/services/data-service.ts`

- [ ] **Step 1: Create DataService**

```typescript:fm-optimize-electron/electron/main/services/data-service.ts
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { app } from 'electron'
import type { AppSettings } from '../../shared/ipc-types'

interface UserData {
  favorites: string[]
  customScripts: Array<{ name: string; content: string; extension: string }>
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  autoOpenLog: true,
  confirmOnExecute: true
}

function getDataDir(): string {
  return app.isPackaged
    ? resolve(app.getPath('appData'), 'FMOptimize')
    : resolve(__dirname, '../../../data')
}

function getDataFilePath(): string {
  const dir = getDataDir()
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  return resolve(dir, 'scripts_data.json')
}

function getSettingsFilePath(): string {
  const dir = getDataDir()
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  return resolve(dir, 'settings.json')
}

export function getDataFilePathForRenderer(): string {
  return getDataFilePath()
}

export function loadUserData(): UserData {
  const filePath = getDataFilePath()
  if (!existsSync(filePath)) return { favorites: [], customScripts: [] }

  try {
    const raw = readFileSync(filePath, 'utf-8')
    return JSON.parse(raw)
  } catch {
    // Backup corrupted file
    copyFileSync(filePath, `${filePath}.bak`)
    return { favorites: [], customScripts: [] }
  }
}

export function saveUserData(data: UserData): void {
  const filePath = getDataFilePath()
  writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
}

export function loadSettings(): AppSettings {
  const filePath = getSettingsFilePath()
  if (!existsSync(filePath)) return DEFAULT_SETTINGS

  try {
    const raw = readFileSync(filePath, 'utf-8')
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: AppSettings): void {
  const filePath = getSettingsFilePath()
  writeFileSync(filePath, JSON.stringify(settings, null, 2), 'utf-8')
}
```

- [ ] **Step 2: Commit**

```bash
git add fm-optimize-electron/electron/main/services/data-service.ts
git commit -m "feat: add DataService"
```

---

### Task 9: Main Process — IPC Handlers

**Files:**
- Create: `fm-optimize-electron/electron/main/ipc-handlers.ts`

- [ ] **Step 1: Create IPC handlers**

```typescript:fm-optimize-electron/electron/main/ipc-handlers.ts
import { ipcMain, BrowserWindow } from 'electron'
import { loadScripts, getScriptById, getScriptContent } from './services/script-registry'
import { getSystemInfo } from './services/system-info'
import { executeScript, cancelExecution } from './services/script-executor'
import { getRestorePoints, createRestorePoint, deleteRestorePoint, restoreSystem } from './services/restore-points'
import { loadSettings, saveSettings, loadUserData, saveUserData, getDataFilePathForRenderer } from './services/data-service'
import { isAdmin } from './services/admin-check'
import type { IpcResult } from '../shared/ipc-types'

export function registerIpcHandlers(): void {
  ipcMain.handle('get-system-info', async (): Promise<IpcResult> => {
    try {
      return { success: true, data: getSystemInfo() }
    } catch (e: any) {
      return { success: false, error: e.message }
    }
  })

  ipcMain.handle('get-scripts', async (): Promise<IpcResult> => {
    try {
      return { success: true, data: loadScripts() }
    } catch (e: any) {
      return { success: false, error: e.message }
    }
  })

  ipcMain.handle('get-script-content', async (_e, id: string): Promise<IpcResult> => {
    try {
      return { success: true, data: getScriptContent(id) }
    } catch (e: any) {
      return { success: false, error: e.message }
    }
  })

  ipcMain.handle('execute-script', async (_e, id: string): Promise<IpcResult> => {
    try {
      executeScript(id)
      return { success: true }
    } catch (e: any) {
      return { success: false, error: e.message }
    }
  })

  ipcMain.handle('cancel-execution', async (_e, id: string): Promise<IpcResult> => {
    try {
      cancelExecution(id)
      return { success: true }
    } catch (e: any) {
      return { success: false, error: e.message }
    }
  })

  ipcMain.handle('get-restore-points', async (): Promise<IpcResult> => {
    try {
      return { success: true, data: getRestorePoints() }
    } catch (e: any) {
      return { success: false, error: e.message }
    }
  })

  ipcMain.handle('create-restore-point', async (_e, name: string): Promise<IpcResult> => {
    try {
      createRestorePoint(name)
      return { success: true }
    } catch (e: any) {
      return { success: false, error: e.message }
    }
  })

  ipcMain.handle('delete-restore-point', async (_e, seq: number): Promise<IpcResult> => {
    try {
      deleteRestorePoint(seq)
      return { success: true }
    } catch (e: any) {
      return { success: false, error: e.message }
    }
  })

  ipcMain.handle('is-admin', async (): Promise<IpcResult> => {
    try {
      return { success: true, data: isAdmin() }
    } catch (e: any) {
      return { success: false, error: e.message }
    }
  })

  ipcMain.handle('get-settings', async (): Promise<IpcResult> => {
    try {
      return { success: true, data: loadSettings() }
    } catch (e: any) {
      return { success: false, error: e.message }
    }
  })

  ipcMain.handle('save-settings', async (_e, settings): Promise<IpcResult> => {
    try {
      saveSettings(settings)
      return { success: true }
    } catch (e: any) {
      return { success: false, error: e.message }
    }
  })

  ipcMain.handle('get-data-file-path', async (): Promise<IpcResult> => {
    try {
      return { success: true, data: getDataFilePathForRenderer() }
    } catch (e: any) {
      return { success: false, error: e.message }
    }
  })
}
```

- [ ] **Step 2: Commit**

```bash
git add fm-optimize-electron/electron/main/ipc-handlers.ts
git commit -m "feat: add IPC handlers"
```

---

### Task 10: Main Process — Admin Check

**Files:**
- Create: `fm-optimize-electron/electron/main/services/admin-check.ts`

- [ ] **Step 1: Create admin check**

```typescript:fm-optimize-electron/electron/main/services/admin-check.ts
export function isAdmin(): boolean {
  try {
    const { execSync } = require('child_process')
    execSync('net session', { timeout: 3000 })
    return true
  } catch {
    return false
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add fm-optimize-electron/electron/main/services/admin-check.ts
git commit -m "feat: add admin check service"
```

---

### Task 11: Main Process Entry & Preload

**Files:**
- Create: `fm-optimize-electron/electron/main/index.ts`
- Create: `fm-optimize-electron/electron/preload/index.ts`

- [ ] **Step 1: Create main process entry**

```typescript:fm-optimize-electron/electron/main/index.ts
import { app, BrowserWindow, shell } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { registerIpcHandlers } from './ipc-handlers'

let mainWindow: BrowserWindow | null = null

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 600,
    show: false,
    title: 'FM Optimize',
    icon: join(__dirname, '../../resources/icon.ico'),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.fmoptimize')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  registerIpcHandlers()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
```

- [ ] **Step 2: Create preload script**

```typescript:fm-optimize-electron/electron/preload/index.ts
import { contextBridge, ipcRenderer } from 'electron'
import type { ElectronAPI, ScriptOutput, ScriptEnded } from '../shared/ipc-types'

const electronAPI: ElectronAPI = {
  getSystemInfo: () => ipcRenderer.invoke('get-system-info').then((r: any) => r.success ? r.data : Promise.reject(r.error)),
  getScripts: () => ipcRenderer.invoke('get-scripts').then((r: any) => r.success ? r.data : Promise.reject(r.error)),
  getScriptContent: (id) => ipcRenderer.invoke('get-script-content', id).then((r: any) => r.success ? r.data : Promise.reject(r.error)),
  extractScript: (id) => ipcRenderer.invoke('extract-script', id).then((r: any) => r.success ? r.data : Promise.reject(r.error)),
  executeScript: (id) => ipcRenderer.invoke('execute-script', id).then((r: any) => { if (!r.success) throw new Error(r.error) }),
  cancelExecution: (id) => ipcRenderer.invoke('cancel-execution', id).then((r: any) => { if (!r.success) throw new Error(r.error) }),
  getRestorePoints: () => ipcRenderer.invoke('get-restore-points').then((r: any) => r.success ? r.data : Promise.reject(r.error)),
  createRestorePoint: (name) => ipcRenderer.invoke('create-restore-point', name).then((r: any) => { if (!r.success) throw new Error(r.error) }),
  deleteRestorePoint: (seq) => ipcRenderer.invoke('delete-restore-point', seq).then((r: any) => { if (!r.success) throw new Error(r.error) }),
  isAdmin: () => ipcRenderer.invoke('is-admin').then((r: any) => r.success ? r.data : Promise.reject(r.error)),
  getSettings: () => ipcRenderer.invoke('get-settings').then((r: any) => r.success ? r.data : Promise.reject(r.error)),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings).then((r: any) => { if (!r.success) throw new Error(r.error) }),
  getDataFilePath: () => ipcRenderer.invoke('get-data-file-path').then((r: any) => r.success ? r.data : Promise.reject(r.error)),
  onScriptOutput: (cb: (data: ScriptOutput) => void) => {
    const listener = (_e: any, raw: string) => cb(JSON.parse(raw))
    ipcRenderer.on('script-output', listener)
    return () => ipcRenderer.removeListener('script-output', listener)
  },
  onScriptError: (cb: (data: ScriptOutput) => void) => {
    const listener = (_e: any, raw: string) => cb(JSON.parse(raw))
    ipcRenderer.on('script-error', listener)
    return () => ipcRenderer.removeListener('script-error', listener)
  },
  onScriptEnded: (cb: (data: ScriptEnded) => void) => {
    const listener = (_e: any, raw: string) => cb(JSON.parse(raw))
    ipcRenderer.on('script-ended', listener)
    return () => ipcRenderer.removeListener('script-ended', listener)
  }
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)
```

- [ ] **Step 3: Commit**

```bash
git add fm-optimize-electron/electron/main/index.ts fm-optimize-electron/electron/preload/index.ts
git commit -m "feat: add main process entry and preload"
```

---

### Task 12: Renderer Foundation — Tailwind, Theme, shadcn/ui

**Files:**
- Create: `fm-optimize-electron/src/styles/globals.css`
- Create: `fm-optimize-electron/src/lib/utils.ts`
- Create: `fm-optimize-electron/components.json` (shadcn config)

- [ ] **Step 1: Create global CSS with Tailwind + dark neon theme**

```css:fm-optimize-electron/src/styles/globals.css
@import "tailwindcss";

@theme {
  --color-background: #0a0a0f;
  --color-foreground: #f0f0f5;
  --color-card: #12121a;
  --color-card-foreground: #f0f0f5;
  --color-popover: #12121a;
  --color-popover-foreground: #f0f0f5;
  --color-primary: #0044ff;
  --color-primary-foreground: #ffffff;
  --color-secondary: #1a1a2e;
  --color-secondary-foreground: #f0f0f5;
  --color-muted: #1f1f2e;
  --color-muted-foreground: #8888aa;
  --color-accent: #0033cc;
  --color-accent-foreground: #ffffff;
  --color-destructive: #ff3355;
  --color-destructive-foreground: #ffffff;
  --color-border: #1a1a2e;
  --color-input: #1a1a2e;
  --color-ring: #0044ff;
  --color-sidebar-background: #0d0d14;
  --color-sidebar-foreground: #f0f0f5;
  --color-sidebar-primary: #0044ff;
  --color-sidebar-accent: #0033cc;
  --color-sidebar-border: #1a1a2e;

  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  --radius: 0.75rem;
}

* {
  border-color: var(--color-border);
}

body {
  background-color: var(--color-background);
  color: var(--color-foreground);
  font-family: var(--font-sans);
  margin: 0;
  -webkit-font-smoothing: antialiased;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: var(--color-background);
}
::-webkit-scrollbar-thumb {
  background: var(--color-muted);
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: var(--color-muted-foreground);
}
```

- [ ] **Step 2: Create utils.ts (cn helper)**

```typescript:fm-optimize-electron/src/lib/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 3: Commit**

```bash
git add fm-optimize-electron/src/styles/globals.css fm-optimize-electron/src/lib/utils.ts
git commit -m "feat: add Tailwind theme and cn utility"
```

---

### Task 13: React Entry, App Shell & Routing

**Files:**
- Create: `fm-optimize-electron/src/main.tsx`
- Create: `fm-optimize-electron/src/App.tsx`
- Create: `fm-optimize-electron/src/layout/AppLayout.tsx`
- Create: `fm-optimize-electron/src/layout/Sidebar.tsx`
- Create: `fm-optimize-electron/src/layout/TopBar.tsx`
- Create: `fm-optimize-electron/src/hooks/use-electron-api.ts`
- Create: `fm-optimize-electron/src/vite-env.d.ts`

- [ ] **Step 1: Create React entry point**

```typescript:fm-optimize-electron/src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
```

- [ ] **Step 2: Create electronAPI type declaration**

```typescript:fm-optimize-electron/src/vite-env.d.ts
/// <reference types="vite/client" />

import type { ElectronAPI } from '../electron/shared/ipc-types'

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
```

- [ ] **Step 3: Create use-electron-api hook**

```typescript:fm-optimize-electron/src/hooks/use-electron-api.ts
export function useElectronAPI() {
  return window.electronAPI
}
```

- [ ] **Step 4: Create App with placeholder routes**

```typescript:fm-optimize-electron/src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './layout/AppLayout'
import { ScriptProvider } from './contexts/ScriptContext'
import { SystemProvider } from './contexts/SystemContext'
import { RestorePointProvider } from './contexts/RestorePointContext'
import { LogProvider } from './contexts/LogContext'
import { SettingsProvider } from './contexts/SettingsContext'
import DashboardPage from './pages/DashboardPage'
import ScriptsPage from './pages/ScriptsPage'
import RestorePointsPage from './pages/RestorePointsPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  return (
    <SettingsProvider>
      <SystemProvider>
        <ScriptProvider>
          <LogProvider>
            <RestorePointProvider>
              <Routes>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/tweaks" element={<ScriptsPage category="Tweaks / Desempenho" />} />
                  <Route path="/utilities" element={<ScriptsPage category="Sistema / Utilities" />} />
                  <Route path="/cleaner" element={<ScriptsPage category="Cleaner" />} />
                  <Route path="/restore-points" element={<RestorePointsPage />} />
                  <Route path="/dns" element={<ScriptsPage category="Rede / Internet" />} />
                  <Route path="/apps" element={<ScriptsPage category="Privacidade / Apps" />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Routes>
            </RestorePointProvider>
          </LogProvider>
        </ScriptProvider>
      </SystemProvider>
    </SettingsProvider>
  )
}
```

- [ ] **Step 5: Create AppLayout**

```typescript:fm-optimize-electron/src/layout/AppLayout.tsx
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { LogPanel } from '../components/LogPanel'

export function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
        <LogPanel />
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Create Sidebar**

```typescript:fm-optimize-electron/src/layout/Sidebar.tsx
import { NavLink } from 'react-router-dom'
import { cn } from '../lib/utils'
import {
  LayoutDashboard,
  Gauge,
  Wrench,
  Eraser,
  Shield,
  Globe,
  Smartphone,
  Settings
} from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tweaks', icon: Gauge, label: 'Tweaks' },
  { to: '/utilities', icon: Wrench, label: 'Utilities' },
  { to: '/cleaner', icon: Eraser, label: 'Cleaner' },
  { to: '/restore-points', icon: Shield, label: 'Restore Points' },
  { to: '/dns', icon: Globe, label: 'DNS' },
  { to: '/apps', icon: Smartphone, label: 'Apps' },
  { to: '/settings', icon: Settings, label: 'Settings' }
]

export function Sidebar() {
  return (
    <aside className="flex w-16 flex-col items-center gap-2 border-r border-border bg-sidebar-background py-4">
      <div className="mb-4 text-primary text-xl font-bold">FM</div>
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
                isActive
                  ? 'bg-primary/20 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )
            }
            title={item.label}
          >
            <item.icon className="h-5 w-5" />
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
```

- [ ] **Step 7: Create TopBar**

```typescript:fm-optimize-electron/src/layout/TopBar.tsx
import { useLocation } from 'react-router-dom'
import { SearchInput } from '../components/SearchInput'

const routeTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/tweaks': 'Tweaks / Desempenho',
  '/utilities': 'Utilities',
  '/cleaner': 'Cleaner',
  '/restore-points': 'Restore Points',
  '/dns': 'DNS Manager',
  '/apps': 'Apps & Privacy',
  '/settings': 'Settings'
}

export function TopBar() {
  const location = useLocation()
  const title = routeTitles[location.pathname] || 'FM Optimize'
  const isDashboard = location.pathname === '/'

  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
      <h1 className="text-lg font-semibold">{title}</h1>
      {!isDashboard && <SearchInput />}
    </header>
  )
}
```

- [ ] **Step 8: Create SearchInput placeholder**

```typescript:fm-optimize-electron/src/components/SearchInput.tsx
import { Search, X } from 'lucide-react'
import { useScriptContext } from '../contexts/ScriptContext'

export function SearchInput() {
  const { search, setSearch } = useScriptContext()

  return (
    <div className="relative flex items-center">
      <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar scripts..."
        className="h-9 w-64 rounded-lg border border-input bg-background pl-9 pr-8 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
      />
      {search && (
        <button onClick={() => setSearch('')} className="absolute right-2">
          <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 9: Commit**

```bash
git add fm-optimize-electron/src/main.tsx fm-optimize-electron/src/App.tsx fm-optimize-electron/src/layout/AppLayout.tsx fm-optimize-electron/src/layout/Sidebar.tsx fm-optimize-electron/src/layout/TopBar.tsx fm-optimize-electron/src/hooks/use-electron-api.ts fm-optimize-electron/src/vite-env.d.ts fm-optimize-electron/src/components/SearchInput.tsx
git commit -m "feat: add React entry, layout, sidebar, topbar"
```

---

### Task 14: Context Providers

**Files:**
- Create: `fm-optimize-electron/src/contexts/ScriptContext.tsx`
- Create: `fm-optimize-electron/src/contexts/SystemContext.tsx`
- Create: `fm-optimize-electron/src/contexts/RestorePointContext.tsx`
- Create: `fm-optimize-electron/src/contexts/LogContext.tsx`
- Create: `fm-optimize-electron/src/contexts/SettingsContext.tsx`

- [ ] **Step 1: Create ScriptContext**

```typescript:fm-optimize-electron/src/contexts/ScriptContext.tsx
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { ScriptEntry } from '../../electron/shared/ipc-types'

interface ScriptContextValue {
  scripts: ScriptEntry[]
  filteredScripts: ScriptEntry[]
  favorites: string[]
  activeExecution: string | null
  search: string
  categoryFilter: string
  loading: boolean
  error: string | null
  setSearch: (s: string) => void
  setCategoryFilter: (c: string) => void
  toggleFavorite: (id: string) => void
  showFavoritesOnly: boolean
  setShowFavoritesOnly: (v: boolean) => void
  execute: (id: string) => Promise<void>
  cancel: (id: string) => Promise<void>
}

const ScriptContext = createContext<ScriptContextValue | null>(null)

export function ScriptProvider({ children }: { children: ReactNode }) {
  const [scripts, setScripts] = useState<ScriptEntry[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [activeExecution, setActiveExecution] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    window.electronAPI
      .getScripts()
      .then(setScripts)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const filteredScripts = scripts.filter((s) => {
    if (showFavoritesOnly && !favorites.includes(s.id)) return false
    if (categoryFilter && s.category !== categoryFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q))
      )
    }
    return true
  })

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
      return next
    })
  }, [])

  const execute = useCallback(async (id: string) => {
    setActiveExecution(id)
    try {
      await window.electronAPI.executeScript(id)
    } finally {
      setActiveExecution(null)
    }
  }, [])

  const cancel = useCallback(async (id: string) => {
    await window.electronAPI.cancelExecution(id)
    setActiveExecution(null)
  }, [])

  return (
    <ScriptContext.Provider
      value={{
        scripts,
        filteredScripts,
        favorites,
        activeExecution,
        search,
        categoryFilter,
        loading,
        error,
        setSearch,
        setCategoryFilter,
        toggleFavorite,
        showFavoritesOnly,
        setShowFavoritesOnly,
        execute,
        cancel
      }}
    >
      {children}
    </ScriptContext.Provider>
  )
}

export function useScriptContext(): ScriptContextValue {
  const ctx = useContext(ScriptContext)
  if (!ctx) throw new Error('useScriptContext must be used within ScriptProvider')
  return ctx
}
```

- [ ] **Step 2: Create SystemContext**

```typescript:fm-optimize-electron/src/contexts/SystemContext.tsx
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { DashboardData } from '../../electron/shared/ipc-types'

interface SystemContextValue {
  data: DashboardData | null
  loading: boolean
  error: string | null
  refresh: () => void
}

const SystemContext = createContext<SystemContextValue | null>(null)

export function SystemProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(() => {
    setLoading(true)
    setError(null)
    window.electronAPI
      .getSystemInfo()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return (
    <SystemContext.Provider value={{ data, loading, error, refresh }}>
      {children}
    </SystemContext.Provider>
  )
}

export function useSystemContext(): SystemContextValue {
  const ctx = useContext(SystemContext)
  if (!ctx) throw new Error('useSystemContext must be used within SystemProvider')
  return ctx
}
```

- [ ] **Step 3: Create RestorePointContext**

```typescript:fm-optimize-electron/src/contexts/RestorePointContext.tsx
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { RestorePointEntry } from '../../electron/shared/ipc-types'

interface RestorePointContextValue {
  restorePoints: RestorePointEntry[]
  loading: boolean
  error: string | null
  creating: boolean
  refresh: () => void
  create: (name: string) => Promise<void>
  remove: (seq: number) => Promise<void>
}

const RestorePointContext = createContext<RestorePointContextValue | null>(null)

export function RestorePointProvider({ children }: { children: ReactNode }) {
  const [restorePoints, setRestorePoints] = useState<RestorePointEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const refresh = useCallback(() => {
    setLoading(true)
    setError(null)
    window.electronAPI
      .getRestorePoints()
      .then(setRestorePoints)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const create = useCallback(async (name: string) => {
    setCreating(true)
    try {
      await window.electronAPI.createRestorePoint(name)
      await refresh()
    } finally {
      setCreating(false)
    }
  }, [refresh])

  const remove = useCallback(async (seq: number) => {
    await window.electronAPI.deleteRestorePoint(seq)
    await refresh()
  }, [refresh])

  useEffect(() => { refresh() }, [refresh])

  return (
    <RestorePointContext.Provider value={{ restorePoints, loading, error, creating, refresh, create, remove }}>
      {children}
    </RestorePointContext.Provider>
  )
}

export function useRestorePointContext(): RestorePointContextValue {
  const ctx = useContext(RestorePointContext)
  if (!ctx) throw new Error('useRestorePointContext must be used within RestorePointProvider')
  return ctx
}
```

- [ ] **Step 4: Create LogContext**

```typescript:fm-optimize-electron/src/contexts/LogContext.tsx
import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react'

export interface LogEntry {
  id: string
  text: string
  level: 'info' | 'start' | 'end' | 'error' | 'warn'
  timestamp: Date
}

interface LogContextValue {
  entries: LogEntry[]
  addEntry: (text: string, level?: LogEntry['level']) => void
  clear: () => void
}

const LogContext = createContext<LogContextValue | null>(null)
let logCounter = 0

export function LogProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<LogEntry[]>([])
  const cleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    const unsubOutput = window.electronAPI.onScriptOutput((data) => {
      addEntry(data.text, 'info')
    })
    const unsubError = window.electronAPI.onScriptError((data) => {
      addEntry(data.text, 'error')
    })
    const unsubEnded = window.electronAPI.onScriptEnded((data) => {
      addEntry(`Script finalizado (código: ${data.code})`, data.code === 0 ? 'end' : 'error')
    })

    return () => {
      unsubOutput()
      unsubError()
      unsubEnded()
    }
  }, [])

  const addEntry = useCallback((text: string, level: LogEntry['level'] = 'info') => {
    const entry: LogEntry = { id: `log-${++logCounter}`, text, level, timestamp: new Date() }
    setEntries((prev) => [...prev, entry])
  }, [])

  const clear = useCallback(() => setEntries([]), [])

  return (
    <LogContext.Provider value={{ entries, addEntry, clear }}>
      {children}
    </LogContext.Provider>
  )
}

export function useLogContext(): LogContextValue {
  const ctx = useContext(LogContext)
  if (!ctx) throw new Error('useLogContext must be used within LogProvider')
  return ctx
}
```

- [ ] **Step 5: Create SettingsContext**

```typescript:fm-optimize-electron/src/contexts/SettingsContext.tsx
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { AppSettings } from '../../electron/shared/ipc-types'

interface SettingsContextValue {
  settings: AppSettings
  update: (partial: Partial<AppSettings>) => void
  loading: boolean
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

const DEFAULT: AppSettings = { theme: 'dark', autoOpenLog: true, confirmOnExecute: true }

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.electronAPI.getSettings().then(setSettings).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const update = useCallback((partial: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial }
      window.electronAPI.saveSettings(next).catch(() => {})
      return next
    })
  }, [])

  return (
    <SettingsContext.Provider value={{ settings, update, loading }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettingsContext(): SettingsContextValue {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettingsContext must be used within SettingsProvider')
  return ctx
}
```

- [ ] **Step 6: Commit**

```bash
git add fm-optimize-electron/src/contexts/
git commit -m "feat: add all context providers"
```

---

### Task 15: UI Components — ScriptCard, LogPanel, DashboardWidget

**Files:**
- Create: `fm-optimize-electron/src/components/ScriptCard.tsx`
- Create: `fm-optimize-electron/src/components/ScriptCardSkeleton.tsx`
- Create: `fm-optimize-electron/src/components/DashboardWidget.tsx`
- Create: `fm-optimize-electron/src/components/LogPanel.tsx`
- Create: `fm-optimize-electron/src/components/FavoriteButton.tsx`

- [ ] **Step 1: Create ScriptCard**

```typescript:fm-optimize-electron/src/components/ScriptCard.tsx
import { Play, Square, Terminal, Flag, ShieldAlert } from 'lucide-react'
import { cn } from '../lib/utils'
import { FavoriteButton } from './FavoriteButton'
import type { ScriptEntry } from '../../electron/shared/ipc-types'

interface ScriptCardProps {
  script: ScriptEntry
  isFavorite: boolean
  isExecuting: boolean
  onExecute: () => void
  onCancel: () => void
  onToggleFavorite: () => void
}

export function ScriptCard({
  script,
  isFavorite,
  isExecuting,
  onExecute,
  onCancel,
  onToggleFavorite
}: ScriptCardProps) {
  return (
    <div className="group relative flex flex-col rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-[0_0_12px_rgba(0,68,255,0.15)]">
      <div className="mb-2 flex items-start justify-between">
        <h3 className="font-medium text-sm text-foreground line-clamp-2">{script.name}</h3>
        <FavoriteButton isFavorite={isFavorite} onClick={onToggleFavorite} />
      </div>

      <p className="mb-3 text-xs text-muted-foreground line-clamp-2">{script.description}</p>

      <div className="mb-3 flex flex-wrap gap-1">
        <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[10px] text-muted-foreground font-mono">
          <Terminal className="h-3 w-3" />
          .{script.extension}
        </span>
        {script.requiresAdmin && (
          <span className="inline-flex items-center gap-1 rounded-md bg-destructive/10 px-2 py-0.5 text-[10px] text-destructive font-mono">
            <ShieldAlert className="h-3 w-3" />
            Admin
          </span>
        )}
      </div>

      <div className="mt-auto flex gap-2">
        {isExecuting ? (
          <button
            onClick={onCancel}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground transition-colors hover:bg-destructive/90"
          >
            <Square className="h-3.5 w-3.5" />
            Cancelar
          </button>
        ) : (
          <button
            onClick={onExecute}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Play className="h-3.5 w-3.5" />
            Executar
          </button>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create ScriptCardSkeleton**

```typescript:fm-optimize-electron/src/components/ScriptCardSkeleton.tsx
export function ScriptCardSkeleton() {
  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-4 animate-pulse">
      <div className="mb-2 h-4 w-3/4 rounded bg-muted" />
      <div className="mb-3 h-3 w-full rounded bg-muted" />
      <div className="mb-3 h-3 w-1/2 rounded bg-muted" />
      <div className="mt-auto flex gap-2">
        <div className="h-7 w-20 rounded-lg bg-muted" />
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create DashboardWidget**

```typescript:fm-optimize-electron/src/components/DashboardWidget.tsx
import { cn } from '../lib/utils'
import type { LucideIcon } from 'lucide-react'

interface DashboardWidgetProps {
  icon: LucideIcon
  label: string
  value: string
  detail?: string
  className?: string
}

export function DashboardWidget({ icon: Icon, label, value, detail, className }: DashboardWidgetProps) {
  return (
    <div className={cn('rounded-xl border border-border bg-card p-4', className)}>
      <div className="mb-2 flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span className="text-xs uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-lg font-semibold text-foreground">{value || '—'}</div>
      {detail && <div className="mt-1 text-xs text-muted-foreground">{detail}</div>}
    </div>
  )
}
```

- [ ] **Step 4: Create FavoriteButton**

```typescript:fm-optimize-electron/src/components/FavoriteButton.tsx
import { Star } from 'lucide-react'
import { cn } from '../lib/utils'

interface FavoriteButtonProps {
  isFavorite: boolean
  onClick: () => void
}

export function FavoriteButton({ isFavorite, onClick }: FavoriteButtonProps) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick() }}
      className="text-muted-foreground hover:text-yellow-400 transition-colors"
    >
      <Star className={cn('h-4 w-4', isFavorite && 'fill-yellow-400 text-yellow-400')} />
    </button>
  )
}
```

- [ ] **Step 5: Create LogPanel**

```typescript:fm-optimize-electron/src/components/LogPanel.tsx
import { useEffect, useRef, useState } from 'react'
import { Terminal, Copy, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { useLogContext, type LogEntry } from '../contexts/LogContext'
import { cn } from '../lib/utils'

export function LogPanel() {
  const { entries, clear } = useLogContext()
  const [isOpen, setIsOpen] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [entries])

  const copyLog = () => {
    const text = entries.map((e) => `[${e.timestamp.toLocaleTimeString()}] [${e.level}] ${e.text}`).join('\n')
    navigator.clipboard.writeText(text)
  }

  const logColors: Record<LogEntry['level'], string> = {
    info: 'text-foreground',
    start: 'text-primary',
    end: 'text-green-400',
    error: 'text-destructive',
    warn: 'text-yellow-400'
  }

  return (
    <div className="border-t border-border">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between bg-card px-4 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <span className="flex items-center gap-2">
          <Terminal className="h-3.5 w-3.5" />
          Log ({entries.length})
        </span>
        {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
      </button>

      {isOpen && (
        <div
          ref={scrollRef}
          className="h-40 overflow-y-auto bg-background px-4 py-2 font-mono text-xs leading-relaxed"
        >
          {entries.length === 0 && (
            <span className="text-muted-foreground">[ System ready — aguardando execução... ]</span>
          )}
          {entries.map((entry) => (
            <div key={entry.id} className={cn(logColors[entry.level])}>
              <span className="text-muted-foreground">[{entry.timestamp.toLocaleTimeString()}]</span>{' '}
              {entry.text}
            </div>
          ))}
          <span className="inline-block h-4 w-2 animate-pulse bg-primary" />
        </div>
      )}

      {isOpen && entries.length > 0 && (
        <div className="flex gap-2 border-t border-border bg-card px-4 py-1.5">
          <button onClick={copyLog} className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground">
            <Copy className="h-3 w-3" /> Copiar
          </button>
          <button onClick={clear} className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground">
            <Trash2 className="h-3 w-3" /> Limpar
          </button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add fm-optimize-electron/src/components/ScriptCard.tsx fm-optimize-electron/src/components/ScriptCardSkeleton.tsx fm-optimize-electron/src/components/DashboardWidget.tsx fm-optimize-electron/src/components/FavoriteButton.tsx fm-optimize-electron/src/components/LogPanel.tsx
git commit -m "feat: add core UI components"
```

---

### Task 16: Pages — DashboardPage, ScriptsPage, RestorePointsPage, SettingsPage

**Files:**
- Create: `fm-optimize-electron/src/pages/DashboardPage.tsx`
- Create: `fm-optimize-electron/src/pages/ScriptsPage.tsx`
- Create: `fm-optimize-electron/src/pages/RestorePointsPage.tsx`
- Create: `fm-optimize-electron/src/pages/SettingsPage.tsx`

- [ ] **Step 1: Create DashboardPage**

```typescript:fm-optimize-electron/src/pages/DashboardPage.tsx
import { Cpu, Monitor, MemoryStick, HardDrive, Clock, Activity } from 'lucide-react'
import { useSystemContext } from '../contexts/SystemContext'
import { DashboardWidget } from '../components/DashboardWidget'

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return `${d}d ${h}h ${m}m`
}

export default function DashboardPage() {
  const { data, loading, error, refresh } = useSystemContext()

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-card border border-border" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="mb-2 text-sm">Erro ao carregar informações do sistema</p>
        <p className="mb-4 text-xs text-destructive">{error}</p>
        <button onClick={refresh} className="rounded-lg bg-primary px-4 py-2 text-xs text-primary-foreground">
          Tentar novamente
        </button>
      </div>
    )
  }

  if (!data) return null

  return (
    <div>
      <button onClick={refresh} className="mb-4 text-xs text-muted-foreground hover:text-primary transition-colors">
        Atualizar
      </button>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <DashboardWidget
          icon={Cpu}
          label="CPU"
          value={data.cpu.model}
          detail={`${data.cpu.cores} cores · ${data.cpu.usage}% uso`}
        />
        <DashboardWidget
          icon={Monitor}
          label="GPU"
          value={data.gpu.name}
          detail={`${data.gpu.vram} VRAM`}
        />
        <DashboardWidget
          icon={MemoryStick}
          label="RAM"
          value={data.memory.total}
          detail={`${data.memory.type} · ${data.memory.slots} slots · ${data.memory.used} em uso`}
        />
        <DashboardWidget
          icon={Activity}
          label="Sistema"
          value={data.os.name}
          detail={`Build ${data.os.build} · ${data.os.edition}`}
        />
        {data.drives.map((drive) => (
          <DashboardWidget
            key={drive.letter}
            icon={HardDrive}
            label={`Disco ${drive.letter}`}
            value={drive.size}
            detail={`${drive.free} livres · ${drive.type}`}
          />
        ))}
        <DashboardWidget
          icon={Clock}
          label="Uptime"
          value={formatUptime(data.uptime)}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create ScriptsPage**

```typescript:fm-optimize-electron/src/pages/ScriptsPage.tsx
import { Star } from 'lucide-react'
import { cn } from '../lib/utils'
import { useScriptContext } from '../contexts/ScriptContext'
import { ScriptCard } from '../components/ScriptCard'
import { ScriptCardSkeleton } from '../components/ScriptCardSkeleton'

interface ScriptsPageProps {
  category: string
}

export default function ScriptsPage({ category }: ScriptsPageProps) {
  const {
    filteredScripts,
    favorites,
    activeExecution,
    loading,
    error,
    setCategoryFilter,
    toggleFavorite,
    showFavoritesOnly,
    setShowFavoritesOnly,
    execute,
    cancel
  } = useScriptContext()

  // Set category filter on mount
  // (In a real app this would use useEffect, but since we pass category via route,
  // the ScriptProvider already handles filtering. We just use filteredScripts.)

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ScriptCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-sm">Erro ao carregar scripts</p>
        <p className="text-xs text-destructive mt-2">{error}</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <button
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-colors',
            showFavoritesOnly
              ? 'bg-yellow-400/20 text-yellow-400'
              : 'bg-muted text-muted-foreground hover:text-foreground'
          )}
        >
          <Star className={cn('h-3.5 w-3.5', showFavoritesOnly && 'fill-yellow-400')} />
          Favoritos
        </button>
        <span className="text-xs text-muted-foreground">
          {filteredScripts.length} scripts
        </span>
      </div>

      {filteredScripts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <p className="text-sm">Nenhum script encontrado</p>
          <p className="text-xs mt-1">Tente ajustar sua busca ou filtro</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredScripts.map((script) => (
            <ScriptCard
              key={script.id}
              script={script}
              isFavorite={favorites.includes(script.id)}
              isExecuting={activeExecution === script.id}
              onExecute={() => execute(script.id)}
              onCancel={() => cancel(script.id)}
              onToggleFavorite={() => toggleFavorite(script.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Create RestorePointsPage**

```typescript:fm-optimize-electron/src/pages/RestorePointsPage.tsx
import { useState } from 'react'
import { RefreshCw, Plus, Trash2 } from 'lucide-react'
import { useRestorePointContext } from '../contexts/RestorePointContext'

export default function RestorePointsPage() {
  const { restorePoints, loading, error, creating, refresh, create, remove } = useRestorePointContext()
  const [newName, setNewName] = useState('')

  const handleCreate = async () => {
    if (!newName.trim()) return
    await create(newName.trim())
    setNewName('')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <p className="text-sm">Erro ao carregar restore points</p>
        <p className="text-xs text-destructive mt-2">{error}</p>
        <button onClick={refresh} className="mt-4 rounded-lg bg-primary px-4 py-2 text-xs text-primary-foreground">
          Tentar novamente
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nome do restore point..."
          className="flex-1 h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
        />
        <button
          onClick={handleCreate}
          disabled={creating || !newName.trim()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" />
          {creating ? 'Criando...' : 'Criar'}
        </button>
        <button onClick={refresh} className="rounded-lg border border-border p-2 text-muted-foreground hover:text-foreground">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {restorePoints.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <p className="text-sm">Nenhum restore point encontrado</p>
          <p className="text-xs mt-1">Crie um restore point para começar</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-card text-muted-foreground text-xs uppercase">
                <th className="px-4 py-3 text-left">Descrição</th>
                <th className="px-4 py-3 text-left">Data</th>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {restorePoints.map((rp) => (
                <tr key={rp.sequenceNumber} className="hover:bg-card/50 transition-colors">
                  <td className="px-4 py-3">{rp.description}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(rp.creationTime).toLocaleString('pt-BR')}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{rp.eventType}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => remove(rp.sequenceNumber)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Create SettingsPage**

```typescript:fm-optimize-electron/src/pages/SettingsPage.tsx
import { useSettingsContext } from '../contexts/SettingsContext'

export default function SettingsPage() {
  const { settings, update } = useSettingsContext()

  return (
    <div className="max-w-lg">
      <h2 className="mb-6 text-lg font-semibold">Preferências</h2>

      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
          <div>
            <p className="text-sm font-medium">Auto-abrir Log</p>
            <p className="text-xs text-muted-foreground">Abrir painel de log automaticamente</p>
          </div>
          <label className="relative inline-flex h-5 w-9 cursor-pointer items-center">
            <input
              type="checkbox"
              checked={settings.autoOpenLog}
              onChange={(e) => update({ autoOpenLog: e.target.checked })}
              className="peer sr-only"
            />
            <div className="h-5 w-9 rounded-full bg-muted after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-muted-foreground after:transition-all peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:bg-white" />
          </label>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
          <div>
            <p className="text-sm font-medium">Confirmar Execução</p>
            <p className="text-xs text-muted-foreground">Confirmar antes de executar scripts</p>
          </div>
          <label className="relative inline-flex h-5 w-9 cursor-pointer items-center">
            <input
              type="checkbox"
              checked={settings.confirmOnExecute}
              onChange={(e) => update({ confirmOnExecute: e.target.checked })}
              className="peer sr-only"
            />
            <div className="h-5 w-9 rounded-full bg-muted after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-muted-foreground after:transition-all peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:bg-white" />
          </label>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Fix ScriptsPage to use category prop properly**

Edit `ScriptsPage.tsx` to apply category filter:

```typescript:fm-optimize-electron/src/pages/ScriptsPage.tsx
// Add useEffect to filter by category
import { useEffect } from 'react'
// ... rest of imports

export default function ScriptsPage({ category }: ScriptsPageProps) {
  const {
    filteredScripts,
    favorites,
    activeExecution,
    loading,
    error,
    setCategoryFilter,
    toggleFavorite,
    showFavoritesOnly,
    setShowFavoritesOnly,
    execute,
    cancel
  } = useScriptContext()

  useEffect(() => {
    setCategoryFilter(category)
  }, [category, setCategoryFilter])
```

- [ ] **Step 6: Commit**

```bash
git add fm-optimize-electron/src/pages/
git commit -m "feat: add all pages"
```

---

### Task 17: Circuit Background Component

**Files:**
- Create: `fm-optimize-electron/src/components/CircuitBackground.tsx`

- [ ] **Step 1: Create CircuitBackground component**

```typescript:fm-optimize-electron/src/components/CircuitBackground.tsx
import { useEffect, useRef } from 'react'

interface Point {
  x: number
  y: number
}

interface Trace {
  start: Point
  end: Point
  progress: number
  speed: number
  hue: number
}

export function CircuitBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const tracesRef = useRef<Trace[]>([])
  const animRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Generate traces
    const traces: Trace[] = []
    const spacing = 80
    for (let x = 0; x < canvas.width + spacing; x += spacing) {
      for (let y = 0; y < canvas.height + spacing; y += spacing) {
        if (Math.random() > 0.3) continue
        const dir = Math.floor(Math.random() * 4)
        const start = { x, y }
        const end = dir === 0
          ? { x: x + spacing, y }
          : dir === 1
            ? { x: x - spacing, y }
            : dir === 2
              ? { x, y: y + spacing }
              : { x, y: y - spacing }
        traces.push({
          start,
          end,
          progress: Math.random(),
          speed: 0.002 + Math.random() * 0.004,
          hue: 210 + Math.random() * 30
        })
      }
    }
    tracesRef.current = traces

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Background grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)'
      ctx.lineWidth = 1
      for (let x = 0; x < canvas.width; x += spacing) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }
      for (let y = 0; y < canvas.height; y += spacing) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.stroke()
      }

      // Animated traces
      for (const trace of traces) {
        trace.progress += trace.speed
        if (trace.progress > 1) trace.progress = 0

        const t = trace.progress
        const cx = trace.start.x + (trace.end.x - trace.start.x) * t
        const cy = trace.start.y + (trace.end.y - trace.start.y) * t

        ctx.beginPath()
        ctx.arc(cx, cy, 2, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${trace.hue}, 100%, 50%, ${0.3 + t * 0.4})`
        ctx.fill()

        // Trail
        const trailLen = 0.1
        const prevT = Math.max(0, t - trailLen)
        const px = trace.start.x + (trace.end.x - trace.start.x) * prevT
        const py = trace.start.y + (trace.end.y - trace.start.y) * prevT
        ctx.beginPath()
        ctx.moveTo(px, py)
        ctx.lineTo(cx, cy)
        ctx.strokeStyle = `hsla(${trace.hue}, 100%, 50%, ${0.1 + t * 0.2})`
        ctx.lineWidth = 1
        ctx.stroke()
      }

      animRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 -z-10"
    />
  )
}
```

- [ ] **Step 2: Integrate into AppLayout**

Add `<CircuitBackground />` to `AppLayout.tsx`:

```typescript:fm-optimize-electron/src/layout/AppLayout.tsx
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { LogPanel } from '../components/LogPanel'
import { CircuitBackground } from '../components/CircuitBackground'

export function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <CircuitBackground />
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
        <LogPanel />
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add fm-optimize-electron/src/components/CircuitBackground.tsx fm-optimize-electron/src/layout/AppLayout.tsx
git commit -m "feat: add circuit background animation"
```

---

### Task 18: Dialogs — ScriptDetailDialog & EditScriptDialog

**Files:**
- Create: `fm-optimize-electron/src/components/ScriptDetailDialog.tsx`
- Create: `fm-optimize-electron/src/components/EditScriptDialog.tsx`

- [ ] **Step 1: Create ScriptDetailDialog**

```typescript:fm-optimize-electron/src/components/ScriptDetailDialog.tsx
import { useEffect, useState } from 'react'
import { X, Terminal, ShieldAlert, Copy, Check } from 'lucide-react'
import type { ScriptEntry } from '../../electron/shared/ipc-types'

interface ScriptDetailDialogProps {
  script: ScriptEntry | null
  onClose: () => void
}

export function ScriptDetailDialog({ script, onClose }: ScriptDetailDialogProps) {
  const [content, setContent] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (script) {
      window.electronAPI.getScriptContent(script.id).then(setContent).catch(() => setContent(''))
    }
  }, [script])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (script) window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [script, onClose])

  if (!script) return null

  const copyCode = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-xl border border-border bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold">{script.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{script.description}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs font-mono text-muted-foreground">
            <Terminal className="h-3 w-3" /> .{script.extension}
          </span>
          {script.requiresAdmin && (
            <span className="inline-flex items-center gap-1 rounded-md bg-destructive/10 px-2 py-0.5 text-xs font-mono text-destructive">
              <ShieldAlert className="h-3 w-3" /> Requer Admin
            </span>
          )}
        </div>

        <div className="relative">
          <pre className="max-h-80 overflow-auto rounded-lg bg-background p-4 font-mono text-xs leading-relaxed text-foreground">
            {content || 'Carregando...'}
          </pre>
          <button
            onClick={copyCode}
            className="absolute top-2 right-2 rounded-md bg-muted p-1.5 text-muted-foreground hover:text-foreground"
          >
            {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create EditScriptDialog**

```typescript:fm-optimize-electron/src/components/EditScriptDialog.tsx
import { useState } from 'react'
import { X, Upload, FileCode } from 'lucide-react'

interface EditScriptDialogProps {
  onClose: () => void
  onSave: (script: { name: string; content: string; extension: string }) => void
}

export function EditScriptDialog({ onClose, onSave }: EditScriptDialogProps) {
  const [name, setName] = useState('')
  const [content, setContent] = useState('')
  const [extension, setExtension] = useState('bat')

  const handleFilePick = async () => {
    // In Electron, this would use dialog.showOpenDialog via IPC
    // For now, show a paste area
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Adicionar Script</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Tipo</label>
            <select
              value={extension}
              onChange={(e) => setExtension(e.target.value)}
              className="w-full h-9 rounded-lg border border-input bg-background px-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            >
              <option value="bat">Batch (.bat)</option>
              <option value="ps1">PowerShell (.ps1)</option>
              <option value="cmd">Command (.cmd)</option>
              <option value="reg">Registry (.reg)</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs text-muted-foreground">Código</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="w-full rounded-lg border border-input bg-background p-3 font-mono text-xs focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-xs text-muted-foreground hover:text-foreground"
            >
              Cancelar
            </button>
            <button
              onClick={() => onSave({ name, content, extension })}
              disabled={!name || !content}
              className="rounded-lg bg-primary px-4 py-2 text-xs text-primary-foreground disabled:opacity-50"
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add fm-optimize-electron/src/components/ScriptDetailDialog.tsx fm-optimize-electron/src/components/EditScriptDialog.tsx
git commit -m "feat: add script detail and edit dialogs"
```

---

### Task 19: Electron Builder Config & Resources

**Files:**
- Create: `fm-optimize-electron/electron-builder.yml`
- Create: `fm-optimize-electron/resources/icon.ico` (copy from FMOptimize)

- [ ] **Step 1: Create electron-builder config**

```yaml:fm-optimize-electron/electron-builder.yml
appId: com.fmoptimize.app
productName: FM Optimize
copyright: Copyright © 2026 Felipe Melo

directories:
  output: dist
  buildResources: resources

files:
  - out/**/*
  - resources/scripts.json

win:
  target:
    - target: portable
      arch:
        - x64
    - target: nsis
      arch:
        - x64
  icon: resources/icon.ico

nsis:
  oneClick: false
  allowToChangeInstallationDirectory: true
  createDesktopShortcut: true
  shortcutName: FM Optimize
  artifactName: FM_Optimize_Setup_${version}.${ext}

portable:
  artifactName: FM_Optimize_Portable_${version}.${ext}

extraResources:
  - from: resources/
    to: resources/
    filter:
      - "*.json"
```

- [ ] **Step 2: Copy icon from existing project**

Run: `Copy-Item -LiteralPath "../FMOptimize/icon.ico" -Destination "resources/icon.ico"`

- [ ] **Step 3: Commit**

```bash
git add fm-optimize-electron/electron-builder.yml fm-optimize-electron/resources/icon.ico
git commit -m "chore: add electron-builder config and icon"
```

---

### Task 20: Verify Build

- [ ] **Step 1: Run typecheck**

Run: `cd fm-optimize-electron && npm run typecheck`

Expected: No TypeScript errors

- [ ] **Step 2: Build the project**

Run: `cd fm-optimize-electron && npm run build`

Expected: Build completes without errors, `out/` directory created with main, preload, and renderer

- [ ] **Step 3: Run dev server (smoke test)**

Run: `cd fm-optimize-electron && npm run dev`

Expected: Electron window opens showing the dark theme with sidebar and content area. If running headless, verify build output exists.

- [ ] **Step 4: Final commit**

```bash
git add -A && git commit -m "chore: initial working build"
```
