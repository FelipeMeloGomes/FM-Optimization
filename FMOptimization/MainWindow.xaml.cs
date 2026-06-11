using System.Linq;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using FMOptimization.Models;
using FMOptimization.ViewModels;
using Microsoft.Win32;

namespace FMOptimization;

public partial class MainWindow : Window
{
    private readonly MainViewModel _vm;

    public MainWindow()
    {
        InitializeComponent();
        _vm = new MainViewModel();
        DataContext = _vm;

        _vm.OnShowDetails += ShowDetailsDialog;
        _vm.OnEditScript += OpenEditDialog;
        _vm.OnAddScript += OpenAddDialog;
        _vm.OnManageCategories += OpenCategoryDialog;

        KeyDown += OnKeyDown;
        _vm.PropertyChanged += (_, e) =>
        {
            if (e.PropertyName == nameof(MainViewModel.LogExpanded))
                AnimateLogPanel();
        };
    }

    private void OnKeyDown(object? sender, KeyEventArgs e)
    {
        if (e.Key == Key.F && Keyboard.IsKeyDown(Key.LeftCtrl))
        {
            SearchBox.Focus();
            e.Handled = true;
        }
        else if (e.Key == Key.Escape)
        {
            if (!string.IsNullOrEmpty(SearchBox.Text))
            {
                SearchBox.Text = "";
                e.Handled = true;
            }
        }
    }

    private void AnimateLogPanel()
    {
        if (_vm.LogExpanded)
        {
            LogScrollView.MaxHeight = 120;
            LogToggleBtn.Content = "▲";
        }
        else
        {
            LogScrollView.MaxHeight = 0;
            LogToggleBtn.Content = "▼";
        }
    }

    private void ShowDetailsDialog(ScriptModel script)
    {
        var badges = new List<string> { script.TipoLabel, script.Categoria };
        if (script.Admin) badges.Add("REQUER ADMIN");

        var explicacao = !string.IsNullOrEmpty(script.Explicacao)
            ? script.Explicacao
            : script.Descricao;

        var msg = $"[{string.Join(" | ", badges)}]\n\n{explicacao}";

        MessageBox.Show(msg, script.Nome, MessageBoxButton.OK, MessageBoxImage.Information);
    }

    private void OpenEditDialog(ScriptModel script)
    {
        var dialog = new DialogEditScript(script);
        dialog.Owner = this;
        if (dialog.ShowDialog() == true)
        {
            _vm.LoadData();
        }
    }

    private void OpenAddDialog()
    {
        var dialog = new DialogEditScript(null);
        dialog.Owner = this;
        if (dialog.ShowDialog() == true)
        {
            _vm.LoadData();
        }
    }

    private void OpenCategoryDialog()
    {
        var dialog = new DialogManageCategories(_vm.Categories.Select(c => c.Name).ToList());
        dialog.Owner = this;
        if (dialog.ShowDialog() == true)
        {
            _vm.LoadData();
        }
    }
}
