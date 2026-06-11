using System.Text.Json.Serialization;
using System.Windows.Media;
using CommunityToolkit.Mvvm.ComponentModel;

namespace FMOptimization.Models;

public partial class ScriptModel : ObservableObject
{
    [ObservableProperty]
    private string nome = "";

    [ObservableProperty]
    private string descricao = "";

    [ObservableProperty]
    private string categoria = "";

    [ObservableProperty]
    private string tipo = "";

    [ObservableProperty]
    private string caminho = "";

    [ObservableProperty]
    private bool isEmbedded;

    [ObservableProperty]
    private bool admin;

    public string Explicacao { get; set; } = "";

    public bool IsFavorito { get; set; }

    [JsonIgnore]
    public string TipoUpper => Tipo.TrimStart('.').ToUpper();

    public string TipoLabel => (!string.IsNullOrEmpty(Tipo) ? Tipo.TrimStart('.').ToUpper() : "");

    [JsonIgnore]
    public SolidColorBrush AccentColor => Tipo switch
    {
        ".bat" or ".cmd" => new SolidColorBrush(Color.FromRgb(0, 230, 118)),
        ".ps1" => new SolidColorBrush(Color.FromRgb(0, 229, 255)),
        ".exe" or ".reg" => new SolidColorBrush(Color.FromRgb(255, 140, 0)),
        _ => new SolidColorBrush(Color.FromRgb(138, 143, 163)),
    };
}

public class AppData
{
    public List<string> Categorias { get; set; } = [];
    public List<string> Favoritos { get; set; } = [];
    public List<ScriptData> Scripts { get; set; } = [];
}

public class ScriptData
{
    public string Nome { get; set; } = "";
    public string Descricao { get; set; } = "";
    public string Categoria { get; set; } = "";
    public string Caminho { get; set; } = "";
    public string Tipo { get; set; } = "";
}
