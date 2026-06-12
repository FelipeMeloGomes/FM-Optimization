# FM Optimization

**Unifique todos os scripts de otimização do Windows em um só lugar.**

Chega de pesquisar na internet por scripts .bat, .cmd, .reg e .ps1 para cada tarefa de manutenção do sistema. O FM Optimization reúne **39 scripts** essenciais em uma interface gráfica moderna — tudo embutido em um único executável, sem dependências externas.

## Funcionalidades

- **39 Scripts Embutidos** em 8 categorias (Limpeza, Desempenho, Rede, Privacidade, Sistema, GPU AMD/NVIDIA, Energia)
- **Tema escuro azul neon** com acentos `#0044ff`, ícones SVG e gradientes
- **Circuito animado no fundo** — traços de PCB com pulsos de dados fluindo (efeito neon)
- **Interface componentizada**: Sidebar, TopBar, ScriptCard e LogPanel como UserControls independentes
- **Busca instantânea** (Ctrl+F) com glow neon no foco
- **Favoritos**: marque scripts com estrela e filtre rapidamente
- **Log em tempo real** com terminal scrollável, cursor piscante e botões Copiar/Limpar
- **Execução inteligente**: .bat, .cmd, .ps1, .reg, .exe com detecção de admin
- **Gerenciamento**: adicione, edite ou remova scripts e categorias
- **Elevação UAC**: executável requer administrador automaticamente na abertura

## Tecnologias

| Tecnologia | Finalidade |
|---|---|
| **C# / .NET 9** | Linguagem e runtime |
| **WPF / XAML** | Interface gráfica com animações nativas (Storyboard, DoubleAnimation) |
| **CommunityToolkit.Mvvm** | Padrão MVVM |
| **Windows API** | Detecção de privilégios de administrador |

## Como executar

> O executável requer **Administrador** (UAC). Clique com botão direito e selecione "Executar como administrador".

```bash
dotnet run --project FMOptimization
```

## Publicar executável portátil

Gera um único `.exe` self-contained (~68 MB) sem dependência do .NET Runtime:

```bash
dotnet publish FMOptimization -c Release -o dist `
  --self-contained true `
  -p:PublishSingleFile=true `
  -p:IncludeNativeLibrariesForSelfExtract=true `
  -p:EnableCompressionInSingleFile=true
```

## Armazenamento dos Scripts

O FM Optimization funciona **sem instalação** — todos os scripts estão embutidos no executável e extraídos automaticamente na primeira execução.

### Scripts Embutidos (Built-in)

Os 39 scripts vêm codificados em **Base64** dentro do código fonte (`Services/ScriptRegistry.cs`). Na inicialização, o aplicativo:

1. Lê o `ScriptRegistry` e decodifica cada `ConteudoB64`
2. Extrai os arquivos para `%TEMP%\FMOptimization\scripts\`
3. Executa diretamente do diretório temp quando solicitado

```
┌─────────────────────────────────────────────────────────────┐
│                   FMOptimization.exe                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              ScriptRegistry.cs                        │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │ "1 Delete Temporary Files.cmd"                 │  │   │
│  │  │   ConteudoB64: Q29AZHNjAHI...  ◄── Base64     │  │   │
│  │  │ "Liberar Memoria RAM.bat"                      │  │   │
│  │  │   ConteudoB64: QWNob3M...                      │  │   │
│  │  │ ... (39 scripts)                               │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  │                       │                                │
│  │                       ▼                                │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │  MainViewModel.LoadData()                      │  │   │
│  │  │  └─ ExtrairScript() → decodifica Base64        │  │   │
│  │  │     e salva em disco se não existir             │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
│                       │                                      │
│                       ▼                                      │
│  %TEMP%\FMOptimization\scripts\                              │
│  ├── 1 Delete Temporary Files.cmd                            │
│  ├── Liberar Memoria RAM.bat                                 │
│  ├── Desabilitar Telemetria.bat                              │
│  ├── NVCleanstall_1.19.0.exe                                 │
│  └── ... (39 arquivos)                                       │
└─────────────────────────────────────────────────────────────┘
```

- A extração só ocorre **uma vez** (se o arquivo já existe, pula)
- O diretório `%TEMP%` é limpo pelo Windows periodicamente
- Cada execução regenera os arquivos se necessário

### Scripts do Usuário

Além dos embutidos, o usuário pode adicionar scripts próprios:

1. Abre o diálogo "Editar Script" → "Selecionar Arquivo"
2. Escolhe qualquer `.bat`, `.cmd`, `.ps1`, `.reg` ou `.exe`
3. O **caminho absoluto** é salvo em `scripts_data.json`

```
FMOptimization.exe/
└── scripts_data.json          ◄── ao lado do executável
    ├── "Categorias": ["Limpeza", "Desempenho", ...]
    ├── "Favoritos": ["Liberar Memoria RAM"]
    └── "Scripts": [           ◄── scripts do usuário
          { "Nome": "Meu Script",
            "Caminho": "D:\scripts\otimizar.bat",
            "Categoria": "Desempenho" }
        ]
```

### Resumo dos Caminhos

| Tipo | Onde fica | Definido em |
|---|---|---|
| **Scripts embutidos** | `%TEMP%\FMOptimization\scripts\` | `MainViewModel.cs:88` — `Path.Combine(Path.GetTempPath(), "FMOptimization", entry.CaminhoRelativo)` |
| **Dados do app** | Mesmo diretório do `.exe` | `DataService.cs:12` — `AppDomain.CurrentDomain.BaseDirectory` |
| **Scripts do usuário** | Qualquer lugar no disco | Escolhido pelo usuário no `OpenFileDialog`, salvo em `scripts_data.json` |

## Estrutura

```
FM-Scripts/
├── FMOptimization.sln
├── FMOptimization/
│   ├── App.xaml/.cs              - Tema azul neon e estilos globais
│   ├── MainWindow.xaml/.cs       - Interface principal (compõe UserControls)
│   ├── app.manifest              - requireAdministrator (UAC)
│   ├── icon.ico                  - Ícone do executável
│   ├── Models/                   - ScriptModel, AppData
│   ├── Services/                 - ScriptRegistry, DataService, ScriptExecution
│   ├── ViewModels/               - MainViewModel (MVVM)
│   ├── Views/                    - Dialogs (editar, categorias)
│   ├── Controls/                 - UserControls:
│   │   ├── SidebarControl        - Sidebar com logo pulsante e categorias
│   │   ├── TopBarControl         - Título + badge + search com glow
│   │   ├── ScriptCardControl     - Card de script (favorito, admin, ações)
│   │   ├── LogPanelControl       - Terminal com log scrollável
│   │   └── CircuitBackground     - Circuito PCB animado (fundo neon)
│   └── Converters/               - 7 conversores (cor, opacidade, visibilidade)
└── dist/                         - Executável publicado (single-file)
```
