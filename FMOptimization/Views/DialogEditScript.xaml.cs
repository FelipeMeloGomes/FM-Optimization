using System.IO;
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

        if (existing != null)
        {
            TxtNome.Text = existing.Nome;
            TxtDescricao.Text = existing.Descricao;
            TxtCaminho.Text = existing.Caminho;
            CboCategoria.SelectedValue = existing.Categoria;
        }
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
        var path = TxtCaminho.Text.Trim();

        if (string.IsNullOrEmpty(nome) || string.IsNullOrEmpty(path))
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

        if (_existing != null)
        {
            var toEdit = _data.Scripts.FirstOrDefault(s => s.Nome == _existing.Nome);
            if (toEdit != null)
            {
                toEdit.Nome = nome;
                toEdit.Descricao = desc;
                toEdit.Categoria = cat;
                toEdit.Caminho = path;
                toEdit.Tipo = ext;
            }
        }
        else
        {
            _data.Scripts.Add(new ScriptData
            {
                Nome = nome,
                Descricao = desc,
                Categoria = cat,
                Caminho = path,
                Tipo = ext
            });
        }

        _dataService.Salvar(_data);
        DialogResult = true;
        Close();
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
