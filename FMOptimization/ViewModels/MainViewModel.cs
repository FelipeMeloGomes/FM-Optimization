using System.Collections.ObjectModel;
using System.IO;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using FMOptimization.Converters;
using FMOptimization.Helpers;
using FMOptimization.Models;
using FMOptimization.Resources;
using FMOptimization.Services;

namespace FMOptimization.ViewModels;

/// <summary>Main view model that manages script display, filtering, execution, and logging.</summary>
public partial class MainViewModel : ObservableObject
{
    private readonly IScriptExecutionService _executor;
    private readonly IDataService _dataService;
    private AppData _data = new();
    private string _searchText = "";
    private CancellationTokenSource? _searchCts;

    /// <summary>Gets or sets the currently selected category name used to filter scripts.</summary>
    [ObservableProperty]
    private string selectedCategory = Strings.CategoryAll;

    /// <summary>Gets or sets the complete list of all available scripts.</summary>
    [ObservableProperty]
    private ObservableCollection<ScriptModel> allScripts = [];

    /// <summary>Gets or sets the filtered subset of scripts displayed in the UI.</summary>
    [ObservableProperty]
    private ObservableCollection<ScriptModel> filteredScripts = [];

    /// <summary>Gets or sets the collection of category items shown in the filter bar.</summary>
    [ObservableProperty]
    private ObservableCollection<CategoryItem> categories = [];

    /// <summary>Gets or sets the collection of log entries displayed in the log panel.</summary>
    [ObservableProperty]
    private ObservableCollection<LogEntry> logEntries = [];

    /// <summary>Gets or sets whether the log panel is expanded or collapsed.</summary>
    [ObservableProperty]
    private bool logExpanded = true;

    /// <summary>Gets or sets whether the view model is currently loading data.</summary>
    [ObservableProperty]
    private bool isLoading;

    /// <summary>Gets or sets the search text used to filter scripts by name or description.</summary>
    public string SearchText
    {
        get => _searchText;
        set
        {
            if (SetProperty(ref _searchText, value))
                DebouncedSearch();
        }
    }

    /// <summary>Initializes a new instance of the <see cref="MainViewModel"/> class.</summary>
    /// <param name="dataService">The data service for loading and saving application data.</param>
    /// <param name="executor">The script execution service.</param>
    public MainViewModel(IDataService dataService, IScriptExecutionService executor)
    {
        _dataService = dataService;
        _executor = executor;
        _executor.OnLog += OnScriptLog;
        LoadData();
    }

