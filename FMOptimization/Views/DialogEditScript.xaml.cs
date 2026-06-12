using System.IO;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Animation;
using FMOptimization.Models;
using FMOptimization.Resources;
using FMOptimization.Services;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Win32;

namespace FMOptimization;

public partial class DialogEditScript : Window
{
    private readonly IDataService _dataService;
    private readonly ScriptModel? _existing;
    private readonly AppData _data;
    private static readonly string[] TiposCode = [".bat", ".cmd", ".ps1", ".reg", ".exe"];
    private static readonly string UserScriptsDir = Path.Combine(
        AppDomain.CurrentDomain.BaseDirectory, "user_scripts");

    public DialogEditScript(ScriptModel? existing)
    {
        InitializeComponent();
        _dataService = App.Services.GetRequiredService<IDataService>();
        _existing = existing;
        _data = _dataService.Carregar();

        TituloJanela.Text = existing != null ? Strings.EditScriptTitle : Strings.AddScriptTitle;

        foreach (var cat in _data.Categorias)
            CboCategoria.Items.Add(cat);
        if (CboCategoria.Items.Count > 0)
            CboCategoria.SelectedIndex = 0;

        foreach (var t in TiposCode)
            CboTipo.Items.Add(t);
        CboTipo.SelectedIndex = 0;

        if (existing != null)
        {
            TxtNome.Text = existing.Nome;
            TxtDescricao.Text = existing.Descricao;
            TxtCaminho.Text = existing.Caminho;
            CboCategoria.SelectedValue = existing.Categoria;
        }
    }

    private void TabModeChanged(object? sender, RoutedEventArgs e)
    {
        if (!IsLoaded) return;
        var isCode = RadioCodigo.IsChecked == true;
        PanelArquivo.Visibility = isCode ? Visibility.Collapsed : Visibility.Visible;
        PanelCodigo.Visibility = isCode ? Visibility.Visible : Visibility.Collapsed;
    }

    private void BrowseClick(object? sender, RoutedEventArgs e)
    {
        var openDialog = new OpenFileDialog
        {
            Filter = Strings.ScriptFilter,
            Title = Strings.SelectScriptDialogTitle
        };
        if (openDialog.ShowDialog() == true)
            TxtCaminho.Text = openDialog.FileName;
    }

    private void SaveClick(object? sender, RoutedEventArgs e)
    {
        var nome = TxtNome.Text.Trim();
        var desc = TxtDescricao.Text.Trim();
        var cat = CboCategoria.SelectedItem as string ?? "";
        var isCode = RadioCodigo.IsChecked == true;

        if (string.IsNullOrEmpty(nome))
        {
            MessageBox.Show(Strings.RequiredFieldsMessage, Strings.RequiredFieldsTitle,
                MessageBoxButton.OK, MessageBoxImage.Warning);
            return;
        }

        string? conteudo = null;

        if (isCode)
        {
            conteudo = TxtCodigo.Text.Trim();
            if (string.IsNullOrEmpty(conteudo))
            {
                MessageBox.Show(Strings.CodeRequiredMessage, Strings.RequiredFieldsTitle,
                    MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }
        }
        else
        {
            var path = TxtCaminho.Text.Trim();
            if (string.IsNullOrEmpty(path))
            {
                MessageBox.Show(Strings.RequiredFieldsMessage, Strings.RequiredFieldsTitle,
                    MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            if (!File.Exists(path))
            {
                MessageBox.Show(Strings.FileNotFoundMessage(path), Strings.FileNotFoundTitle,
                    MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }

            var ext = Path.GetExtension(path).ToLower();
            if (ext != ".bat" && ext != ".cmd" && ext != ".ps1" && ext != ".exe")
            {
                MessageBox.Show(Strings.InvalidTypeMessage, Strings.InvalidTypeTitle,
                    MessageBoxButton.OK, MessageBoxImage.Warning);
                return;
            }
        }

        if (_existing != null)
        {
            var toEdit = _data.Scripts.FirstOrDefault(s => s.Nome == _existing.Nome);
            if (toEdit != null)
            {
                toEdit.Nome = nome;
                toEdit.Descricao = desc;
                toEdit.Categoria = cat;
                toEdit.Conteudo = conteudo;
                if (isCode)
                {
                    var tipo = CboTipo.SelectedItem as string ?? ".bat";
                    toEdit.Tipo = tipo;
                    toEdit.Caminho = SalvarConteudo(nome, tipo, conteudo!);
                }
                else
                {
                    toEdit.Caminho = TxtCaminho.Text.Trim();
                    toEdit.Tipo = Path.GetExtension(toEdit.Caminho).ToLower();
                }
            }
        }
        else
        {
            var sd = new ScriptData
            {
                Nome = nome,
                Descricao = desc,
                Categoria = cat,
                Conteudo = conteudo,
            };
            if (isCode)
            {
                var tipo = CboTipo.SelectedItem as string ?? ".bat";
                sd.Tipo = tipo;
                sd.Caminho = SalvarConteudo(nome, tipo, conteudo!);
            }
            else
            {
                sd.Caminho = TxtCaminho.Text.Trim();
                sd.Tipo = Path.GetExtension(sd.Caminho).ToLower();
            }
            _data.Scripts.Add(sd);
        }

        _dataService.Salvar(_data);
        DialogResult = true;
        Close();
    }

    private static string SalvarConteudo(string nome, string tipo, string conteudo)
    {
        Directory.CreateDirectory(UserScriptsDir);
        var nomeArquivo = SanitizarNome(nome) + tipo;
        var caminho = Path.Combine(UserScriptsDir, nomeArquivo);
        File.WriteAllText(caminho, conteudo);
        return caminho;
    }

    private static string SanitizarNome(string nome)
    {
        foreach (var c in Path.GetInvalidFileNameChars())
            nome = nome.Replace(c, '_');
        return nome;
    }

    private void CancelClick(object? sender, RoutedEventArgs e)
    {
        DialogResult = false;
        Close();
    }

    private void Field_GotFocus(object? sender, RoutedEventArgs e)
    {
        if (sender is TextBox tb)
        {
            var parent = tb.Parent as Border;
            if (parent != null)
            {
                parent.BorderBrush = new SolidColorBrush(Color.FromRgb(0x1e, 0x1e, 0x4a));
                var anim = new ColorAnimation
                {
                    To = Color.FromRgb(0, 229, 255),
                    Duration = new Duration(TimeSpan.FromSeconds(0.15)),
                };
                parent.BorderBrush.BeginAnimation(SolidColorBrush.ColorProperty, anim);
            }
        }
    }

    private void Field_LostFocus(object? sender, RoutedEventArgs e)
    {
        if (sender is TextBox tb)
        {
            var parent = tb.Parent as Border;
            if (parent != null)
            {
                var anim = new ColorAnimation
                {
                    To = Color.FromRgb(0x1e, 0x1e, 0x4a),
                    Duration = new Duration(TimeSpan.FromSeconds(0.15)),
                };
                parent.BorderBrush.BeginAnimation(SolidColorBrush.ColorProperty, anim);
            }
        }
    }

    private void Window_MouseDown(object? sender, MouseButtonEventArgs e)
    {
        if (e.ChangedButton == MouseButton.Left)
            DragMove();
    }
}
