# Melhorias FMOptimization — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) or executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aplicar 8 melhorias de qualidade no FMOptimization (logging, SRP, testes, thread-safety, cancellation, remoção de `pause`, code-gen, error handling).

**Architecture:** Projeto WPF .NET 9 com DI (`Microsoft.Extensions.DependencyInjection`), MVVM (`CommunityToolkit.Mvvm`), scripts embutidos em Base64. As melhorias são incrementais e cada task deixa o app compilável e funcional.

**Tech Stack:** .NET 9 WPF, CommunityToolkit.Mvvm 8.4.2, Microsoft.Extensions.DependencyInjection 10.0.9, System.Text.Json 10.0.9, Microsoft.Extensions.Logging, MSTest + Moq + FluentAssertions

**Build:** `dotnet publish FMOptimization/FMOptimization.csproj -c Release -r win-x64 --self-contained -o dist`

---

### Task 1: Logging Estruturado com ILogger\<T\>

**Files:**
- Modify: `FMOptimization/FMOptimization.csproj` — adicionar packages
- Modify: `FMOptimization/App.xaml.cs` — configurar logging no DI
- Modify: `FMOptimization/Services/DataService.cs` — usar ILogger\<DataService\>
- Modify: `FMOptimization/Services/ScriptExecutionService.cs` — usar ILogger\<ScriptExecutionService\>
- Modify: `FMOptimization/ViewModels/MainViewModel.cs` — usar ILogger\<MainViewModel\>

**Detalhamento:**

A skill dotnet-best-practices recomenda `Microsoft.Extensions.Logging` com scoped logging. O DI já está configurado com `ServiceCollection`, então a adição é direta.

- [ ] **1.1 Adicionar packages Microsoft.Extensions.Logging**

```xml
<!-- FMOptimization.csproj — adicionar ao ItemGroup existente -->
<PackageReference Include="Microsoft.Extensions.Logging" Version="10.0.9" />
<PackageReference Include="Microsoft.Extensions.Logging.Debug" Version="10.0.9" />
```

- [ ] **1.2 Configurar logging no App.xaml.cs**

```csharp
// App.xaml.cs — dentro de OnStartup, antes de BuildServiceProvider
using Microsoft.Extensions.Logging;

sc.AddLogging(builder =>
{
    builder.AddDebug();
    builder.SetMinimumLevel(LogLevel.Information);
});
```

- [ ] **1.3 Substituir Debug.WriteLine em DataService por ILogger**

```csharp
// DataService.cs
public class DataService : IDataService
{
    private readonly string _dataFile;
    private readonly ILogger<DataService> _logger;

    public DataService(ILogger<DataService> logger)
    {
        _logger = logger;
        _dataFile = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "scripts_data.json");
    }

    public AppData Carregar()
    {
        try
        {
            if (File.Exists(_dataFile))
            {
                var json = File.ReadAllText(_dataFile);
                var data = JsonSerializer.Deserialize<AppData>(json);
                if (data != null) return data;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Falha ao carregar dados de {Path}", _dataFile);
        }
        return new AppData();
    }

    public void Salvar(AppData data)
    {
        try
        {
            var json = JsonSerializer.Serialize(data, new JsonSerializerOptions
            {
                WriteIndented = true
            });
            File.WriteAllText(_dataFile, json);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Falha ao salvar dados em {Path}", _dataFile);
        }
    }
}
```

- [ ] **1.4 Adicionar ILogger ao ScriptExecutionService**

```csharp
// ScriptExecutionService.cs
public class ScriptExecutionService : IScriptExecutionService
{
    private readonly Dictionary<string, Process> _runningProcesses = new();
    private readonly ILogger<ScriptExecutionService> _logger;

    public ScriptExecutionService(ILogger<ScriptExecutionService> logger)
    {
        _logger = logger;
    }

    // No Cancel:
    catch (Exception ex)
    {
        _logger.LogWarning(ex, "Erro ao cancelar script {ScriptName}", script.Nome);
    }

    // No ExecuteAsync:
    catch (Win32Exception ex) when (ex.NativeErrorCode == 5)
    {
        Log(LogMessages.ExecutionError(nome, "Acesso negado."), LogLevel.Error);
        _logger.LogWarning(ex, "Script {ScriptName} falhou por acesso negado", nome);
    }
    catch (Exception ex)
    {
        Log(LogMessages.ExecutionError(nome, ex.Message), LogLevel.Error);
        _logger.LogError(ex, "Erro ao executar script {ScriptName}", nome);
    }
}
```

