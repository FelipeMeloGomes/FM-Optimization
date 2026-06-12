using System.Windows;
using System.Windows.Input;
using FMOptimization.Models;
using FMOptimization.ViewModels;

namespace FMOptimization;

public partial class MainWindow : Window
{
    private readonly MainViewModel _vm;

    public MainWindow(MainViewModel vm)
    {
        InitializeComponent();
        _vm = vm;
        DataContext = _vm;

        _vm.OnShowDetails += ShowDetailsDialog;
        _vm.OnEditScript += OpenEditDialog;
        _vm.OnAddScript += OpenAddDialog;
        _vm.OnManageCategories += OpenCategoryDialog;

        KeyDown += OnKeyDown;
    }

    private void OnKeyDown(object? sender, KeyEventArgs e)
    {
        if (e.Key == Key.F && Keyboard.IsKeyDown(Key.LeftCtrl))
        {
            TopBar.FocusSearch();
            e.Handled = true;
        }
        else if (e.Key == Key.Escape)
        {
            if (!string.IsNullOrEmpty(TopBar.SearchText))
            {
                TopBar.ClearSearch();
                e.Handled = true;
            }
        }
    }

    private void ShowDetailsDialog(ScriptModel script)
    {
        var dialog = new DialogDetalhes(script) { Owner = this };
        dialog.ShowDialog();
    }

    private void OpenEditDialog(ScriptModel script)
    {
        var dialog = new DialogEditScript(script) { Owner = this };
        if (dialog.ShowDialog() == true)
            _vm.LoadData();
    }

    private void OpenAddDialog()
    {
        var dialog = new DialogEditScript(null) { Owner = this };
        if (dialog.ShowDialog() == true)
            _vm.LoadData();
    }

    private void OpenCategoryDialog()
    {
        var dialog = new DialogManageCategories(_vm.Categories.Select(c => c.Name).ToList()) { Owner = this };
        if (dialog.ShowDialog() == true)
            _vm.LoadData();
    }
}
