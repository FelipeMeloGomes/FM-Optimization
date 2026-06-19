using System.Windows;
using System.Windows.Input;
using FMOptimize.Models;
using FMOptimize.Services;

namespace FMOptimize;

public partial class DialogRestorePoints : Window
{
    private readonly ISystemInfoService _systemInfoService;
    private List<RestorePointEntry> _entries = [];
    private bool _isOperating;

    public DialogRestorePoints(List<RestorePointEntry> entries, ISystemInfoService systemInfoService)
    {
        InitializeComponent();
        _systemInfoService = systemInfoService;
        _entries = entries;
        PopulateList(entries);
    }

    private void PopulateList(List<RestorePointEntry> entries)
    {
        _entries = entries;

        if (entries.Count == 0)
        {
            TxtCount.Text = "Nenhum ponto encontrado";
            TxtEmpty.Visibility = Visibility.Visible;
            ListaRestores.Visibility = Visibility.Collapsed;
            BtnRestaurar.IsEnabled = false;
            BtnExcluir.IsEnabled = false;
            BtnCopiar.IsEnabled = false;
            return;
        }

        TxtCount.Text = $"{entries.Count} ponto(s) encontrado(s)";
        TxtEmpty.Visibility = Visibility.Collapsed;
        ListaRestores.Visibility = Visibility.Visible;
        ListaRestores.ItemsSource = null;
        ListaRestores.ItemsSource = entries;
        BtnRestaurar.IsEnabled = false;
        BtnExcluir.IsEnabled = false;
        BtnCopiar.IsEnabled = false;
        TxtSelectedInfo.Text = "";
    }

    private void ShowStatus(string icon, string message, bool isError = false)
    {
        StatusBar.Visibility = Visibility.Visible;
        TxtStatusIcon.Text = icon;
        TxtStatusMessage.Text = message;
        TxtStatusMessage.Foreground = isError
            ? (System.Windows.Media.Brush)FindResource("RedErrorBrush")
            : (System.Windows.Media.Brush)FindResource("GreenRunBrush");
    }

    private void HideStatus()
    {
        StatusBar.Visibility = Visibility.Collapsed;
    }

    private void SetOperating(bool operating)
    {
        _isOperating = operating;
        BtnRestaurar.IsEnabled = !operating && ListaRestores.SelectedItem != null;
        BtnExcluir.IsEnabled = !operating && ListaRestores.SelectedItem != null;
        BtnCopiar.IsEnabled = !operating && ListaRestores.SelectedItem != null;
        Cursor = operating ? Cursors.Wait : Cursors.Arrow;
    }

    private async void RestoreClick(object? sender, RoutedEventArgs e)
    {
        if (_isOperating) return;

        var selected = ListaRestores.SelectedItem as RestorePointEntry;
        if (selected == null) return;

        var confirm = MessageBox.Show(
            $"Tem certeza que deseja restaurar o ponto:\n\n{selected.Descricao}\n{selected.DataCriacao}\n\n" +
            $"O sistema será reiniciado para concluir a restauração. Salve seu trabalho antes de continuar.",
            "Confirmar Restauração",
            MessageBoxButton.YesNo,
            MessageBoxImage.Warning);

        if (confirm != MessageBoxResult.Yes) return;

        SetOperating(true);
        HideStatus();

        try
        {
            var result = await _systemInfoService.RestoreSystemAsync(selected.SequenceNumber);
            ShowStatus(result.Success ? "✓" : "✗", result.Message, !result.Success);
        }
        catch (Exception ex)
        {
            ShowStatus("✗", $"Erro: {ex.Message}", true);
        }
        finally
        {
            SetOperating(false);
        }
    }

    private async void DeleteClick(object? sender, RoutedEventArgs e)
    {
        if (_isOperating) return;

        var selected = ListaRestores.SelectedItem as RestorePointEntry;
        if (selected == null) return;

        var confirm = MessageBox.Show(
            $"Excluir o ponto de restauração:\n\n{selected.Descricao}\n{selected.DataCriacao}?",
            "Confirmar Exclusão",
            MessageBoxButton.YesNo,
            MessageBoxImage.Question);

        if (confirm != MessageBoxResult.Yes) return;

        SetOperating(true);
        HideStatus();

        try
        {
            var result = await _systemInfoService.DeleteRestorePointAsync(selected.SequenceNumber);
            ShowStatus(result.Success ? "✓" : "✗", result.Message, !result.Success);

            if (result.Success)
            {
                var updated = await _systemInfoService.GetRestorePointsAsync();
                PopulateList(updated);
            }
        }
        catch (Exception ex)
        {
            ShowStatus("✗", $"Erro: {ex.Message}", true);
        }
        finally
        {
            SetOperating(false);
        }
    }

    private void CloseClick(object? sender, RoutedEventArgs e)
    {
        DialogResult = true;
        Close();
    }

    private void Window_MouseDown(object? sender, MouseButtonEventArgs e)
    {
        if (e.ChangedButton == MouseButton.Left)
            DragMove();
    }

    private void ListaRestores_SelectionChanged(object? sender, System.Windows.Controls.SelectionChangedEventArgs e)
    {
        if (_isOperating) return;

        var selected = ListaRestores.SelectedItem as RestorePointEntry;
        BtnRestaurar.IsEnabled = selected != null;
        BtnExcluir.IsEnabled = selected != null;
        BtnCopiar.IsEnabled = selected != null;

        if (selected != null)
            TxtSelectedInfo.Text = $"#{selected.SequenceNumber} selecionado";
        else
            TxtSelectedInfo.Text = "";
    }

    private void CopyClick(object? sender, RoutedEventArgs e)
    {
        if (ListaRestores.SelectedItem is RestorePointEntry entry)
            CopyToClipboard(entry, full: false);
    }

    private void CopyItemClick(object? sender, RoutedEventArgs e)
    {
        if ((sender as System.Windows.Controls.MenuItem)?.DataContext is RestorePointEntry entry)
            CopyToClipboard(entry, full: false);
    }

    private void CopyItemFullClick(object? sender, RoutedEventArgs e)
    {
        if ((sender as System.Windows.Controls.MenuItem)?.DataContext is RestorePointEntry entry)
            CopyToClipboard(entry, full: true);
    }

    private static void CopyToClipboard(RestorePointEntry entry, bool full)
    {
        var text = full
            ? $"#{entry.SequenceNumber} | {entry.Descricao} | {entry.DataCriacao} | {entry.Tipo}"
            : entry.Descricao;
        try { Clipboard.SetText(text); }
        catch { }
    }
}
