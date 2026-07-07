# Build (Electron)

## Dev

```powershell
npm run dev
```

## Build

```powershell
npm run build
```

Gera em `fm-optimize-electron/out/`.

## Typecheck

```powershell
npm run typecheck
```

## Portable (standalone .exe)

```powershell
npx electron-builder --win portable
```

Gera `dist/fm-optimize-*-portable.exe`.

## Instalável (NSIS)

```powershell
npx electron-builder --win nsis
```

Gera `dist/fm-optimize-*-setup.exe`.

Dados salvos em `%APPDATA%\fm-optimize\`.

# Commit

Antes de commitar, verificar se o README.md foi atualizado com as últimas mudanças para manter sincronizado.

Trabalhar sempre dentro de `fm-optimize-electron/`.

# Release (GitHub)

## Regras para release body

O body deve conter apenas mudanças relevantes para o usuário final, em português.
Agrupar em seções: **Novidades**, **Melhorias**, **Correções**.
Commits técnicos (chore, bump, docs, refactor) ficam em uma seção "Técnico" no final ou são omitidos.

## Criar nova release com builds

### Pré-requisitos

- [ ] Diretório de trabalho é `fm-optimize-electron/`
- [ ] `package.json` com a versão atualizada
- [ ] `.env` na raiz com `GITHUB_TOKEN=ghp_...`
- [ ] Builds gerados (`npm run build`)
- [ ] README.md revisado e atualizado

### Template do body

Preencher com as mudanças desta release:

```markdown
## v1.0.0 - dd/MM/yyyy

### Novidades
-

### Melhorias
-

### Correções
-
```

### Exemplo renderizado

Como o body aparece no GitHub:

```markdown
## v1.5.2 - 26/06/2026

### Novidades
- Suporte a novo formato de planilha

### Melhorias
- Performance otimizada na leitura de arquivos grandes

### Correções
- Corrigido crash ao importar CSV com header vazio
```

### Script

```powershell
$body = @"
## v$(node -p "require('./package.json').version") - $(Get-Date -Format 'dd/MM/yyyy')

### Novidades
- 

### Melhorias
- 

### Correções
- 
"@

$env:GITHUB_TOKEN = (Get-Content -Path ".env" | ForEach-Object {
  if ($_ -match '^GITHUB_TOKEN=(.*)') { $matches[1] }
})
$tag = "v$(node -p "require('./package.json').version")"
$api = "https://api.github.com/repos/FelipeMeloGomes/FM-Optimization/releases"

$release = Invoke-RestMethod -Uri $api -Method Post -Headers @{
  Authorization = "Bearer $env:GITHUB_TOKEN"
} -Body (@{
  tag_name = $tag
  name = $tag
  body = $body
} | ConvertTo-Json) -ContentType "application/json"

$uploadUrl = ($release.upload_url -replace '\{.*\}', '')
$assets = @(
  @{Path="dist/portable/fm-optimize-portable.exe"; Type="application/x-msdownload"}
  @{Path="dist/installer/fm-optimize-setup.exe"; Type="application/x-msdownload"}
  @{Path="dist/installer/fm-optimize-setup.exe.blockmap"; Type="application/octet-stream"}
  @{Path="dist/latest.yml"; Type="application/octet-stream"}
)

foreach ($a in $assets) {
  $name = Split-Path $a.Path -Leaf
  Write-Output "Uploading $name..."
  Invoke-RestMethod -Uri "${uploadUrl}?name=$name" -Method Post -Headers @{
    Authorization = "Bearer $env:GITHUB_TOKEN"
    "Content-Type" = $a.Type
  } -InFile $a.Path
  Write-Output "  OK"
}

Write-Output "Release $tag criada!"
```

### Execução

Copie e cole o script acima no terminal PowerShell a partir de `fm-optimize-electron/`.

# Session Work State

## Completed
### Fase 1 — Bugs (H1-H5)
- **H1 (activeExecution quebrado):** `onScriptEnded` + `activeRef` em vez de limpar no `finally`
- **H2 (command injection):** `createRestorePoint` sanitiza input (`/[^a-zA-Z0-9 áéíóúà...]/g`)
- **H3 (race condition):** `Promise.all` para carregar scripts+favoritos
- **H4 (unhandled rejections):** try/catch em cancel, remove, restore
- **H5 (activeProcesses sobrescrito):** Verifica `activeProcesses.has(id)` antes de spawnar + `taskkill /F /T` fallback

### Fase 2 — Melhorias (M1-M8)
- **M1 (silent catches):** `console.error` em vez de `catch(()=>{})`
- **M2 (script-error):** stderr emite evento `script-error`
- **M3 (setState updater):** `saveSettings` fora do updater
- **M4 (admin check):** `executeScript` verifica `requiresAdmin` vs `isAdmin()`
- **M6 (escrita atômica):** `saveUserData`/`saveSettings` em `.tmp` + `renameSync`
- **M7 (UpdateInfo.error):** Campo `error?: string` adicionado
- **M8 (feedback restore):** Diálogo mostra estado após confirmação

### Fase 2 — TypeScript
- **H3 (require→import):** `require('child_process')` → ESM import
- **H2 (catch e:any→unknown):** 20+ blocos em `ipc-handlers.ts`, 2 em `restore-points.ts`
- **H5 (preload _e:any→IpcRendererEvent):** Todos listeners tipados
- **M1 (main.tsx null check):** `document.getElementById('root')` validado
- **H4 (system-info any):** Interface `RawDriveInfo` criada
- **H1 (preload IPC typing):** Helpers `ipc<T>()` e `ipcVoid()` substituem `.then(r: any => ...)`

### Fase 3 — Const Arrays
- **M3:** `FILTERS` em `LogPanel.tsx` com `as const`
- **M3:** `navItems` em `Sidebar.tsx` com `as const`
- **M4:** `never` check em `getCommand` (fallback default)
- **M6:** `JSON.parse` validado com type guard em `loadSettings`

### Fase 4 — Discriminated Unions
- **M5:** `AsyncState<T>` type (`loading` | `error` | `success`)
- **M5:** `SystemContext` usa `state: AsyncState<DashboardData>`
- **M5:** `RestorePointContext` usa `state: AsyncState<RestorePointEntry[]>`
- **M5:** `ScriptContext` usa `state: AsyncState<ScriptEntry[]>`
- Consumidores (`DashboardPage`, `ScriptsPage`, `RestorePointsPage`) atualizados

## Pendente
- **M2 (IpcResult return type):** Tipar retorno dos handlers IPC com `IpcResult<T>`
- **M4 (never):** Exaustão em switches relevantes
- **M? (electron-updater):** Testar atualização automática na build

## Relevant Files
- `electron/main/ipc-handlers.ts` — handlers com `catch(e:unknown)`, `IpcResult` incompleto
- `electron/main/services/script-executor.ts` — admin check, duplicata guard, taskkill fallback
- `electron/main/services/restore-points.ts` — sanitização + `catch(e:unknown)`
- `electron/main/services/data-service.ts` — escrita atômica, JSON.parse validado
- `electron/main/services/system-info.ts` — RawDriveInfo
- `electron/preload/index.ts` — `ipc<T>()`, `ipcVoid()`, IpcRendererEvent
- `electron/shared/ipc-types.ts` — `AsyncState`, `UpdateInfo.error`, `ElectronAPI`
- `src/contexts/SystemContext.tsx` — discriminated union
- `src/contexts/RestorePointContext.tsx` — discriminated union
- `src/contexts/ScriptContext.tsx` — discriminated union + filteredScripts useMemo
