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

## Todos os targets (recomendado para release)

```powershell
npx electron-builder --win
```

Gera `dist/fm-optimize-portable.exe`, `dist/fm-optimize-setup.exe`,
`dist/fm-optimize-setup.exe.blockmap` e `dist/latest.yml` (essencial para
`electron-updater`).

## Portable (standalone .exe — para teste rápido)

```powershell
npx electron-builder --win portable
```

Gera `dist/fm-optimize-portable.exe`.

## Instalável (NSIS — para teste rápido)

```powershell
npx electron-builder --win nsis
```

Gera `dist/fm-optimize-setup.exe` + `dist/fm-optimize-setup.exe.blockmap`.

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

- [ ] `.env.local` na raiz com `GITHUB_TOKEN=ghp_...`
- [ ] `README.md` revisado e atualizado (se houver mudanças visuais/funcionais)
- [ ] Working directory é `fm-optimize-electron/`
- [ ] Working tree limpo (sem arquivos não commitados)

### O que o script faz

1. Pede o tipo de bump (`patch`/`minor`/`major`)
2. `npm version <tipo>` — bump no `package.json`, commit, tag local
3. `npm run build` — compila TypeScript
4. `npx electron-builder --win` — gera builds + `latest.yml`
5. Verifica se todos os assets existem e versão está consistente
6. Pergunta o corpo da release (Novidades/Melhorias/Correções)
7. `git push --follow-tags` — push do commit + tag
8. Cria release no GitHub + upload dos assets

### Template do body

```markdown
## vX.Y.Z - dd/MM/yyyy

### Novidades
-

### Melhorias
-

### Correções
-
```

### Exemplo renderizado

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

Copie e cole no terminal PowerShell a partir de `fm-optimize-electron/`:

```powershell
$ErrorActionPreference = "Stop"

# ─── Validações iniciais ───

if (-not (Test-Path ".env.local")) {
  throw ".env.local não encontrado. Crie com GITHUB_TOKEN=ghp_..."
}
if (-not (Test-Path ".git")) {
  throw "Diretório não é um repositório git"
}

$status = git status --porcelain
if ($status) {
  throw "Working tree sujo. Faça commit ou stash das mudanças antes de release."
}

# ─── Bump de versão ───

Write-Output "`n=== Release: novo build ===`n"

do {
  $bump = Read-Host "Tipo de bump (patch/minor/major)"
} while ($bump -notin @("patch", "minor", "major"))

Write-Output "Executando npm version $bump...`n"
npm version $bump
if ($LASTEXITCODE -ne 0) { throw "npm version falhou" }

$version = node -p "require('./package.json').version"
$tag = "v$version"
Write-Output "Versão: $version`n"

# ─── Build ───

Write-Output "=== Compilando TypeScript... ==="
npm run build
if ($LASTEXITCODE -ne 0) { throw "npm run build falhou" }

Write-Output "`n=== Gerando builds Windows... ==="
npx electron-builder --win
if ($LASTEXITCODE -ne 0) { throw "electron-builder falhou" }

# ─── Verificação de assets ───

Write-Output "`n=== Verificando assets... ==="
$expected = @(
  "dist/fm-optimize-setup.exe"
  "dist/fm-optimize-setup.exe.blockmap"
  "dist/fm-optimize-portable.exe"
  "dist/latest.yml"
)
foreach ($a in $expected) {
  if (-not (Test-Path $a)) {
    throw "Asset faltando: $a"
  }
  Write-Output "  OK: $a"
}

$ymlVersion = Select-String -Path "dist/latest.yml" -Pattern "^version: $version$" -Quiet
if (-not $ymlVersion) {
  throw "latest.yml não contém a versão $version (pode ter sido buildado com versão antiga)"
}
Write-Output "  Versão confirmada: $version`n"

# ─── Corpo da release ───

Write-Output "=== Corpo da release ==="
Write-Output "Deixe em branco e pressione Enter para pular uma seção.`n"

$novidades = Read-Host "Novidades"
$melhorias = Read-Host "Melhorias"
$correcoes = Read-Host "Correções"

$body = @"
## $tag - $(Get-Date -Format 'dd/MM/yyyy')

### Novidades
$novidades

### Melhorias
$melhorias

### Correções
$correcoes
"@

# ─── Push ───

