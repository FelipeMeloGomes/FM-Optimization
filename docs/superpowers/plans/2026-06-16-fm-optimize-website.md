# FM Optimize Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create and deploy a single-page landing page for FM Optimize downloads.

**Architecture:** Pure static site (HTML + CSS + JS), hosted on Vercel. Downloads served via GitHub Releases. Animations via CSS transitions + IntersectionObserver.

**Tech Stack:** HTML5, CSS3, Vanilla JS, Vercel (static deploy), GitHub Releases (binary hosting)

**Project location:** `C:\programacao\FM-Scripts\site-fmoptimize\`

---

### Task 1: Scaffold project files

**Files:**
- Create: `site-fmoptimize/index.html`
- Create: `site-fmoptimize/styles.css`
- Create: `site-fmoptimize/script.js`
- Create: `site-fmoptimize/vercel.json`
- Create: `site-fmoptimize/.gitignore`

- [ ] **Step 1: Create project directory and vercel.json**

```bash
New-Item -ItemType Directory -Path "site-fmoptimize\assets\screenshots" -Force
```

- [ ] **Step 2: Create vercel.json**

```json
{
  "version": 2,
  "buildCommand": null,
  "outputDirectory": ".",
  "framework": null
}
```

- [ ] **Step 3: Create .gitignore**

```
# Vercel
.vercel
```

---

### Task 2: Write index.html — Structure

**Files:**
- Create: `site-fmoptimize/index.html`

- [ ] **Step 1: Write full HTML structure**

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FM Optimize — Otimização do Windows</title>
  <meta name="description" content="Unifique todos os scripts de otimização do Windows em um só lugar. 90 scripts embutidos em interface dark neon.">
  <link rel="icon" href="assets/icon.png" type="image/png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
</head>
<body>

  <!-- NAV -->
  <nav class="navbar">
    <div class="nav-logo">FM <span>OPTIMIZE</span></div>
    <div class="nav-links">
      <a href="#features">Recursos</a>
      <a href="#categories">Categorias</a>
      <a href="#tech">Tecnologias</a>
      <a href="#download" class="btn-nav">Download</a>
    </div>
  </nav>

  <!-- HERO -->
  <section id="hero" class="hero">
    <div class="circuit-bg"></div>
    <div class="hero-content">
      <h1 class="hero-title">FM <span>OPTIMIZE</span></h1>
      <p class="hero-subtitle">Unifique todos os scripts de otimização do Windows em um só lugar.</p>
      <p class="hero-desc">Chega de pesquisar na internet por scripts .bat, .cmd, .reg e .ps1 para cada tarefa de manutenção do sistema. O FM Optimize reúne 90 scripts essenciais em uma interface gráfica moderna — tudo embutido em um único executável.</p>
      <a href="#download" class="btn-primary">Baixar Agora</a>
    </div>
  </section>

  <!-- FEATURES -->
  <section id="features" class="section">
    <div class="container">
      <h2 class="section-title">Recursos</h2>
      <div class="features-grid">
        <div class="feature-card fade-in">
          <div class="feature-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0044ff" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
          </div>
          <h3>90 Scripts Embutidos</h3>
          <p>11 categorias de otimização em um único executável. Sem dependências externas.</p>
        </div>
        <div class="feature-card fade-in">
          <div class="feature-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0044ff" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
          <h3>Busca Instantânea</h3>
          <p>Localize qualquer script com Ctrl+F. Filtro com debounce e destaque neon.</p>
        </div>
        <div class="feature-card fade-in">
          <div class="feature-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0044ff" stroke-width="2"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
          </div>
          <h3>Log em Tempo Real</h3>
          <p>Terminal scrollável com saída ao vivo, cursor piscante e botões Copiar/Limpar.</p>
        </div>
        <div class="feature-card fade-in">
          <div class="feature-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0044ff" stroke-width="2"><path d="M12 3a1 1 0 0 1 1 1v1a1 1 0 0 1-2 0V4a1 1 0 0 1 1-1z"/><path d="M12 18a1 1 0 0 1 1 1v1a1 1 0 0 1-2 0v-1a1 1 0 0 1 1-1z"/><path d="M5.64 5.64a1 1 0 0 1 1.42 0l.7.7a1 1 0 0 1-1.42 1.42l-.7-.7a1 1 0 0 1 0-1.42z"/><path d="M16.24 16.24a1 1 0 0 1 1.42 0l.7.7a1 1 0 0 1-1.42 1.42l-.7-.7a1 1 0 0 1 0-1.42z"/><path d="M3 12a1 1 0 0 1 1-1h1a1 1 0 0 1 0 2H4a1 1 0 0 1-1-1z"/><path d="M18 12a1 1 0 0 1 1-1h1a1 1 0 0 1 0 2h-1a1 1 0 0 1-1-1z"/></svg>
          </div>
          <h3>Tema Dark Neon</h3>
          <p>Interface escura azul neon com acentos #0044ff, ícones SVG e gradientes.</p>
        </div>
        <div class="feature-card fade-in">
          <div class="feature-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0044ff" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </div>
          <h3>Execução Inteligente</h3>
          <p>Suporte a .bat, .cmd, .ps1, .reg e .exe com detecção automática de admin.</p>
        </div>
        <div class="feature-card fade-in">
          <div class="feature-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0044ff" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </div>
          <h3>Favoritos</h3>
          <p>Marque scripts com estrela e filtre rapidamente seus preferidos.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- CATEGORIES -->
  <section id="categories" class="section section-dark">
    <div class="container">
      <h2 class="section-title">Categorias</h2>
      <p class="section-subtitle">90 scripts organizados em 11 categorias</p>
      <div class="categories-grid" id="categoriesGrid">
        <div class="category-card fade-in" data-category="limpeza">
          <div class="cat-badge" style="--cat-color: #22c55e">15</div>
          <h3>Limpeza</h3>
          <p>Remove temporários, caches, logs e bloatware</p>
        </div>
        <div class="category-card fade-in" data-category="desempenho">
          <div class="cat-badge" style="--cat-color: #06b6d4">15</div>
          <h3>Desempenho</h3>
          <p>Otimiza serviços, inicialização, SSD e jogos</p>
        </div>
        <div class="category-card fade-in" data-category="rede">
          <div class="cat-badge" style="--cat-color: #a855f7">6</div>
          <h3>Rede</h3>
          <p>Limpa DNS, reseta TCP/IP, bloqueia telemetria</p>
        </div>
        <div class="category-card fade-in" data-category="internet">
          <div class="cat-badge" style="--cat-color: #f59e0b">10</div>
          <h3>Internet</h3>
          <p>Alterna DNS entre Google, Cloudflare, OpenDNS e mais</p>
        </div>
        <div class="category-card fade-in" data-category="privacidade">
          <div class="cat-badge" style="--cat-color: #ef4444">11</div>
          <h3>Privacidade</h3>
          <p>Desativa telemetria, Defender, Cortana e Copilot</p>
        </div>
        <div class="category-card fade-in" data-category="sistema">
          <div class="cat-badge" style="--cat-color: #3b82f6">11</div>
          <h3>Sistema</h3>
          <p>SFC, DISM, CHKDSK, TRIM SSD e relatórios</p>
        </div>
        <div class="category-card fade-in" data-category="gpu-amd">
          <div class="cat-badge" style="--cat-color: #ec4899">4</div>
          <h3>GPU - AMD</h3>
          <p>Tweaks de latência e pré-renderização</p>
        </div>
        <div class="category-card fade-in" data-category="gpu-nvidia">
          <div class="cat-badge" style="--cat-color: #10b981">2</div>
          <h3>GPU - NVIDIA</h3>
          <p>Instalação limpa de drivers e ajustes avançados</p>
        </div>
        <div class="category-card fade-in" data-category="energia">
          <div class="cat-badge" style="--cat-color: #f97316">6</div>
          <h3>Energia</h3>
          <p>Planos Ultimate Performance, hibernação e USB</p>
        </div>
        <div class="category-card fade-in" data-category="windows11">
          <div class="cat-badge" style="--cat-color: #8b5cf6">6</div>
          <h3>Windows 11</h3>
          <p>Menu clássico, widgets, chat e Copilot</p>
        </div>
        <div class="category-card fade-in" data-category="completos">
          <div class="cat-badge" style="--cat-color: #14b8a6">4</div>
          <h3>Scripts Completos</h3>
          <p>Pacotes combinados: manutenção, game mode, privacidade</p>
        </div>
      </div>
    </div>
  </section>

  <!-- TECH -->
  <section id="tech" class="section">
    <div class="container">
      <h2 class="section-title">Tecnologias</h2>
      <div class="tech-list">
        <span class="tech-chip">C# 13</span>
        <span class="tech-chip">.NET 9</span>
        <span class="tech-chip">WPF / XAML</span>
        <span class="tech-chip">CommunityToolkit.Mvvm</span>
        <span class="tech-chip">MVVM</span>
      </div>
    </div>
  </section>

  <!-- SCREENSHOTS -->
  <section id="screenshots" class="section section-dark">
    <div class="container">
      <h2 class="section-title">Screenshots</h2>
      <div class="carousel">
        <div class="carousel-track" id="carouselTrack">
          <div class="carousel-slide">
            <div class="slide-placeholder">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#444" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
              <p>main-window.png</p>
            </div>
          </div>
          <div class="carousel-slide">
            <div class="slide-placeholder">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#444" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
              <p>script-details.png</p>
            </div>
          </div>
          <div class="carousel-slide">
            <div class="slide-placeholder">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#444" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
              <p>circuit-bg.png</p>
            </div>
          </div>
          <div class="carousel-slide">
            <div class="slide-placeholder">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#444" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
              <p>log-panel.png</p>
            </div>
          </div>
        </div>
        <div class="carousel-nav">
          <button id="carouselPrev" aria-label="Anterior">&lsaquo;</button>
          <div class="carousel-dots" id="carouselDots"></div>
          <button id="carouselNext" aria-label="Próximo">&rsaquo;</button>
        </div>
      </div>
    </div>
  </section>

  <!-- DOWNLOAD -->
  <section id="download" class="section">
    <div class="container">
      <h2 class="section-title">Download</h2>
      <p class="section-subtitle">Escolha a versão ideal para você</p>
      <div class="download-grid">
        <div class="download-card fade-in">
          <div class="download-header">
            <h3>Portátil</h3>
            <span class="download-badge">~148 MB</span>
          </div>
          <div class="download-body">
            <ul>
              <li>Standalone — sem instalação</li>
              <li>Execute direto do pendrive</li>
              <li>Dados salvos ao lado do .exe</li>
            </ul>
            <a href="#" class="btn-download" data-version="portable">Baixar .exe</a>
          </div>
        </div>
        <div class="download-card fade-in">
          <div class="download-header">
            <h3>Instalador</h3>
            <span class="download-badge">~46 MB</span>
          </div>
          <div class="download-body">
            <ul>
              <li>Inno Setup — instalação guiada</li>
              <li>Integração com Program Files</li>
              <li>Dados salvos em %APPDATA%</li>
            </ul>
            <a href="#" class="btn-download" data-version="installer">Baixar Setup</a>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- FOOTER -->
  <footer class="footer">
    <div class="container">
      <p>FM Optimize — Feito por <a href="https://github.com/anomalyco" target="_blank">Felipe Melo</a></p>
      <p><a href="https://github.com/anomalyco/FM-Scripts" target="_blank">GitHub</a></p>
    </div>
  </footer>

  <!-- BACK TO TOP -->
  <button id="backToTop" class="back-to-top" aria-label="Voltar ao topo">&uarr;</button>

  <script src="script.js"></script>
</body>
</html>
```

