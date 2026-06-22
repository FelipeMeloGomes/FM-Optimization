using System.Collections.ObjectModel;
using System.IO;
using System.Linq;
using System.Windows;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using FMOptimize.Helpers;
using FMOptimize.Models;
using FMOptimize.Resources;
using FMOptimize.Services;
using Microsoft.Extensions.Logging;
using LogLevel = FMOptimize.Models.LogLevel;

namespace FMOptimize.ViewModels;

public partial class MainViewModel : ObservableObject
{
    private readonly IScriptExecutionService _executor;
    private readonly IDataService _dataService;
    private readonly IScriptExtractionService _extractor;
    private readonly IScriptFilterService _filterService;
    private readonly ISystemInfoService _systemInfoService;
    private readonly ILogger<MainViewModel> _logger;
    private Models.AppData _data = new();
    private string _searchText = "";
    private CancellationTokenSource? _searchCts;

    [ObservableProperty]
    private DashboardData? dashboardData;

    [ObservableProperty]
    private string currentSection = "Dashboard";

    [ObservableProperty]
    private ObservableCollection<Models.ScriptModel> allScripts = [];

    [ObservableProperty]
    private ObservableCollection<Models.ScriptModel> filteredScripts = [];

    [ObservableProperty]
    private ObservableCollection<Models.LogEntry> logEntries = [];

    [ObservableProperty]
    private bool logExpanded = true;

    [ObservableProperty]
    private bool isLoading;

    [ObservableProperty]
    private bool isDashboard = true;

    [ObservableProperty]
    private ObservableCollection<RestorePointEntry> restorePoints = [];

    [ObservableProperty]
    private RestorePointEntry? selectedRestorePoint;

    [ObservableProperty]
    private bool isOperatingRestore;

    [ObservableProperty]
    private string restoreStatusMessage = "";

    [ObservableProperty]
    private bool restoreStatusError;

    public bool IsTweaks => CurrentSection == "Tweaks";
    public bool IsUtilities => CurrentSection == "Utilities";
    public bool IsCleaner => CurrentSection == "Cleaner";
    public bool IsRestorePoints => CurrentSection == "RestorePoints";
    public bool IsDnsManager => CurrentSection == "DNS Manager";
    public bool IsApps => CurrentSection == "Apps";
    public bool IsSettings => CurrentSection == "Settings";

    public string SearchText
    {
        get => _searchText;
        set
        {
            if (SetProperty(ref _searchText, value))
                DebouncedSearch();
        }
    }

    public MainViewModel(
        IDataService dataService,
        IScriptExecutionService executor,
        IScriptExtractionService extractor,
        IScriptFilterService filterService,
        ISystemInfoService systemInfoService,
        ILogger<MainViewModel> logger)
    {
        _dataService = dataService;
        _executor = executor;
        _extractor = extractor;
        _filterService = filterService;
        _systemInfoService = systemInfoService;
        _logger = logger;
        _executor.OnLog += OnScriptLog;
        LoadData();
    }

    public void LoadData()
    {
        _data = _dataService.Carregar();

        var scripts = new List<Models.ScriptModel>();

        foreach (var entry in ScriptRegistry.Entries)
        {
            var caminho = Path.Combine(Path.GetTempPath(), "FMOptimize", entry.CaminhoRelativo);
            scripts.Add(new Models.ScriptModel
            {
                Nome = entry.Nome,
                Descricao = entry.Descricao,
                Explicacao = entry.Explicacao,
                Categoria = entry.Categoria,
                Tipo = entry.Tipo,
                Caminho = caminho,
                IsEmbedded = true,
                Admin = entry.Admin,
                IsFavorito = _data.Favoritos.Contains(entry.Nome),
            });
        }

        foreach (var sd in _data.Scripts)
        {
            scripts.Add(new Models.ScriptModel
            {
                Id = sd.Id,
                Nome = sd.Nome,
                Descricao = sd.Descricao,
                Categoria = sd.Categoria,
                Tipo = sd.Tipo,
                Caminho = sd.Caminho,
                IsEmbedded = false,
                Admin = false,
                IsFavorito = _data.Favoritos.Contains(sd.Nome),
            });
        }

        AllScripts = new ObservableCollection<Models.ScriptModel>(scripts);
        ApplyFilter();
        _extractor.ExtrairScripts(AllScripts);
        foreach (var sd in _data.Scripts)
            _extractor.ExtrairScriptUsuario(sd);
    }

    partial void OnCurrentSectionChanged(string value)
    {
        IsDashboard = value == "Dashboard";
        OnPropertyChanged(nameof(IsTweaks));
        OnPropertyChanged(nameof(IsUtilities));
        OnPropertyChanged(nameof(IsCleaner));
        OnPropertyChanged(nameof(IsRestorePoints));
        OnPropertyChanged(nameof(IsDnsManager));
        OnPropertyChanged(nameof(IsApps));
        OnPropertyChanged(nameof(IsSettings));
        ApplyFilter();
        if (value == "RestorePoints")
        {
            _ = LoadRestoresAsync();
        }
    }

