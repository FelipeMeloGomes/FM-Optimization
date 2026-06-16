# FM Optimization

**Unifique todos os scripts de otimização do Windows em um só lugar.**

Chega de pesquisar na internet por scripts .bat, .cmd, .reg e .ps1 para cada tarefa de manutenção do sistema. O FM Optimization reúne **90 scripts** essenciais em uma interface gráfica moderna — tudo embutido em um único executável, sem dependências externas.

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

O FM Optimization é um aplicativo WPF (.NET 9) que centraliza **90 scripts de otimização do Windows** em uma interface gráfica moderna com tema escuro azul neon. Os scripts são embutidos diretamente no executável e extraídos automaticamente.

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

- **90 Scripts Embutidos** em 11 categorias (Limpeza, Desempenho, Internet, Rede, Privacidade, Sistema, GPU - AMD, GPU - NVIDIA, Energia, Windows 11, Scripts Completos)
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
| 40 | DNS - Google | .bat | ✓ | Internet |
| 41 | DNS - Cloudflare | .bat | ✓ | Internet |
| 42 | DNS - OpenDNS | .bat | ✓ | Internet |
| 43 | DNS - Quad9 | .bat | ✓ | Internet |
| 44 | DNS - AdGuard | .bat | ✓ | Internet |
| 45 | DNS - Automatico (DHCP) | .bat | ✓ | Internet |
| 46 | Benchmark de DNS | .bat | ✗ | Internet |
| 47 | Flush DNS | .bat | ✓ | Internet |
| 48 | Winsock Reset | .bat | ✓ | Internet |
| 49 | Reset TCP/IP | .bat | ✓ | Internet |
| 50 | Desativar Animacoes do Sistema | .bat | ✗ | Desempenho |
| 51 | Desativar Transparencia do Windows | .bat | ✗ | Desempenho |
| 52 | Desativar SysMain (Superfetch) | .bat | ✓ | Desempenho |
| 53 | Desativar Windows Search | .bat | ✓ | Desempenho |
| 54 | Desativar GameDVR (Gravacao) | .bat | ✗ | Desempenho |
| 55 | Desativar Algoritmo Nagle | .bat | ✓ | Desempenho |
| 56 | Desativar Core Parking | .bat | ✓ | Desempenho |
| 57 | Otimizar Timer do Sistema | .bat | ✓ | Desempenho |
| 58 | Desativar Localizacao | .bat | ✓ | Privacidade |
| 59 | Desativar ID de Anuncio | .bat | ✓ | Privacidade |
| 60 | Desativar Sugestoes no Iniciar | .bat | ✓ | Privacidade |
| 61 | Desativar Timeline | .bat | ✓ | Privacidade |
| 62 | Desativar Conteudo Tela Bloqueio | .bat | ✓ | Privacidade |
| 63 | Desativar Reconhecimento de Fala | .bat | ✓ | Privacidade |
| 64 | Desativar Hibernacao | .bat | ✓ | Energia |
| 65 | Desativar Suspensao Automatica | .bat | ✓ | Energia |
| 66 | Desativar Suspensao USB | .bat | ✓ | Energia |
| 67 | Desativar Economia PCI Express | .bat | ✓ | Energia |
| 68 | Restaurar Menu Classico | .bat | ✓ | Windows 11 |
| 69 | Desabilitar Widgets | .bat | ✓ | Windows 11 |
| 70 | Desabilitar Chat (Teams) | .bat | ✓ | Windows 11 |
| 71 | Desabilitar Barra de Pesquisa | .bat | ✓ | Windows 11 |
| 72 | Desabilitar Snap Layouts | .bat | ✓ | Windows 11 |
| 73 | Desabilitar Copilot | .bat | ✓ | Windows 11 |
| 74 | SFC Scannow | .bat | ✓ | Sistema |
| 75 | DISM RestoreHealth | .bat | ✓ | Sistema |
| 76 | CHKDSK (Verificar Disco) | .bat | ✓ | Sistema |
| 77 | Compactar Sistema Operacional | .bat | ✓ | Sistema |
| 78 | TRIM SSD | .bat | ✓ | Sistema |
| 79 | Relatorio de Bateria | .bat | ✓ | Sistema |
| 80 | Limpeza Profunda do Sistema | .bat | ✓ | Scripts Completos |
| 81 | Limpeza de Disco (CleanMgr) | .bat | ✓ | Limpeza |
| 82 | Limpar Prefetch | .bat | ✓ | Limpeza |
| 83 | Limpar Cache de Miniaturas | .bat | ✗ | Limpeza |
| 84 | Limpar Cache da Windows Store | .bat | ✗ | Limpeza |
| 85 | Limpar Cache DirectX Shader | .bat | ✗ | Limpeza |
| 86 | Limpar Lixeira | .bat | ✗ | Limpeza |
| 87 | Limpar Cache de Atualizacoes | .bat | ✓ | Limpeza |
| 88 | Pacote de Manutencao | .bat | ✓ | Scripts Completos |
| 89 | Turbo Game Mode | .bat | ✓ | Scripts Completos |
| 90 | Privacidade Maxima | .bat | ✓ | Scripts Completos |