- [ ] **1.5 Adicionar ILogger ao MainViewModel**

```csharp
// MainViewModel.cs — campo
private readonly ILogger<MainViewModel> _logger;

// Construtor
public MainViewModel(IDataService dataService, IScriptExecutionService executor, ILogger<MainViewModel> logger)
{
    _dataService = dataService;
    _executor = executor;
    _logger = logger;
    _executor.OnLog += OnScriptLog;
    LoadData();
}
```

Substituir `Debug.WriteLine` por `_logger.LogWarning` nos catches de `ExtrairScript` e `ExtrairScriptsUsuario`.

- [ ] **1.6 Buildar e verificar**

Run: `dotnet build FMOptimization/FMOptimization.csproj`
Expected: build succeeds

---

### Task 2: Thread Safety no Dicionário de Processos

**Files:**
- Modify: `FMOptimization/Services/ScriptExecutionService.cs`

- [ ] **2.1 Trocar Dictionary por ConcurrentDictionary**

```csharp
// ScriptExecutionService.cs — campo
private readonly ConcurrentDictionary<string, Process> _runningProcesses = new(StringComparer.OrdinalIgnoreCase);

// Cancel — usar TryRemove em vez de TryGetValue + Remove
public void Cancel(ScriptModel script)
{
    if (_runningProcesses.TryRemove(script.Nome, out var process))
    {
        try
        {
            if (!process.HasExited)
                process.Kill(entireProcessTree: true);
            Log(LogMessages.ScriptCancelled(script.Nome), LogLevel.Warn);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Erro ao cancelar script {ScriptName}", script.Nome);
        }
        finally
        {
            process.Dispose();
        }
    }
}

// RunProcess — adicionar/remover
_runningProcesses[nome] = process;
// finally — remover linha _runningProcesses.Remove(nome), TryRemove no Cancel já cuida
// Mas precisamos remover no finally também, pois o processo pode terminar naturalmente
// Solução: usar TryRemove no finally (se já foi removido pelo Cancel, não faz mal)
finally
{
    _runningProcesses.TryRemove(nome, out _);
    process.Dispose();
}
```

- [ ] **2.2 Buildar e verificar**

Run: `dotnet build FMOptimization/FMOptimization.csproj`
Expected: build succeeds

---

### Task 3: Separação de Responsabilidades (SRP)

**Files:**
- Create: `FMOptimization/Services/ScriptExtractionService.cs`
- Create: `FMOptimization/Services/IScriptExtractionService.cs`
- Create: `FMOptimization/Services/ScriptFilterService.cs`
- Create: `FMOptimization/Services/IScriptFilterService.cs`
- Modify: `FMOptimization/ViewModels/MainViewModel.cs` — delegar extração e filtro, remover métodos
- Modify: `FMOptimization/App.xaml.cs` — registrar novos serviços

- [ ] **3.1 Criar IScriptExtractionService + ScriptExtractionService**

```csharp
// IScriptExtractionService.cs
namespace FMOptimization.Services;

using FMOptimization.Models;

public interface IScriptExtractionService
{
    void ExtrairScripts(IEnumerable<ScriptModel> scripts);
    void ExtrairScriptUsuario(ScriptData scriptData);
}
```

```csharp
// ScriptExtractionService.cs
using System.IO;
using FMOptimization.Models;
using Microsoft.Extensions.Logging;

namespace FMOptimization.Services;

public class ScriptExtractionService : IScriptExtractionService
{
    private readonly ILogger<ScriptExtractionService> _logger;

    public ScriptExtractionService(ILogger<ScriptExtractionService> logger)
    {
        _logger = logger;
    }

    public void ExtrairScripts(IEnumerable<ScriptModel> scripts)
    {
        foreach (var script in scripts.Where(s => s.IsEmbedded))
        {
            try
            {
                var entry = ScriptRegistry.Entries.FirstOrDefault(e => e.Nome == script.Nome);
                if (entry == null) continue;

                var dst = script.Caminho;
                var dir = Path.GetDirectoryName(dst);
                if (dir != null) Directory.CreateDirectory(dir);

                if (!File.Exists(dst))
                {
                    var data = Convert.FromBase64String(entry.ConteudoB64);
                    File.WriteAllBytes(dst, data);
                    File.SetAttributes(dst, FileAttributes.Normal);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Erro ao extrair script '{ScriptName}'", script.Nome);
            }
        }
    }

    public void ExtrairScriptUsuario(ScriptData sd)
    {
        if (string.IsNullOrEmpty(sd.Conteudo)) return;
        try
        {
            var dst = sd.Caminho;
            var dir = Path.GetDirectoryName(dst);
            if (dir != null) Directory.CreateDirectory(dir);
            if (!File.Exists(dst))
                File.WriteAllText(dst, sd.Conteudo);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Erro ao extrair script de usuário '{ScriptName}'", sd.Nome);
        }
    }
}
```

