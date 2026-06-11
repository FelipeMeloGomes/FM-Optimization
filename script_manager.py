import asyncio
import atexit
import base64
import json
import os
import shutil
import subprocess
import sys
import tempfile
import datetime
from collections import Counter

import flet as ft
from scripts_registry import EMBEDDED_SCRIPTS


FONTS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "fonts")


def get_app_dir():
    if getattr(sys, "frozen", False):
        return os.path.dirname(sys.executable)
    return os.path.dirname(os.path.abspath(__file__))


DATA_FILE = os.path.join(get_app_dir(), "scripts_data.json")


def carregar_dados():
    dados = {"categorias": [], "scripts": []}
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, "r", encoding="utf-8") as f:
                dados = json.load(f)
        except (json.JSONDecodeError, OSError) as e:
            print(f"Erro ao carregar dados: {e}")
    dados.pop("agendamento", None)
    dados["categorias"] = [c for c in dados.get("categorias", []) if c != "Geral"]
    dados["favoritos"] = dados.get("favoritos", [])
    if "scripts" not in dados:
        dados["scripts"] = []
    return dados


def salvar_dados(dados):
    try:
        with open(DATA_FILE, "w", encoding="utf-8") as f:
            json.dump(dados, f, indent=2, ensure_ascii=False)
    except OSError as e:
        print(f"Erro ao salvar dados: {e}")


C = ft.Colors
ICONS = ft.icons.Icons

BG_PRIMARY = "#0d0d1a"
BG_SIDEBAR = "#12122a"
BG_CARD = "#1a1a2e"
TEXT_PRIMARY = "#eef0f4"
TEXT_MUTED = "#8a8fa3"
BORDER_DEFAULT = "#2a2a4a"
BORDER_HOVER = "#5a5a7a"
AMBER_PRIMARY = "#ff8c00"
AMBER_HOVER = "#2a1a00"
CYAN_ACCENT = "#00e5ff"
GREEN_RUN = "#00e676"
RED_ERROR = "#ff1744"

CATEGORY_ICONS = {
    "Todas": ICONS.APPS,
    "Limpeza": ICONS.AUTO_FIX_HIGH,
    "Desempenho": ICONS.SPEED,
    "Energia": ICONS.ELECTRIC_BOLT,
    "Privacidade": ICONS.SHIELD,
    "Rede": ICONS.LAN,
    "Sistema": ICONS.COMPUTER,
    "Script Babbo": ICONS.CODE,
    "GPU - AMD": ICONS.MEMORY,
    "GPU - NVIDIA": ICONS.MEMORY,
    "Windows 11": ICONS.DESKTOP_WINDOWS,
    "Favoritos": ICONS.STAR,
}

SCRIPT_ICONS = {
    "bat": ICONS.SETTINGS,
    "cmd": ICONS.SETTINGS,
    "ps1": ICONS.BOLT,
    "exe": ICONS.PLAY_CIRCLE_FILLED,
    "reg": ICONS.TUNE,
    "txt": ICONS.DESCRIPTION,
}

ACCENT_COLORS = {
    ".bat": GREEN_RUN,
    ".cmd": GREEN_RUN,
    ".ps1": CYAN_ACCENT,
    ".exe": AMBER_PRIMARY,
    ".reg": AMBER_PRIMARY,
    ".txt": TEXT_MUTED,
}


def border_all(width, color):
    s = ft.BorderSide(width, color)
    return ft.Border(left=s, right=s, top=s, bottom=s)