---

### Task 3: Write styles.css — Theme & Base

**Files:**
- Create: `site-fmoptimize/styles.css`

- [ ] **Step 1: Write CSS variables and reset**

```css
:root {
  --bg-primary: #0a0a0f;
  --bg-secondary: #12121a;
  --bg-card: #161622;
  --border: #1e1e2e;
  --border-hover: #2a2a3e;
  --accent: #0044ff;
  --accent-hover: #0055ff;
  --accent-glow: rgba(0, 68, 255, 0.3);
  --text-primary: #e0e0e0;
  --text-secondary: #8888aa;
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --max-width: 1100px;
  --nav-height: 64px;
}

*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

html { scroll-behavior: smooth; }

body {
  font-family: var(--font-sans);
  background: var(--bg-primary);
  color: var(--text-primary);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

a { color: var(--accent); text-decoration: none; transition: color .2s; }
a:hover { color: var(--accent-hover); }

.container { max-width: var(--max-width); margin: 0 auto; padding: 0 24px; }

.section { padding: 100px 0; }
.section-dark { background: var(--bg-secondary); }

.section-title {
  font-size: 2rem;
  font-weight: 800;
  text-align: center;
  margin-bottom: 12px;
  letter-spacing: -0.02em;
}

.section-subtitle {
  text-align: center;
  color: var(--text-secondary);
  margin-bottom: 48px;
  font-size: 1.05rem;
}
```