    /// <summary>Loads scripts from embedded resources and user data, then applies filtering and category setup.</summary>
    public void LoadData()
    {
        _data = _dataService.Carregar();

        var allCats = new List<string> { Strings.CategoryAll, Strings.CategoryFavorites };
        allCats.AddRange(_data.Categorias);
        Categories = new ObservableCollection<CategoryItem>(
            allCats.Select(c => new CategoryItem { Name = c, Icon = GetCatIcon(c) }));
        UpdateCategoryActive();

        var scripts = new List<ScriptModel>();

        foreach (var entry in ScriptRegistry.Entries)
        {
            var caminho = Path.Combine(Path.GetTempPath(), "FMOptimization", entry.CaminhoRelativo);
            scripts.Add(new ScriptModel
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
            scripts.Add(new ScriptModel
            {
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

        AllScripts = new ObservableCollection<ScriptModel>(scripts);
        ApplyFilter();

        if (!_data.Categorias.Contains(Strings.CategoryLimpeza))
        {
            var cats = new HashSet<string>(_data.Categorias);
            foreach (var s in ScriptRegistry.Entries)
                cats.Add(s.Categoria);
            _data.Categorias = [.. cats];
            _dataService.Salvar(_data);
        }

        RefreshCategories();

        foreach (var script in AllScripts)
        {
            if (script.IsEmbedded)
                ExtrairScript(script);
        }
    }

    private static void ExtrairScript(ScriptModel script)
    {
        try
        {
            var entry = ScriptRegistry.Entries.FirstOrDefault(e => e.Nome == script.Nome);
            if (entry == null) return;

            var dst = script.Caminho;
            var dir = Path.GetDirectoryName(dst);
            if (dir != null) Directory.CreateDirectory(dir);

            if (!File.Exists(dst))
            {
                var data = Convert.FromBase64String(entry.ConteudoB64);
                File.WriteAllBytes(dst, data);
            }
        }
        catch (Exception ex)
        {
            System.Diagnostics.Debug.WriteLine(
                $"[ExtrairScript] Erro ao extrair '{script.Nome}': {ex.Message}");
        }
    }

    /// <summary>Called when <see cref="SelectedCategory"/> changes; updates the active state on category items.</summary>
    /// <param name="value">The new selected category name.</param>
    partial void OnSelectedCategoryChanged(string value)
    {
        UpdateCategoryActive();
    }

    /// <summary>Selects a category and re-applies the script filter.</summary>
    /// <param name="category">The category name to select.</param>
    [RelayCommand]
    private void SelectCategory(string category)
    {
        if (SelectedCategory == category) return;
        SelectedCategory = category;
        ApplyFilter();
    }

    private void UpdateCategoryActive()
    {
        foreach (var cat in Categories)
            cat.IsActive = cat.Name == SelectedCategory;
    }

    private void RefreshCategories()
    {
        var allCats = new List<string> { Strings.CategoryAll, Strings.CategoryFavorites };
        allCats.AddRange(_data.Categorias);
        Categories = new ObservableCollection<CategoryItem>(
            allCats.Select(c => new CategoryItem { Name = c, Icon = GetCatIcon(c) }));
        UpdateCategoryActive();
    }

    /// <summary>Toggles the favorite status of the specified script and persists the change.</summary>
    /// <param name="script">The script to toggle as favorite.</param>
    [RelayCommand]
    private void ToggleFavorito(ScriptModel script)
    {
        script.IsFavorito = !script.IsFavorito;
        if (script.IsFavorito)
            _data.Favoritos.Add(script.Nome);
        else
            _data.Favoritos.Remove(script.Nome);

        _dataService.Salvar(_data);
    }

    /// <summary>Executes the specified script via the script execution service.</summary>
    /// <param name="script">The script to execute, or <see langword="null"/>.</param>
    [RelayCommand]
    private async Task ExecuteScript(ScriptModel? script)
    {
        if (script == null) return;

        if (script.Admin && !IsAdministrator())
        {
            // Ask user to continue - for now log warning
            Log(LogMessages.AdminWarning(script.Nome), LogLevel.Warn);
        }

        await _executor.ExecuteAsync(script);
    }

    /// <summary>Invokes the <see cref="OnShowDetails"/> event to display script details.</summary>
    /// <param name="script">The script whose details to show.</param>
    [RelayCommand]
    private void ShowDetails(ScriptModel script)
    {
        // Will be handled by view via event
        OnShowDetails?.Invoke(script);
    }

    /// <summary>Invokes the <see cref="OnEditScript"/> event to open the edit dialog for the specified script.</summary>
    /// <param name="script">The script to edit.</param>
    [RelayCommand]
    private void OpenEditDialog(ScriptModel script)
    {
        OnEditScript?.Invoke(script);
    }

    /// <summary>Removes the specified script from the user data and updates the UI.</summary>
    /// <param name="script">The script to remove.</param>
    [RelayCommand]
    private void RemoveScript(ScriptModel script)
    {
        var toRemove = _data.Scripts.FirstOrDefault(s => s.Nome == script.Nome);
        if (toRemove != null)
        {
            _data.Scripts.Remove(toRemove);
            _dataService.Salvar(_data);
            AllScripts.Remove(script);
            ApplyFilter();
        }
    }

    /// <summary>Invokes the <see cref="OnAddScript"/> event to open the add-script dialog.</summary>
    [RelayCommand]
    private void AddScript()
    {
        OnAddScript?.Invoke();
    }

    /// <summary>Invokes the <see cref="OnManageCategories"/> event to open the category management dialog.</summary>
    [RelayCommand]
    private void ManageCategories()
    {
        OnManageCategories?.Invoke();
    }

    /// <summary>Copies all log messages to the system clipboard as a newline-separated string.</summary>
    [RelayCommand]
    private void CopyLog()
    {
        var text = string.Join("\n", LogEntries.Select(e => e.Message));
        if (!string.IsNullOrWhiteSpace(text))
            System.Windows.Clipboard.SetText(text);
    }

    /// <summary>Clears all entries from the log.</summary>
    [RelayCommand]
    private void ClearLog()
    {
        LogEntries.Clear();
    }

    /// <summary>Toggles the log panel between expanded and collapsed states.</summary>
    [RelayCommand]
    private void ToggleLog()
    {
        LogExpanded = !LogExpanded;
    }

    /// <summary>Raised when the view should display details for a script.</summary>
    public event Action<ScriptModel>? OnShowDetails;

    /// <summary>Raised when the view should open an edit dialog for a script.</summary>
    public event Action<ScriptModel>? OnEditScript;

    /// <summary>Raised when the view should open the add-script dialog.</summary>
    public event Action? OnAddScript;

    /// <summary>Raised when the view should open the category management dialog.</summary>
    public event Action? OnManageCategories;

    private void ApplyFilter()
    {
        var busca = SearchText?.Trim().ToLower() ?? "";
        IEnumerable<ScriptModel> source = AllScripts;

        if (SelectedCategory == Strings.CategoryFavorites)
            source = source.Where(s => s.IsFavorito);
        else if (SelectedCategory != Strings.CategoryAll)
            source = source.Where(s => s.Categoria == SelectedCategory);

        if (!string.IsNullOrEmpty(busca))
            source = source.Where(s =>
                s.Nome.ToLower().Contains(busca) ||
                s.Descricao.ToLower().Contains(busca));

        FilteredScripts = new ObservableCollection<ScriptModel>(source);
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
        catch (OperationCanceledException)
        {
            // Nova pesquisa cancelou a anterior — ignora
        }
    }

    private void OnScriptLog(string msg, LogLevel level)
    {
        System.Windows.Application.Current.Dispatcher.Invoke(() =>
        {
            LogEntries.Add(new LogEntry
            {
                Message = msg,
                Level = level,
                Timestamp = DateTime.Now.ToString(Strings.TimestampFormat)
            });

            if (LogEntries.Count > 500)
                LogEntries.RemoveAt(0);
        });
    }

    private void Log(string msg, LogLevel level)
    {
        OnScriptLog(msg, level);
    }

    private static bool IsAdministrator() => SecurityHelper.IsAdministrator();

    private static string GetCatIcon(string cat) => cat switch
    {
        "Todas" => Strings.IconAll,
        "Limpeza" => Strings.IconLimpeza,
        "Desempenho" => Strings.IconDesempenho,
        "Energia" => Strings.IconEnergia,
        "Privacidade" => Strings.IconPrivacidade,
        "Rede" => Strings.IconRede,
        "Sistema" => Strings.IconSistema,
        "GPU - AMD" or "GPU - NVIDIA" => Strings.IconGpu,
        "Windows 11" => Strings.IconWindows11,
        "Favoritos" => Strings.IconFavorites,
        _ => Strings.IconDefault,
    };
}
