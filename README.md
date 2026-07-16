# FM Optimize

[![site](https://img.shields.io/badge/site-fmoptimize-0044ff?style=for-the-badge)](https://fmoptimize.vercel.app)

41 scripts de otimização do Windows em um único app desktop. Tudo embutido em um executável.

---

<div align="center">
  <img src="assets/screenshots/dashboard_painel.webp" alt="Dashboard — visão geral do sistema" width="750">
</div>

<br>

<div align="center">
  <table>
    <tr>
      <td width="50%"><img src="assets/screenshots/scripts_list.webp" alt="Lista de scripts" width="100%"></td>
      <td width="50%"><img src="assets/screenshots/terminal_log.webp" alt="Log em tempo real" width="100%"></td>
    </tr>
    <tr>
      <td width="50%"><img src="assets/screenshots/confirm_script.webp" alt="Confirmação de execução" width="100%"></td>
      <td width="50%"><img src="assets/screenshots/backup_windows.webp" alt="Pontos de restauração" width="100%"></td>
    </tr>
  </table>
</div>

---

## Funcionalidades

- **Dashboard** — CPU, GPU, memória, armazenamento com barra de uso e tempo de atividade
- **Scripts de otimização** — Tweaks, Utilitários, Limpeza, Rede, Apps, Input Lag, Processador (Intel/AMD)
- **Rede** — benchmark de DNS com ordenação por latência e aplicação automática + scripts de otimização de internet
- **Limpeza** — limpeza de arquivos temporários, cache de navegadores e atualizações do Windows
- **Processador** — detecção automática de fabricante (Intel/AMD) com scripts específicos
- **Restore Points** — crie, liste, gerencie e restaure backups do Windows (criação automática opcional antes de executar scripts)
- **Histórico de Execução** — registro de todos os scripts executados com duração e status
- **Favoritos** — scripts marcados com estrela para acesso rápido
- **Busca + Filtros** — busca textual e filtro por subcategoria
- **Mini-guia** — explicação simples do que cada script faz e quando usar
- **Atualização integrada** — botão nas Configurações que baixa e instala novas versões do GitHub
- **Tema** — dark azul neon com fundo de circuito animado

---

## Tecnologias

Electron 35 · React 19 · TypeScript · Vite · Tailwind CSS 4 · Framer Motion

---

## Início rápido

```bash
cd fm-optimize-electron
npm install
npm run dev     # desenvolvimento
npm run build   # produção (gera em out/)
```

---

## Download

[fmoptimize.vercel.app](https://fmoptimize.vercel.app) · [GitHub Releases](https://github.com/FelipeMeloGomes/FM-Optimization/releases)
