using System.Windows;
using System.Windows.Input;
using FMOptimize.Models;

namespace FMOptimize.Controls;

public partial class RestorePointsControl
{
    public RestorePointsControl()
    {
        InitializeComponent();
        Loaded += OnLoaded;
    }

    private void OnLoaded(object? sender, RoutedEventArgs e)
    {
        ListaRestores.SelectionChanged += OnSelectionChanged;
        if (DataContext is ViewModels.MainViewModel vm)
        {
            vm.PropertyChanged += (_, args) =>
            {
                if (args.PropertyName == nameof(vm.RestorePoints))
                {
                    UpdateListState();
                }
                if (args.PropertyName is nameof(vm.RestoreStatusMessage) or nameof(vm.RestoreStatusError))
                {
                    UpdateStatus();
                }
            };
        }
        UpdateListState();
    }

    private void OnSelectionChanged(object? sender, System.Windows.Controls.SelectionChangedEventArgs e)
    {
        var selected = ListaRestores.SelectedItem as RestorePointEntry;
        BtnRestaurar.IsEnabled = selected != null;
        BtnExcluir.IsEnabled = selected != null;
        TxtSelectedInfo.Text = selected != null ? $"#{selected.SequenceNumber} selecionado" : "";
    }

    private void UpdateListState()
    {
        if (DataContext is not ViewModels.MainViewModel vm) return;
        var count = vm.RestorePoints.Count;
        TxtCount.Text = count > 0 ? $"{count} ponto(s) encontrado(s)" : "Nenhum ponto encontrado";
        TxtEmpty.Visibility = count == 0 ? Visibility.Visible : Visibility.Collapsed;
        ListaRestores.Visibility = count == 0 ? Visibility.Collapsed : Visibility.Visible;
    }

    private void UpdateStatus()
    {
        if (DataContext is not ViewModels.MainViewModel vm) return;
        if (string.IsNullOrEmpty(vm.RestoreStatusMessage))
        {
            StatusBar.Visibility = Visibility.Collapsed;
            return;
        }
        StatusBar.Visibility = Visibility.Visible;
        TxtStatusIcon.Text = vm.RestoreStatusError ? "✗" : "✓";
        TxtStatusMessage.Text = vm.RestoreStatusMessage;
        TxtStatusMessage.Foreground = vm.RestoreStatusError
            ? (System.Windows.Media.Brush)FindResource("RedErrorBrush")
            : (System.Windows.Media.Brush)FindResource("GreenRunBrush");
    }

}
