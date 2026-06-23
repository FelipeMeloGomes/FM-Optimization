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

## Criar nova release com builds

```powershell
$env:GITHUB_TOKEN = (Get-Content -Path ".env" | ForEach-Object { if ($_ -match '^GITHUB_TOKEN=(.*)') { $matches[1] } })
$tag = "v$(node -p "require('./package.json').version")"
$api = "https://api.github.com/repos/FelipeMeloGomes/FM-Optimization/releases"

$prevTag = git tag --sort=-v:refname | Select-Object -Skip 1 | Select-Object -First 1
$body = if ($prevTag) { (git log "$prevTag..HEAD" --oneline --no-decorate | ForEach-Object { "- $_" }) -join "`n" } else { "First release" }

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
