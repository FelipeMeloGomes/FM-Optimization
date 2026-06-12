using System.Diagnostics;
using System.IO;
using System.Text.Json;
using FMOptimization.Models;
using FMOptimization.Resources;

namespace FMOptimization.Services;

/// <summary>Loads and saves application data as JSON to a local file.</summary>
public class DataService : IDataService
{
    private readonly string DataFile = Path.Combine(
        AppDomain.CurrentDomain.BaseDirectory, "scripts_data.json");

    /// <summary>Loads <see cref="AppData"/> from the local JSON file, or returns a new instance if the file is missing or corrupt.</summary>
    /// <returns>The deserialized <see cref="AppData"/> or a new default instance.</returns>
    public AppData Carregar()
    {
        try
        {
            if (File.Exists(DataFile))
            {
                var json = File.ReadAllText(DataFile);
                var data = JsonSerializer.Deserialize<AppData>(json);
                if (data != null) return data;
            }
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"[DataService.Carregar] {LogMessages.LoadError(ex.Message)}");
        }
        return new AppData();
    }

    /// <summary>Serializes the given <see cref="AppData"/> to JSON and writes it to the local file.</summary>
    /// <param name="data">The <see cref="AppData"/> to persist.</param>
    public void Salvar(AppData data)
    {
        try
        {
            var json = JsonSerializer.Serialize(data, new JsonSerializerOptions
            {
                WriteIndented = true
            });
            File.WriteAllText(DataFile, json);
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"[DataService.Salvar] {LogMessages.SaveError(ex.Message)}");
        }
    }
}
