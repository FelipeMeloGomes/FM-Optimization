import atexit
import base64
import ctypes
import customtkinter as ctk
import json
import os
import shutil
import subprocess
import sys
import tempfile
import threading
import datetime
import time
from tkinter import filedialog, messagebox
from scripts_registry import EMBEDDED_SCRIPTS

ctk.set_appearance_mode("dark")

CYAN = "#60cdff"
CYAN_DIM = "#1a4a6a"
CYAN_BG = "#1a2a3a"
AMBER = "#e6a84c"
GREEN = "#4caf50"
RED = "#e74c3c"
BG_PRIMARY = "#1a1a1a"
BG_SIDEBAR = "#222222"
BG_CARD = "#242424"
BG_CARD_HOVER = "#2c2c2c"
BORDER_CARD = "#333333"
TEXT_PRIMARY = "#e0e0e0"
TEXT_MUTED = "#888888"
TERMINAL_BG = "#111111"
SIDEBAR_DIVIDER = "#333333"
RED_HOVER = "#2a1010"
RED_BORDER = "#4d0000"
AMBER_HOVER = "#2a2010"
AMBER_BORDER = "#4d3600"
CYAN_BORDER = "#1a5a7a"
CYAN_ACTIVE = "#2c2c2c"
GREEN_BG = "#1a3a1a"
HEADER_DIVIDER = "#333333"

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
        except:
            pass
    dados.pop("agendamento", None)
    dados["categorias"] = [c for c in dados.get("categorias", []) if c != "Geral"]
    if "scripts" not in dados:
        dados["scripts"] = []
    return dados

def salvar_dados(dados):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(dados, f, indent=2, ensure_ascii=False)


class FullLogWindow(ctk.CTkToplevel):
    def __init__(self, parent):
        super().__init__(parent)
        self.title("Log Completo")
        self.geometry("700x500")
        self.configure(fg_color=BG_PRIMARY)
        self.textbox = ctk.CTkTextbox(self, wrap="word", fg_color=TERMINAL_BG, text_color=GREEN,
                                       font=ctk.CTkFont(family="Consolas", size=12))
        self.textbox.pack(fill="both", expand=True, padx=10, pady=(10, 5))

        btn_frame = ctk.CTkFrame(self, fg_color="transparent")
        btn_frame.pack(fill="x", padx=10, pady=(0, 10))
        ctk.CTkButton(btn_frame, text="Limpar", width=80, fg_color=BG_CARD, text_color=TEXT_PRIMARY,
                       hover_color=BG_CARD_HOVER, border_width=1, border_color=BORDER_CARD,
                       command=self.limpar).pack(side="right", padx=5)
        ctk.CTkButton(btn_frame, text="Fechar", width=80, fg_color=CYAN, text_color=BG_PRIMARY,
                       hover_color="#00c4d9", command=self.destroy).pack(side="right", padx=5)

    def log(self, msg):
        self.after(0, self._log_ui, msg)

    def _log_ui(self, msg):
        try:
            self.textbox.insert("end", msg + "\n")
            self.textbox.see("end")
        except Exception:
            pass

    def limpar(self):
        self.textbox.delete("1.0", "end")


