# FM Optimization

Gerenciador de scripts de otimização para Windows (.bat, .cmd, .ps1) com interface gráfica moderna em Flet.

## Funcionalidades

- Interface escura com design moderno (Flet + Material Design)
- **39 scripts embutidos** em 8 categorias (Sistema, Desempenho, Rede, Limpeza, Privacidade, Energia, GPU - AMD, GPU - NVIDIA)
- Scripts embutidos diretamente no executável em base64 (não precisa de pastas externas)
- Cards em grid responsivo com nome, descrição, badge ADMIN e badge de tipo
- **Favoritos**: marque scripts com estrela e filtre por favoritos
- Categorias como pills no sidebar com contagem ao vivo
- Execução com log em tempo real (ícones coloridos: ✓, ✗, !)
- Busca contextual por nome/descrição na topbar (por categoria)
- Suporte a .bat, .cmd, .ps1

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
  script_manager.py      - Código principal (Flet UI)
  scripts_registry.py    - 39 scripts embutidos em base64
  scripts/               - Scripts individuais (.bat, .cmd)
  fonts/                 - Fonte JetBrains Mono Nerd Font
  build.py               - Script de build (flet pack)
  README.md
```
