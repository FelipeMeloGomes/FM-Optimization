# FM Optimization

**Unifique todos os scripts de otimização do Windows em um só lugar.**

Chega de pesquisar na internet por scripts .bat, .cmd, .reg e .ps1 para cada tarefa de manutenção do sistema. O FM Optimization reúne **39 scripts** essenciais em uma interface gráfica moderna — tudo embutido em um único executável, sem dependências externas.

## Ideia Principal

Manter o Windows otimizado exige executar dezenas de comandos diferentes: limpar arquivos temporários, resetar pilha TCP/IP, desativar telemetria, liberar RAM, otimizar GPU, reparar arquivos do sistema, e muito mais. Cada tarefa exige um script diferente, geralmente encontrado em fóruns e sites espalhados pela internet.

O FM Optimization **centraliza todos esses scripts** em um único programa com interface gráfica, organizados por categoria, com busca, execução com log em tempo real e suporte a favoritos. Não precisa mais caçar scripts um por um — está tudo aqui, pronto para usar.

## Funcionalidades

### 🧠 39 Scripts Embutidos
Distribuídos em **8 categorias** cobrindo todas as áreas de otimização:

| Categoria | Quantidade | Exemplos |
|-----------|:----------:|----------|
| **Limpeza** | 8 | Deletar Temporários, Logs, Cache do Windows Update, Script Baboo, Cache de Navegadores, Limpeza Completa, Liberar RAM, Encerrar Processos |
| **Desempenho** | 7 | Acelerar Inicialização, Win32 Priority Separation, Otimizar SSD, Corrigir Erros do Sistema, Otimizar Serviços, Efeitos Visuais, Otimização para Jogos |
| **Rede** | 7 | Otimizar DNS, TCP/IP Avançada, Bloquear Telemetria, Resetar Pilha TCP/IP, Testar Latência, Network Reset Completo |
| **Privacidade** | 5 | Desabilitar Windows Update/Defender, Desabilitar Telemetria, Apps Forçados, Cortana e Copilot |
| **Sistema** | 4 | Perfect Windows, Chris Titus Utility, Limpeza WinSxS, Relatório do Sistema |
| **GPU - AMD** | 4 | 1 Frame Pre-Renderizado, Tweak Melody (Latência), Reversores |
| **GPU - NVIDIA** | 2 | NVCleanstall (instalação limpa), NVIDIA Profile Inspector |
| **Energia** | 2 | Plano Ultimate Performance, Alto Desempenho |

### 🖥️ Interface Gráfica Moderna (Flet)
- Design escuro com tema Material Design
- Grid de cards responsivo com nome, descrição e badges (ADMIN / tipo de arquivo)
- Sidebar com categorias como pills e contagem ao vivo de scripts
- **Favoritos**: marque scripts com estrela e filtre rapidamente
- **Busca contextual**: filtre scripts por nome ou descrição dentro da categoria ativa (Ctrl+F)
- **Log em tempo real**: execute scripts e veja a saída com ícones coloridos (✓, ✗, !)

### ⚡ Execução Inteligente
- Suporte a **.bat, .cmd, .ps1, .reg, .exe e .txt**
- Detecção automática de scripts que exigem **permissão de administrador**
- Diálogo de confirmação ao executar scripts administrativos sem elevation
- Extração automática de scripts embutidos para execução (base64 → arquivo temporário)

### 🔧 Gerenciamento de Scripts
- **Adicione scripts externos**: inclua seus próprios scripts .bat, .cmd, .ps1 ou .exe
- **Edite e remova** scripts adicionados
- **Gerencie categorias**: crie, renomeie ou remova categorias livremente
- **Favoritos**: persista seus scripts preferidos entre sessões

### 📋 Logging e Diagnóstico
- Painel de log recolhível com timestamps
- Diferenciação visual por tipo de mensagem (início, fim, erro, aviso)
- Cópia do log para área de transferência
- Limpeza rápida do log

### 🛠️ Extra
- Atalho de teclado: `Ctrl+F` para focar a busca, `Esc` para limpar
- Relatório completo do sistema exportável para .txt
- Guias de registro para prioridade CPU/GPU e configurações avançadas

## Tecnologias

| Tecnologia | Finalidade |
|------------|------------|
| **Python 3.12+** | Linguagem base |
| **Flet** | Framework de interface gráfica (Flutter para Python) |
| **Material Design** | Tema visual com cores escuras e contraste |
| **JetBrains Mono Nerd Font** | Tipografia monoespaçada para código |
| **Base64** | Scripts embutidos diretamente no executável |
| **Flet Pack (PyInstaller)** | Geração do executável .exe portátil |
| **Windows Registry (REG)** | Aplicação de configurações do sistema |
| **PowerShell / CMD** | Execução de scripts de otimização |
| **Windows API (ctypes)** | Detecção de privilégios de administrador |

## Pré-requisitos

- Python 3.12+
- Pip

## Instalação

```bash
pip install flet flet-cli
```

## Executar Localmente

```bash
python script_manager.py
```

## Gerar .exe

```bash
python build.py
```

O executável será gerado em `dist\FM Optimization.exe`.

## Estrutura

```
FM-Scripts/
  script_manager.py      - Código principal (Flet UI ~1185 linhas)
  scripts_registry.py    - 39 scripts embutidos em base64 (~395 linhas)
  scripts/               - Scripts individuais (.bat, .cmd, .reg, .exe)
  fonts/                 - JetBrains Mono Nerd Font (Regular + Bold)
  build.py               - Script de build (flet pack → .exe)
  README.md
```
