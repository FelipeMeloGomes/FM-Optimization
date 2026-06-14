# FM Optimization

**Unifique todos os scripts de otimização do Windows em um só lugar.**

Chega de pesquisar na internet por scripts .bat, .cmd, .reg e .ps1 para cada tarefa de manutenção do sistema. O FM Optimization reúne **39 scripts** essenciais em uma interface gráfica moderna — tudo embutido em um único executável, sem dependências externas.

---

## Índice

- [Visão Geral](#visão-geral)
- [Screenshots](#screenshots)
- [Funcionalidades](#funcionalidades)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Tecnologias](#tecnologias)
- [Como Executar](#como-executar)
- [Publicar Executável](#publicar-executável)
- [Armazenamento dos Scripts](#armazenamento-dos-scripts)
- [Interface do Usuário](#interface-do-usuário)
- [Arquitetura](#arquitetura)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Troubleshooting / FAQ](#troubleshooting--faq)
- [Roadmap](#roadmap)

---

## Visão Geral

O FM Optimization é um aplicativo WPF (.NET 9) que centraliza **39 scripts de otimização do Windows** em uma interface gráfica moderna com tema escuro azul neon. Os scripts são embutidos diretamente no executável e extraídos automaticamente na primeira execução.

### O que ele faz?

- **Limpeza** — remove arquivos temporários, caches, logs e bloatware
- **Desempenho** — otimiza serviços, inicialização, SSD e jogos
- **Rede** — limpa DNS, reseta TCP/IP, testa latência, bloqueia telemetria
- **Privacidade** — desativa telemetria, Defender, Cortana, Copilot e Windows Update
- **Sistema** — repara arquivos (SFC/DISM), limpa WinSxS, gera relatório
- **GPU AMD/NVIDIA** — tweaks de latência e instalação limpa de drivers
- **Energia** — ativa planos Ultimate Performance e Alto Desempenho

---

## Screenshots

> **Adicione aqui prints da interface** — os screenshots devem ser salvos em `assets/screenshots/`.

Sugestões de captura:
| Tela | Descrição |
|------|-----------|
| `main-window.png` | Interface principal com sidebar, cards e painel de log |
| `script-details.png` | Dialog de detalhes de um script |
| `circuit-bg.png` | Fundo animado de circuito PCB neon |
| `log-panel.png` | Terminal com log scrollável e cursor piscante |

---

## Funcionalidades

- **39 Scripts Embutidos** em 8 categorias (Limpeza, Desempenho, Rede, Privacidade, Sistema, GPU AMD, GPU NVIDIA, Energia)
- **Tema escuro azul neon** com acentos `#0044ff`, ícones SVG e gradientes
- **Circuito animado no fundo** — traços de PCB com pulsos de dados fluindo (efeito neon)
- **Interface componentizada**: Sidebar, TopBar, ScriptCard e LogPanel como UserControls independentes
- **Busca instantânea** (Ctrl+F) com glow neon no foco e debounce de 150ms
- **Favoritos**: marque scripts com estrela e filtre rapidamente
- **Log em tempo real** com terminal scrollável, cursor piscante e botões Copiar/Limpar
- **Execução inteligente**: `.bat`, `.cmd`, `.ps1`, `.reg`, `.exe` com detecção de admin
- **Cancelamento**: botão "■ Parar" vermelho substitui o "▶ Executar" durante execução — kill completo da árvore de processos
- **Gerenciamento**: adicione por arquivo ou código direto, edite ou remova scripts e categorias
- **Elevação UAC**: executável requer administrador automaticamente na abertura
- **Perfil do usuário**: nome editável exibido no topo, salvo em `scripts_data.json`
- **Animações escalonadas**: cards com fade-in e scale sequenciais (IndexToDelayConverter)
- **Badges visuais**: cores distintas por tipo de arquivo (BAT=verde, PS1=ciano, EXE/REG=laranja)

---

## Scripts Disponíveis

### Tabela Resumo

| # | Nome | Tipo | Admin | Categoria |
|---|------|------|-------|-----------|
| 1 | Deletar Arquivos Temporarios | .cmd | ✓ | Limpeza |
| 2 | Deletar Arquivos de Log | .cmd | ✓ | Limpeza |
| 3 | Deletar Cache do Windows Update | .cmd | ✓ | Limpeza |
| 4 | Script Baboo v3.2 - Limpeza Total | .bat | ✓ | Limpeza |
| 5 | Liberar Memoria RAM | .bat | ✗ | Limpeza |
| 6 | Encerrar Processos Desnecessarios | .bat | ✗ | Limpeza |
| 7 | Limpeza de Navegadores | .bat | ✗ | Limpeza |
| 8 | Limpeza Completa do Sistema | .bat | ✓ | Limpeza |
| 9 | Acelerar Inicializacao | .bat | ✓ | Desempenho |
| 10 | Win32 Priority Separation | .reg | ✓ | Desempenho |
| 11 | Otimizar SSD | .bat | ✓ | Desempenho |
| 12 | Corrigir Erros do Sistema | .bat | ✓ | Desempenho |
| 13 | Otimizar Servicos do Windows | .bat | ✓ | Desempenho |
| 14 | Otimizar Efeitos Visuais | .bat | ✗ | Desempenho |
| 15 | Otimizacao para Jogos | .bat | ✓ | Desempenho |
| 16 | Otimizar DNS e Internet | .bat | ✓ | Rede |
| 17 | Otimizacao TCP/IP Avancada | .bat | ✓ | Rede |
| 18 | Bloquear Telemetria Microsoft | .bat | ✓ | Rede |
| 19 | Resetar Pilha TCP/IP Completa | .bat | ✓ | Rede |
| 20 | Testar Latencia Internet | .bat | ✗ | Rede |
| 21 | Network Reset Completo | .bat | ✓ | Rede |
| 22 | Desabilitar Windows Update | .cmd | ✓ | Privacidade |
| 23 | Desabilitar Windows Defender | .cmd | ✓ | Privacidade |
| 24 | Desabilitar Apps e Instalacao Forcada | .cmd | ✓ | Privacidade |
| 25 | Desabilitar Telemetria e Rastreamento | .bat | ✓ | Privacidade |
| 26 | Desabilitar Cortana e Copilot | .bat | ✗ | Privacidade |
| 27 | Perfect Windows - Otimizacao Completa | .bat | ✓ | Sistema |
| 28 | Debloat - Chris Titus Utility | .txt | ✗ | Sistema |
| 29 | Prioridade CPU/GPU - Registry Guide | .txt | ✗ | Sistema |
| 30 | Limpeza WinSxS e Componentes | .bat | ✓ | Sistema |
| 31 | Relatorio do Sistema | .bat | ✗ | Sistema |
| 32 | AMD - 1 Frame Pre-Renderizado | .reg | ✓ | GPU - AMD |
| 33 | AMD - Tweak Melody (Latencia) | .reg | ✓ | GPU - AMD |
| 34 | AMD - Reverter 3 Frames | .reg | ✓ | GPU - AMD |
| 35 | AMD - Reverter Tweak Melody | .reg | ✓ | GPU - AMD |
| 36 | NVCleanstall - Instalar Driver NVIDIA | .exe | ✓ | GPU - NVIDIA |
| 37 | NVIDIA Profile Inspector | .exe | ✗ | GPU - NVIDIA |
| 38 | Ativar Plano de Energia Ultimate Performance | .bat | ✓ | Energia |
| 39 | Plano de Energia Alto Desempenho | .bat | ✓ | Energia |

### Por Categoria

<details>
<summary><b>Limpeza</b> (8 scripts)</summary>

| # | Nome | Descrição |
|---|------|-----------|
| 1 | **Deletar Arquivos Temporarios** | Remove `%temp%` e `C:\Windows\Temp`, recria pastas e ajusta permissões |
| 2 | **Deletar Arquivos de Log** | Varre toda a unidade C: e deleta todos os arquivos `.log` |
| 3 | **Deletar Cache do Windows Update** | Para serviços de update e limpa a pasta SoftwareDistribution |
| 4 | **Script Baboo v3.2 - Limpeza Total** | Limpeza abrangente: Lixeira, Temp, logs, caches de navegadores e apps |
| 5 | **Liberar Memoria RAM** | Força o Windows a liberar RAM de processos ociosos via `rundllll32` |
| 6 | **Encerrar Processos Desnecessarios** | Finaliza OneDrive, YourPhone, Xbox Game Bar e serviços em 2º plano |
| 7 | **Limpeza de Navegadores** | Fecha Chrome, Edge, Firefox e limpa caches de cada navegador |
| 8 | **Limpeza Completa do Sistema** | Prefetch, Lixeira, logs, cache DNS, .NET, CleanMgr, DISM |

</details>

<details>
<summary><b>Desempenho</b> (7 scripts)</summary>

| # | Nome | Descrição |
|---|------|-----------|
| 9 | **Acelerar Inicializacao** | Desativa DiagTrack (telemetria) e SysMain (Superfetch) |
| 10 | **Win32 Priority Separation** | Ajusta prioridade de CPU para foreground (jogos) via registro |
| 11 | **Otimizar SSD** | Executa `defrag /O` e `winsat formal` para forçar TRIM |
| 12 | **Corrigir Erros do Sistema** | Executa SFC + DISM para reparar arquivos corrompidos |
| 13 | **Otimizar Servicos do Windows** | Desabilita 10+ serviços não essenciais (SysMain, Search, Telemetria, etc.) |
| 14 | **Otimizar Efeitos Visuais** | Remove animações, transparência, Aero Peek e reduz timeouts |
| 15 | **Otimizacao para Jogos** | Ativa Game Mode, GPU Scheduling, desativa GameDVR, ajusta latência |

</details>

<details>
<summary><b>Rede</b> (6 scripts)</summary>

| # | Nome | Descrição |
|---|------|-----------|
| 16 | **Otimizar DNS e Internet** | `flushdns`, `release/renew`, reset TCP/IP + Winsock |
| 17 | **Otimizacao TCP/IP Avancada** | 12 ajustes de rede (RSS, ECN, autotuning, chimney, etc.) |
| 18 | **Bloquear Telemetria Microsoft** | Adiciona 16 domínios de telemetria ao arquivo Hosts |
| 19 | **Resetar Pilha TCP/IP Completa** | Winsock, TCP/IP, DNS, ARP, NetBIOS |
| 20 | **Testar Latencia Internet** | Ping para Cloudflare (1.1.1.1) e Google (8.8.8.8) |
| 21 | **Network Reset Completo** | Reset completo: Winsock, TCP/IP, WinHTTP, Firewall, DNS, adaptadores |

</details>

<details>
<summary><b>Privacidade</b> (5 scripts)</summary>

| # | Nome | Descrição |
|---|------|-----------|
| 22 | **Desabilitar Windows Update** | Bloqueia atualizações automáticas do Windows e Office via registro |
| 23 | **Desabilitar Windows Defender** | Desliga antivírus, antispyware e proteção em tempo real |
| 24 | **Desabilitar Apps e Instalacao Forcada** | Bloqueia bloatware da Microsoft Store e instalação silenciosa |
| 25 | **Desabilitar Telemetria e Rastreamento** | Desliga DiagTrack, localização, ID de anúncio, bloqueia hosts |
| 26 | **Desabilitar Cortana e Copilot** | Remove Cortana, Copilot, Widgets e busca na web (Bing) |

</details>

<details>
<summary><b>Sistema</b> (5 scripts)</summary>

| # | Nome | Descrição |
|---|------|-----------|
| 27 | **Perfect Windows - Otimizacao Completa** | Script interativo com 200+ ajustes em 10 categorias |
| 28 | **Debloat - Chris Titus Utility** | Baixa e executa utilitário online de otimização (`iwr`) |
| 29 | **Prioridade CPU/GPU - Registry Guide** | Guia de caminhos do registro para prioridade em jogos |
| 30 | **Limpeza WinSxS e Componentes** | DISM + Compact para limpar WinSxS e componentes antigos |
| 31 | **Relatorio do Sistema** | Exporta hardware, disco, processos, serviços e bateria para `.txt` |

> **Nota sobre scripts `.txt`**: scripts com extensão `.txt` (Chris Titus, Registry Guide) são abertos com o bloco de notas, não executados. Use-os como referência ou execute manualmente os comandos.

</details>

<details>
<summary><b>GPU - AMD</b> (4 scripts)</summary>

| # | Nome | Descrição |
|---|------|-----------|
| 32 | **AMD - 1 Frame Pre-Renderizado** | Reduz input lag (1 frame pre-renderizado) |
| 33 | **AMD - Tweak Melody (Latencia)** | 33 ajustes de latência no driver AMD |
| 34 | **AMD - Reverter 3 Frames** | Restaura 3 frames pre-renderizados (padrão) |
| 35 | **AMD - Reverter Tweak Melody** | Restaura configurações originais de energia/latência |

</details>

<details>
<summary><b>GPU - NVIDIA</b> (2 scripts)</summary>

| # | Nome | Descrição |
|---|------|-----------|
| 36 | **NVCleanstall - Instalar Driver NVIDIA** | Instalador customizado sem GeForce Experience e bloatware |
| 37 | **NVIDIA Profile Inspector** | Ferramenta de ajustes avançados do driver NVIDIA |

</details>

<details>
<summary><b>Energia</b> (2 scripts)</summary>

| # | Nome | Descrição |
|---|------|-----------|
| 38 | **Ativar Plano de Energia Ultimate Performance** | Ativa o plano Ultimate Performance (desktops) |
| 39 | **Plano de Energia Alto Desempenho** | Ativa o plano Alto Desempenho |

</details>

---

## Tecnologias

| Tecnologia | Finalidade |
|---|---|
| **C# 13 / .NET 9.0** | Linguagem e runtime |
| **WPF / XAML** | Interface gráfica com animações nativas (Storyboard, DoubleAnimation) |
| **CommunityToolkit.Mvvm 8.4.2** | Padrão MVVM com source generators (`[ObservableProperty]`, `[RelayCommand]`) |
| **Microsoft.Extensions.DependencyInjection 10.0.9** | Injeção de dependência |
| **System.Text.Json 10.0.9** | Serialização JSON |
| **Windows API** | Detecção de privilégios de administrador |

---

## Como Executar

> O executável requer **Administrador** (UAC). Clique com botão direito e selecione "Executar como administrador".

```bash
dotnet run --project FMOptimization
```

Ou execute o binário publicado diretamente:

```powershell
.\dist\FMOptimization.exe
```

---

## Publicar Executável

### Portátil (self-contained, ~148 MB)

Gera um único `.exe` standalone sem dependência do .NET Runtime:

```powershell
dotnet publish FMOptimization -c Release -r win-x64 --self-contained -o dist
```

O executável será gerado em `dist/FMOptimization.exe` (~148 MB).

### Com compressão (alternativa, ~68 MB)

Adicione as flags de compressão para reduzir o tamanho:

```powershell
dotnet publish FMOptimization -c Release -r win-x64 --self-contained -o dist `
  -p:PublishSingleFile=true `
  -p:IncludeNativeLibrariesForSelfExtract=true `
  -p:EnableCompressionInSingleFile=true
```

---

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
│  │  │ 39 entradas com Nome, Categoria, Tipo,         │  │   │
│  │  │ Admin, ConteudoB64 (Base64)                    │  │   │
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

1. Abre o diálogo "Editar Script" → "Selecionar Arquivo" ou cole o código diretamente
2. Escolhe qualquer `.bat`, `.cmd`, `.ps1`, `.reg` ou `.exe`
3. O **caminho absoluto** é salvo em `scripts_data.json`

```
FMOptimization.exe/
├── scripts_data.json          ◄── ao lado do executável
├── user_scripts/              ◄── scripts criados via código
│   ├── MeuScript.bat
│   └── ...
```

**scripts_data.json**:
```json
{
  "Categorias": ["Limpeza", "Desempenho", "Rede", "Privacidade", "Sistema", "GPU - AMD", "GPU - NVIDIA", "Energia"],
  "Favoritos": ["Liberar Memoria RAM"],
  "Scripts": [
    { "Nome": "Meu Script", "Descricao": "...", "Categoria": "Desempenho", "Caminho": "D:\\scripts\\otimizar.bat", "Tipo": ".bat" }
  ],
  "Profile": {
    "NomeExibicao": "Felipe",
    "UserName": "Canuto",
    "MachineName": "FELIPEMELO",
    "PrimeiroUso": "2026-06-12T18:08:24.299-03:00"
  }
}
```

### Resumo dos Caminhos

| Tipo | Onde fica | Definido em |
|---|---|---|
| **Scripts embutidos** | `%TEMP%\FMOptimization\scripts\` | `MainViewModel.cs:104` — `Path.Combine(Path.GetTempPath(), "FMOptimization", entry.CaminhoRelativo)` |
| **Dados do app** | Mesmo diretório do `.exe` | `DataService.cs:12` — `AppDomain.CurrentDomain.BaseDirectory` |
| **Scripts do usuário (arquivo)** | Qualquer lugar no disco | Escolhido pelo usuário no `OpenFileDialog` |
| **Scripts do usuário (código)** | `{BaseDirectory}\user_scripts\` | Definido pelo nome salvo |

---

## Interface do Usuário

### Layout Principal

A interface é dividida em 3 colunas:

```
┌─────────┬──┬──────────────────────────────────────┐
│         │  │  TopBarControl                       │
│ Sidebar │  │  (título + badge + busca + perfil)   │
│ Control │G │──────────────────────────────────────│
│         │r │                                      │
│ Catego- │i │  ScriptCards (WrapPanel)             │
│ rias    │d │  ● Fade-in + scale animados          │
│ com     │S │  ● Badges de tipo e admin            │
│ ícones  │p │  ● Estrela de favorito               │
│ SVG     │l │  ● Botão Executar / Parar            │
│         │i │                                      │
│ [Add]   │t │──────────────────────────────────────│
│ [Manage]│t │  LogPanelControl                     │
│         │e │  (terminal scrollável com cursor      │
│         │r │   piscante + Copiar/Limpar)          │
└─────────┴──┴──────────────────────────────────────┘
```

### UserControls

| Control | Arquivo | Descrição |
|---|---|---|
| **SidebarControl** | `Controls/SidebarControl.xaml` | Logo FM/OPTIMIZATION pulsante, lista de categorias com ícones SVG, destaque ativo com glow, botões "Adicionar Script" e "Gerenciar Categorias" |
| **TopBarControl** | `Controls/TopBarControl.xaml` | Título da categoria ativa + badge de contagem, campo de busca com glow neon no foco, popup de perfil com nome editável |
| **ScriptCardControl** | `Controls/ScriptCardControl.xaml` | Card de 320px com animação fade-in/scale, nome, descrição, badges (ADMIN, categoria, tipo), botões Detalhes/Editar/Remover/Executar/Parar, estrela de favorito com animação |
| **LogPanelControl** | `Controls/LogPanelControl.xaml` | Terminal com log em fonte monospace, cursor piscante, botões Copiar/Limpar com animação, toggle expandir/recolher |
| **CircuitBackground** | `Controls/CircuitBackground.xaml` | Fundo animado de circuito PCB com 7 traços de fluxo, 10 nós pulsantes e 3 nós de junção com glow |

### Dialogs

| Dialog | Arquivo | Descrição |
|---|---|---|
| **Detalhes do Script** | `Views/DialogDetalhes.xaml` | Exibe nome, descrição detalhada, código-fonte do script, badges de tipo e admin |
| **Editar/Adicionar Script** | `Views/DialogEditScript.xaml` | Adiciona ou edita script por seleção de arquivo ou colagem de código |
| **Gerenciar Categorias** | `Views/DialogManageCategories.xaml` | Adiciona ou remove categorias personalizadas |

### Atalhos de Teclado

| Tecla | Ação |
|---|---|
| `Ctrl+F` | Foca o campo de busca |
| `Esc` | Limpa o campo de busca |

---

## Arquitetura

### Fluxo de Inicialização

```
App.xaml.cs
  │
  ├─ ServiceCollection (DI)
  │   ├─ IDataService → DataService (Singleton)
  │   ├─ IScriptExecutionService → ScriptExecutionService (Transient)
  │   ├─ MainViewModel (Transient)
  │   └─ MainWindow (Transient)
  │
  └─ MainWindow.Show()
       │
       └─ MainViewModel (construtor)
            │
            └─ LoadData()
                 │
                 ├─ Carrega scripts_data.json (DataService)
                 ├─ Popula Profile (nome, máquina, primeiro uso)
                 ├─ Constrói categorias (Todas, Favoritos + salvas)
                 ├─ Itera ScriptRegistry.Entries (39 built-in)
                 │   └─ Cria ScriptModel + ExtrairScript() → Base64 → TEMP
                 ├─ Itera _data.Scripts (scripts do usuário)
                 ├─ Aplica filtro inicial
                 └─ Salva categorias se primeira execução
```

### Fluxo de Execução de Script

```
Botão "▶ Executar"
    │
    └─ MainViewModel.ExecuteScript()
         │
         └─ ScriptExecutionService.ExecuteAsync()
              │
              ├─ .bat/.cmd → cmd.exe /c "<caminho>"
              ├─ .ps1 → powershell.exe -ExecutionPolicy Bypass -File "<caminho>"
              ├─ .reg → regedit.exe /s "<caminho>"
              ├─ .exe → execução direta
              └─ .txt → Process.Start com UseShellExecute (abre com bloco de notas)
                   │
                   └─ Process.Start()
                        ├─ RedirectStandardOutput/Error = true
                        ├─ CreateNoWindow = true
                        ├─ Log em tempo real via evento OnLog
                        └─ Suporte a cancelamento via process.Kill(tree: true)
```

### Fluxo de Extração de Scripts

```
MainViewModel.LoadData()
    │
    └─ ExtrairScript() (para cada script embutido)
         │
         ├─ Busca entry no ScriptRegistry pelo nome
         ├─ Define destino: Path.Combine(TEMP, "FMOptimization", entry.CaminhoRelativo)
         ├─ Cria diretório se não existir
         ├─ Se arquivo não existe:
         │   ├─ Convert.FromBase64String(entry.ConteudoB64)
         │   └─ File.WriteAllBytes(dst, data)
         └─ Se arquivo já existe: pula (extração única)
```

### Camadas do Projeto

```
App.xaml.cs        → DI Container (ServiceProvider)
MainWindow.xaml    → View (XAML) + Code-behind (eventos, dialogs)
├─ Controls/       → UserControls reutilizáveis (Sidebar, TopBar, ScriptCard, LogPanel, CircuitBackground)
├─ ViewModels/     → MainViewModel (~450 linhas, lógica central)
├─ Services/       → DataService (JSON), ScriptExecutionService (Process), ScriptRegistry (Base64)
├─ Models/         → ScriptModel, AppData, UserProfile, ScriptData, CategoryItem, LogEntry
├─ Converters/     → 8 converters (cor, opacidade, visibilidade, índice → tempo, etc.)
└─ Helpers/        → SecurityHelper (verificação de admin)
```

---

## Estrutura do Projeto

```
FM-Scripts/
├── FMOptimization.sln                    # Solução .NET 9
├── AGENTS.md                             # Instruções de build para agente
├── README.md                             # Esta documentação
├── assets/
│   └── screenshots/                      # Screenshots da interface
│
├── FMOptimization/                       # Projeto principal WPF
│   ├── App.xaml / App.xaml.cs            # Recursos globais + DI container
│   ├── MainWindow.xaml / .cs             # Layout principal + code-behind
│   ├── app.manifest                      # requireAdministrator (UAC)
│   ├── icon.ico                          # Ícone do executável
│   ├── FMOptimization.csproj             # .NET 9 WPF, single-file publish
│   │
│   ├── Assets/
│   │   ├── Icons.cs                      # SVG paths para ícones de categorias
│   │   └── Fonts/
│   │       ├── Audiowide-Regular.ttf      # Fonte logo "FM"
│   │       ├── JetBrainsMono-Bold.ttf    # Fonte monospace bold
│   │       ├── JetBrainsMono-Regular.ttf # Fonte monospace
│   │       ├── Rajdhani-Bold.ttf         # Fonte UI bold
│   │       └── Rajdhani-Regular.ttf      # Fonte UI principal
│   │
│   ├── Controls/
│   │   ├── CircuitBackground.xaml/.cs    # Fundo animado circuito PCB neon
│   │   ├── LogPanelControl.xaml/.cs      # Terminal com log scrollável
│   │   ├── ScriptCardControl.xaml/.cs    # Card de script
│   │   ├── SidebarControl.xaml/.cs       # Sidebar com categorias
│   │   └── TopBarControl.xaml/.cs        # Topo: título, busca, perfil
│   │
│   ├── Converters/
│   │   ├── AdminToVisibilityConverter.cs      # bool admin → Visibility
│   │   ├── BoolToOpacityConverter.cs          # bool → 1.0 / 0.4
│   │   ├── BoolToStarConverter.cs             # bool → ★ / ☆
│   │   ├── FileTypeToColorConverter.cs        # extensão → cor
│   │   ├── IconConverter.cs                   # categoria → Geometry SVG
│   │   ├── IconToColorConverter.cs            # extensão → cor
│   │   ├── IndexToDelayConverter.cs           # index → TimeSpan (animação)
│   │   └── LogLevelToColorConverter.cs        # LogLevel → cor
│   │
│   ├── Helpers/
│   │   └── SecurityHelper.cs                  # Verificação de admin
│   │
│   ├── Models/
│   │   ├── CategoryItem.cs                    # Categoria com nome e ícone
│   │   ├── LogEntry.cs                        # Entrada de log
│   │   ├── LogLevel.cs                        # Enum: Info, Start, End, Error, Warn
│   │   └── ScriptModel.cs                    # ScriptModel + AppData + Profile + ScriptData
│   │
│   ├── Resources/
│   │   ├── LogMessages.cs / .resx             # Textos PT-BR para log
│   │   └── Strings.cs / .resx                 # Textos PT-BR para interface
│   │
│   ├── Services/
│   │   ├── DataService.cs / IDataService.cs          # Persistência JSON
│   │   ├── ScriptExecutionService.cs / IScriptExecutionService.cs  # Execução
│   │   └── ScriptRegistry.cs                          # 39 scripts em Base64
│   │
│   ├── ViewModels/
│   │   └── MainViewModel.cs                           # VM principal (~450 linhas)
│   │
│   └── Views/
│       ├── DialogDetalhes.xaml/.cs                    # Detalhes do script
│       ├── DialogEditScript.xaml/.cs                  # Adicionar/editar script
│       └── DialogManageCategories.xaml/.cs            # Gerenciar categorias
│
└── dist/                               # Build publicado
    ├── FMOptimization.exe              # Single-file ~148 MB
    ├── scripts_data.json               # Dados do usuário
    └── user_scripts/                   # Scripts criados via código
```

---

## Troubleshooting / FAQ

### "O aplicativo não abre"

O executável requer **privilégios de administrador** (UAC). O `app.manifest` tem `requireAdministrator`. Clique com botão direito e selecione "Executar como administrador".

### "Meu script não executa"

Verifique:
- O tipo do arquivo é suportado (`.bat`, `.cmd`, `.ps1`, `.reg`, `.exe`, `.txt`)
- O script `.txt` é apenas aberto no bloco de notas, não executado
- Scripts marcados como "Admin" (ícone de escudo) exigem que o app rode como administrador

### "Onde estão meus scripts do usuário?"

Os dados ficam no arquivo `scripts_data.json` ao lado do executável. Os scripts embutidos ficam em `%TEMP%\FMOptimization\scripts\`.

### "Como resetar tudo?"

Delete os arquivos abaixo e reinicie o aplicativo:
```
%TEMP%\FMOptimization\
{BaseDirectory}\scripts_data.json
```

### "O log está muito grande"

O log mantém no máximo **500 entradas** na tela. Use o botão "Limpar" (ícone de lixeira) para limpar manualmente.

### "Como recuperar um script que removi?"

Scripts embutidos (built-in) são recarregados automaticamente do `ScriptRegistry.cs`. Scripts do usuário removidos não podem ser recuperados — a menos que você tenha backup do `scripts_data.json`.

---

## Roadmap

- [ ] **Categoria "Windows 11"** — já preparada no código (`GetCatIcon` reconhece o ícone), aguardando scripts específicos
- [ ] **Execução agendada** — permitir agendar scripts para execução periódica
- [ ] **Perfis de otimização** — combinar múltiplos scripts em um único clique
- [ ] **Backup automático** — salvar `scripts_data.json` com timestamp antes de alterações
- [ ] **Temas adicionais** — suporte a temas claros e customizados

---

<div align="center">
  <sub>FM Optimization — Feito por <a href="https://github.com/anomalyco">Felipe Melo</a></sub>
</div>