- [ ] **3.2 Criar IScriptFilterService + ScriptFilterService**

```csharp
// IScriptFilterService.cs
using FMOptimization.Models;

namespace FMOptimization.Services;

public interface IScriptFilterService
{
    IEnumerable<ScriptModel> ApplyFilter(IEnumerable<ScriptModel> source, string searchText, string selectedCategory);
}
```

```csharp
// ScriptFilterService.cs
using FMOptimization.Models;
using FMOptimization.Resources;

namespace FMOptimization.Services;

public class ScriptFilterService : IScriptFilterService
{
    public IEnumerable<ScriptModel> ApplyFilter(
        IEnumerable<ScriptModel> source, string searchText, string selectedCategory)
    {
        if (selectedCategory == Strings.CategoryFavorites)
            source = source.Where(s => s.IsFavorito);
        else if (selectedCategory != Strings.CategoryAll)
            source = source.Where(s => s.Categoria == selectedCategory);

        var busca = searchText?.Trim().ToLower() ?? "";
        if (!string.IsNullOrEmpty(busca))
            source = source.Where(s =>
                s.Nome.ToLower().Contains(busca) ||
                s.Descricao.ToLower().Contains(busca));

        return source;
    }
}
```

- [ ] **3.3 Simplificar MainViewModel**

```csharp
// MainViewModel.cs — novos campos
private readonly IScriptExtractionService _extractor;
private readonly IScriptFilterService _filterService;

// Construtor
public MainViewModel(
    IDataService dataService,
    IScriptExecutionService executor,
    IScriptExtractionService extractor,
    IScriptFilterService filterService,
    ILogger<MainViewModel> logger)
{
    _dataService = dataService;
    _executor = executor;
    _extractor = extractor;
    _filterService = filterService;
    _logger = logger;
    _executor.OnLog += OnScriptLog;
    LoadData();
}
```

Em `LoadData()`, substituir as chamadas de extração:
```csharp
// Após montar AllScripts
_extractor.ExtrairScripts(AllScripts.Where(s => s.IsEmbedded));
foreach (var sd in _data.Scripts)
    _extractor.ExtrairScriptUsuario(sd);
```

Remover os métodos `ExtrairScript()`, `ExtrairScriptsUsuario()` do ViewModel.

Substituir `ApplyFilter()`:
```csharp
private void ApplyFilter()
{
    FilteredScripts = new ObservableCollection<ScriptModel>(
        _filterService.ApplyFilter(AllScripts, SearchText, SelectedCategory));
}
```

- [ ] **3.4 Registrar no App.xaml.cs**

```csharp
// App.xaml.cs
sc.AddSingleton<IDataService, DataService>();
sc.AddTransient<IScriptExecutionService, ScriptExecutionService>();
sc.AddTransient<IScriptExtractionService, ScriptExtractionService>();
sc.AddSingleton<IScriptFilterService, ScriptFilterService>();
sc.AddTransient<ViewModels.MainViewModel>();
sc.AddTransient<MainWindow>();
```

- [ ] **3.5 Buildar e verificar**

Run: `dotnet build FMOptimization/FMOptimization.csproj`
Expected: build succeeds

---

### Task 4: Testes Automatizados

**Files:**
- Create: `FMOptimization.Tests/FMOptimization.Tests.csproj`
- Create: `FMOptimization.Tests/Services/ScriptFilterServiceTests.cs`
- Create: `FMOptimization.Tests/Services/DataServiceTests.cs`

