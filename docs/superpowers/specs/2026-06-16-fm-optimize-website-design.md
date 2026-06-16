# FM Optimize — Landing Page Design

## Visão Geral

Landing page de página única responsiva para o aplicativo FM Optimize (WPF .NET 9). O site permite que usuários conheçam o aplicativo e baixem as versões portátil e instalável. Hospedado na Vercel (site) + GitHub Releases (downloads).

## Seções

### 1. Hero
- Logo "FM OPTIMIZE" com gradiente neon azul #0044ff → #0066ff
- Subtítulo: "Unifique todos os scripts de otimização do Windows em um só lugar."
- Breve parágrafo descritivo
- Botão CTA "Download" com scroll suave para seção de download
- Fundo com circuito animado em CSS (versão simplificada do fundo do app)

### 2. Features
Grid 3 colunas com ícones e 6 cards:
- **90 Scripts Embutidos** — 11 categorias, sem dependências externas
- **Busca Instantânea** — Ctrl+F com debounce e glow neon
- **Log em Tempo Real** — terminal scrollável com cursor piscante
- **Tema Dark Neon** — azul #0044ff com acentos e gradientes
- **Execução Inteligente** — BAT, CMD, PS1, REG, EXE com detecção de admin
- **Favoritos** — marque scripts com estrela e filtre rapidamente

### 3. Categorias
Grid visual 4×3 com 11 cards + 1 espaço vazio centralizado. Cada card exibe:
- Nome da categoria
- Descrição curta
- Número de scripts
- Badge com cor distinta

### 4. Tecnologias
Linha de chips minimalistas: C# 13, .NET 9, WPF/XAML, CommunityToolkit.Mvvm, MVVM

### 5. Screenshots
Carrossel horizontal com scroll nativo e navegação por dots/botões.

### 6. Download
Dois cards lado a lado:
- **Portátil** (~148 MB): standalone, sem instalação, dados ao lado do .exe
- **Instalador** (~46 MB compactado): Inno Setup, dados em %APPDATA%
Cada card: badge de tamanho, botão de download, bullets descritivos, ícone.

### 7. Footer
Crédito "Feito por Felipe Melo" com link para GitHub. Link do repositório do projeto.

## Estilo Visual

- **Background:** #0a0a0f (preto azulado profundo)
- **Cards/Superfícies:** #12121a com borda sutil #1e1e2e, glow azul #0044ff no hover
- **Accent:** #0044ff, gradientes #0044ff → #0066ff
- **Texto:** #e0e0e0 (primário), #8888aa (secundário)
- **Tipografia:** sans-serif para corpo, JetBrains Mono (monospace) para elementos técnicos
- **Animações:** fade-in + slide-up com IntersectionObserver, fade stagger em grids, pulsação sutil em elementos destacados

## Interatividade

- Scroll suave entre seções via JS
- Animações de entrada com IntersectionObserver
- Carrossel de screenshots com navegação (dots + setas)
- Badges animados nos cards de tecnologia
- Botão flutuante "voltar ao topo" após scroll

## Infraestrutura / Deploy

| Componente | Destino | Motivo |
|---|---|---|
| Site (HTML/CSS/JS) | Vercel (static deploy) | Gratuito, CDN global, HTTPS automático |
| Downloads (exe ~46-148 MB) | GitHub Releases | Vercel free tier limita 50 MB por arquivo |
| Domínio | *.vercel.app (padrão) ou custom | — |

### Fluxo de Deploy

```bash
# Desenvolver localmente em site-fmoptimize/
cd site-fmoptimize
# Deploy na Vercel
vercel --prod
# Publicar nova versão do executável
# → GitHub Release + atualizar link no site
```

### Estrutura de Arquivos

```
site-fmoptimize/
├── index.html
├── styles.css
├── script.js
├── assets/
│   ├── screenshots/
│   └── icon.png
├── vercel.json
└── .gitignore
```

## Premissas

- Site 100% estático (sem backend, sem framework)
- Downloads servidos via GitHub Releases (links diretos)
- Vercel CLI instalada e configurada na máquina do dev
- Screenshots do app serão adicionados manualmente em assets/screenshots/