class FMOptimizationApp:
    def __init__(self, page: ft.Page):
        self.page = page
        page.title = "FM Optimization"
        page.theme_mode = ft.ThemeMode.DARK
        page.window.width = 1200
        page.window.height = 720
        page.window.min_width = 900
        page.window.min_height = 500
        page.padding = 0
        page.spacing = 0

        jb_r = os.path.join(FONTS_DIR, "JetBrainsMonoNerdFont-Regular.ttf")
        jb_b = os.path.join(FONTS_DIR, "JetBrainsMonoNerdFont-Bold.ttf")
        fonts = {}
        if os.path.exists(jb_r):
            fonts["JetBrains Mono"] = jb_r
        if os.path.exists(jb_b):
            fonts["JetBrains Mono Bold"] = jb_b
        if fonts:
            page.fonts = fonts

        self.dados = carregar_dados()
        for s in EMBEDDED_SCRIPTS:
            if s["categoria"] not in self.dados["categorias"]:
                self.dados["categorias"].append(s["categoria"])

        self.categoria_atual = "Todas"
        self._temp_scripts_dir = tempfile.mkdtemp(prefix="FMOptimization_")
        atexit.register(self._limpar_temp)

        self._running: dict[str, bool] = {}
        self._categorias_dirty = True
        self._cached_embedded: list[dict] | None = None
        self._cached_todos: list[dict] | None = None
        self._script_indices: dict[tuple[str, str], int] = {}
        self._sidebar_refs: dict[str, dict] = {}
        self._card_entries: list[dict] = []
        self._log_lines: list[str] = []
        self._log_last_was_separator = False
        self.log_queue: asyncio.Queue = asyncio.Queue()
        self.log_expanded = True

        self._file_picker = ft.FilePicker()
        self._search_debounce_task = None

        self._build_ui()
        page.on_keyboard_event = self._on_keyboard_event
        self._atualizar_cards()
        page.run_task(self._drain_log_queue)

    def _build_ui(self):
        page = self.page
        page.add(ft.Row([
            self._build_sidebar(),
            self._build_content(),
        ], expand=True, spacing=0))

    def _build_sidebar(self):
        self.sidebar_menu = ft.Column(scroll=ft.ScrollMode.ALWAYS, expand=True, spacing=0)

        mono = "JetBrains Mono" if self.page.fonts and "JetBrains Mono" in self.page.fonts else None
        mono_b = "JetBrains Mono Bold" if self.page.fonts and "JetBrains Mono Bold" in self.page.fonts else None

        logo = ft.Container(
            content=ft.Column([
                ft.Row([
                    ft.Text("FM", size=28, weight=ft.FontWeight.BOLD, color=AMBER_PRIMARY, font_family=mono_b),
                ], alignment=ft.MainAxisAlignment.CENTER),
                ft.Container(
                    content=ft.Text("OPTIMIZATION", size=9, weight=ft.FontWeight.BOLD, color=CYAN_ACCENT, font_family=mono),
                    alignment=ft.alignment.Alignment.CENTER,
                    padding=ft.Padding(0, 0, 0, 6),
                ),
                ft.Container(height=1, bgcolor=BORDER_DEFAULT, margin=ft.Margin(16, 0, 16, 0)),
                ft.Container(height=4),
            ], spacing=0, horizontal_alignment=ft.CrossAxisAlignment.CENTER),
            padding=ft.Padding(0, 16, 0, 4),
        )

        gear_btn = ft.Container(
            content=ft.Row([
                ft.Icon(ICONS.SETTINGS, size=13, color=TEXT_MUTED),
                ft.Text("Gerenciar Categorias", size=10, color=TEXT_MUTED),
            ], spacing=6, alignment=ft.MainAxisAlignment.CENTER),
            padding=ft.Padding(12, 0, 12, 0),
            height=32,
            on_click=lambda e: self._abrir_gerenciar_categorias(),
        )

        return ft.Container(
            content=ft.Column([
                logo,
                self.sidebar_menu,
                gear_btn,
            ], spacing=0, expand=True),
            width=200,
            bgcolor=BG_SIDEBAR,
        )

    def _build_content(self):
        font = "JetBrains Mono Bold" if self.page.fonts and "JetBrains Mono Bold" in self.page.fonts else None
        font_reg = "JetBrains Mono" if self.page.fonts and "JetBrains Mono" in self.page.fonts else None

        self.lbl_categoria = ft.Text(
            "Todas", size=14, weight=ft.FontWeight.BOLD, color=TEXT_PRIMARY,
            font_family=font,
        )
        self.lbl_count = ft.Container(
            content=ft.Text("0 scripts", size=10, color=TEXT_MUTED),
            bgcolor=BG_CARD,
            border_radius=10,
            border=border_all(1, BORDER_DEFAULT),
            padding=ft.Padding(8, 1, 8, 1),
        )

        self.search_field = ft.TextField(
            hint_text="Buscar...",
            border=ft.InputBorder.NONE,
            text_size=12,
            text_align=ft.TextAlign.CENTER,
            text_style=ft.TextStyle(color=TEXT_PRIMARY, font_family=font_reg),
            hint_style=ft.TextStyle(color=TEXT_MUTED),
            fill_color=None,
            expand=True,
            height=30,
            content_padding=ft.Padding(8, 0, 8, 0),
            on_change=self._on_busca_change,
        )
        search_box = ft.Container(
            content=self.search_field,
            bgcolor=BG_CARD,
            border_radius=6,
            border=border_all(1, BORDER_DEFAULT),
            padding=ft.Padding(8, 4, 8, 4),
            width=200,
            visible=False,
        )

        self.search_box = search_box

        topbar = ft.Container(
            content=ft.Row([
                ft.Row([self.lbl_categoria, self.lbl_count], spacing=8),
                self.search_box,
            ], alignment=ft.MainAxisAlignment.SPACE_BETWEEN),
            height=44,
            bgcolor=BG_SIDEBAR,
            padding=ft.Padding(16, 0, 16, 0),
        )

        self.cards_grid = ft.ResponsiveRow(spacing=8, run_spacing=8)
        self.empty_state = ft.Column([
            ft.Text("Nenhum script encontrado", size=15, weight=ft.FontWeight.BOLD, color=TEXT_MUTED, text_align=ft.TextAlign.CENTER),
            ft.Text("", size=11, color=TEXT_MUTED, text_align=ft.TextAlign.CENTER),
        ], horizontal_alignment=ft.CrossAxisAlignment.CENTER, visible=False)
        self.empty_sub = self.empty_state.controls[1]

        cards_area = ft.Container(
            content=ft.Column([
                ft.Container(content=self.cards_grid, expand=True),
                self.empty_state,
            ], expand=True, scroll=ft.ScrollMode.ALWAYS),
            expand=True,
            padding=ft.Padding(8, 8, 8, 0),
        )

        self.log_dot = ft.Container(width=6, height=6, bgcolor="#333333", border_radius=3)

        log_header = ft.Container(
            content=ft.Row([
                ft.Row([
                    self.log_dot,
                    ft.Text("LOG", size=9, weight=ft.FontWeight.BOLD, color=TEXT_MUTED),
                ], spacing=6),
                ft.Row([
                    ft.TextButton("Copiar", style=ft.ButtonStyle(color=CYAN_ACCENT, overlay_color="#ffffff08", padding=ft.Padding(8, 0, 8, 0)), on_click=lambda e: self._copiar_log()),
                    ft.TextButton("Limpar", style=ft.ButtonStyle(color=TEXT_MUTED, overlay_color="#ffffff08", padding=ft.Padding(8, 0, 8, 0)), on_click=lambda e: self._limpar_log_rapido()),
                    ft.TextButton("▲", style=ft.ButtonStyle(color=TEXT_MUTED, overlay_color="#ffffff08", padding=ft.Padding(8, 0, 8, 0)), on_click=self._toggle_log),
                ], spacing=0),
            ], alignment=ft.MainAxisAlignment.SPACE_BETWEEN),
            height=26,
            padding=ft.Padding(14, 0, 8, 0),
        )

        self.log_text_field = ft.TextField(
            multiline=True,
            read_only=True,
            text_size=11,
            text_style=ft.TextStyle(font_family="Consolas", color="#c0c0c0"),
            fill_color=BG_PRIMARY,
            border=ft.InputBorder.NONE,
            expand=True,
        )

        self.log_panel = ft.Container(
            content=ft.Column([log_header, self.log_text_field], spacing=0, expand=True),
            height=120,
            bgcolor=BG_PRIMARY,
        )

        resizer = ft.Container(
            content=ft.Container(height=2, width=36, bgcolor=BORDER_DEFAULT),
            height=6,
            bgcolor=BG_SIDEBAR,
            alignment=ft.alignment.Alignment.CENTER,
        )

        return ft.Container(
            content=ft.Column([
                topbar,
                cards_area,
                resizer,
                self.log_panel,
            ], spacing=0, expand=True),
            expand=True,
            bgcolor=BG_PRIMARY,
        )

    def _sidebar_section(self, parent, texto):
        parent.controls.append(
            ft.Container(
                content=ft.Text(texto, size=9, weight=ft.FontWeight.BOLD, color=TEXT_MUTED),
                padding=ft.Padding(16, 10, 16, 3),
            )
        )

    def _sidebar_item(self, parent, nome, icone, count, active=False):
        is_active = active or (nome == self.categoria_atual)
        refs = {}

        accent = ft.Container(width=2, height=28, bgcolor=AMBER_PRIMARY if is_active else None, border_radius=1)
        icon_w = ft.Icon(icone, size=13, color=AMBER_PRIMARY if is_active else TEXT_MUTED)
        name_w = ft.Text(nome, size=12, color=TEXT_PRIMARY if is_active else TEXT_MUTED, expand=True)
        count_w = ft.Container(
            content=ft.Text(str(count), size=9, color=AMBER_PRIMARY if is_active else TEXT_MUTED),
            padding=ft.Padding(5, 1, 5, 1),
            margin=ft.Margin(0, 0, 12, 0),
        )

        container = ft.Container(
            height=28,
            bgcolor=BG_CARD if is_active else None,
            content=ft.Row([accent, icon_w, name_w, count_w], spacing=6),
            on_click=lambda e, n=nome: self._selecionar_categoria(n),
        )

        refs["accent"] = accent
        refs["icon"] = icon_w
        refs["name"] = name_w
        refs["count"] = count_w
        refs["container"] = container
        self._sidebar_refs[nome] = refs

        parent.controls.append(container)

    def _selecionar_categoria(self, nome):
        if self.categoria_atual == nome:
            return
        self.categoria_atual = nome
        self._update_search_context()
        self._update_sidebar_active()
        self._filter_cards()
        self.page.update()

    def _update_search_context(self):
        self.search_box.visible = True
        if self.categoria_atual == "Todas":
            self.search_field.hint_text = "Buscar em todos os scripts"
        else:
            self.search_field.hint_text = f"Buscar em {self.categoria_atual}"

    def _render_sidebar(self):
        self._sidebar_refs.clear()
        self.sidebar_menu.controls.clear()
        todos = self._todos_scripts()
        total_count = len(todos)
        counts = Counter(s.get("categoria") for s in todos)

        self._sidebar_section(self.sidebar_menu, "CATEGORIAS")
        self._sidebar_item(self.sidebar_menu, "Todas",
                           CATEGORY_ICONS.get("Todas", ICONS.APPS), total_count)
        for cat in self.dados["categorias"]:
            icone = CATEGORY_ICONS.get(cat, ICONS.CIRCLE)
            self._sidebar_item(self.sidebar_menu, cat, icone, counts.get(cat, 0))

        self.sidebar_menu.controls.append(
            ft.Container(height=1, bgcolor=BORDER_DEFAULT, margin=ft.Margin(12, 8, 12, 8))
        )
        self._sidebar_item(self.sidebar_menu, "Favoritos",
                           CATEGORY_ICONS.get("Favoritos", ICONS.STAR), self._favoritos_count)
        self._update_sidebar_active()
        self.sidebar_menu.update()

    def _update_sidebar_active(self):
        for name, refs in self._sidebar_refs.items():
            active = (name == self.categoria_atual)
            refs["container"].bgcolor = BG_CARD if active else None
            refs["accent"].bgcolor = AMBER_PRIMARY if active else None
            refs["icon"].color = AMBER_PRIMARY if active else TEXT_MUTED
            refs["name"].color = TEXT_PRIMARY if active else TEXT_MUTED

    def _extrair_unico(self, script):
        dst = os.path.join(self._temp_scripts_dir, script["caminho_relativo"])
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        try:
            data = base64.b64decode(script["conteudo_b64"])
            with open(dst, "wb") as f:
                f.write(data)
        except Exception as e:
            print(f"Erro extraindo {script['nome']}: {e}")

    def _limpar_temp(self):
        try:
            shutil.rmtree(self._temp_scripts_dir, ignore_errors=True)
        except Exception:
            pass

    @property
    def _embedded_scripts(self):
        if self._cached_embedded is None:
            result = []
            for s in EMBEDDED_SCRIPTS:
                entry = dict(s)
                entry["caminho"] = os.path.join(self._temp_scripts_dir, s["caminho_relativo"])
                entry["embedded"] = True
                result.append(entry)
            self._cached_embedded = result
        return self._cached_embedded

    def _todos_scripts(self):
        if self._cached_todos is None or self._categorias_dirty:
            self._cached_todos = self.dados["scripts"] + self._embedded_scripts
        return self._cached_todos

    def _make_hover_handler(self, wrapper, card):
        def handler(e):
            if e.data == "true":
                wrapper.border = border_all(1, BORDER_HOVER)
            else:
                wrapper.border = border_all(1, BORDER_DEFAULT)
            wrapper.update()
        return handler

    def _build_card(self, script):
        is_embedded = script.get("embedded", False)
        _tipo = script.get("tipo", "").replace(".", "")
        icon_color = (GREEN_RUN if _tipo in ("bat", "cmd") else
                      CYAN_ACCENT if _tipo == "ps1" else
                      AMBER_PRIMARY if _tipo in ("exe", "reg") else
                      TEXT_MUTED)
        accent_color = ACCENT_COLORS.get(script.get("tipo", ""), TEXT_MUTED)
        icon_name = SCRIPT_ICONS.get(_tipo, ICONS.PLAY_ARROW)

        tipo_label = script.get("tipo", "").upper()
        admin = script.get("admin", False)
        categoria = script.get("categoria", "")
        nome = script["nome"]
        descricao = script.get("descricao", "")

        mono = "JetBrains Mono" if self.page.fonts and "JetBrains Mono" in self.page.fonts else None
        mono_b = "JetBrains Mono Bold" if self.page.fonts and "JetBrains Mono Bold" in self.page.fonts else None

        type_badge = ft.Container(
            content=ft.Text(tipo_label, size=8, weight=ft.FontWeight.BOLD, color=icon_color,
                            font_family=mono),
            border=border_all(1, icon_color + "60"),
            border_radius=4,
            padding=ft.Padding(5, 1, 5, 1),
        )

        is_fav = nome in self.dados.get("favoritos", [])
        star_icon = ft.Icon(
            ICONS.STAR if is_fav else ICONS.STAR_OUTLINE,
            size=13, color=AMBER_PRIMARY if is_fav else TEXT_MUTED,
        )
        star_btn = ft.Container(
            content=star_icon,
            on_click=lambda e: self._toggle_favorito(nome),
        )

        meta_row = ft.Row(spacing=6)
        meta_row.controls.append(star_btn)
        if admin:
            meta_row.controls.append(
                ft.Text("ADMIN", size=8, weight=ft.FontWeight.BOLD, color=AMBER_PRIMARY,
                        font_family=mono)
            )
        meta_row.controls.append(ft.Text(categoria, size=9, color=TEXT_MUTED))
        meta_row.controls.append(ft.Container(expand=True))
        meta_row.controls.append(type_badge)

        run_container = ft.Container()

        def make_run_handler(s):
            def handler(e):
                asyncio.create_task(self._executar_script(s))
            return handler

        run_btn = ft.FilledButton(
            "Executar" if script.get("tipo") != ".txt" else "Abrir",
            style=ft.ButtonStyle(
                color="#0d0d1a",
                bgcolor=GREEN_RUN,
                overlay_color=C.WHITE10,
                padding=ft.Padding(12, 6, 12, 6),
                text_style=ft.TextStyle(size=10, font_family=mono_b),
            ),
            on_click=make_run_handler(script),
        )
        run_ring = ft.ProgressRing(width=10, height=10, stroke_width=2, color=GREEN_RUN)
        run_ring.visible = False

        run_container.content = ft.Row([run_ring, run_btn], spacing=6, alignment=ft.MainAxisAlignment.END)

        right_col = ft.Column([run_container], spacing=4, horizontal_alignment=ft.CrossAxisAlignment.END)

        if is_embedded:
            detail_btn = ft.OutlinedButton(
                "Detalhes",
                style=ft.ButtonStyle(
                    color=CYAN_ACCENT,
                    side=ft.BorderSide(1, CYAN_ACCENT + "40"),
                    overlay_color="#ffffff08",
                    padding=ft.Padding(12, 4, 12, 4),
                    text_style=ft.TextStyle(size=9, font_family=mono),
                ),
                on_click=lambda e, s=script: self._mostrar_detalhes(s),
            )
            right_col.controls.append(detail_btn)
        else:
            edit_btn = ft.OutlinedButton(
                "Editar",
                style=ft.ButtonStyle(
                    color=AMBER_PRIMARY,
                    side=ft.BorderSide(1, AMBER_PRIMARY + "40"),
                    overlay_color="#ffffff08",
                    padding=ft.Padding(12, 4, 12, 4),
                    text_style=ft.TextStyle(size=9, font_family=mono),
                ),
                on_click=lambda e, s=script: self._editar_script(s),
            )
            remove_btn = ft.OutlinedButton(
                "Remover",
                style=ft.ButtonStyle(
                    color=RED_ERROR,
                    side=ft.BorderSide(1, RED_ERROR + "40"),
                    overlay_color="#ffffff08",
                    padding=ft.Padding(12, 4, 12, 4),
                    text_style=ft.TextStyle(size=9, font_family=mono),
                ),
                on_click=lambda e, s=script: self._remover_script(s),
            )
            right_col.controls.append(edit_btn)
            right_col.controls.append(remove_btn)

        card = ft.Card(
            content=ft.Container(
                content=ft.Row([
                    ft.Container(width=2, bgcolor=accent_color, border_radius=1),
                    ft.Container(
                        content=ft.Column([
                            ft.Text(nome, size=13, weight=ft.FontWeight.BOLD, color=TEXT_PRIMARY,
                                    font_family=mono_b),
                            ft.Text(descricao, size=10, color=TEXT_MUTED) if descricao else ft.Container(height=0),
                            meta_row,
                        ], spacing=4),
                        padding=ft.Padding(12, 8, 12, 8), expand=True,
                    ),
                    ft.Container(content=right_col, padding=ft.Padding(0, 8, 12, 8)),
                ], spacing=0),
            ),
            elevation=0,
            col={"sm": 12, "md": 6, "lg": 6, "xl": 4},
        )

        wrapper = ft.Container(
            content=card,
            border=border_all(1, BORDER_DEFAULT),
            border_radius=8,
            bgcolor=BG_CARD,
            padding=0,
            animate=100,
        )
        wrapper.on_hover = self._make_hover_handler(wrapper, card)

        return {
            "widget": wrapper,
            "script": dict(script),
            "nome_lower": nome.lower(),
            "descricao_lower": descricao.lower(),
            "run_btn": run_btn,
            "run_ring": run_ring,
            "star_icon": star_icon,
        }

    def _create_all_cards(self):
        self._card_entries.clear()
        self.cards_grid.controls.clear()
        self.empty_state.visible = False

        for script in self._todos_scripts():
            entry = self._build_card(script)
            self._card_entries.append(entry)
            self.cards_grid.controls.append(entry["widget"])

    def _filter_cards(self):
        busca = (self.search_field.value or "").strip().lower()
        visible_count = 0

        for entry in self._card_entries:
            script = entry["script"]
            show = True

            if self.categoria_atual == "Favoritos":
                show = script["nome"] in self.dados.get("favoritos", [])
            elif self.categoria_atual != "Todas":
                show = script.get("categoria") == self.categoria_atual

            if show and busca:
                show = (busca in entry["nome_lower"] or
                        busca in entry["descricao_lower"])

            entry["widget"].visible = show
            if show:
                visible_count += 1

        self.lbl_categoria.value = self.categoria_atual
        self.lbl_count.content.value = f"{visible_count} {'script' if visible_count == 1 else 'scripts'}"

        if visible_count == 0:
            if self.categoria_atual == "Favoritos":
                self.empty_sub.value = "Clique na estrela ★ em um script para favorita-lo"
            elif not self.dados["scripts"] and not busca:
                self.empty_sub.value = "Use '+ Adicionar Script' para incluir seus próprios scripts"
            else:
                self.empty_sub.value = ""
            self.empty_state.visible = True
        else:
            self.empty_state.visible = False

    def _atualizar_cards(self):
        if self._categorias_dirty:
            self._render_sidebar()
            self._create_all_cards()
            self._categorias_dirty = False
        self._update_search_context()
        self._filter_cards()
        self.cards_grid.update()
        self.empty_state.update()
        self.lbl_categoria.update()
        self.lbl_count.update()
        self.search_box.update()

    def _on_busca_change(self, e):
        if self._search_debounce_task:
            self._search_debounce_task.cancel()
        self._search_debounce_task = asyncio.create_task(self._debounced_search())

    async def _debounced_search(self):
        await asyncio.sleep(0.15)
        self._atualizar_cards()

    def _on_keyboard_event(self, e: ft.KeyboardEvent):
        if e.ctrl and e.key == "F":
            self.search_field.focus()
            self.page.update()
        elif e.key == "Escape":
            if self.search_field.value:
                self.search_field.value = ""
                self._atualizar_cards()

    def _log(self, msg):
        timestamp = datetime.datetime.now().strftime("%H:%M:%S")
        msg_lower = msg.lower()

        is_start = any(w in msg_lower for w in ["executando:", "iniciado"])
        is_end = any(w in msg_lower for w in ["finalizado", "concluido"])
        is_error = any(w in msg_lower for w in ["erro", "error", "falha", "failed", "acesso negado"])
        is_warn = any(w in msg_lower for w in ["aviso", "warning", "cancelado", "negado"])

        if is_start:
            nivel = "start"
        elif is_end:
            nivel = "end"
        elif is_error:
            nivel = "error"
        elif is_warn:
            nivel = "warn"
        else:
            nivel = "info"

        line = f"$ {timestamp} {msg}"
        self.log_queue.put_nowait((line, nivel))

    async def _drain_log_queue(self):
        while True:
            line, nivel = await self.log_queue.get()

            if nivel == "start":
                prefix = ""
            elif nivel == "end":
                separator = "─" * 40
                self._append_log(separator, "#444444")
                prefix = "✓ "
            elif nivel == "error":
                prefix = "✗ "
            elif nivel == "warn":
                prefix = "! "
            else:
                prefix = "  "

            self._append_log(prefix + line, None)
            self.log_text_field.update()

    def _append_log(self, line, color_override=None):
        self._log_lines.append(line)
        if len(self._log_lines) > 500:
            self._log_lines = self._log_lines[-500:]
        self.log_text_field.value = "\n".join(self._log_lines)

    def _toggle_log(self, e):
        self.log_expanded = not self.log_expanded
        self.log_panel.height = 120 if self.log_expanded else 26
        self.log_text_field.visible = self.log_expanded
        self.page.update()

    def _copiar_log(self):
        texto = "\n".join(self._log_lines)
        if texto.strip():
            self.page.clipboard = texto
            self._log("Log copiado para a area de transferencia")

    def _limpar_log_rapido(self):
        self._log_lines.clear()
        self.log_text_field.value = ""
        self.log_text_field.update()

    def _mostrar_detalhes(self, script):
        colors = {".bat": GREEN_RUN, ".cmd": GREEN_RUN, ".ps1": CYAN_ACCENT,
                  ".exe": AMBER_PRIMARY, ".reg": AMBER_PRIMARY, ".txt": TEXT_MUTED}
        c = colors.get(script.get("tipo", ""), TEXT_MUTED)
        tipo = script.get("tipo", "").upper()
        categoria = script.get("categoria", "")
        admin = script.get("admin", False)
        explicacao = script.get("explicacao", script.get("descricao", "Sem descricao disponivel."))

        badges = [
            ft.Container(
                content=ft.Text(tipo, size=10, weight=ft.FontWeight.BOLD, color=c),
                border=border_all(1, c + "60"),
                border_radius=4, padding=ft.Padding(6, 2, 6, 2),
            ),
            ft.Text(categoria, size=11, color=TEXT_MUTED),
        ]
        if admin:
            badges.append(
                ft.Container(
                    content=ft.Text("REQUER ADMIN", size=9, weight=ft.FontWeight.BOLD, color=AMBER_PRIMARY),
                    border=border_all(1, AMBER_PRIMARY + "60"),
                    border_radius=4, padding=ft.Padding(6, 2, 6, 2),
                )
            )

        dialog = ft.AlertDialog(
            title=ft.Text(script["nome"], size=18, weight=ft.FontWeight.BOLD, color=TEXT_PRIMARY),
            content=ft.Container(
                content=ft.Column([
                    ft.Row(badges, spacing=8),
                    ft.Divider(height=1, color=BORDER_DEFAULT),
                    ft.Text(explicacao, size=13, color=TEXT_PRIMARY),
                ], spacing=12, scroll=ft.ScrollMode.ALWAYS),
                width=500, height=280,
            ),
            actions=[
                ft.TextButton("Fechar", on_click=lambda e: self._close_dialog()),
            ],
            actions_alignment=ft.MainAxisAlignment.END,
        )
        self.page.show_dialog(dialog)

    def _close_dialog(self):
        self.page.pop_dialog()

    def _abrir_edit_dialog(self, script=None):
        categorias = self.dados["categorias"]
        nome_val = script["nome"] if script else ""
        desc_val = script.get("descricao", "") if script else ""
        cat_val = script.get("categoria", categorias[0] if categorias else "") if script else (categorias[0] if categorias else "")
        path_val = script.get("caminho", "") if script else ""

        field_style = {
            "border_color": BORDER_DEFAULT,
            "fill_color": BG_CARD,
            "text_style": ft.TextStyle(color=TEXT_PRIMARY),
            "label_style": ft.TextStyle(color=TEXT_MUTED),
        }

        entry_nome = ft.TextField(label="Nome", value=nome_val, **field_style)
        entry_desc = ft.TextField(label="Descricao", value=desc_val, **field_style)
        combo_cat = ft.Dropdown(
            label="Categoria",
            options=[ft.dropdown.Option(c) for c in categorias],
            value=cat_val,
            **field_style,
        )
        entry_path = ft.TextField(label="Caminho do Script", value=path_val, read_only=True, **field_style)

        async def browse_click(e):
            result = await self._file_picker.pick_files(
                dialog_title="Selecionar Script",
                file_type=ft.FilePickerFileType.CUSTOM,
                allowed_extensions=["bat", "cmd", "ps1", "exe"],
                allow_multiple=False,
            )
            if result:
                entry_path.value = result[0].path
                entry_path.update()

        browse_btn = ft.OutlinedButton(
            "...",
            style=ft.ButtonStyle(color=TEXT_PRIMARY, side=ft.BorderSide(1, BORDER_DEFAULT)),
            on_click=browse_click,
        )

        def save_click(e):
            nome = entry_nome.value.strip() if entry_nome.value else ""
            desc = entry_desc.value.strip() if entry_desc.value else ""
            cat = combo_cat.value
            path = entry_path.value.strip() if entry_path.value else ""
            if not nome or not path:
                self._show_warning("Campos obrigatorios", "Preencha nome e caminho do script.")
                return
            if not os.path.exists(path):
                self._show_warning("Arquivo nao encontrado", f"O arquivo nao existe:\n{path}")
                return
            ext = os.path.splitext(path)[1].lower()
            if ext not in (".bat", ".cmd", ".ps1", ".exe"):
                self._show_warning("Tipo invalido", "Apenas .bat, .cmd, .ps1 e .exe sao permitidos.")
                return
            data = {
                "nome": nome, "descricao": desc, "categoria": cat,
                "caminho": path, "tipo": ext,
            }
            idx = self._find_script_index(script)
            if idx >= 0:
                self.dados["scripts"][idx] = data
                salvar_dados(self.dados)
                self._script_indices.clear()
                self._categorias_dirty = True
                self._atualizar_cards()
                self._log(f"Script editado: {data['nome']}")
            self._close_dialog()

        path_row = ft.Row([entry_path, browse_btn], spacing=6)

        content = ft.Column([
            entry_nome, entry_desc, combo_cat, path_row,
        ], spacing=10, scroll=ft.ScrollMode.ALWAYS)

        dialog = ft.AlertDialog(
            title=ft.Text("Editar Script", size=16, weight=ft.FontWeight.BOLD),
            content=ft.Container(content=content, width=480, height=320),
            actions=[
                ft.TextButton("Cancelar", on_click=lambda e: self._close_dialog()),
                ft.FilledButton("Salvar",
                    style=ft.ButtonStyle(color="#0d0d1a", bgcolor=AMBER_PRIMARY),
                    on_click=save_click,
                ),
            ],
            actions_alignment=ft.MainAxisAlignment.END,
        )
        self.page.show_dialog(dialog)

    def _show_warning(self, title, message):
        dialog = ft.AlertDialog(
            title=ft.Text(title),
            content=ft.Text(message),
            actions=[ft.TextButton("OK", on_click=lambda e: self._close_dialog())],
        )
        self.page.show_dialog(dialog)

    def _show_confirm(self, title, message, callback):
        dialog = ft.AlertDialog(
            title=ft.Text(title),
            content=ft.Text(message),
            actions=[
                ft.TextButton("Nao", on_click=lambda e: self._close_dialog()),
                ft.FilledButton("Sim",
                    style=ft.ButtonStyle(color="#0d0d1a", bgcolor=AMBER_PRIMARY),
                    on_click=lambda e: (self._close_dialog(), callback()),
                ),
            ],
        )
        self.page.show_dialog(dialog)

    def _find_script_index(self, script):
        if not self._script_indices:
            self._script_indices = {
                (s["nome"], s["caminho"]): i
                for i, s in enumerate(self.dados["scripts"])
            }
        key = (script.get("nome", ""), script.get("caminho", ""))
        return self._script_indices.get(key, -1)

    def _editar_script(self, script):
        self._abrir_edit_dialog(script=script)

    def _remover_script(self, script):
        def confirm():
            idx = self._find_script_index(script)
            if idx >= 0:
                self.dados["scripts"].pop(idx)
                salvar_dados(self.dados)
                self._script_indices.clear()
                self._categorias_dirty = True
                self._atualizar_cards()
                self._log(f"Script removido: {script['nome']}")

        self._show_confirm("Confirmar", f"Remover o script '{script['nome']}'?", confirm)

    def _abrir_gerenciar_categorias(self):
        categorias = self.dados["categorias"][:]

        field_style = {
            "border_color": BORDER_DEFAULT,
            "fill_color": BG_CARD,
            "text_style": ft.TextStyle(color=TEXT_PRIMARY),
            "label_style": ft.TextStyle(color=TEXT_MUTED),
        }

        entry_cat = ft.TextField(label="Nova categoria...", **field_style)
        cat_list = ft.Column(spacing=4, scroll=ft.ScrollMode.ALWAYS, expand=True)

        def render_cat_list(do_update=True):
            cat_list.controls.clear()
            for cat in categorias:
                f = ft.Container(
                    content=ft.Row([
                        ft.Text(cat, color=TEXT_PRIMARY, expand=True),
                        ft.OutlinedButton("Remover",
                            style=ft.ButtonStyle(color=RED_ERROR, side=ft.BorderSide(1, RED_ERROR + "40")),
                            on_click=lambda e, c=cat: remove_cat(c),
                        ),
                    ], alignment=ft.MainAxisAlignment.SPACE_BETWEEN),
                    bgcolor=BG_CARD, border_radius=8, padding=ft.Padding(14, 8, 8, 8),
                )
                cat_list.controls.append(f)
            if do_update:
                cat_list.update()

        def add_cat(e):
            nome = entry_cat.value.strip() if entry_cat.value else ""
            if nome and nome not in categorias:
                categorias.append(nome)
                entry_cat.value = ""
                entry_cat.update()
                render_cat_list()

        def remove_cat(cat):
            if cat in categorias:
                categorias.remove(cat)
                render_cat_list()

        def save_cats(e):
            self.dados["categorias"] = categorias
            if not self.dados["categorias"]:
                self.dados["categorias"] = []
            if self.categoria_atual not in categorias and self.categoria_atual not in ("Todas", "Favoritos"):
                self.categoria_atual = categorias[0] if categorias else "Todas"
            salvar_dados(self.dados)
            self._script_indices.clear()
            self._categorias_dirty = True
            self._atualizar_cards()
            self._close_dialog()
            self._log("Categorias atualizadas")

        render_cat_list(do_update=False)

        dialog = ft.AlertDialog(
            title=ft.Text("Gerenciar Categorias", size=16, weight=ft.FontWeight.BOLD),
            content=ft.Container(
                content=ft.Column([
                    ft.Row([
                        entry_cat,
                        ft.FilledButton("Adicionar",
                            style=ft.ButtonStyle(color="#0d0d1a", bgcolor=AMBER_PRIMARY),
                            on_click=add_cat,
                        ),
                    ], spacing=10, vertical_alignment=ft.CrossAxisAlignment.END),
                    cat_list,
                ], spacing=12),
                width=400, height=300,
            ),
            actions=[
                ft.TextButton("Cancelar", on_click=lambda e: self._close_dialog()),
                ft.FilledButton("Salvar",
                    style=ft.ButtonStyle(color="#0d0d1a", bgcolor=AMBER_PRIMARY),
                    on_click=save_cats,
                ),
            ],
            actions_alignment=ft.MainAxisAlignment.END,
        )
        self.page.show_dialog(dialog)

    def _toggle_favorito(self, nome):
        favs = self.dados.setdefault("favoritos", [])
        if nome in favs:
            favs.remove(nome)
        else:
            favs.append(nome)
        salvar_dados(self.dados)

        for entry in self._card_entries:
            if entry["script"]["nome"] == nome:
                is_fav = nome in favs
                entry["star_icon"].name = ICONS.STAR if is_fav else ICONS.STAR_OUTLINE
                entry["star_icon"].color = AMBER_PRIMARY if is_fav else TEXT_MUTED
                entry["star_icon"].update()
                break

        fav_refs = self._sidebar_refs.get("Favoritos")
        if fav_refs:
            count = self._favoritos_count
            fav_refs["count"].content.value = str(count)
            fav_refs["count"].update()

        if self.categoria_atual == "Favoritos":
            self._filter_cards()
            self.cards_grid.update()
            self.empty_state.update()

    @property
    def _favoritos_count(self):
        favs = self.dados.get("favoritos", [])
        return sum(1 for s in self._todos_scripts() if s["nome"] in favs)

    def _set_running(self, nome, estado):
        self._running[nome] = estado
        any_running = any(self._running.values())
        self.log_dot.bgcolor = GREEN_RUN if any_running else "#333333"

        for entry in self._card_entries:
            if entry["script"]["nome"] == nome:
                btn = entry["run_btn"]
                ring = entry["run_ring"]
                if estado:
                    btn.text = "Executando"
                    btn.disabled = True
                    btn.style = ft.ButtonStyle(
                        color=GREEN_RUN,
                        bgcolor="#0d3a1a",
                        side=ft.BorderSide(1, GREEN_RUN + "60"),
                        padding=ft.Padding(12, 6, 12, 6),
                        text_style=ft.TextStyle(size=10),
                    )
                    ring.visible = True
                else:
                    btn_label = "Abrir" if entry["script"].get("tipo") == ".txt" else "Executar"
                    btn.text = btn_label
                    btn.disabled = False
                    btn.style = ft.ButtonStyle(
                        color="#0d0d1a",
                        bgcolor=GREEN_RUN,
                        overlay_color=C.WHITE10,
                        padding=ft.Padding(12, 6, 12, 6),
                        text_style=ft.TextStyle(size=10),
                    )
                    ring.visible = False
                break
        self.log_dot.update()

    async def _executar_script(self, script):
        nome = script["nome"]
        if self._running.get(nome):
            return

        self._set_running(nome, True)
        self.page.update()

        tipo = script.get("tipo", "")
        caminho = script["caminho"]
        script_dir = os.path.dirname(caminho)

        if not os.path.exists(caminho) and script.get("embedded"):
            self._extrair_unico(script)

        if not os.path.exists(caminho):
            self._log(f"Erro: Arquivo nao encontrado: {caminho}")
            self._set_running(nome, False)
            self.page.update()
            return

        if tipo == ".txt":
            try:
                os.startfile(caminho)
            except Exception as e:
                self._log(f"Erro ao abrir {nome}: {e}")
            self._set_running(nome, False)
            self.page.update()
            return

        import ctypes
        if script.get("admin") and not ctypes.windll.shell32.IsUserAnAdmin():
            proceed = await self._ask_admin_continue(nome)
            if not proceed:
                self._log(f"Execucao cancelada: {nome} (requer admin)")
                self._set_running(nome, False)
                self.page.update()
                return

        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, self._run_script_thread, script, nome, tipo, caminho, script_dir)

        self._set_running(nome, False)
        self.page.update()

    def _run_script_thread(self, script, nome, tipo, caminho, script_dir):
        try:
            self._log(f"Executando: {nome}")
            startupinfo = subprocess.STARTUPINFO()
            startupinfo.dwFlags |= subprocess.STARTF_USESHOWWINDOW
            if tipo in (".bat", ".cmd"):
                proc = subprocess.Popen(
                    ["cmd.exe", "/c", caminho],
                    stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                    startupinfo=startupinfo, text=True, encoding="utf-8", errors="replace",
                    cwd=script_dir,
                )
            elif tipo == ".ps1":
                proc = subprocess.Popen(
                    ["powershell.exe", "-ExecutionPolicy", "Bypass", "-File", caminho],
                    stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                    startupinfo=startupinfo, text=True, encoding="utf-8", errors="replace",
                    cwd=script_dir,
                )
            elif tipo == ".reg":
                proc = subprocess.Popen(
                    ["regedit.exe", "/s", caminho],
                    stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                    startupinfo=startupinfo, text=True, encoding="utf-8", errors="replace",
                    cwd=script_dir,
                )
            else:
                proc = subprocess.Popen(
                    [caminho],
                    stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                    startupinfo=startupinfo, text=True, encoding="utf-8", errors="replace",
                    cwd=script_dir,
                )
            for line in proc.stdout:
                if line.strip():
                    self._log(line.strip())
            proc.wait()
            self._log(f"Finalizado: {nome} (codigo: {proc.returncode})")
        except Exception as e:
            self._log(f"Erro ao executar {nome}: {e}")

    async def _ask_admin_continue(self, nome):
        ev = asyncio.Event()
        result = [False]

        def yes_click(e):
            result[0] = True
            ev.set()
            self._close_dialog()

        def no_click(e):
            result[0] = False
            ev.set()
            self._close_dialog()

        dialog = ft.AlertDialog(
            title=ft.Text("Permissao de Administrador"),
            content=ft.Text(
                f'O script "{nome}" requer permissoes de administrador.\n\n'
                "Deseja continuar mesmo assim? O script pode falhar se nao for executado como administrador."
            ),
            actions=[
                ft.TextButton("Nao", on_click=no_click),
                ft.FilledButton("Sim",
                    style=ft.ButtonStyle(color="#0d0d1a", bgcolor=AMBER_PRIMARY),
                    on_click=yes_click,
                ),
            ],
        )
        self.page.show_dialog(dialog)
        self.page.update()
        await ev.wait()
        return result[0]


def main(page: ft.Page):
    FMOptimizationApp(page)


if __name__ == "__main__":
    ft.run(main=main)