- [ ] **4.1 Criar projeto de testes**

```xml
<!-- FMOptimization.Tests/FMOptimization.Tests.csproj -->
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net9.0-windows</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <IsPackable>false</IsPackable>
  </PropertyGroup>
  <ItemGroup>
    <PackageReference Include="Microsoft.NET.Test.Sdk" Version="17.12.0" />
    <PackageReference Include="MSTest.TestAdapter" Version="3.6.0" />
    <PackageReference Include="MSTest.TestFramework" Version="3.6.0" />
    <PackageReference Include="Moq" Version="4.20.72" />
    <PackageReference Include="FluentAssertions" Version="7.0.0" />
  </ItemGroup>
  <ItemGroup>
    <ProjectReference Include="..\FMOptimization\FMOptimization.csproj" />
  </ItemGroup>
</Project>
```

- [ ] **4.2 Adicionar projeto à solution**

```bash
dotnet sln add FMOptimization.Tests/FMOptimization.Tests.csproj
```

- [ ] **4.3 Testes do ScriptFilterService**

```csharp
// ScriptFilterServiceTests.cs
namespace FMOptimization.Tests.Services;

using FMOptimization.Models;
using FMOptimization.Services;
using FluentAssertions;

[TestClass]
public class ScriptFilterServiceTests
{
    private readonly ScriptFilterService _sut = new();
    private readonly List<ScriptModel> _scripts;

    public ScriptFilterServiceTests()
    {
        _scripts =
        [
            new() { Nome = "Limpeza Temp", Descricao = "Remove temporarios", Categoria = "Limpeza", IsFavorito = false },
            new() { Nome = "Otimizar SSD", Descricao = "TRIM no SSD", Categoria = "Desempenho", IsFavorito = true },
            new() { Nome = "Desabilitar Telemetria", Descricao = "Bloqueia rastreamento", Categoria = "Privacidade", IsFavorito = false },
        ];
    }

    [TestMethod]
    public void ApplyFilter_CategoriaAll_RetornaTodos()
    {
        var result = _sut.ApplyFilter(_scripts, "", "Todas");
        result.Should().HaveCount(3);
    }

    [TestMethod]
    public void ApplyFilter_PorCategoria_RetornaCorrespondentes()
    {
        var result = _sut.ApplyFilter(_scripts, "", "Limpeza");
        result.Should().ContainSingle().Which.Nome.Should().Be("Limpeza Temp");
    }

    [TestMethod]
    public void ApplyFilter_Favoritos_RetornaApenasFavoritos()
    {
        var result = _sut.ApplyFilter(_scripts, "", "Favoritos");
        result.Should().ContainSingle().Which.Nome.Should().Be("Otimizar SSD");
    }

    [TestMethod]
    public void ApplyFilter_BuscaPorNome_RetornaCorrespondente()
    {
        var result = _sut.ApplyFilter(_scripts, "ssd", "Todas");
        result.Should().ContainSingle().Which.Nome.Should().Be("Otimizar SSD");
    }

    [TestMethod]
    public void ApplyFilter_BuscaPorDescricao_RetornaCorrespondente()
    {
        var result = _sut.ApplyFilter(_scripts, "rastreamento", "Todas");
        result.Should().ContainSingle().Which.Nome.Should().Be("Desabilitar Telemetria");
    }

    [TestMethod]
    public void ApplyFilter_SemResultado_RetornaVazio()
    {
        var result = _sut.ApplyFilter(_scripts, "zzzzzz", "Todas");
        result.Should().BeEmpty();
    }
}
```

- [ ] **4.4 Executar testes do filtro**

Run: `dotnet test FMOptimization.Tests/FMOptimization.Tests.csproj --filter "ClassName~ScriptFilterService"`
Expected: 6 passed

- [ ] **4.5 Testes do DataService**