class ScriptDetailsDialog(ctk.CTkToplevel):
    def __init__(self, parent, script):
        super().__init__(parent)
        self.title(script["nome"])
        self.geometry("560x400")
        self.configure(fg_color=BG_PRIMARY)
        self.transient(parent)
        self.grab_set()

        main = ctk.CTkScrollableFrame(self, fg_color="transparent")
        main.pack(fill="both", expand=True, padx=24, pady=18)

        ctk.CTkLabel(main, text=script["nome"],
                      font=ctk.CTkFont(size=18, weight="bold"),
                      text_color=TEXT_PRIMARY).pack(anchor="w", pady=(0, 8))

        meta = ctk.CTkFrame(main, fg_color="transparent")
        meta.pack(fill="x", pady=(0, 12))
        colors = {".bat": GREEN, ".cmd": GREEN, ".ps1": CYAN, ".exe": AMBER, ".reg": AMBER, ".txt": TEXT_MUTED}
        c = colors.get(script.get("tipo", ""), TEXT_MUTED)
        ctk.CTkLabel(meta, text=script.get("tipo", "").upper(),
                      font=ctk.CTkFont(size=10, weight="bold"),
                      text_color=c, fg_color=BG_CARD, corner_radius=3).pack(side="left", padx=(0, 8), ipadx=6, ipady=2)
        ctk.CTkLabel(meta, text=script.get("categoria", ""),
                      font=ctk.CTkFont(size=11),
                      text_color=TEXT_MUTED).pack(side="left", padx=(0, 8))
        if script.get("admin"):
            ctk.CTkLabel(meta, text="REQUER ADMIN",
                          font=ctk.CTkFont(size=9, weight="bold"),
                          text_color=AMBER, fg_color=AMBER_HOVER,
                          corner_radius=3, padx=6).pack(side="left", ipadx=4, ipady=2)

        ctk.CTkFrame(main, height=1, fg_color=BORDER_CARD).pack(fill="x", pady=(0, 12))

        explicacao = script.get("explicacao", script.get("descricao", "Sem descricao disponivel."))
        lbl = ctk.CTkLabel(main, text=explicacao, wraplength=490,
                           font=ctk.CTkFont(size=13), text_color=TEXT_PRIMARY,
                           justify="left")
        lbl.pack(anchor="w", fill="x", pady=(0, 16))

        btn_frame = ctk.CTkFrame(main, fg_color="transparent")
        btn_frame.pack(fill="x")
        ctk.CTkButton(btn_frame, text="Fechar", width=120, fg_color=CYAN,
                       text_color=BG_PRIMARY, hover_color="#00c4d9",
                       command=self.destroy).pack(side="right")


class AddEditScriptDialog(ctk.CTkToplevel):
    def __init__(self, parent, categorias, script=None, callback=None):
        super().__init__(parent)
        self.callback = callback
        self.script = script
        self.title("Editar Script" if script else "Adicionar Script")
        self.geometry("520x380")
        self.configure(fg_color=BG_PRIMARY)
        self.transient(parent)
        self.grab_set()

        lbl_style = {"font": ctk.CTkFont(size=12), "text_color": TEXT_MUTED}
        entry_style = {"fg_color": BG_CARD, "border_color": BORDER_CARD, "text_color": TEXT_PRIMARY,
                       "placeholder_text_color": TEXT_MUTED}

        ctk.CTkLabel(self, text="Nome", **lbl_style).pack(anchor="w", padx=24, pady=(18, 2))
        self.entry_nome = ctk.CTkEntry(self, width=470, **entry_style)
        self.entry_nome.pack(padx=24, pady=(0, 10))
        if script:
            self.entry_nome.insert(0, script["nome"])

        ctk.CTkLabel(self, text="Descricao", **lbl_style).pack(anchor="w", padx=24)
        self.entry_desc = ctk.CTkEntry(self, width=470, **entry_style)
        self.entry_desc.pack(padx=24, pady=(0, 10))
        if script:
            self.entry_desc.insert(0, script.get("descricao", ""))

        ctk.CTkLabel(self, text="Categoria", **lbl_style).pack(anchor="w", padx=24)
        self.combo_cat = ctk.CTkComboBox(self, values=categorias if categorias else [""],
                                          width=470, fg_color=BG_CARD, border_color=BORDER_CARD,
                                          button_color=CYAN, button_hover_color="#00c4d9",
                                          dropdown_fg_color=BG_CARD, dropdown_text_color=TEXT_PRIMARY,
                                          dropdown_hover_color=BG_CARD_HOVER, text_color=TEXT_PRIMARY)
        self.combo_cat.pack(padx=24, pady=(0, 10))
        if script:
            self.combo_cat.set(script.get("categoria", categorias[0] if categorias else ""))

        ctk.CTkLabel(self, text="Caminho do Script", **lbl_style).pack(anchor="w", padx=24)
        path_frame = ctk.CTkFrame(self, fg_color="transparent")
        path_frame.pack(padx=24, pady=(0, 16), fill="x")
        self.entry_path = ctk.CTkEntry(path_frame, **entry_style)
        self.entry_path.pack(side="left", fill="x", expand=True)
        if script:
            self.entry_path.insert(0, script.get("caminho", ""))
        ctk.CTkButton(path_frame, text="...", width=40, fg_color=BG_CARD, text_color=TEXT_PRIMARY,
                       hover_color=BG_CARD_HOVER, border_width=1, border_color=BORDER_CARD,
                       command=self.browse).pack(side="right", padx=(6, 0))

        ctk.CTkButton(self, text="Salvar", width=200, fg_color=CYAN, text_color=BG_PRIMARY,
                       hover_color="#00c4d9", command=self.save).pack(pady=6)

    def browse(self):
        path = filedialog.askopenfilename(
            title="Selecionar Script",
            filetypes=[("Scripts", "*.bat;*.cmd;*.ps1;*.exe"), ("Todos", "*.*")]
        )
        if path:
            self.entry_path.delete(0, "end")
            self.entry_path.insert(0, path)

    def save(self):
        nome = self.entry_nome.get().strip()
        desc = self.entry_desc.get().strip()
        cat = self.combo_cat.get().strip()
        path = self.entry_path.get().strip()
        if not nome or not path:
            messagebox.showwarning("Campos obrigatorios", "Preencha nome e caminho do script.")
            return
        if not os.path.exists(path):
            messagebox.showwarning("Arquivo nao encontrado", f"O arquivo nao existe:\n{path}")
            return
        ext = os.path.splitext(path)[1].lower()
        if ext not in (".bat", ".cmd", ".ps1", ".exe"):
            messagebox.showwarning("Tipo invalido", "Apenas .bat, .cmd, .ps1 e .exe sao permitidos.")
            return
        data = {
            "nome": nome, "descricao": desc, "categoria": cat,
            "caminho": path, "tipo": ext
        }
        if self.callback:
            self.callback(data)
        self.destroy()