    [RelayCommand]
    private void NavigateToDashboard()
    {
        if (CurrentSection != "Dashboard")
            CurrentSection = "Dashboard";
        if (DashboardData == null)
        {
            _ = LoadDashboardAsync();
        }
    }

    [RelayCommand]
    private void NavigateToTweaks() => CurrentSection = "Tweaks";
    [RelayCommand]
    private void NavigateToUtilities() => CurrentSection = "Utilities";
    [RelayCommand]
    private void NavigateToCleaner() => CurrentSection = "Cleaner";
    [RelayCommand]
    private void NavigateToRestorePoints() => CurrentSection = "RestorePoints";
    [RelayCommand]
    private void NavigateToDnsManager() => CurrentSection = "DNS Manager";
    [RelayCommand]
    private void NavigateToApps() => CurrentSection = "Apps";
    [RelayCommand]
    private void NavigateToSettings() => CurrentSection = "Settings";

    [RelayCommand]
    private void ViewRestores() => NavigateToRestorePoints();

    [RelayCommand]
    private async Task CreateBackup()
    {
        IsLoading = true;
        try
        {
            var result = await _systemInfoService.CreateRestorePointAsync("FM Optimize - Backup manual");
            var icon = result.Success ? "✓" : "✗";
            Log($"{icon} {result.Message}", result.Success ? LogLevel.End : LogLevel.Error);
            _ = MessageBox.Show(result.Message, result.Success ? "Backup concluído" : "Falha no backup",
                MessageBoxButton.OK, result.Success ? MessageBoxImage.Information : MessageBoxImage.Warning);
            if (result.Success)
                _ = LoadRestoresAsync();
        }
        catch (Exception ex)
        {
            Log($"Erro ao criar backup: {ex.Message}", LogLevel.Error);
            _ = MessageBox.Show($"Erro: {ex.Message}", "Erro", MessageBoxButton.OK, MessageBoxImage.Error);
        }
        finally
        {
            IsLoading = false;
        }
    }

    private async Task LoadRestoresAsync()
    {
        IsOperatingRestore = true;
        RestoreStatusMessage = "Carregando pontos de restauração...";
        RestoreStatusError = false;

        List<RestorePointEntry> entries = [];
        for (var attempt = 0; attempt < 2; attempt++)
        {
            try
            {
                entries = await _systemInfoService.GetRestorePointsAsync();
                if (entries.Count > 0)
                    break;
                if (attempt == 0)
                    await Task.Delay(1000);
            }
            catch (Exception ex)
            {
                Log($"Erro ao listar restores: {ex.Message}", LogLevel.Error);
                if (attempt == 0)
                    await Task.Delay(1000);
            }
        }

        var dedup = entries
            .GroupBy(e => e.SequenceNumber)
            .Select(g => g.First())
            .ToList();

        if (dedup.Count != entries.Count)
            Log($"Removidas {entries.Count - dedup.Count} entrada(s) duplicada(s) da listagem.", LogLevel.Warn);

        Application.Current.Dispatcher.Invoke(() =>
        {
            RestorePoints = new ObservableCollection<RestorePointEntry>(dedup);
        });

        if (dedup.Count == 0)
        {
            RestoreStatusMessage = "Nenhum ponto de restauração encontrado. Verifique se a Proteção do Sistema está ativada.";
            RestoreStatusError = true;
        }
        else
        {
            RestoreStatusMessage = "";
            RestoreStatusError = false;
        }

        IsOperatingRestore = false;
    }

    [RelayCommand]
    private async Task RestoreRestorePoint()
    {
        if (SelectedRestorePoint == null || IsOperatingRestore) return;
        var rp = SelectedRestorePoint;
        var confirm = MessageBox.Show(
            $"Tem certeza que deseja restaurar o ponto:\n\n{rp.Descricao}\n{rp.DataCriacao}\n\n" +
            "O sistema será reiniciado para concluir a restauração. Salve seu trabalho antes de continuar.",
            "Confirmar Restauração",
            MessageBoxButton.YesNo,
            MessageBoxImage.Warning);
        if (confirm != MessageBoxResult.Yes) return;
        IsOperatingRestore = true;
        try
        {
            var result = await _systemInfoService.RestoreSystemAsync(rp.SequenceNumber);
            RestoreStatusMessage = result.Message;
            RestoreStatusError = !result.Success;
        }
        catch (Exception ex)
        {
            RestoreStatusMessage = $"Erro: {ex.Message}";
            RestoreStatusError = true;
        }
        finally
        {
            IsOperatingRestore = false;
        }
    }