- [ ] **Step 2: Write navbar styles**

```css
.navbar {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: var(--nav-height);
  background: rgba(10, 10, 15, 0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  z-index: 100;
}

.nav-logo {
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 1.25rem;
  letter-spacing: -0.02em;
}
.nav-logo span { color: var(--accent); }

.nav-links { display: flex; align-items: center; gap: 24px; }
.nav-links a {
  color: var(--text-secondary);
  font-size: 0.9rem;
  transition: color .2s;
}
.nav-links a:hover { color: var(--text-primary); }

.btn-nav {
  background: var(--accent);
  color: #fff !important;
  padding: 8px 20px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.85rem !important;
  transition: background .2s, box-shadow .2s !important;
}
.btn-nav:hover {
  background: var(--accent-hover);
  box-shadow: 0 0 20px var(--accent-glow);
}
```

- [ ] **Step 3: Write hero section styles**

```css
.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 120px 24px 80px;
  position: relative;
  overflow: hidden;
}

.circuit-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 20% 50%, rgba(0,68,255,0.08) 0%, transparent 50%),
    radial-gradient(circle at 80% 50%, rgba(0,68,255,0.05) 0%, transparent 50%);
  pointer-events: none;
}

.hero-content { position: relative; z-index: 1; max-width: 700px; }

.hero-title {
  font-family: var(--font-mono);
  font-size: 3.5rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  margin-bottom: 16px;
}
.hero-title span {
  background: linear-gradient(135deg, var(--accent), #0066ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.3rem;
  color: var(--text-secondary);
  margin-bottom: 16px;
  line-height: 1.5;
}

.hero-desc {
  font-size: 0.95rem;
  color: #6666aa;
  margin-bottom: 32px;
  max-width: 580px;
  margin-left: auto;
  margin-right: auto;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--accent);
  color: #fff;
  padding: 14px 36px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  transition: background .2s, box-shadow .2s, transform .2s;
}
.btn-primary:hover {
  background: var(--accent-hover);
  box-shadow: 0 0 30px var(--accent-glow);
  transform: translateY(-2px);
  color: #fff;
}
```

