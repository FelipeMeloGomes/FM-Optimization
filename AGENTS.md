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