### Por Categoria

<details>
<summary><b>Limpeza</b> (15 scripts)</summary>

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
| 81 | **Limpeza de Disco (CleanMgr)** | Executa limpeza de disco com opções pré-selecionadas |
| 82 | **Limpar Prefetch** | Remove arquivos de pré-carregamento do sistema |
| 83 | **Limpar Cache de Miniaturas** | Remove cache de miniaturas do Explorer |
| 84 | **Limpar Cache da Windows Store** | Reseta o cache da Microsoft Store via `wsreset` |
| 85 | **Limpar Cache DirectX Shader** | Remove cache de shaders DirectX |
| 86 | **Limpar Lixeira** | Esvazia a lixeira via linha de comando |
| 87 | **Limpar Cache de Atualizacoes** | Remove cache de atualizações do Windows Update |

</details>

<details>
<summary><b>Desempenho</b> (15 scripts)</summary>

| # | Nome | Descrição |
|---|------|-----------|
| 9 | **Acelerar Inicializacao** | Desativa DiagTrack (telemetria) e SysMain (Superfetch) |
| 10 | **Win32 Priority Separation** | Ajusta prioridade de CPU para foreground (jogos) via registro |
| 11 | **Otimizar SSD** | Executa `defrag /O` e `winsat formal` para forçar TRIM |
| 12 | **Corrigir Erros do Sistema** | Executa SFC + DISM para reparar arquivos corrompidos |
| 13 | **Otimizar Servicos do Windows** | Desabilita 10+ serviços não essenciais (SysMain, Search, Telemetria, etc.) |
| 14 | **Otimizar Efeitos Visuais** | Remove animações, transparência, Aero Peek e reduz timeouts |
| 15 | **Otimizacao para Jogos** | Ativa Game Mode, GPU Scheduling, desativa GameDVR, ajusta latência |
| 50 | **Desativar Animacoes do Sistema** | Remove animações de janelas e menus |
| 51 | **Desativar Transparencia do Windows** | Desliga efeitos de transparência (Aero) |
| 52 | **Desativar SysMain (Superfetch)** | Desativa o serviço de pré-carregamento de aplicativos |
| 53 | **Desativar Windows Search** | Desativa o serviço de busca indexada |
| 54 | **Desativar GameDVR (Gravacao)** | Desativa gravação em segundo plano do Xbox Game Bar |
| 55 | **Desativar Algoritmo Nagle** | Desativa Nagle para reduzir latência de rede |
| 56 | **Desativar Core Parking** | Impede que núcleos de CPU sejam desligados |
| 57 | **Otimizar Timer do Sistema** | Ajusta resolução do timer para 0.5ms |

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
<summary><b>Internet</b> (10 scripts)</summary>

| # | Nome | Descrição |
|---|------|-----------|
| 40 | **DNS - Google** | Altera DNS para Google (8.8.8.8 / 8.8.4.4) |
| 41 | **DNS - Cloudflare** | Altera DNS para Cloudflare (1.1.1.1 / 1.0.0.1) |
| 42 | **DNS - OpenDNS** | Altera DNS para OpenDNS (208.67.222.222 / 208.67.220.220) |
| 43 | **DNS - Quad9** | Altera DNS para Quad9 (9.9.9.9 / 149.112.112.112) |
| 44 | **DNS - AdGuard** | Altera DNS para AdGuard (94.140.14.14 / 94.140.15.15) |
| 45 | **DNS - Automatico (DHCP)** | Restaura DNS para automático via DHCP |
| 46 | **Benchmark de DNS** | Testa latência de múltiplos provedores DNS |
| 47 | **Flush DNS** | Limpa cache DNS com `ipconfig /flushdns` |
| 48 | **Winsock Reset** | Reseta a pilha Winsock para configuração padrão |
| 49 | **Reset TCP/IP** | Reseta pilha TCP/IP e metadados de rede |