- [ ] **Step 4: Write features grid**

```css
.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.feature-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 32px 24px;
  transition: border-color .3s, box-shadow .3s, transform .3s;
}
.feature-card:hover {
  border-color: var(--accent);
  box-shadow: 0 0 30px rgba(0,68,255,0.08);
  transform: translateY(-4px);
}

.feature-icon { margin-bottom: 16px; }
.feature-icon svg { width: 32px; height: 32px; }

.feature-card h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 8px;
}
.feature-card p {
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.6;
}
```

- [ ] **Step 5: Write categories grid**

```css
.categories-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.category-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  transition: border-color .3s, box-shadow .3s, transform .3s;
}
.category-card:hover {
  border-color: var(--cat-color, var(--accent));
  box-shadow: 0 0 24px color-mix(in srgb, var(--cat-color, var(--accent)) 15%, transparent);
  transform: translateY(-3px);
}

.cat-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--cat-color) 20%, transparent);
  color: var(--cat-color);
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 1rem;
  margin-bottom: 12px;
}

.category-card h3 {
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 6px;
}

.category-card p {
  color: var(--text-secondary);
  font-size: 0.8rem;
  line-height: 1.5;
}
```

- [ ] **Step 6: Write tech chips**

```css
.tech-list {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 16px;
}

.tech-chip {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  padding: 10px 24px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 100px;
  color: var(--text-secondary);
  transition: border-color .3s, box-shadow .3s, color .3s;
}
.tech-chip:hover {
  border-color: var(--accent);
  box-shadow: 0 0 20px var(--accent-glow);
  color: var(--text-primary);
}
```

