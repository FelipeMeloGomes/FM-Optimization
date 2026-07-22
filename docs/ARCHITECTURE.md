# Arquitetura — FM Optimize

Visão geral da arquitetura do app desktop (Electron + React + TypeScript).

## Camadas

```
┌─────────────────────────────────────────────┐
│  Renderer (React)  — src/                    │
│  Contexts → Pages → Components               │
└───────────────┬─────────────────────────────┘
                │  window.electronAPI.*  (preload)
┌───────────────┴─────────────────────────────┐
│  Preload  — electron/preload/index.ts        │
│  contextBridge: ipc<T>() expõe API tipada    │
└───────────────┬─────────────────────────────┘
                │  ipcMain.handle('channel', ...)
┌───────────────┴─────────────────────────────┐
│  Main  — electron/main/                      │
│  ipc-handlers → services (PowerShell, etc.)  │
└─────────────────────────────────────────────┘
```

### Main (`electron/main/`)
- `ipc-handlers.ts` — registra todos os `ipcMain.handle`. Todo handler passa por `handleIpc(channel, input, fn)` que aplica **rate-limit** e **validação Zod** antes de executar.
- `services/powershell.ts` — `execPowerShellSafe` (comando + args parametrizados, escapados) e `execPowerShell` (scripts inline sanitizados).
- `services/rate-limit.ts` — janela deslizante por canal (ex: `elevate-app` 2/10s, `benchmark-dns` 3/5s).
- `validation.ts` + `branded-types.ts` — schemas Zod e tipos *branded* (`ScriptId`, `InterfaceIndex`, `RestorePointSeq`).
- `services/system-info.ts` — funções modulares (`getCpuInfo`, `getGpuInfo`, etc.) exportadas individualmente.

### Preload (`electron/preload/`)
- `ipc<T>(channel, ...args)` invoca `ipcRenderer.invoke` e retorna `data` ou rejeita com `error`.
- A API exposta está tipada em `ElectronAPI` (`electron/shared/ipc-types.ts`).

### Renderer (`src/`)
- **Providers modulares** (`src/contexts/`): `SystemContext` exporta providers por seção (`CpuProvider`, `GpuProvider`, `MemoryProvider`, `OsProvider`, `StorageProvider`) que carregam sob demanda. `DnsProvider` está encapsulado dentro da `NetworkPage` (lazy) para não rodar benchmark no startup.
- **Pages lazy**: todas as rotas em `App.tsx` usam `React.lazy()`.
- **Code-splitting**: `electron.vite.config.ts` separa vendors (`react`, `radix`, `lucide`) em chunks próprios.

## Fluxo de uma ação (ex: aplicar DNS)

1. `NetworkPage` chama `useDnsContext().applyDns(provider)`.
2. Preload `applyDns(interfaceIndex, addresses)` → `ipcRenderer.invoke('apply-dns', ...)`.
3. Main `handleIpc('apply-dns', ...)` → rate-limit + `applyDnsSchema` (Zod) valida IPv4.
4. `execPowerShellSafe('Set-DnsClientServerAddress', [...])` (args escapados).
5. Resultado volta ao renderer via Promise.

## Arquivos principais

| Arquivo | Responsabilidade |
|---------|------------------|
| `electron/main/ipc-handlers.ts` | Registro e pipeline de handlers IPC |
| `electron/main/validation.ts` | Schemas Zod de entrada IPC |
| `electron/main/branded-types.ts` | Tipos branded de domínio |
| `electron/main/services/powershell.ts` | Execução segura de PowerShell |
| `electron/main/services/rate-limit.ts` | Rate-limit por canal |
| `src/contexts/SystemContext.tsx` | Providers modulares de sistema |
| `src/pages/NetworkPage.tsx` | DNS benchmark + apply (encapsula DnsProvider) |
| `electron.vite.config.ts` | Build + manualChunks |