class CategoryDialog(ctk.CTkToplevel):
    def __init__(self, parent, categorias, callback):
        super().__init__(parent)
        self.callback = callback
        self.categorias = categorias[:]
        self.title("Gerenciar Categorias")
        self.geometry("420x360")
        self.configure(fg_color=BG_PRIMARY)
        self.transient(parent)
        self.grab_set()

        top_frame = ctk.CTkFrame(self, fg_color="transparent")
        top_frame.pack(fill="x", padx=24, pady=18)
        self.entry_cat = ctk.CTkEntry(top_frame, placeholder_text="Nova categoria...", width=260,
                                       fg_color=BG_CARD, border_color=BORDER_CARD, text_color=TEXT_PRIMARY,
                                       placeholder_text_color=TEXT_MUTED)
        self.entry_cat.pack(side="left")
        ctk.CTkButton(top_frame, text="Adicionar", width=90, fg_color=CYAN, text_color=BG_PRIMARY,
                       hover_color="#00c4d9", command=self.add_categoria).pack(side="right", padx=(10, 0))

        self.list_frame = ctk.CTkScrollableFrame(self, fg_color="transparent")
        self.list_frame.pack(fill="both", expand=True, padx=24, pady=(0, 18))
        self.render_list()

    def render_list(self):
        for w in self.list_frame.winfo_children():
            w.destroy()
        for cat in self.categorias:
            f = ctk.CTkFrame(self.list_frame, fg_color=BG_CARD, corner_radius=8)
            f.pack(fill="x", pady=3)
            ctk.CTkLabel(f, text=cat, text_color=TEXT_PRIMARY).pack(side="left", padx=14, pady=8)
            ctk.CTkButton(f, text="Remover", width=70, fg_color="transparent", text_color=RED,
                           hover_color=RED_HOVER, border_width=1, border_color=RED_BORDER,
                           command=lambda c=cat: self.remove_categoria(c)).pack(side="right", padx=8, pady=4)

    def add_categoria(self):
        nome = self.entry_cat.get().strip()
        if nome and nome not in self.categorias:
            self.categorias.append(nome)
            self.entry_cat.delete(0, "end")
            self.render_list()

    def remove_categoria(self, cat):
        if cat in self.categorias:
            self.categorias.remove(cat)
            self.render_list()

    def destroy(self):
        self.callback(self.categorias)
        super().destroy()


