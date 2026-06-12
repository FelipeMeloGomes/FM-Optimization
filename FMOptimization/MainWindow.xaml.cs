using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Animation;
using FMOptimization.Models;

namespace FMOptimization;

public partial class MainWindow : Window
{
    private readonly ViewModels.MainViewModel _vm;

    public MainWindow()
    {
        InitializeComponent();
        _vm = new ViewModels.MainViewModel();
        DataContext = _vm;

        _vm.OnShowDetails += ShowDetailsDialog;
        _vm.OnEditScript += OpenEditDialog;
        _vm.OnAddScript += OpenAddDialog;
        _vm.OnManageCategories += OpenCategoryDialog;

        KeyDown += OnKeyDown;
        _vm.PropertyChanged += (_, e) =>
        {
            if (e.PropertyName == nameof(ViewModels.MainViewModel.LogExpanded))
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
            LogScrollView.MaxHeight = 160;
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
        var dialog = new DialogDetalhes(script)
        {
            Owner = this
        };
        dialog.ShowDialog();
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

    // Search glow on focus
    private void SearchBox_GotFocus(object? sender, RoutedEventArgs e)
    {
        var colorAnim = new ColorAnimation
        {
            To = Color.FromRgb(0, 229, 255),
            Duration = new Duration(TimeSpan.FromSeconds(0.15)),
        };
        SearchBorder.BorderBrush = new SolidColorBrush(Color.FromRgb(0x1e, 0x1e, 0x4a));
        SearchBorder.BorderBrush.BeginAnimation(SolidColorBrush.ColorProperty, colorAnim);
    }

    private void SearchBox_LostFocus(object? sender, RoutedEventArgs e)
    {
        var colorAnim = new ColorAnimation
        {
            To = Color.FromRgb(0x1e, 0x1e, 0x4a),
            Duration = new Duration(TimeSpan.FromSeconds(0.15)),
        };
        SearchBorder.BorderBrush.BeginAnimation(SolidColorBrush.ColorProperty, colorAnim);
    }

    private void SearchBox_TextChanged(object? sender, TextChangedEventArgs e)
    {
        if (sender is TextBox tb && DataContext is ViewModels.MainViewModel vm)
        {
            vm.SearchText = tb.Text;
        }
    }

    private void SearchBorder_MouseDown(object? sender, System.Windows.Input.MouseButtonEventArgs e)
    {
        SearchBox.Focus();
    }
}