</details>

<details>
<summary><b>Privacidade</b> (11 scripts)</summary>

| # | Nome | Descrição |
|---|------|-----------|
| 22 | **Desabilitar Windows Update** | Bloqueia atualizações automáticas do Windows e Office via registro |
| 23 | **Desabilitar Windows Defender** | Desliga antivírus, antispyware e proteção em tempo real |
| 24 | **Desabilitar Apps e Instalacao Forcada** | Bloqueia bloatware da Microsoft Store e instalação silenciosa |
| 25 | **Desabilitar Telemetria e Rastreamento** | Desliga DiagTrack, localização, ID de anúncio, bloqueia hosts |
| 26 | **Desabilitar Cortana e Copilot** | Remove Cortana, Copilot, Widgets e busca na web (Bing) |
| 58 | **Desativar Localizacao** | Desativa serviço de localização e sensoriamento |
| 59 | **Desativar ID de Anuncio** | Remove ID de anúncio único do usuário |
| 60 | **Desativar Sugestoes no Iniciar** | Remove sugestões de apps no menu Iniciar |
| 61 | **Desativar Timeline** | Desativa o histórico de atividades e Timeline |
| 62 | **Desativar Conteudo Tela Bloqueio** | Remove dicas e sugestões da tela de bloqueio |
| 63 | **Desativar Reconhecimento de Fala** | Desativa reconhecimento de fala online (Cortana) |

</details>

<details>
<summary><b>Sistema</b> (11 scripts)</summary>

| # | Nome | Descrição |
|---|------|-----------|
| 27 | **Perfect Windows - Otimizacao Completa** | Script interativo com 200+ ajustes em 10 categorias |
| 28 | **Debloat - Chris Titus Utility** | Baixa e executa utilitário online de otimização (`iwr`) |
| 29 | **Prioridade CPU/GPU - Registry Guide** | Guia de caminhos do registro para prioridade em jogos |
| 30 | **Limpeza WinSxS e Componentes** | DISM + Compact para limpar WinSxS e componentes antigos |
| 31 | **Relatorio do Sistema** | Exporta hardware, disco, processos, serviços e bateria para `.txt` |
| 74 | **SFC Scannow** | Verifica e repara arquivos protegidos do sistema |
| 75 | **DISM RestoreHealth** | Repara imagem do Windows com DISM |
| 76 | **CHKDSK (Verificar Disco)** | Verifica integridade do disco com `chkdsk /f` |
| 77 | **Compactar Sistema Operacional** | Compacta arquivos do sistema com Compact OS |
| 78 | **TRIM SSD** | Força operação TRIM em unidades SSD |
| 79 | **Relatorio de Bateria** | Gera relatório detalhado de bateria (`powercfg /batteryreport`) |

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
<summary><b>Energia</b> (6 scripts)</summary>

| # | Nome | Descrição |
|---|------|-----------|
| 38 | **Ativar Plano de Energia Ultimate Performance** | Ativa o plano Ultimate Performance (desktops) |
| 39 | **Plano de Energia Alto Desempenho** | Ativa o plano Alto Desempenho |
| 64 | **Desativar Hibernacao** | Desliga hibernação e exclui `hiberfil.sys` |
| 65 | **Desativar Suspensao Automatica** | Impede que o sistema entre em suspensão |
| 66 | **Desativar Suspensao USB** | Impede desconexão de dispositivos USB para economia |
| 67 | **Desativar Economia PCI Express** | Desliga gerenciamento de energia de links PCI Express |

</details>

<details>
<summary><b>Windows 11</b> (6 scripts)</summary>

