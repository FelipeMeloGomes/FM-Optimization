namespace FMOptimize.Models;

public record CpuInfo(
    string Nome,
    int CoresFisicas,
    int CoresLogicas,
    string Frequencia,
    string Socket,
    string Cache);

public record GpuInfo(
    string Nome,
    string Vram,
    string DriverVersao,
    string Resolucao,
    string RefreshRate);

public record MemoryInfo(
    string Total,
    string TipoMemoria);

public record SystemInfoBasic(
    string VersaoWindows,
    string Build,
    string Edicao,
    string NomePC,
    string NomeUsuario,
    string Uptime);

public record StorageDrive(
    string Letra,
    string Rotulo,
    string Total,
    string Usado,
    string Livre,
    double PercentualUso,
    string Formato,
    string Tipo);

public record TweakInfo(
    string Nome,
    bool Ativo);

public record RestorePointEntry(
    [property: System.Text.Json.Serialization.JsonPropertyName("Description")]
    string Descricao,
    [property: System.Text.Json.Serialization.JsonPropertyName("CreationTime")]
    string DataCriacao,
    [property: System.Text.Json.Serialization.JsonPropertyName("SequenceNumber")]
    int SequenceNumber,
    [property: System.Text.Json.Serialization.JsonPropertyName("RestorePointType")]
    string Tipo);

public class DashboardData
{
    public CpuInfo? Cpu { get; init; }
    public GpuInfo? Gpu { get; init; }
    public MemoryInfo? Memory { get; init; }
    public SystemInfoBasic? System { get; init; }
    public string PrimaryDisk { get; init; } = "";
    public string PrimaryDiskTotal { get; init; } = "";
}
