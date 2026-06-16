# Build

## Portable (standalone .exe sem instalação)

```powershell
dotnet publish FMOptimization/FMOptimization.csproj -c Release -r win-x64 --self-contained -o dist\portable
```

Gera `dist\portable\FMOptimization.exe`. Dados salvos ao lado do executável.

## Instalável (com Inno Setup)

```powershell
dotnet publish FMOptimization/FMOptimization.csproj -c Release -r win-x64 --self-contained -o dist\installer -p:IsInstaller=true
& "C:\Program Files (x86)\Inno Setup 6\iscc.exe" installer.iss
Remove-Item -LiteralPath "dist\installer\FMOptimization.exe" -ErrorAction SilentlyContinue
```

Gera `dist\installer\FMOptimization_Setup.exe` (~46 MB com compressão). Dados salvos em `%APPDATA%\FMOptimization\`.

# Commit

Antes de commitar, verificar se o README.md foi atualizado com as últimas mudanças para manter sincronizado.