Write-Output "`n=== Fazendo push para GitHub... ==="
git push --follow-tags
if ($LASTEXITCODE -ne 0) { throw "git push falhou" }

# ─── Release no GitHub ───

Write-Output "`n=== Criando release no GitHub... ==="
$env:GITHUB_TOKEN = (Get-Content -Path ".env.local" | ForEach-Object {
  if ($_ -match '^GITHUB_TOKEN=(.*)') { $matches[1] }
})

$api = "https://api.github.com/repos/FelipeMeloGomes/FM-Optimization/releases"

# Deleta release existente com a mesma tag (se houver)
try {
  $existing = Invoke-RestMethod -Uri "$api/tags/$tag" -Headers @{
    Authorization = "Bearer $env:GITHUB_TOKEN"
  }
  Write-Output "Release $tag já existe, recriando..."
  Invoke-RestMethod -Uri "$api/$($existing.id)" -Method Delete -Headers @{
    Authorization = "Bearer $env:GITHUB_TOKEN"
  }
  # Deleta a tag remota também
  $refApi = "https://api.github.com/repos/FelipeMeloGomes/FM-Optimization/git/refs/tags/$tag"
  try {
    Invoke-RestMethod -Uri $refApi -Method Delete -Headers @{
      Authorization = "Bearer $env:GITHUB_TOKEN"
    }
  } catch { }
} catch { }

$release = Invoke-RestMethod -Uri $api -Method Post -Headers @{
  Authorization = "Bearer $env:GITHUB_TOKEN"
} -Body (@{
  tag_name = $tag
  name = $tag
  body = $body
} | ConvertTo-Json) -ContentType "application/json"

$uploadUrl = ($release.upload_url -replace '\{.*\}', '')

$assets = @(
  @{Path="dist/fm-optimize-portable.exe"; Type="application/x-msdownload"}
  @{Path="dist/fm-optimize-setup.exe"; Type="application/x-msdownload"}
  @{Path="dist/fm-optimize-setup.exe.blockmap"; Type="application/octet-stream"}
  @{Path="dist/latest.yml"; Type="application/octet-stream"}
)

Write-Output "`n=== Uploading assets... ==="
foreach ($a in $assets) {
  $name = Split-Path $a.Path -Leaf
  Write-Output "  Uploading $name..."
  Invoke-RestMethod -Uri "${uploadUrl}?name=$name" -Method Post -Headers @{
    Authorization = "Bearer $env:GITHUB_TOKEN"
    "Content-Type" = $a.Type
  } -InFile $a.Path
  Write-Output "  OK"
}

Write-Output "`n=== Release $tag criada com sucesso! ==="
```


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
- **M? (electron-updater):** Testar atualização automática na build (manual — criar release real e verificar fluxo)

## Observações
- **M2 (IpcResult return type):** Completo — todos os 22 handlers retornam `Promise<IpcResult<T>>` (commit `1b24689`). Limpeza adicional: inline `import()` types substituídos por imports diretos em `preload/index.ts` e `script-executor.ts`.
- **M4 (never):** Completo — `getCommand` em `script-executor.ts` trata `undefined` antes do `switch` e usa `const _exhaustive: never = ext` no `default`.
- **auto-updater:** Config `electron-builder.yml` já tem `publish: github`. `setupAutoUpdater()` em `main/index.ts` chama `setFeedURL()`. Teste manual ao criar release real.

## Relevant Files
- `electron/main/ipc-handlers.ts` — handlers com `catch(e:unknown)`, `IpcResult` completo (commit `1b24689`)
- `electron/main/services/script-executor.ts` — admin check, duplicata guard, taskkill fallback, never exhaustion
- `electron/main/services/restore-points.ts` — sanitização + `catch(e:unknown)`
- `electron/main/services/data-service.ts` — escrita atômica, JSON.parse validado
- `electron/main/services/system-info.ts` — RawDriveInfo
- `electron/preload/index.ts` — `ipc<T>()`, `ipcVoid()`, IpcRendererEvent, imports limpos
- `electron/shared/ipc-types.ts` — `AsyncState`, `UpdateInfo.error`, `ElectronAPI`
- `src/contexts/SystemContext.tsx` — discriminated union
- `src/contexts/RestorePointContext.tsx` — discriminated union
- `src/contexts/ScriptContext.tsx` — discriminated union + filteredScripts useMemo
