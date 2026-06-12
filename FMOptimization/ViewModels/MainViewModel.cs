using System.Collections.ObjectModel;
using System.IO;
using System.Globalization;
using System.Windows.Data;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using FMOptimization.Models;
using FMOptimization.Services;

namespace FMOptimization.ViewModels;

public partial class MainViewModel : ObservableObject
{
    private readonly ScriptExecutionService _executor = new();
    private AppData _data = new();
    private string _searchText = "";
    private CancellationTokenSource? _searchCts;

    [ObservableProperty]
    private string selectedCategory = "Todas";

    [ObservableProperty]
    private ObservableCollection<ScriptModel> allScripts = [];

    [ObservableProperty]
    private ObservableCollection<ScriptModel> filteredScripts = [];

    [ObservableProperty]
    private ObservableCollection<CategoryItem> categories = [];

    [ObservableProperty]
    private ObservableCollection<LogEntry> logEntries = [];

    [ObservableProperty]
    private bool logExpanded = true;

    [ObservableProperty]
    private bool isLoading;

    public string SearchText
    {
        get => _searchText;
        set
        {
            if (SetProperty(ref _searchText, value))
                DebouncedSearch();
        }
    }

    public MainViewModel()
    {
        _executor.OnLog += OnScriptLog;
        LoadData();
    }

    public void LoadData()
    {
        _data = DataService.Carregar();

        var allCats = new List<string> { "Todas", "Favoritos" };
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

        if (!_data.Categorias.Contains("Limpeza"))
        {
            var cats = new HashSet<string>(_data.Categorias);
            foreach (var s in ScriptRegistry.Entries)
                cats.Add(s.Categoria);
            _data.Categorias = [.. cats];
            DataService.Salvar(_data);
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
        catch { }
    }

    partial void OnSelectedCategoryChanged(string value)
    {
        UpdateCategoryActive();
    }

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
        var allCats = new List<string> { "Todas", "Favoritos" };
        allCats.AddRange(_data.Categorias);
        Categories = new ObservableCollection<CategoryItem>(
            allCats.Select(c => new CategoryItem { Name = c, Icon = GetCatIcon(c) }));
        UpdateCategoryActive();
    }

    [RelayCommand]
    private void ToggleFavorito(ScriptModel script)
    {
        script.IsFavorito = !script.IsFavorito;
        if (script.IsFavorito)
            _data.Favoritos.Add(script.Nome);
        else
            _data.Favoritos.Remove(script.Nome);

        DataService.Salvar(_data);
    }

    [RelayCommand]
    private async Task ExecuteScript(ScriptModel? script)
    {
        if (script == null) return;

        if (script.Admin && !IsAdministrator())
        {
            // Ask user to continue - for now log warning
            Log($"AVISO: \"{script.Nome}\" requer administrador", LogLevel.Warn);
        }

        await _executor.ExecuteAsync(script);
    }

    [RelayCommand]
    private void ShowDetails(ScriptModel script)
    {
        // Will be handled by view via event
        OnShowDetails?.Invoke(script);
    }

    [RelayCommand]
    private void OpenEditDialog(ScriptModel script)
    {
        OnEditScript?.Invoke(script);
    }

    [RelayCommand]
    private void RemoveScript(ScriptModel script)
    {
        var toRemove = _data.Scripts.FirstOrDefault(s => s.Nome == script.Nome);
        if (toRemove != null)
        {
            _data.Scripts.Remove(toRemove);
            DataService.Salvar(_data);
            AllScripts.Remove(script);
            ApplyFilter();
        }
    }

    [RelayCommand]
    private void AddScript()
    {
        OnAddScript?.Invoke();
    }

    [RelayCommand]
    private void ManageCategories()
    {
        OnManageCategories?.Invoke();
    }

    [RelayCommand]
    private void CopyLog()
    {
        var text = string.Join("\n", LogEntries.Select(e => e.Message));
        if (!string.IsNullOrWhiteSpace(text))
            System.Windows.Clipboard.SetText(text);
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

    public event Action<ScriptModel>? OnShowDetails;
    public event Action<ScriptModel>? OnEditScript;
    public event Action? OnAddScript;
    public event Action? OnManageCategories;

    private void ApplyFilter()
    {
        var busca = SearchText?.Trim().ToLower() ?? "";
        IEnumerable<ScriptModel> source = AllScripts;

        if (SelectedCategory == "Favoritos")
            source = source.Where(s => s.IsFavorito);
        else if (SelectedCategory != "Todas")
            source = source.Where(s => s.Categoria == SelectedCategory);

        if (!string.IsNullOrEmpty(busca))
            source = source.Where(s =>
                s.Nome.ToLower().Contains(busca) ||
                s.Descricao.ToLower().Contains(busca));

        FilteredScripts = new ObservableCollection<ScriptModel>(source);
    }

    private void DebouncedSearch()
    {
        _searchCts?.Cancel();
        _searchCts = new CancellationTokenSource();
        var token = _searchCts.Token;

        Task.Delay(150, token).ContinueWith(_ =>
        {
            if (!token.IsCancellationRequested)
            {
                System.Windows.Application.Current.Dispatcher.Invoke(ApplyFilter);
            }
        }, token);
    }

    private void OnScriptLog(string msg, LogLevel level)
    {
        System.Windows.Application.Current.Dispatcher.Invoke(() =>
        {
            LogEntries.Add(new LogEntry
            {
                Message = msg,
                Level = level,
                Timestamp = DateTime.Now.ToString("HH:mm:ss")
            });

            if (LogEntries.Count > 500)
                LogEntries.RemoveAt(0);
        });
    }

    private void Log(string msg, LogLevel level)
    {
        OnScriptLog(msg, level);
    }

    private static bool IsAdministrator()
    {
        using var identity = System.Security.Principal.WindowsIdentity.GetCurrent();
        var principal = new System.Security.Principal.WindowsPrincipal(identity);
        return principal.IsInRole(System.Security.Principal.WindowsBuiltInRole.Administrator);
    }

    private static string GetCatIcon(string cat) => cat switch
    {
        "Todas" => "◉",
        "Limpeza" => "◎",
        "Desempenho" => "⚡",
        "Energia" => "🔋",
        "Privacidade" => "🛡",
        "Rede" => "🌐",
        "Sistema" => "💻",
        "GPU - AMD" => "🧠",
        "GPU - NVIDIA" => "🧠",
        "Windows 11" => "🪟",
        "Favoritos" => "★",
        _ => "●",
    };
}

public class CategoryItem : CommunityToolkit.Mvvm.ComponentModel.ObservableObject
{
    public string Name { get; set; } = "";
    public string Icon { get; set; } = "●";

    private bool _isActive;
    public bool IsActive
    {
        get => _isActive;
        set => SetProperty(ref _isActive, value);
    }
}

public class LogEntry
{
    public string Message { get; set; } = "";
    public LogLevel Level { get; set; }
    public string Timestamp { get; set; } = "";
}

public class IndexToDelayConverter : IValueConverter
{
    public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        if (value is int index)
            return TimeSpan.FromSeconds(index * 0.04);
        return TimeSpan.Zero;
    }

    public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
        => throw new NotImplementedException();
}