- [ ] **Step 7: Write carousel**

```css
.carousel {
  max-width: 700px;
  margin: 0 auto;
  position: relative;
}

.carousel-track {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  -ms-overflow-style: none;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--bg-card);
}
.carousel-track::-webkit-scrollbar { display: none; }

.carousel-slide {
  flex: 0 0 100%;
  scroll-snap-align: start;
  padding: 80px 24px;
}

.slide-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #444;
}
.slide-placeholder p {
  font-family: var(--font-mono);
  font-size: 0.85rem;
}

.carousel-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 20px;
}

.carousel-nav button {
  background: none;
  border: 1px solid var(--border);
  color: var(--text-secondary);
  width: 40px;
  height: 40px;
  border-radius: 8px;
  font-size: 1.25rem;
  cursor: pointer;
  transition: border-color .2s, color .2s;
}
.carousel-nav button:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.carousel-dots {
  display: flex;
  gap: 8px;
}

.carousel-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--border);
  cursor: pointer;
  transition: background .2s;
}
.carousel-dot.active { background: var(--accent); }
```

- [ ] **Step 8: Write download section**

```css
.download-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  max-width: 700px;
  margin: 0 auto;
}

.download-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
  transition: border-color .3s, box-shadow .3s;
}
.download-card:hover {
  border-color: var(--accent);
  box-shadow: 0 0 40px rgba(0,68,255,0.1);
}

.download-header {
  padding: 24px 24px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.download-header h3 { font-size: 1.2rem; font-weight: 700; }

.download-badge {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  padding: 4px 12px;
  border-radius: 100px;
  background: rgba(0,68,255,0.15);
  color: var(--accent);
  font-weight: 600;
}

.download-body { padding: 20px 24px 24px; }

.download-body ul {
  list-style: none;
  margin-bottom: 24px;
}
.download-body li {
  padding: 6px 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}
.download-body li::before {
  content: "›";
  color: var(--accent);
  margin-right: 8px;
  font-weight: 700;
}

.btn-download {
  display: block;
  text-align: center;
  padding: 12px;
  background: var(--accent);
  color: #fff;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  transition: background .2s, box-shadow .2s;
}
.btn-download:hover {
  background: var(--accent-hover);
  box-shadow: 0 0 20px var(--accent-glow);
  color: #fff;
}
```

- [ ] **Step 9: Write footer, back-to-top, responsive, and animations**

```css
.footer {
  text-align: center;
  padding: 48px 24px;
  border-top: 1px solid var(--border);
  color: var(--text-secondary);
  font-size: 0.85rem;
}
.footer p + p { margin-top: 8px; }

.back-to-top {
  position: fixed;
  bottom: 32px;
  right: 32px;
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  color: var(--text-secondary);
  font-size: 1.2rem;
  cursor: pointer;
  opacity: 0;
  visibility: hidden;
  transition: opacity .3s, visibility .3s, border-color .2s;
  z-index: 99;
}
.back-to-top.visible { opacity: 1; visibility: visible; }
.back-to-top:hover {
  border-color: var(--accent);
  color: var(--accent);
}

/* Fade-in animation */
.fade-in {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity .6s ease, transform .6s ease;
}
.fade-in.visible {
  opacity: 1;
  transform: translateY(0);
}
.fade-in:nth-child(2) { transition-delay: .1s; }
.fade-in:nth-child(3) { transition-delay: .2s; }
.fade-in:nth-child(4) { transition-delay: .3s; }
.fade-in:nth-child(5) { transition-delay: .4s; }
.fade-in:nth-child(6) { transition-delay: .5s; }

/* Responsive */
@media (max-width: 900px) {
  .features-grid { grid-template-columns: repeat(2, 1fr); }
  .categories-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 640px) {
  .hero-title { font-size: 2.2rem; }
  .hero-subtitle { font-size: 1rem; }
  .features-grid { grid-template-columns: 1fr; }
  .categories-grid { grid-template-columns: 1fr; }
  .download-grid { grid-template-columns: 1fr; }
  .nav-links a:not(.btn-nav) { display: none; }
}
```

