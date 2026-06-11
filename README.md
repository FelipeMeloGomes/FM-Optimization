# FM Optimization

Gerenciador de scripts de otimização para Windows (.bat, .cmd, .ps1, .exe, .reg, .txt) com interface gráfica moderna em customtkinter.

## Funcionalidades

- Interface escura minimalista com tema Windows 11
- Scripts embutidos diretamente no executável (não precisa de pastas externas)
- Cards com Executar, Detalhes e badge ADMIN para scripts que requerem administrador
- Categorias como pills horizontais
- Log rápido + janela de log completo
- Busca por nome/descrição
- Suporte a .bat, .cmd, .ps1, .exe, .reg, .txt

## Pré-requisitos

- Python 3.12+
- Pip

## Instalação

```bash
pip install customtkinter pyinstaller
```

## Executar Localmente

```bash
python script_manager.py
```

## Gerar .exe

```bash
pyinstaller --onefile --windowed --name "FM Optimization" script_manager.py
```

O executável será gerado em `dist\FM Optimization.exe`.

## Estrutura

```
FM-Scripts/
  script_manager.py      - Código principal
  scripts_registry.py    - Scripts embutidos em base64
  README.md
```