    [RelayCommand]
    private async Task DeleteRestorePoint()
    {
        if (SelectedRestorePoint == null || IsOperatingRestore) return;
        var rp = SelectedRestorePoint;
        var confirm = MessageBox.Show(
            $"Excluir o ponto de restauração:\n\n{rp.Descricao}\n{rp.DataCriacao}?",
            "Confirmar Exclusão",
            MessageBoxButton.YesNo,
            MessageBoxImage.Question);
        if (confirm != MessageBoxResult.Yes) return;
        IsOperatingRestore = true;
        try
        {
            var result = await _systemInfoService.DeleteRestorePointAsync(rp.SequenceNumber);
            if (result.Success)
            {
                SelectedRestorePoint = null;
                await LoadRestoresAsync();
            }
            RestoreStatusMessage = result.Message;
            RestoreStatusError = !result.Success;
        }
        catch (Exception ex)
        {
            RestoreStatusMessage = $"Erro: {ex.Message}";
            RestoreStatusError = true;
        }
        finally
        {
            IsOperatingRestore = false;
        }
    }

    private async Task LoadDashboardAsync()
    {
        IsLoading = true;
        try
        {
            DashboardData = await _systemInfoService.GetSystemInfoAsync();
        }
        finally
        {
            IsLoading = false;
        }
    }

    [RelayCommand]
    private void ToggleFavorito(Models.ScriptModel script)
    {
        script.IsFavorito = !script.IsFavorito;
        if (script.IsFavorito)
            _data.Favoritos.Add(script.Nome);
        else
            _data.Favoritos.Remove(script.Nome);
        _dataService.Salvar(_data);
        ApplyFilter();
    }

    [RelayCommand]
    private void CancelScript(Models.ScriptModel? script)
    {
        if (script == null || !script.IsExecuting) return;
        _executor.Cancel(script);
        script.IsExecuting = false;
    }

    [RelayCommand]
    private async Task ExecuteScript(Models.ScriptModel? script)
    {
        if (script == null || script.IsExecuting) return;
        script.IsExecuting = true;
        try
        {
            if (script.Admin && !IsAdministrator())
                Log(LogMessages.AdminWarning(script.Nome), LogLevel.Warn);
            await _executor.ExecuteAsync(script);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro inesperado ao executar script {ScriptName}", script.Nome);
            Log(LogMessages.ExecutionError(script.Nome, ex.Message), LogLevel.Error);
        }
        finally
        {
            Application.Current.Dispatcher.Invoke(() =>
            {
                script.IsExecuting = false;
                Log($"✓ Script '{script.Nome}' finalizado. Botão reabilitado.", LogLevel.End);
            });
        }
    }

    [RelayCommand]
    private void ShowDetails(Models.ScriptModel script)
    {
        OnShowDetails?.Invoke(script);
    }

    [RelayCommand]
    private void OpenEditDialog(Models.ScriptModel script)
    {
        OnEditScript?.Invoke(script);
    }

    [RelayCommand]
    private void RemoveScript(Models.ScriptModel script)
    {
        var toRemove = _data.Scripts.FirstOrDefault(s => s.Id == script.Id);
        if (toRemove != null)
        {
            _data.Scripts.Remove(toRemove);
            _dataService.Salvar(_data);
            AllScripts.Remove(script);
            ApplyFilter();
            if (toRemove.Conteudo != null && File.Exists(script.Caminho))
                File.Delete(script.Caminho);
        }
    }

    [RelayCommand]
    private void AddScript()
    {
        OnAddScript?.Invoke();
    }

    [RelayCommand]
    private void ToggleTheme()
    {
        Log("Toggle Theme - coming soon", LogLevel.Info);
    }

    [RelayCommand]
    private void CopyLog()
    {
        var text = string.Join(Environment.NewLine,
            LogEntries.Select(e => $"[{e.Timestamp}] {e.Message}"));
        if (!string.IsNullOrEmpty(text))
        {
            try { Clipboard.SetText(text); }
            catch { }
        }
    }

    [RelayCommand]
    private void ClearLog()
    {
        LogEntries.Clear();
    }

    [RelayCommand]
    private void ToggleLog()
    {
        LogExpanded = !LogExpanded;
    }

    public event Action<Models.ScriptModel>? OnShowDetails;
    public event Action<Models.ScriptModel>? OnEditScript;
    public event Action? OnAddScript;

    private void ApplyFilter()
    {
        if (CurrentSection is "Dashboard" or "RestorePoints" or "Settings")
        {
            FilteredScripts = [];
            return;
        }
        FilteredScripts = new ObservableCollection<Models.ScriptModel>(
            _filterService.ApplyFilter(AllScripts, SearchText, CurrentSection));
    }

    private async void DebouncedSearch()
    {
        _searchCts?.Cancel();
        _searchCts?.Dispose();
        _searchCts = new CancellationTokenSource();
        try
        {
            await Task.Delay(150, _searchCts.Token);
            ApplyFilter();
        }
        catch (OperationCanceledException) { }
    }

    private void OnScriptLog(string msg, LogLevel level)
    {
        Application.Current.Dispatcher.Invoke(() =>
        {
            LogEntries.Add(new Models.LogEntry
            {
                Message = msg,
                Level = level,
                Timestamp = System.DateTime.Now.ToString(Strings.TimestampFormat)
            });
            if (LogEntries.Count > 500)
                LogEntries.RemoveAt(0);
        });
    }

    private void Log(string msg, LogLevel level) => OnScriptLog(msg, level);

    private static bool IsAdministrator() => SecurityHelper.IsAdministrator();
}