```csharp
// DataServiceTests.cs
namespace FMOptimization.Tests.Services;

using FMOptimization.Models;
using FMOptimization.Services;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;

[TestClass]
public class DataServiceTests
{
    [TestMethod]
    public void Carregar_ArquivoInexistente_RetornaNovoAppData()
    {
        // DataService usa caminho fixo BaseDirectory, então se não há arquivo
        // ele retorna novo AppData(). Isso testa o fluxo de exceção também.
        // OBS: pode falhar se scripts_data.json existir no output dos testes.
        // Alternativa real: injetar caminho no construtor de DataService.
        var loggerMock = new Mock<ILogger<DataService>>();
        var service = new DataService(loggerMock.Object);
        var result = service.Carregar();
        result.Should().NotBeNull();
        result.Categorias.Should().BeEmpty();
    }

    [TestMethod]
    public void Salvar_NaoLancaExcecao()
    {
        var loggerMock = new Mock<ILogger<DataService>>();
        var service = new DataService(loggerMock.Object);
        var data = new AppData { Categorias = ["Teste"] };
        Action act = () => service.Salvar(data);
        act.Should().NotThrow();
    }
}
```

- [ ] **4.6 Executar todos os testes**

Run: `dotnet test FMOptimization.Tests/FMOptimization.Tests.csproj`
Expected: 8 passed

---

### Task 5: CancellationToken na Cadeia Async

**Files:**
- Modify: `FMOptimization/Services/IScriptExecutionService.cs`
- Modify: `FMOptimization/Services/ScriptExecutionService.cs`

- [ ] **5.1 Adicionar CancellationToken à interface**

```csharp
// IScriptExecutionService.cs
Task ExecuteAsync(ScriptModel script, CancellationToken cancellationToken = default);
```

- [ ] **5.2 Propagar no ScriptExecutionService**

```csharp
// ScriptExecutionService.cs
public async Task ExecuteAsync(ScriptModel script, CancellationToken cancellationToken = default)
{
    // ... (sem mudanças até RunProcess) ...
    await RunProcess(caminho, nome, tipo, cancellationToken);
}

private async Task RunProcess(string caminho, string nome, string tipo, CancellationToken ct)
{
    var psi = tipo switch { /* ... */ };
    psi.RedirectStandardOutput = true;
    psi.RedirectStandardError = true;
    psi.UseShellExecute = false;
    psi.CreateNoWindow = true;
    psi.WorkingDirectory = Path.GetDirectoryName(caminho) ?? "";

    using var process = new Process { StartInfo = psi };
    process.Start();
    _runningProcesses[nome] = process;

    try
    {
        ct.Register(() =>
        {
            try { if (!process.HasExited) process.Kill(entireProcessTree: true); }
            catch { /* processo já finalizou */ }
        });

        var outputTask = ReadStreamAsync(process.StandardOutput, ct);
        var errorTask = ReadStreamAsync(process.StandardError, ct);

        await Task.WhenAll(outputTask, errorTask);
        await process.WaitForExitAsync(ct);

        Log(LogMessages.ScriptFinished(nome, process.ExitCode), LogLevel.End);
    }
    finally
    {
        _runningProcesses.TryRemove(nome, out _);
        process.Dispose();
    }
}

private static async Task ReadStreamAsync(StreamReader reader, CancellationToken ct)
{
    string? line;
    while ((line = await reader.ReadLineAsync(ct)) != null)
    {
        if (!string.IsNullOrWhiteSpace(line))
            OnLog?.Invoke(line, LogLevel.Info);
    }
}
```

- [ ] **5.3 Buildar e verificar**

Run: `dotnet build FMOptimization/FMOptimization.csproj`
Expected: build succeeds

---

### Task 6: Remover `pause` dos Scripts na Extração

**Files:**
- Modify: `FMOptimization/Services/ScriptExtractionService.cs`

- [ ] **6.1 Adicionar sanitização na extração**

```csharp
// ScriptExtractionService.cs
private static byte[] SanitizeScript(byte[] content)
{
    var text = Encoding.UTF8.GetString(content);
    var lines = text.Split('\n')
        .Where(line =>
        {
            var trimmed = line.Trim().ToLowerInvariant();
            return trimmed != "pause" && trimmed != "pause >nul";
        });
    return Encoding.UTF8.GetBytes(string.Join("\n", lines));
}
```

Aplicar em `ExtrairScripts`:
```csharp
var data = Convert.FromBase64String(entry.ConteudoB64);
data = SanitizeScript(data);
// Sempre reextrair (remover if !File.Exists para garantir correções)
File.WriteAllBytes(dst, data);
File.SetAttributes(dst, FileAttributes.Normal);
```

- [ ] **6.2 Buildar e verificar**

Run: `dotnet build FMOptimization/FMOptimization.csproj`
Expected: build succeeds

