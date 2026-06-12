# Build

Sempre usar este comando para buildar o FMOptimization (da raiz do projeto):

```powershell
Remove-Item -Recurse -Force dist
dotnet publish FMOptimization/FMOptimization.csproj -c Release -r win-x64 --self-contained -o dist
Remove-Item -Recurse -Force dist\* -Exclude 'FMOptimization.exe', 'scripts_data.json'
```

Gera um único `FMOptimization.exe` standalone (~148MB) em `dist/` na raiz.
