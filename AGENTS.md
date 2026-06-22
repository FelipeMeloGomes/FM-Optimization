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