---

### Task 7: Error Handling — Nunca Silenciar Exceções

**Files:**
- Modify: `FMOptimization/Services/ScriptExecutionService.cs`
- Modify: `FMOptimization/ViewModels/MainViewModel.cs`

- [ ] **7.1 Substituir catch vazio em ScriptExecutionService**

```csharp
// Cancel — substituir catch { }
catch (Exception ex) when (ex is InvalidOperationException or Win32Exception)
{
    _logger.LogWarning(ex, "Erro ao cancelar script {ScriptName} (processo já finalizou?)", script.Nome);
}
```

- [ ] **7.2 Adicionar logging a catches genéricos no MainViewModel**

```csharp
// ExecuteScript — no catch
catch (Exception ex)
{
    _logger.LogError(ex, "Erro inesperado ao executar script {ScriptName}", script?.Nome);
    Log($"Erro: {ex.Message}", LogLevel.Error);
}
```

- [ ] **7.3 Buildar e verificar**

Run: `dotnet build FMOptimization/FMOptimization.csproj`
Expected: build succeeds

---

### Task 8: Build-time Code Generation para ScriptRegistry

**Files:**
- Create: `FMOptimization/scripts/` (pasta com os `.bat`, `.cmd`, `.reg`, `.txt` originais)
- Create: `ScriptRegistryGenerator/` (projeto console)
- Create: `FMOptimization/scripts/scripts.json` (metadados)
- Modify: `FMOptimization/FMOptimization.csproj` — target pré-build
- Modify: `FMOptimization/Services/ScriptRegistry.cs` — será gerado como `ScriptRegistry.g.cs`

- [ ] **8.1 Exportar scripts atuais do Base64 para pasta scripts/**

```csharp
// ScriptRegistryGenerator/Program.cs (esboço)
foreach (var entry in ScriptRegistry.Entries)
{
    var bytes = Convert.FromBase64String(entry.ConteudoB64);
    var path = Path.Combine(scriptsDir, entry.CaminhoRelativo);
    Directory.CreateDirectory(Path.GetDirectoryName(path)!);
    File.WriteAllBytes(path, bytes);
}
```

- [ ] **8.2 Criar scripts.json com metadados**

```json
[
  {
    "nome": "Deletar Arquivos Temporarios",
    "descricao": "Remove arquivos das pastas Temp",
    "explicacao": "Apaga arquivos temporarios...",
    "categoria": "Limpeza",
    "caminhoRelativo": "scripts\\1 Delete Temporary Files.cmd",
    "admin": true,
    "tipo": ".cmd"
  }
]
```

- [ ] **8.3 Gerar ScriptRegistry.g.cs no pré-build**

```csharp
// ScriptRegistryGenerator lê scripts.json + arquivos, gera ScriptRegistry.g.cs
// com ScriptEntry[] contendo Base64 embutido, igual ao atual.
```

- [ ] **8.4 Buildar e verificar**

Run: `dotnet build FMOptimization/FMOptimization.csproj`
Expected: ScriptRegistry.g.cs gerado, rebuild succeeds

---

## Resumo de Impacto nos Arquivos

| Task | Cria | Modifica | Descrição |
|------|------|----------|-----------|
| 1 | — | `csproj`, `App.xaml.cs`, `DataService.cs`, `ScriptExecutionService.cs`, `MainViewModel.cs` | ILogger\<T\> em todo lugar |
| 2 | — | `ScriptExecutionService.cs` | ConcurrentDictionary |
| 3 | `IScriptExtractionService.cs`, `ScriptExtractionService.cs`, `IScriptFilterService.cs`, `ScriptFilterService.cs` | `MainViewModel.cs`, `App.xaml.cs` | SRP extraction |
| 4 | `FMOptimization.Tests/` (projeto + 2 testes) | — | 8 testes unitários |
| 5 | — | `IScriptExecutionService.cs`, `ScriptExecutionService.cs` | CancellationToken |
| 6 | — | `ScriptExtractionService.cs` | Remover pause |
| 7 | — | `ScriptExecutionService.cs`, `MainViewModel.cs` | Error handling |
| 8 | `ScriptRegistryGenerator/`, `scripts/`, `scripts.json` | `csproj`, `ScriptRegistry.cs` | Code generation |