class ScriptManagerApp(ctk.CTk):
    def __init__(self):
        super().__init__()
        self.title("FM Optimization")
        self.geometry("1200x720")
        self.minsize(900, 500)
        self.configure(fg_color=BG_PRIMARY)
        self.dados = carregar_dados()

        for s in EMBEDDED_SCRIPTS:
            if s["categoria"] not in self.dados["categorias"]:
                self.dados["categorias"].append(s["categoria"])

        self.categoria_atual = "Todas"
        if self.dados["categorias"]:
            self.categoria_atual = self.dados["categorias"][0]

        self._temp_scripts_dir = tempfile.mkdtemp(prefix="OtimizarWindons_")
        self._extrair_scripts_temp()
        atexit.register(self._limpar_temp)

        self._build_ui()
        self._atualizar_cards()

    def _build_ui(self):
        self.grid_columnconfigure(0, weight=1)

        header = ctk.CTkFrame(self, fg_color=BG_SIDEBAR, corner_radius=0)
        header.grid(row=0, column=0, sticky="ew")
        header.grid_columnconfigure(1, weight=1)

        ctk.CTkLabel(header, text="FM Optimization",
                      font=ctk.CTkFont(size=14, weight="bold"),
                      text_color=TEXT_PRIMARY).grid(row=0, column=0, padx=(16, 10), pady=10, sticky="w")

        self.entry_busca = ctk.CTkEntry(header, placeholder_text="Buscar scripts...",
                                         border_width=0, height=32,
                                         fg_color=BG_PRIMARY, text_color=TEXT_PRIMARY,
                                         placeholder_text_color=TEXT_MUTED)
        self.entry_busca.grid(row=0, column=1, padx=8, pady=10, sticky="ew")
        self.entry_busca.bind("<KeyRelease>", lambda e: self._atualizar_cards())

        ctk.CTkButton(header, text="+ Adicionar Script", width=130, height=32,
                       fg_color=CYAN, text_color="#ffffff",
                       hover_color=CYAN_DIM, font=ctk.CTkFont(size=12),
                       command=self._abrir_adicionar_script).grid(row=0, column=2, padx=(8, 16), pady=10)

        tab_bar = ctk.CTkFrame(self, fg_color="transparent", corner_radius=0, height=36)
        tab_bar.grid(row=1, column=0, sticky="ew")
        tab_bar.grid_propagate(False)

        self.cat_frame = ctk.CTkScrollableFrame(tab_bar, orientation="horizontal",
                                                  fg_color="transparent", height=28)
        self.cat_frame.pack(fill="x", padx=16, pady=2)

        divider = ctk.CTkFrame(self, height=1, fg_color=BORDER_CARD)
        divider.grid(row=2, column=0, sticky="ew")

        self.cards_frame = ctk.CTkScrollableFrame(self, fg_color="transparent")
        self.cards_frame.grid(row=3, column=0, sticky="nsew", padx=18, pady=(12, 0))

        self.grid_rowconfigure(3, weight=1)

        self.log_expanded = True
        self.full_log_window = None

        log_outer = ctk.CTkFrame(self, fg_color=BG_SIDEBAR, corner_radius=0)
        log_outer.grid(row=4, column=0, sticky="ew")

        toggle_bar = ctk.CTkFrame(log_outer, fg_color="transparent", height=24)
        toggle_bar.pack(fill="x")
        toggle_bar.pack_propagate(False)

        ctk.CTkLabel(toggle_bar, text="LOG",
                      font=ctk.CTkFont(size=9, weight="bold"),
                      text_color=TEXT_MUTED).pack(side="left", padx=14)

        self.log_toggle_btn = ctk.CTkButton(toggle_bar, text=chr(9660), width=22, height=18,
                                             fg_color="transparent", text_color=TEXT_MUTED,
                                             hover_color=BG_CARD_HOVER,
                                             command=self._toggle_log)
        self.log_toggle_btn.pack(side="left", padx=2)

        ctk.CTkButton(toggle_bar, text="Full", width=40, height=18,
                       fg_color="transparent", text_color=CYAN, hover_color=CYAN_BG,
                       font=ctk.CTkFont(size=9),
                       command=self._abrir_full_log).pack(side="right", padx=4)
        ctk.CTkButton(toggle_bar, text="Copiar", width=50, height=18,
                       fg_color="transparent", text_color=CYAN, hover_color=CYAN_BG,
                       font=ctk.CTkFont(size=9),
                       command=self._copiar_log).pack(side="right", padx=4)
        ctk.CTkButton(toggle_bar, text="Limpar", width=50, height=18,
                       fg_color="transparent", text_color=TEXT_MUTED, hover_color=BG_CARD_HOVER,
                       font=ctk.CTkFont(size=9),
                       command=self._limpar_log_rapido).pack(side="right", padx=4)

        self.log_content = ctk.CTkFrame(log_outer, fg_color=TERMINAL_BG, corner_radius=6)
        self.log_content.pack(fill="x", padx=12, pady=(0, 10))

        self.log_text = ctk.CTkTextbox(self.log_content, height=80, wrap="word",
                                        fg_color=TERMINAL_BG, text_color=GREEN,
                                        font=ctk.CTkFont(family="Consolas", size=11))
        self.log_text.pack(fill="both", expand=True, padx=4, pady=4)

    def _extrair_scripts_temp(self):
        for s in EMBEDDED_SCRIPTS:
            dst = os.path.join(self._temp_scripts_dir, s["caminho_relativo"])
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            try:
                data = base64.b64decode(s["conteudo_b64"])
                with open(dst, "wb") as f:
                    f.write(data)
            except Exception:
                pass

    def _limpar_temp(self):
        try:
            shutil.rmtree(self._temp_scripts_dir, ignore_errors=True)
        except Exception:
            pass

    @property
    def _embedded_scripts(self):
        result = []
        for s in EMBEDDED_SCRIPTS:
            entry = dict(s)
            entry["caminho"] = os.path.join(self._temp_scripts_dir, s["caminho_relativo"])
            entry["embedded"] = True
            result.append(entry)
        return result

    def _todos_scripts(self):
        return self.dados["scripts"] + self._embedded_scripts

    def _render_categorias(self):
        for w in self.cat_frame.winfo_children():
            w.destroy()

        def selecionar(cat):
            self.categoria_atual = cat
            self._atualizar_cards()

        self._tab_pill("Todas", selecionar, self.categoria_atual == "Todas")
        for cat in self.dados["categorias"]:
            self._tab_pill(cat, selecionar, self.categoria_atual == cat)

    def _tab_pill(self, nome, callback, active):
        btn = ctk.CTkButton(self.cat_frame, text=nome,
                             fg_color=CYAN_BG if active else BG_PRIMARY,
                             text_color=CYAN if active else TEXT_MUTED,
                             hover_color=BG_CARD_HOVER,
                             border_width=0,
                             corner_radius=14, height=24,
                             font=ctk.CTkFont(size=11),
                             command=lambda n=nome: callback(n))
        btn.pack(side="left", padx=3, pady=2)

    def _atualizar_cards(self):
        self._render_categorias()
        for w in self.cards_frame.winfo_children():
            w.destroy()

        busca = self.entry_busca.get().strip().lower()
        scripts = self._todos_scripts()
        if self.categoria_atual != "Todas":
            scripts = [s for s in scripts if s.get("categoria") == self.categoria_atual]
        if busca:
            scripts = [s for s in scripts if busca in s["nome"].lower() or busca in s.get("descricao", "").lower()]

        if not scripts:
            ctk.CTkLabel(self.cards_frame, text="Nenhum script encontrado.", text_color=TEXT_MUTED).pack(pady=60)
            return

        icons = {"bat": chr(9881), "cmd": chr(9881), "ps1": chr(9889),
                 "exe": chr(9654), "reg": chr(10025), "txt": chr(8505)}

        for script in scripts:
            is_embedded = script.get("embedded", False)
            _tipo = script.get("tipo", "").replace(".", "")
            icon_color = (GREEN if _tipo in ("bat", "cmd") else
                          CYAN if _tipo == "ps1" else
                          AMBER if _tipo in ("exe", "reg") else
                          TEXT_MUTED)
            _icon_bg = {GREEN: GREEN_BG, CYAN: BG_CARD_HOVER,
                        AMBER: AMBER_HOVER}.get(icon_color, BG_CARD)

            card = ctk.CTkFrame(self.cards_frame, fg_color=BG_CARD, corner_radius=8,
                                 border_width=1, border_color=BORDER_CARD)
            card.pack(fill="x", pady=4)

            row = ctk.CTkFrame(card, fg_color="transparent")
            row.pack(fill="x", padx=16, pady=12)

            left = ctk.CTkFrame(row, fg_color="transparent")
            left.pack(side="left", fill="x", expand=True)

            right = ctk.CTkFrame(row, fg_color="transparent")
            right.pack(side="right", padx=(12, 0))

            icon_line = ctk.CTkFrame(left, fg_color="transparent")
            icon_line.pack(fill="x")
            ctk.CTkLabel(icon_line, text=icons.get(_tipo, chr(9654)),
                          font=ctk.CTkFont(size=16), text_color=icon_color).pack(side="left")
            ctk.CTkLabel(icon_line, text=script["nome"],
                          font=ctk.CTkFont(size=14, weight="bold"),
                          text_color=TEXT_PRIMARY).pack(side="left", padx=(8, 0))

            if script.get("descricao"):
                ctk.CTkLabel(left, text=script["descricao"], text_color=TEXT_MUTED,
                              font=ctk.CTkFont(size=11), wraplength=500,
                              anchor="w").pack(anchor="w", pady=(2, 6))

            meta = ctk.CTkFrame(left, fg_color="transparent")
            meta.pack(anchor="w")
            ctk.CTkLabel(meta, text=script.get("tipo", "").upper(),
                          font=ctk.CTkFont(size=8, weight="bold"),
                          text_color=icon_color, fg_color=_icon_bg,
                          corner_radius=3).pack(side="left", padx=(0, 6), ipadx=4, ipady=1)
            if script.get("admin"):
                ctk.CTkLabel(meta, text="ADMIN",
                              font=ctk.CTkFont(size=8, weight="bold"),
                              text_color=AMBER, fg_color=AMBER_HOVER,
                              corner_radius=3).pack(side="left", padx=(0, 6), ipadx=4, ipady=1)
            ctk.CTkLabel(meta, text=script.get("categoria", ""),
                          font=ctk.CTkFont(size=10),
                          text_color=TEXT_MUTED).pack(side="left")

            btn_label = "Abrir" if script.get("tipo") == ".txt" else "Executar"
            ctk.CTkButton(right, text=btn_label, width=80, height=28,
                           fg_color=GREEN, text_color="#ffffff",
                           hover_color=GREEN_BG,
                           font=ctk.CTkFont(size=11),
                           command=lambda s=script: self._executar_script(s)).pack(side="top", pady=(0, 4))

            if is_embedded:
                ctk.CTkButton(right, text="Detalhes", width=80, height=28,
                               fg_color="transparent", text_color=CYAN,
                               hover_color=CYAN_BG, border_width=1, border_color=CYAN_BORDER,
                               font=ctk.CTkFont(size=11),
                               command=lambda s=script: self._mostrar_detalhes(s)).pack(side="top")
            else:
                ctk.CTkButton(right, text="Editar", width=80, height=28,
                               fg_color="transparent", text_color=AMBER,
                               hover_color=AMBER_HOVER, border_width=1, border_color=AMBER_BORDER,
                               font=ctk.CTkFont(size=11),
                               command=lambda s=script: self._editar_script(s)).pack(side="top", pady=(0, 4))
                ctk.CTkButton(right, text="Remover", width=80, height=28,
                               fg_color="transparent", text_color=RED,
                               hover_color=RED_HOVER, border_width=1, border_color=RED_BORDER,
                               font=ctk.CTkFont(size=11),
                               command=lambda s=script: self._remover_script(s)).pack(side="top")

    def _log(self, msg):
        timestamp = datetime.datetime.now().strftime("%H:%M:%S")
        line = f"[{timestamp}] {msg}"
        self.after(0, self._log_ui, line)

    def _log_ui(self, line):
        self.log_text.insert("end", line + "\n")
        self.log_text.see("end")
        try:
            if self.full_log_window and self.full_log_window.winfo_exists():
                self.full_log_window._log_ui(line)
        except Exception:
            pass

    def _toggle_log(self):
        if self.log_expanded:
            self.log_content.pack_forget()
            self.log_toggle_btn.configure(text=chr(9650))
        else:
            self.log_content.pack(fill="x", padx=12, pady=(0, 10))
            self.log_toggle_btn.configure(text=chr(9660))
        self.log_expanded = not self.log_expanded

    def _mostrar_detalhes(self, script):
        ScriptDetailsDialog(self, script)

    def _copiar_log(self):
        texto = self.log_text.get("1.0", "end-1c")
        if texto.strip():
            self.clipboard_clear()
            self.clipboard_append(texto)
            self._log("Log copiado para a area de transferencia")

    def _limpar_log_rapido(self):
        self.log_text.delete("1.0", "end")

    def _abrir_full_log(self):
        if self.full_log_window and self.full_log_window.winfo_exists():
            self.full_log_window.focus()
            return
        self.full_log_window = FullLogWindow(self)
        for line in self.log_text.get("1.0", "end-1c").split("\n"):
            if line.strip():
                self.full_log_window.log(line)

    def _abrir_adicionar_script(self):
        AddEditScriptDialog(self, self.dados["categorias"], callback=self._adicionar_script_callback)

    def _adicionar_script_callback(self, data):
        self.dados["scripts"].append(data)
        salvar_dados(self.dados)
        self._atualizar_cards()
        self._log(f"Script adicionado: {data['nome']}")

    def _editar_script(self, script):
        def callback(data):
            idx = self.dados["scripts"].index(script)
            self.dados["scripts"][idx] = data
            salvar_dados(self.dados)
            self._atualizar_cards()
            self._log(f"Script editado: {data['nome']}")
        AddEditScriptDialog(self, self.dados["categorias"], script=script, callback=callback)

    def _remover_script(self, script):
        if messagebox.askyesno("Confirmar", f"Remover o script '{script['nome']}'?"):
            self.dados["scripts"].remove(script)
            salvar_dados(self.dados)
            self._atualizar_cards()
            self._log(f"Script removido: {script['nome']}")

    def _abrir_gerenciar_categorias(self):
        def callback(categorias):
            self.dados["categorias"] = categorias
            if not self.dados["categorias"]:
                self.dados["categorias"] = []
            if self.categoria_atual not in categorias and self.categoria_atual != "Todas":
                self.categoria_atual = categorias[0]
            salvar_dados(self.dados)
            self._atualizar_cards()
        CategoryDialog(self, self.dados["categorias"], callback)

    def _executar_script(self, script):
        tipo = script.get("tipo", "")
        caminho = script["caminho"]
        script_dir = os.path.dirname(caminho)

        if not os.path.exists(caminho):
            self._log(f"Erro: Arquivo nao encontrado: {caminho}")
            return

        if tipo == ".txt":
            try:
                os.startfile(caminho)
            except Exception as e:
                self._log(f"Erro ao abrir {script['nome']}: {e}")
            return

        if script.get("admin") and not ctypes.windll.shell32.IsUserAnAdmin():
            resposta = messagebox.askyesno(
                "Permissao de Administrador",
                f"O script \"{script['nome']}\" requer permissoes de administrador.\n\n"
                "Deseja continuar mesmo assim? O script pode falhar se nao for executado como administrador."
            )
            if not resposta:
                self._log(f"Execucao cancelada: {script['nome']} (requer admin)")
                return

        def run():
            try:
                self._log(f"Executando: {script['nome']}")
                startupinfo = subprocess.STARTUPINFO()
                startupinfo.dwFlags |= subprocess.STARTF_USESHOWWINDOW
                if tipo in (".bat", ".cmd"):
                    proc = subprocess.Popen(
                        ["cmd.exe", "/c", caminho],
                        stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                        startupinfo=startupinfo, text=True, encoding="utf-8", errors="replace",
                        cwd=script_dir
                    )
                elif tipo == ".ps1":
                    proc = subprocess.Popen(
                        ["powershell.exe", "-ExecutionPolicy", "Bypass", "-File", caminho],
                        stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                        startupinfo=startupinfo, text=True, encoding="utf-8", errors="replace",
                        cwd=script_dir
                    )
                elif tipo == ".reg":
                    proc = subprocess.Popen(
                        ["regedit.exe", "/s", caminho],
                        stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                        startupinfo=startupinfo, text=True, encoding="utf-8", errors="replace",
                        cwd=script_dir
                    )
                else:
                    proc = subprocess.Popen(
                        [caminho],
                        stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                        startupinfo=startupinfo, text=True, encoding="utf-8", errors="replace",
                        cwd=script_dir
                    )
                for line in proc.stdout:
                    if line.strip():
                        self._log(line.strip())
                proc.wait()
                self._log(f"Finalizado: {script['nome']} (codigo: {proc.returncode})")
            except Exception as e:
                self._log(f"Erro ao executar {script['nome']}: {e}")

        threading.Thread(target=run, daemon=True).start()

if __name__ == "__main__":
    app = ScriptManagerApp()
    app.mainloop()
