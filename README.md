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
