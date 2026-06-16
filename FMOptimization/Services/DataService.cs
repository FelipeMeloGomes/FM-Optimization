using System.IO;
using System.Text.Json;
using FMOptimization.Models;
using FMOptimization.Resources;
using Microsoft.Extensions.Logging;

namespace FMOptimization.Services;

/// <summary>Loads and saves application data as JSON to a local file.</summary>
public class DataService : IDataService
{
    private readonly string _dataFile;
    private readonly ILogger<DataService> _logger;

    public DataService(ILogger<DataService> logger)
    {
        _logger = logger;
        _dataFile = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "scripts_data.json");
    }

    /// <summary>Loads <see cref="AppData"/> from the local JSON file, or returns a new instance if the file is missing or corrupt.</summary>
    /// <returns>The deserialized <see cref="AppData"/> or a new default instance.</returns>
    public AppData Carregar()
    {
        try
        {
            if (File.Exists(_dataFile))
            {
                var json = File.ReadAllText(_dataFile);
                var data = JsonSerializer.Deserialize<AppData>(json);
                if (data != null) return data;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Falha ao carregar dados de {Path}", _dataFile);
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
            File.WriteAllText(_dataFile, json);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Falha ao salvar dados em {Path}", _dataFile);
        }
    }
}