---

### Task 4: Write script.js — Interactivity

**Files:**
- Create: `site-fmoptimize/script.js`

- [ ] **Step 1: Write IntersectionObserver for fade-in animations**

```js
document.addEventListener('DOMContentLoaded', () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));
});
```

- [ ] **Step 2: Write carousel navigation**

```js
  // Carousel
  const track = document.getElementById('carouselTrack');
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');
  const dotsContainer = document.getElementById('carouselDots');
  const slides = track.querySelectorAll('.carousel-slide');
  let currentSlide = 0;

  slides.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
  });

  function goToSlide(index) {
    currentSlide = index;
    track.scrollTo({ left: track.clientWidth * index, behavior: 'smooth' });
    dotsContainer.querySelectorAll('.carousel-dot').forEach((d, i) => {
      d.classList.toggle('active', i === index);
    });
  }

  prevBtn.addEventListener('click', () => {
    goToSlide(Math.max(0, currentSlide - 1));
  });

  nextBtn.addEventListener('click', () => {
    goToSlide(Math.min(slides.length - 1, currentSlide + 1));
  });
```

- [ ] **Step 3: Write back-to-top button**

```js
  // Back to top
  const backToTop = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('visible', window.scrollY > 400);
  });
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
```

- [ ] **Step 4: Write download link updates**

```js
  // Download links (placeholder — update with actual GitHub Release URLs)
  const downloadBtns = document.querySelectorAll('.btn-download');
  downloadBtns.forEach((btn) => {
    const version = btn.dataset.version;
    // TODO: Replace with actual GitHub Release URLs after publishing
    btn.href = version === 'portable'
      ? 'https://github.com/anomalyco/FM-Scripts/releases/latest/download/FMOptimize.exe'
      : 'https://github.com/anomalyco/FM-Scripts/releases/latest/download/FMOptimize_Setup.exe';
  });
});
```

---

### Task 5: Create Vercel deployment

**Files:**
- Modify: `site-fmoptimize/vercel.json`

- [ ] **Step 1: Verify vercel.json is correct**

```json
{
  "version": 2,
  "buildCommand": null,
  "outputDirectory": ".",
  "framework": null
}
```

- [ ] **Step 2: Deploy to Vercel**

```bash
cd site-fmoptimize
vercel --prod
```

- [ ] **Step 3: Confirm deployment URL and share with user**

---

### Task 6: Set up GitHub Releases for downloads

- [ ] **Step 1: Create a GitHub Release with the executables**

```bash
# From repo root
gh release create v1.0.0 \
  "dist/portable/FMOptimize.exe#FMOptimize_Portable.exe" \
  "dist/installer/FMOptimize_Setup.exe#FMOptimize_Setup.exe" \
  --title "FM Optimize v1.0.0" \
  --notes "Primeiro release oficial"
```

- [ ] **Step 2: Update download links in script.js**

Replace the placeholder URLs with the actual release asset URLs from the created release.

---

### Task 7: Add screenshots

- [ ] **Step 1: Ask user to provide screenshots** or capture them from the app
- [ ] **Step 2: Save screenshots to `site-fmoptimize/assets/screenshots/`**
- [ ] **Step 3: Update carousel slides to use real images**

```html
<img src="assets/screenshots/main-window.png" alt="Interface principal">
```
