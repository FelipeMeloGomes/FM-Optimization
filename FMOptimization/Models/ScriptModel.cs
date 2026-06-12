using System.Text.Json.Serialization;
using System.Windows.Media;
using CommunityToolkit.Mvvm.ComponentModel;

namespace FMOptimization.Models;

/// <summary>Represents a script with metadata, path, and visual presentation properties.</summary>
public partial class ScriptModel : ObservableObject
{
    /// <summary>Gets or sets the display name of the script.</summary>
    [ObservableProperty]
    private string nome = "";

    /// <summary>Gets or sets the description of what the script does.</summary>
    [ObservableProperty]
    private string descricao = "";

    /// <summary>Gets or sets the category the script belongs to.</summary>
    [ObservableProperty]
    private string categoria = "";

    /// <summary>Gets or sets the file extension type (e.g. ".bat", ".ps1", ".reg").</summary>
    [ObservableProperty]
    private string tipo = "";

    /// <summary>Gets or sets the full file path to the script.</summary>
    [ObservableProperty]
    private string caminho = "";

    /// <summary>Gets or sets whether the script is an embedded resource extracted at runtime.</summary>
    [ObservableProperty]
    private bool isEmbedded;

    /// <summary>Gets or sets whether the script requires administrator privileges.</summary>
    [ObservableProperty]
    private bool admin;

    /// <summary>Gets or sets an explanation of what the script does, shown in detail views.</summary>
    public string Explicacao { get; set; } = "";

    /// <summary>Gets or sets whether the script is marked as a favorite.</summary>
    [ObservableProperty]
    private bool isFavorito;

    /// <summary>Gets or sets whether the script is currently being executed.</summary>
    [ObservableProperty]
    private bool isExecuting;

    /// <summary>Gets the file extension in uppercase without the leading dot.</summary>
    [JsonIgnore]
    public string TipoUpper => Tipo.TrimStart('.').ToUpper();

    /// <summary>Gets the file extension label in uppercase (e.g. "BAT", "PS1"), or an empty string if not set.</summary>
    public string TipoLabel => (!string.IsNullOrEmpty(Tipo) ? Tipo.TrimStart('.').ToUpper() : "");

    /// <summary>Gets an accent color brush based on the script file type.</summary>
    [JsonIgnore]
    public SolidColorBrush AccentColor => Tipo switch
    {
        ".bat" or ".cmd" => new SolidColorBrush(Color.FromRgb(0, 230, 118)),
        ".ps1" => new SolidColorBrush(Color.FromRgb(0, 229, 255)),
        ".exe" or ".reg" => new SolidColorBrush(Color.FromRgb(255, 140, 0)),
        _ => new SolidColorBrush(Color.FromRgb(138, 143, 163)),
    };
}

/// <summary>Holds the persisted application state including categories, favorites, and user-defined scripts.</summary>
public class AppData
{
    /// <summary>Gets or sets the list of category names.</summary>
    public List<string> Categorias { get; set; } = [];

    /// <summary>Gets or sets the list of favorite script names.</summary>
    public List<string> Favoritos { get; set; } = [];

    /// <summary>Gets or sets the list of user-defined script data entries.</summary>
    public List<ScriptData> Scripts { get; set; } = [];
}

/// <summary>Represents a serializable script entry stored in application data.</summary>
public class ScriptData
{
    /// <summary>Gets or sets the script name.</summary>
    public string Nome { get; set; } = "";

    /// <summary>Gets or sets the script description.</summary>
    public string Descricao { get; set; } = "";

    /// <summary>Gets or sets the category the script belongs to.</summary>
    public string Categoria { get; set; } = "";

    /// <summary>Gets or sets the full file path to the script.</summary>
    public string Caminho { get; set; } = "";

    /// <summary>Gets or sets the file extension type.</summary>
    public string Tipo { get; set; } = "";
}
