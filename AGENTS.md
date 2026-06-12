# Build

Sempre usar este comando para buildar o FMOptimization (da raiz do projeto):

```powershell
dotnet publish FMOptimization/FMOptimization.csproj -c Release -r win-x64 --self-contained -o dist
```

Gera um único `FMOptimization.exe` standalone (~148MB) em `dist/` na raiz.