| # | Nome | Descrição |
|---|------|-----------|
| 68 | **Restaurar Menu Classico** | Restaura menu de contexto clássico do Windows 10 |
| 69 | **Desabilitar Widgets** | Desativa o painel de Widgets do Windows 11 |
| 70 | **Desabilitar Chat (Teams)** | Remove o botão do Chat / Teams da barra de tarefas |
| 71 | **Desabilitar Barra de Pesquisa** | Remove a barra de pesquisa da barra de tarefas |
| 72 | **Desabilitar Snap Layouts** | Desativa o recurso Snap Layouts ao passar o mouse |
| 73 | **Desabilitar Copilot** | Desativa o Microsoft Copilot integrado |

</details>

<details>
<summary><b>Scripts Completos</b> (3 scripts)</summary>

| # | Nome | Descrição |
|---|------|-----------|
| 80 | **Limpeza Profunda do Sistema** | Combina DISM, SFC, CleanMgr, prefetch, temp e logs |
| 88 | **Pacote de Manutencao** | Combina limpeza, reparo de sistema e otimização de disco |
| 89 | **Turbo Game Mode** | Combina 8 otimizações de desempenho para jogos |
| 90 | **Privacidade Maxima** | Combina telemetria, localização, anúncios, Cortana e diagnóstico |

</details>

---

## Tecnologias

| Tecnologia | Finalidade |
|---|---|
| **C# 13 / .NET 9.0** | Linguagem e runtime |
| **WPF / XAML** | Interface gráfica com animações nativas (Storyboard, DoubleAnimation) |
| **CommunityToolkit.Mvvm 8.4.2** | Padrão MVVM com source generators (`[ObservableProperty]`, `[RelayCommand]`) |
| **Microsoft.Extensions.DependencyInjection 10.0.9** | Injeção de dependência |
| **Microsoft.Extensions.Logging 10.0.9** | Logging estruturado (ILogger&lt;T&gt;) |
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

O FM Optimization funciona **sem instalação** — todos os scripts estão embutidos no executável e extraídos automaticamente na inicialização.

### Scripts Embutidos (Built-in)

Os 90 scripts vêm codificados em **Base64** dentro do código fonte (`Services/ScriptRegistry.cs`). Na inicialização, o aplicativo:

1. Lê o `ScriptRegistry` e decodifica cada `ConteudoB64`
2. Extrai os arquivos para `%TEMP%\FMOptimization\scripts\`
3. Executa diretamente do diretório temp quando solicitado

```
┌─────────────────────────────────────────────────────────────┐
│                   FMOptimization.exe                        │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              ScriptRegistry.cs                        │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
 │  │  │ 90 entradas com Nome, Categoria, Tipo,         │  │   │
 │  │  │ Admin, ConteudoB64 (Base64)                    │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  │                       │                                │
│  │                       ▼                                │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │  ScriptExtractionService.ExtrairScript()        │  │   │
│  │  │  └─ Convert.FromBase64String + sanitiza         │  │   │
│  │  │     (remove pause) + salva em disco             │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
│                       │                                      │
│                       ▼                                      │
│  %TEMP%\FMOptimization\scripts\                              │
│  ├── 1 Delete Temporary Files.cmd                            │
│  ├── Liberar Memoria RAM.bat                                 │
│  ├── Desabilitar Telemetria.bat                              │
│  ├── NVCleanstall_1.19.0.exe                                 │
│  └── ... (90 arquivos)                                       │
└─────────────────────────────────────────────────────────────┘
```

- Scripts são **sempre reextraídos** na inicialização (garante que correções como remoção de `pause` sejam aplicadas)
- Na extração, linhas com `pause` ou `pause >nul` são **removidas automaticamente** para execução não-interativa
- O diretório `%TEMP%` é limpo pelo Windows periodicamente

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
  "Categorias": ["Limpeza", "Desempenho", "Internet", "Rede", "Privacidade", "Sistema", "GPU - AMD", "GPU - NVIDIA", "Energia", "Windows 11", "Scripts Completos"],
  "Favoritos": ["Liberar Memoria RAM"],
  "Scripts": [
    { "Nome": "Meu Script", "Descricao": "...", "Categoria": "Desempenho", "Caminho": "D:\\scripts\\otimizar.bat", "Tipo": ".bat" }
  ]
}
```

### Resumo dos Caminhos

