# FM Optimization

**Unifique todos os scripts de otimização do Windows em um só lugar.**

Chega de pesquisar na internet por scripts .bat, .cmd, .reg e .ps1 para cada tarefa de manutenção do sistema. O FM Optimization reúne **39 scripts** essenciais em uma interface gráfica moderna — tudo embutido em um único executável, sem dependências externas.

## Funcionalidades

- **39 Scripts Embutidos** em 8 categorias (Limpeza, Desempenho, Rede, Privacidade, Sistema, GPU AMD/NVIDIA, Energia)
- **Interface escura** com cards, sidebar animada e busca instantânea (Ctrl+F)
- **Favoritos**: marque scripts com estrela e filtre rapidamente
- **Log em tempo real**: execute scripts e veja a saída com ícones coloridos
- **Execução inteligente**: .bat, .cmd, .ps1, .reg, .exe com detecção de admin
- **Gerenciamento**: adicione, edite ou remova scripts e categorias

## Tecnologias

| Tecnologia | Finalidade |
|---|---|
| **C# / .NET 9** | Linguagem e runtime |
| **WPF / XAML** | Interface gráfica com animações nativas |
| **CommunityToolkit.Mvvm** | Padrão MVVM |
| **Windows API** | Detecção de privilégios de administrador |

## Como executar

```bash
dotnet run --project FMOptimization
```

## Publicar executável

```bash
dotnet publish FMOptimization -c Release -o dist
```

## Estrutura

```
FM-Scripts/
├── FMOptimization.sln
├── FMOptimization/
│   ├── App.xaml/.cs         - Tema escuro e estilos globais
│   ├── MainWindow.xaml/.cs  - Interface principal
│   ├── Models/              - ScriptModel, AppData
│   ├── Services/            - ScriptRegistry, DataService, ScriptExecution
│   ├── ViewModels/          - MainViewModel (MVVM)
│   ├── Views/               - Dialogs (editar, categorias)
│   └── Converters/          - Conversores de cor, opacidade, etc.
└── assets/                  - Ícone do aplicativo
```
