# FM Optimize

**Unifique todos os scripts de otimização do Windows em um só lugar.**

[![site](https://img.shields.io/badge/site-fmoptimize-0044ff?style=for-the-badge)](https://fmoptimize.vercel.app)

Chega de pesquisar na internet por scripts .bat, .cmd, .reg e .ps1 para cada tarefa de manutenção do sistema. O FM Optimize reúne **41 scripts** essenciais (consolidados de 90) em uma interface gráfica moderna — tudo embutido em um único executável, sem dependências externas.

---

## Índice

- [Visão Geral](#visão-geral)
- [Site](#site)
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

O FM Optimize é um aplicativo desktop (Electron + React) que centraliza **41 scripts de otimização do Windows** (consolidados de 90) em uma interface gráfica moderna com tema escuro azul neon. Os scripts são embutidos diretamente no executável e extraídos automaticamente.

### O que ele faz?

- **Limpeza** — remove arquivos temporários, caches, logs e bloatware
- **Desempenho** — otimiza serviços, inicialização, SSD e jogos
- **Rede** — limpa DNS, reseta TCP/IP, testa latência, bloqueia telemetria
- **Privacidade** — desativa telemetria, Defender, Cortana, Copilot e Windows Update
- **Sistema** — repara arquivos (SFC/DISM), limpa WinSxS, gera relatório
- **GPU AMD/NVIDIA/Intel** — tweaks de latência e instalação limpa de drivers
- **Energia** — ativa planos Ultimate Performance e Alto Desempenho


---

## Site

Acesse o site oficial do FM Optimize em **[fmoptimize.vercel.app](https://fmoptimize.vercel.app)**.

O site é uma landing page responsiva com tema dark neon contendo:
- Visão geral do aplicativo
- Lista de recursos e categorias
- Tecnologias utilizadas
  - Galeria de screenshots
  - Vídeo de demonstração incorporado
  - **Download** das versões portátil e instalável

Os downloads são servidos diretamente via [GitHub Releases](https://github.com/FelipeMeloGomes/FM-Optimization/releases).

---

## Screenshots

<div align="center">
  <a href="assets/screenshots/main.webp"><img src="assets/screenshots/main.webp" alt="Janela principal do FM Optimize" width="600"></a>
  <p><em>Janela principal com sidebar, cards de scripts e painel de log</em></p>
</div>

<br>

<div align="center">
  <a href="assets/screenshots/script_details.webp"><img src="assets/screenshots/script_details.webp" alt="Detalhes de um script" width="600"></a>
  <p><em>Dialog de detalhes de um script com descrição e badges (sem código-fonte)</em></p>
</div>

<br>

<div align="center">
  <a href="assets/screenshots/terminal_log.webp"><img src="assets/screenshots/terminal_log.webp" alt="Painel de log em tempo real" width="600"></a>
  <p><em>Log scrollável com saída ao vivo, filtro por nível e toggle de quebra de linha</em></p>
</div>

<br>

<div align="center">
  <a href="assets/screenshots/new_script.webp"><img src="assets/screenshots/new_script.webp" alt="Adicionar novo script" width="600"></a>
  <p><em>Dialog de edição e adição de scripts por arquivo ou código direto</em></p>
</div>

---

## Funcionalidades

- **Dashboard** — visão geral do sistema: CPU (modelo/núcleos), GPU (modelo/VRAM), Memória (total/tipo DDR), Sistema (OS/versão), Armazenamento (disco primário/total)
- **Restore Points** — criar, listar, restaurar e excluir pontos de restauração do Windows com confirmação e status
- **Settings** — tela de configurações com alternância de tema e opções de comportamento
- **41 Scripts Embutidos** em 5 categorias (Tweaks, Cleaner, DNS Manager, Apps, Utilities)
- **Sidebar expandida** (w-48) com labels e ícones — todas as categorias visíveis sem colapso
- **Tema escuro azul neon** com acentos `#0044ff`, gradientes e `tabular-nums` para dados do sistema
- **Circuito animado no fundo** — traços de PCB com pulsos de dados fluindo (efeito neon)
- **Interface componentizada**: Sidebar, TopBar, ScriptCard, Dashboard, Restore Points, Settings e LogPanel como componentes React independentes
- **Componentes primitivos customizados** (Button, Input, Toggle, Dialog, Card) via class-variance-authority — sem dependência de shadcn/ui
- **Busca instantânea** (Ctrl+F) com glow neon no foco e debounce de 150ms (disponível nas páginas de scripts)
- **Favoritos**: marque scripts com estrela e filtre rapidamente por "Favoritos" na sidebar
- **Log em tempo real** com terminal scrollável, filtro por nível (Todos/Info/Warn/Error) e toggle de quebra de linha
- **Execução inteligente**: `.bat`, `.ps1`, `.reg`, `.exe` com detecção de admin
- **Cancelamento**: botão "■ Parar" vermelho substitui o "▶ Executar" durante execução — kill completo da árvore de processos
- **Expansão inline**: clique no nome/descrição do script para expandir o texto completo — sem modal
- **Badges visuais**: cores distintas por tipo de arquivo (BAT=verde, REG=ciano, EXE=laranja, TXT=cinza)

---

## Scripts Disponíveis

### Tabela Resumo

Abaixo os 41 scripts disponíveis em 5 categorias.

| # | Nome | Tipo | Admin | Categoria |
|---|------|------|-------|-----------|
| 1 | Debloat Visual do Windows | .bat | ✓ | Tweaks |
| 2 | Otimizar Desempenho Visual | .bat | ✗ | Tweaks |
| 3 | Otimizar Hardware | .bat | ✓ | Tweaks |
| 4 | Modo Gamer | .bat | ✓ | Tweaks |
| 5 | Gerenciar Planos de Energia | .bat | ✓ | Tweaks |
| 6 | Otimizar Servicos do Windows | .bat | ✓ | Tweaks |
| 7 | AMD - 1 Frame Pre-Renderizado | .reg | ✓ | Tweaks |
| 8 | AMD - Tweak Melody (Latencia) | .reg | ✓ | Tweaks |
| 9 | AMD - Reverter 3 Frames | .reg | ✓ | Tweaks |
| 10 | AMD - Reverter Tweak Melody | .reg | ✓ | Tweaks |
| 11 | NVCleanstall - Instalar Driver NVIDIA | .exe | ✓ | Tweaks |
| 12 | NVIDIA Profile Inspector | .exe | ✗ | Tweaks |
| 13 | Perfect Windows - Otimizacao Completa | .bat | ✓ | Tweaks |
| 14 | Otimizacao TCP/IP Avancada | .bat | ✓ | Tweaks |
| 15 | Restaurar Menu Classico | .bat | ✓ | Tweaks |
| 16 | Otimizar Efeitos Visuais | .bat | ✗ | Tweaks |
| 17 | Limpeza Rapida | .bat | ✓ | Cleaner |
| 18 | Limpeza de Atualizacoes | .bat | ✓ | Cleaner |
| 19 | Limpeza de Navegadores | .bat | ✗ | Cleaner |
| 20 | Limpeza Total | .bat | ✓ | Cleaner |
| 21 | Alterar DNS | .bat | ✓ | DNS Manager |
| 22 | Resetar Rede Completo | .bat | ✓ | DNS Manager |
| 23 | Diagnostico de Internet | .bat | ✗ | DNS Manager |
| 24 | Benchmark de DNS | .bat | ✗ | DNS Manager |
| 25 | Flush DNS | .bat | ✓ | DNS Manager |
| 26 | Privacidade Maxima | .bat | ✓ | Apps |
| 27 | Seguranca do Windows | .bat | ✓ | Apps |
| 28 | Remover Bloatware | .bat | ✓ | Apps |
| 29 | Debloat - Chris Titus Utility | .bat | ✗ | Apps |
| 30 | Pacote de Manutencao | .bat | ✓ | Utilities |
| 31 | Limpeza WinSxS | .bat | ✓ | Utilities |
| 32 | Relatorios do Sistema | .bat | ✗ | Utilities |
| 33 | Otimizar SSD | .bat | ✓ | Utilities |
| 34 | Compactar Sistema | .bat | ✓ | Utilities |
| 35 | Prioridade CPU/GPU - Registry Guide | .txt | ✗ | Utilities |
| 36 | SFC Scannow | .bat | ✓ | Utilities |
| 37 | CHKDSK (Verificar Disco) | .bat | ✓ | Utilities |
| 38 | DISM RestoreHealth | .bat | ✓ | Utilities |
| 39 | TRIM SSD | .bat | ✓ | Utilities |
| 40 | Liberar Memoria RAM | .bat | ✗ | Utilities |
| 41 | Encerrar Processos Desnecessarios | .bat | ✗ | Utilities |

### Por Categoria

<details>
<summary><b>Tweaks</b> (16 scripts)</summary>

Tweaks de desempenho, visual, hardware, energia e GPU para Windows.

| # | Nome | Descrição |
|---|------|-----------|
| 1 | **Debloat Visual do Windows** | Remove barra de pesquisa, Copilot, Widgets, Chat, Snap Layouts e sugestões do menu Iniciar |
| 2 | **Otimizar Desempenho Visual** | Desativa animações, transparência, Aero Peek e efeitos visuais — libera GPU/CPU |
| 3 | **Otimizar Hardware** | Core Parking, hibernação, suspensão USB, economia PCI Express e algoritmo Nagle |
| 4 | **Modo Gamer** | Game Mode, GPU Scheduling, baixa latência, Win32 Priority Separation e timer 0.5ms |
| 5 | **Gerenciar Planos de Energia** | Menu interativo: Ultimate Performance, Alto Desempenho, Balanced ou Economia |
| 6 | **Otimizar Servicos do Windows** | Desativa SysMain, Windows Search, DiagTrack e Xbox Services |
| 7 | **AMD - 1 Frame Pre-Renderizado** | Reduz input lag em jogos (GPU AMD, 1 frame) |
| 8 | **AMD - Tweak Melody (Latencia)** | Desativa economia de energia e otimiza latência da GPU AMD |
| 9 | **AMD - Reverter 3 Frames** | Restaura padrão de 3 frames pre-renderizados |
| 10 | **AMD - Reverter Tweak Melody** | Restaura configurações originais de energia/latência AMD |
| 11 | **NVCleanstall - Instalar Driver NVIDIA** | Instala driver NVIDIA sem bloatware, apenas componentes essenciais |
| 12 | **NVIDIA Profile Inspector** | Abre ferramenta avançada de ajustes ocultos do driver NVIDIA |
| 13 | **Perfect Windows - Otimizacao Completa** | Script interativo com 10 categorias de ajustes para Windows |
| 14 | **Otimizacao TCP/IP Avancada** | Ajusta MSS, MTU e janela TCP para reduzir latência em jogos/streaming |
| 15 | **Restaurar Menu Classico** | Restaura menu de contexto clássico do Windows 10 no Windows 11 |
| 16 | **Otimizar Efeitos Visuais** | Desativa animações e transparência manualmente (alternativa granular) |

</details>

<details>
<summary><b>Cleaner</b> (4 scripts)</summary>

Limpeza de arquivos temporários, caches e atualizações do sistema.

| # | Nome | Descrição |
|---|------|-----------|
| 17 | **Limpeza Rapida** | Apaga temporários, logs, prefetch e lixeira — seguro para execução semanal |
| 18 | **Limpeza de Atualizacoes** | Limpa cache do Windows Update, Windows Store, shaders DirectX e drivers |
| 19 | **Limpeza de Navegadores** | Apaga cache de Chrome, Edge, Firefox e Brave |
| 20 | **Limpeza Total** | Faxina completa: temporários, prefetch, logs, lixeira, navegadores, CleanMgr e componentes |

</details>

<details>
<summary><b>DNS Manager</b> (5 scripts)</summary>

Gerenciamento de DNS, diagnóstico e reset de rede.

| # | Nome | Descrição |
|---|------|-----------|
| 21 | **Alterar DNS** | Menu interativo: Cloudflare, Google, OpenDNS, Quad9, AdGuard ou DHCP |
| 22 | **Resetar Rede Completo** | Reseta Winsock, TCP/IP, Firewall, cache DNS, ARP e renova IP |
| 23 | **Diagnostico de Internet** | Testa ping para Cloudflare e Google, exibe configuração de IP |
| 24 | **Benchmark de DNS** | Testa resposta de 5 servidores DNS e mostra o mais rápido para sua região |
| 25 | **Flush DNS** | Limpa o cache DNS do sistema |

</details>

<details>
<summary><b>Apps</b> (4 scripts)</summary>

Privacidade, segurança e remoção de bloatware.

| # | Nome | Descrição |
|---|------|-----------|
| 26 | **Privacidade Maxima** | Desativa telemetria, localização, ID de anúncio, fala, Timeline e bloqueia hosts de telemetria |
| 27 | **Seguranca do Windows** | Menu interativo: desativar Windows Update, Defender ou instalação forçada de apps |
| 28 | **Remover Bloatware** | Remove Cortana, OneDrive, Xbox, YourPhone, Copilot e apps pré-instalados |
| 29 | **Debloat - Chris Titus Utility** | Baixa e executa ferramenta online de otimização do Windows |

</details>

<details>
<summary><b>Utilities</b> (12 scripts)</summary>

Ferramentas de manutenção, reparo e diagnóstico do sistema.

| # | Nome | Descrição |
|---|------|-----------|
| 30 | **Pacote de Manutencao** | SFC + DISM + CHKDSK + CleanMgr em sequência |
| 31 | **Limpeza WinSxS** | Reduz tamanho da pasta WinSxS via DISM StartComponentCleanup |
| 32 | **Relatorios do Sistema** | Gera relatórios de hardware/software (TXT) e bateria (HTML) na Área de Trabalho |
| 33 | **Otimizar SSD** | TRIM manual, otimização e ajustes para prolongar vida útil do SSD |
| 34 | **Compactar Sistema** | Compacta arquivos do SO com Compact OS (libera ~2GB) |
| 35 | **Prioridade CPU/GPU - Registry Guide** | Guia de registro para prioridade de CPU/GPU em jogos (abre no bloco de notas) |
| 36 | **SFC Scannow** | Verifica e repara arquivos protegidos do sistema |
| 37 | **CHKDSK (Verificar Disco)** | Verifica e repara erros no disco (setores danificados, sistema de arquivos) |
| 38 | **DISM RestoreHealth** | Repara a imagem do Windows |
| 39 | **TRIM SSD** | Força o comando TRIM no SSD manualmente |
| 40 | **Liberar Memoria RAM** | Força limpeza de working sets e caches da RAM |
| 41 | **Encerrar Processos Desnecessarios** | Finaliza OneDrive, YourPhone e Xbox em segundo plano |

</details>

---

## Tecnologias

| Tecnologia | Finalidade |
|---|---|
| **Electron 36** | Runtime desktop multiplataforma |
| **React 19** | Interface de usuário |
| **TypeScript** | Tipagem estática |
| **Vite (electron-vite)** | Build tool e dev server |
| **Tailwind CSS 4** | Estilização utilitária |
| **class-variance-authority** | Componentes primitivos customizados |
| **Framer Motion** | Animações de entrada/saída |
| **React Router 7** | Navegação entre páginas |
| **Lucide React** | Ícones SVG |
| **Node.js** | Processo principal (main process) |
| **Windows API (PowerShell/WMI)** | Detecção de hardware e sistema |

---

## Como Executar

> **⚠️ O app requer privilégios de administrador** — funcionalidades como Restore Points, limpeza de sistema e scripts exigem elevação.

```bash
cd fm-optimize-electron
npm run dev
```

Requires **Node.js** e **npm**. O modo dev abre janela do Electron com hot reload.

Para build de produção:

```bash
npm run build
npx electron-builder --win portable
```

---

## Publicar Executável

### Portátil (standalone)

Gera um único `.exe` standalone sem instalação:

```powershell
cd fm-optimize-electron
npm run build
npx electron-builder --win portable
```

Gera `dist/fm-optimize-portable.exe`. Execute **como administrador** (botão direito > Executar como administrador).

Organize na pasta correta:

```powershell
New-Item -ItemType Directory -Path "dist\portable" -Force
Move-Item -Path "dist\fm-optimize-portable.exe" -Destination "dist\portable\" -Force
Remove-Item -Path "dist\builder-debug.yml","dist\win-unpacked" -Recurse -Force -ErrorAction SilentlyContinue
```

### Instalável (NSIS)

```powershell
cd fm-optimize-electron
npm run build
npx electron-builder --win nsis
```

Gera `dist/fm-optimize-setup.exe`. Dados salvos em `%APPDATA%\fm-optimize\`.

Organize na pasta correta:

```powershell
New-Item -ItemType Directory -Path "dist\installer" -Force
Move-Item -Path "dist\fm-optimize-setup.exe","dist\fm-optimize-setup.exe.blockmap" -Destination "dist\installer\" -Force
Remove-Item -Path "dist\builder-debug.yml","dist\win-unpacked" -Recurse -Force -ErrorAction SilentlyContinue
```

---

## Armazenamento dos Scripts

O FM Optimize funciona **sem instalação** — todos os scripts estão embutidos no executável e extraídos automaticamente na inicialização.

### Scripts Embutidos (Built-in)

Os 41 scripts vêm codificados em **Base64** dentro de `resources/scripts.json`. Na inicialização, o Electron via `ScriptRegistryService`:

1. Lê o JSON e decodifica cada `content` (Base64)
2. Extrai os arquivos para `%TEMP%\fm-optimize\scripts\`
3. Executa diretamente do diretório temp quando solicitado

```
┌──────────────────────────────────────────────────────────────┐
│                    fm-optimize.exe                           │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              resources/scripts.json                     │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │ 41 entradas com name, category, extension,       │  │  │
│  │  │ requiresAdmin, content (Base64)                  │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  │                       │                                 │  │
│  │                       ▼                                 │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │  ScriptRegistryService.extractScript()            │  │  │
│  │  │  └─ Buffer.from(base64, 'base64') + sanitiza     │  │  │
│  │  │     (remove pause) + salva em disco               │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘   │
│                       │                                      │
│                       ▼                                      │
│  %TEMP%\fm-optimize\scripts\                              │
│  ├── tweaks-1 Debloat Visual do Windows.bat                  │
│  ├── tweaks-3 Otimizar Hardware.bat                          │
│  ├── apps-1 Privacidade Maxima.bat                           │
│  ├── builtin-8 NVCleanstall - Instalar Driver NVIDIA.exe     │
│  └── ... (41 arquivos)                                       │
└─────────────────────────────────────────────────────────────┘
```

- Scripts são **sempre reextraídos** na inicialização
- Na extração, linhas com `pause` ou `pause >nul` são **removidas automaticamente**
- O diretório `%TEMP%` é limpo pelo Windows periodicamente

### Scripts do Usuário

Além dos embutidos, o usuário pode adicionar scripts próprios:

1. Abre o diálogo "Editar Script" → "Selecionar Arquivo" ou cole o código diretamente
2. Escolhe qualquer `.bat`, `.cmd`, `.ps1`, `.reg` ou `.exe`
3. O **caminho absoluto** é salvo em `scripts_data.json`

```
FMOptimize.exe/
├── scripts_data.json          ◄── ao lado do executável
├── user_scripts/              ◄── scripts criados via código
│   ├── MeuScript.bat
│   └── ...
```

**scripts_data.json**:
```json
{
  "Categorias": ["Tweaks", "Cleaner", "DNS Manager", "Apps", "Utilities"],
  "Favoritos": ["Liberar Memoria RAM"],
  "Scripts": [
    { "Nome": "Meu Script", "Descricao": "...", "Categoria": "Desempenho", "Caminho": "D:\\scripts\\otimizar.bat", "Tipo": ".bat" }
  ]
}
```

### Resumo dos Caminhos

| Tipo | Onde fica | Definido em |
|---|---|---|
| **Scripts embutidos** | `%TEMP%\fm-optimize\scripts\` (sempre reextraídos) | ScriptRegistryService.extractScript() |
| **Dados do app** | `%APPDATA%\FMOptimize\` (packaged) ou `data/` (dev) | `DataService.getStoragePath()` |
| **Scripts do usuário (arquivo)** | Qualquer lugar no disco | Escolhido pelo usuário no `OpenFileDialog` |
| **Scripts do usuário (código)** | `{BaseDirectory}\user_scripts\` | Definido pelo nome salvo |

---

## Interface do Usuário

### Layout Principal

A interface é dividida em sidebar expandida (w-48) + conteúdo principal, navegando entre seções:

```
┌──────────┬───────────────────────────────────────────┐
│  Ícones  │  Dashboard / Restore Points / Settings     │
│  +       │  ou                                        │
│  Labels  │  TopBar (título + badge)                   │
│          │  ScriptCards (WrapPanel)                   │
│  Tweaks  │  ● Expand inline nome/desc                 │
│  Cleaner │  ● Badges de tipo e admin                  │
│  DNS     │  ● Estrela de favorito                     │
│  Apps    │  ● Botão Executar / Parar                  │
│  Utilit. │────────────────────────────────────────────│
│          │  LogPanelControl                           │
│  [Novo]  │  (filtro por nível + wrap toggle)          │
│  [Geren] │                                            │
│ ──────── │                                            │
│ Favoritos│                                            │
│ Config   │                                            │
└──────────┴───────────────────────────────────────────┘
```

### Componentes

| Componente | Arquivo | Descrição |
|---|---|---|
| **Sidebar** | `src/layout/Sidebar.tsx` | Sidebar expandida (w-48) com labels + ícones, seção Favoritos |
| **TopBar** | `src/layout/TopBar.tsx` | Título da página + badge de contagem; busca visível apenas em scripts |
| **ScriptCard** | `src/components/ScriptCard.tsx` | Card com expand inline, badges (ADMIN, tipo), botões Executar/Parar, estrela de favorito |
| **DashboardWidget** | `src/components/DashboardWidget.tsx` | Widget de info do sistema (CPU, GPU, RAM, disco, OS) |
| **LogPanel** | `src/components/LogPanel.tsx` | Terminal scrollável (max-h-40), filtro por nível, toggle line wrap |
| **CircuitBackground** | `src/components/CircuitBackground.tsx` | Fundo animado canvas — grid PCB com pulsos de dados (absolute com container relative) |
| **Button, Input, Toggle, Dialog, Card** | `src/components/ui/` | Primitivos customizados via CVA (class-variance-authority) |
| **EmptyState, LoadingState, ErrorState** | `src/components/ui/` | Estados compartilhados para páginas e componentes |

### Dialogs

| Dialog | Arquivo | Descrição |
|---|---|---|
| **Detalhes do Script** | `src/components/ScriptDetailDialog.tsx` | Exibe descrição detalhada e badges (sem código-fonte) |
| **Adicionar Script** | `src/components/EditScriptDialog.tsx` | Formulário para adicionar/editar script |

### Comportamento

- **Expand inline**: clique no nome/descrição do ScriptCard para expandir o texto completo; botão "Mais"/"Menos"
- **Busca**: campo de busca visível apenas nas páginas de scripts (oculto em Restore Points e Settings)
- **Restore Points**: campo de busca próprio com placeholder "Buscar pontos de restauração..."
- **Log**: filtro por nível (Todos/Info/Warn/Error) e toggle de quebra de linha

### Atalhos de Teclado

| Tecla | Ação |
|---|---|
| `Ctrl+F` | Foca o campo de busca |
| `Esc` | Limpa o campo de busca |

---

## Arquitetura

### Fluxo de Inicialização

```
electron/main/index.ts
  │
  ├─ mainWindow (BrowserWindow)
  │   ├─ preload (contextBridge)
  │   └─ loadRenderer (react-router)
  │
  └─ registerIpcHandlers()
       │
       ├─ ScriptRegistryService (loadScripts, getScriptContent)
       ├─ SystemInfoService (getSystemInfo — WMI/PowerShell)
       ├─ ScriptExecutionService (executeScript, cancelExecution)
       ├─ RestorePointService (getRestorePoints, create, delete, restore)
       ├─ DataService (loadSettings, saveSettings)
       └─ AdminCheck (isAdmin — net session)
```

### Fluxo de Execução de Script

```
Render: ScriptsPage → ScriptCard → "▶ Executar"
    │
    └─ useScriptContext().execute(id)
         │
         └─ window.electronAPI.executeScript(id)
              │
              └─ ipcMain.handle('execute-script')
                   │
                   └─ ScriptExecutionService.execute()
                        │
                         ├─ .bat → cmd.exe /c "<caminho>"
                         ├─ .ps1 → powershell.exe -ExecutionPolicy Bypass -File "<caminho>"
                         ├─ .reg → regedit.exe /s "<caminho>"
                         └─ .exe → execução direta
                             │
                             └─ child_process.spawn()
                                  ├─ stdout/stderr → IPC → LogContext (tempo real)
                                  └─ cancelamento via process.kill(tree: true)
```

### Fluxo de Extração de Scripts

```
ScriptRegistryService.getResourcesPath()
    │
    ├─ Dev:  resolve("resources/scripts.json")
    └─ Prod: path.join(process.resourcesPath, "scripts.json")
         │
         └─ extractScript()
              │
              ├─ Buffer.from(entry.content, 'base64')
              ├─ Sanitiza: remove linhas "pause" e "pause >nul"
              └─ Salva em %TEMP%\fm-optimize\scripts\
```

### Camadas do Projeto

```
electron/ (main process)
├─ main/index.ts        → Entry point, window creation, lifecycle
├─ main/ipc-handlers.ts → Registro de handlers (ipcMain.handle)
├─ main/services/       → ScriptRegistryService, SystemInfoService,
│                          ScriptExecutionService, RestorePointService,
│                          DataService, AdminCheck
├─ preload/index.ts     → contextBridge (ElectronAPI tipada)
└─ shared/ipc-types.ts  → Interfaces compartilhadas (tipos IPC)

src/ (renderer)
├─ main.tsx             → Entry point React
├─ App.tsx              → Providers + Router
├─ layout/              → AppLayout (sidebar + topbar + outlet + log)
├─ pages/               → DashboardPage, ScriptsPage, RestorePointsPage, SettingsPage
├─ contexts/            → ScriptContext, SystemContext, RestorePointContext,
│                          LogContext, SettingsContext
├─ components/
│  ├─ ui/               → Primitivos CVA: Button, Input, Toggle, Dialog, Card,
│  │                       EmptyState, LoadingState, ErrorState
│  ├─ ScriptCard.tsx    → Card com expand inline + badges + ações
│  ├─ ScriptCardSkeleton.tsx → Skeleton loader
│  ├─ DashboardWidget.tsx    → Widget de info do sistema
│  ├─ LogPanel.tsx      → Terminal scrollável (filtro, wrap, max-h-40)
│  ├─ FavoriteButton.tsx → Botão favorito com estrela
│  ├─ SearchInput.tsx   → Campo de busca
│  ├─ CircuitBackground.tsx → Fundo animado canvas (PCB neon)
│  ├─ ScriptDetailDialog.tsx → Dialog simplificado (só descrição + badges)
│  └─ EditScriptDialog.tsx   → Adicionar/editar script
├─ lib/utils.ts         → cn() utility (tailwind-merge + clsx)
└─ styles/globals.css   → Tema Tailwind v4 (@theme + @layer)
```

---

## Estrutura do Projeto

```
FM-Scripts/
├── AGENTS.md                             # Instruções de build para agente
├── README.md                             # Esta documentação
├── assets/                               # Screenshots
│
├── fm-optimize-electron/                 # Aplicação Electron
│   ├── package.json                      # Dependências e scripts
│   ├── electron.vite.config.ts           # Configuração do Vite
│   ├── electron-builder.yml              # Configuração do electron-builder
│   ├── tsconfig.json / .node.json / .web.json  # TypeScript configs
│   ├── index.html                        # HTML entry point
│   │
│   ├── resources/
│   │   ├── icon.ico                      # Ícone do executável
│   │   └── scripts.json                  # 41 scripts em Base64
│   │
│   ├── electron/ (main process)
│   │   ├── main/
│   │   │   ├── index.ts                  # Entry point, window creation
│   │   │   ├── ipc-handlers.ts           # Registro de handlers IPC
│   │   │   └── services/
│   │   │       ├── script-registry.ts    # Load, decode, extract scripts
│   │   │       ├── system-info.ts        # WMI via PowerShell
│   │   │       ├── script-executor.ts    # Spawn processos
│   │   │       ├── restore-points.ts     # PowerShell Checkpoint-Computer
│   │   │       ├── data-service.ts       # Persistência JSON
│   │   │       └── admin-check.ts        # isAdmin check
│   │   ├── preload/
│   │   │   └── index.ts                  # contextBridge
│   │   └── shared/
│   │       └── ipc-types.ts              # Interfaces compartilhadas
│   │
│   └── src/ (renderer)
│       ├── main.tsx                       # Entry point React
│       ├── App.tsx                        # Providers + Router
│       ├── layout/
│       │   ├── AppLayout.tsx              # Shell (sidebar + topbar + outlet + log)
│       │   ├── Sidebar.tsx                # Navegação lateral
│       │   └── TopBar.tsx                 # Busca e ações
│       ├── pages/
│       │   ├── DashboardPage.tsx          # Visão geral do sistema
│       │   ├── ScriptsPage.tsx            # Grid de scripts
│       │   ├── RestorePointsPage.tsx      # Gerenciar restore points
│       │   └── SettingsPage.tsx           # Preferências
│       ├── contexts/
│       │   ├── ScriptContext.tsx           # Estado de scripts
│       │   ├── SystemContext.tsx           # Estado do sistema
│       │   ├── RestorePointContext.tsx     # Estado de restore points
│       │   ├── LogContext.tsx              # Log em tempo real
│       │   └── SettingsContext.tsx         # Configurações
│       ├── components/
│       │   ├── ui/                         # Primitivos CVA
│       │   │   ├── Button.tsx
│       │   │   ├── Input.tsx
│       │   │   ├── Toggle.tsx
│       │   │   ├── Dialog.tsx
│       │   │   ├── Card.tsx
│       │   │   ├── EmptyState.tsx
│       │   │   ├── LoadingState.tsx
│       │   │   └── ErrorState.tsx
│       │   ├── ScriptCard.tsx              # Card com expand inline
│       │   ├── ScriptCardSkeleton.tsx      # Skeleton loader
│       │   ├── DashboardWidget.tsx         # Widget de dashboard
│       │   ├── LogPanel.tsx                # Terminal scrollável (filtro + wrap)
│       │   ├── FavoriteButton.tsx          # Botão favorito
│       │   ├── SearchInput.tsx             # Campo de busca
│       │   ├── CircuitBackground.tsx       # Fundo animado (canvas)
│       │   ├── ScriptDetailDialog.tsx      # Dialog simplificado
│       │   └── EditScriptDialog.tsx        # Adicionar/editar script
│       ├── lib/
│       │   └── utils.ts                    # cn() utility
│       └── styles/
│           └── globals.css                 # Tema Tailwind v4
│
└── FMOptimize.Tests/                   # (a migrar — testes C# antigos)
```

---

## Troubleshooting / FAQ

### "O aplicativo não abre"

O app detecta automaticamente se está rodando como administrador. Scripts marcados como "Requer Admin" só executam com privilégios elevados. O sistema solicitará UAC quando necessário.

### "Meu script não executa"

Verifique:
- O tipo do arquivo é suportado (`.bat`, `.ps1`, `.reg`, `.exe`, `.txt`)
- O script `.txt` é apenas aberto no bloco de notas, não executado
- Scripts marcados como "Admin" (ícone de escudo) exigem que o app rode como administrador

### "Onde estão meus scripts do usuário?"

Os dados ficam em `%APPDATA%\FMOptimize\` (ou `data/` em modo dev). Os scripts embutidos ficam em `%TEMP%\fm-optimize\scripts\`.

### "Como resetar tudo?"

Delete os arquivos abaixo e reinicie o aplicativo:
```
%TEMP%\fm-optimize\
%APPDATA%\fm-optimize\
```

### "O log está muito grande"

O log mantém no máximo **500 entradas** na tela. Use o botão "Limpar" (ícone de lixeira) para limpar manualmente.

### "Como recuperar um script que removi?"

Scripts embutidos (built-in) são recarregados automaticamente do `resources/scripts.json`. Scripts do usuário removidos não podem ser recuperados — a menos que você tenha backup dos dados.

---

## Roadmap

- [ ] **Agendamento de tarefas** — executar scripts em horário agendado
- [ ] **Perfis de otimização** — combinar múltiplos scripts em um único clique
- [ ] **Relatório de impacto** — mostrar o que cada script altera antes de executar

---

<div align="center">
  <sub>FM Optimize — Feito por <a href="https://github.com/anomalyco">Felipe Melo</a></sub>
</div>