| Tipo | Onde fica | Definido em |
|---|---|---|
| **Scripts embutidos** | `%TEMP%\FMOptimization\scripts\` (sempre reextraídos) | `ScriptExtractionService.cs` — `Path.Combine(Path.GetTempPath(), "FMOptimization", entry.CaminhoRelativo)` |
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
│ Sidebar │  │  (título + badge + busca)            │
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
| **TopBarControl** | `Controls/TopBarControl.xaml` | Título da categoria ativa + badge de contagem, campo de busca com glow neon no foco |
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
  │   ├─ IScriptExtractionService → ScriptExtractionService (Singleton)
  │   ├─ IScriptFilterService → ScriptFilterService (Singleton)
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
                 ├─ Constrói categorias (Todas, Favoritos + salvas)
                 ├─ Itera ScriptRegistry.Entries (90 built-in)
                 │   ├─ Cria ScriptModel
                 │   └─ ScriptExtractionService.ExtrairScript() → Base64 → TEMP (sanitizado)
                 ├─ Itera _data.Scripts (scripts do usuário)
                 ├─ Aplica filtro inicial (ScriptFilterService)
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
    └─ ScriptExtractionService.ExtrairScript() (para cada script embutido)
         │
         ├─ Busca entry no ScriptRegistry pelo nome
         ├─ Define destino: Path.Combine(TEMP, "FMOptimization", entry.CaminhoRelativo)
         ├─ Cria diretório se não existir
         ├─ Decodifica: Convert.FromBase64String(entry.ConteudoB64)
         ├─ Sanitiza: remove linhas "pause" e "pause >nul"
         ├─ Salva: File.WriteAllBytes(dst, data) (sempre sobrescreve)
         └─ Retorna caminho do arquivo extraído
```

### Camadas do Projeto

```
App.xaml.cs        → DI Container (ServiceProvider) com logging configurado
MainWindow.xaml    → View (XAML) + Code-behind (eventos, dialogs)
├─ Controls/       → UserControls reutilizáveis (Sidebar, TopBar, ScriptCard, LogPanel, CircuitBackground)
├─ ViewModels/     → MainViewModel (~450 linhas, lógica central)
├─ Services/       → 5 serviços: DataService, ScriptExecutionService, ScriptRegistry,
│                    ScriptExtractionService, ScriptFilterService
├─ Models/         → ScriptModel, AppData, ScriptData, CategoryItem, LogEntry, LogLevel
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
│   ├── App.xaml / App.xaml.cs            # Recursos globais + DI container (com logging)
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
│   │   └── TopBarControl.xaml/.cs        # Topo: título, busca, ações
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
│   │   └── ScriptModel.cs                    # ScriptModel + AppData + ScriptData
│   │
│   ├── Resources/
│   │   ├── LogMessages.cs / .resx             # Textos PT-BR para log
│   │   └── Strings.cs / .resx                 # Textos PT-BR para interface
│   │
│   ├── Services/
│   │   ├── DataService.cs / IDataService.cs             # Persistência JSON
│   │   ├── ScriptExecutionService.cs / IScriptExecutionService.cs  # Execução de processos
│   │   ├── ScriptExtractionService.cs / IScriptExtractionService.cs  # Extração Base64→TEMP
│   │   ├── ScriptFilterService.cs / IScriptFilterService.cs        # Filtro por categoria + busca
│   │   └── ScriptRegistry.cs                             # 90 scripts em Base64
│   │
│   ├── ViewModels/
│   │   └── MainViewModel.cs                           # VM principal (~450 linhas)
│   │
│   └── Views/
│       ├── DialogDetalhes.xaml/.cs                    # Detalhes do script
│       ├── DialogEditScript.xaml/.cs                  # Adicionar/editar script
│       └── DialogManageCategories.xaml/.cs            # Gerenciar categorias
│
├── FMOptimization.Tests/                # Projeto de testes unitários
│   ├── FMOptimization.Tests.csproj       # MSTest + Moq + FluentAssertions
│   ├── Services/
│   │   ├── ScriptFilterServiceTests.cs   # 6 testes (filtro por categoria + busca)
│   │   └── DataServiceTests.cs           # 3 testes (save, load, file-not-found)
│   │
│   └── Usings.cs                         # Global usings
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
