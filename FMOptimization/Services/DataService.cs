using System.IO;
using System.Text.Json;
using FMOptimization.Models;

namespace FMOptimization.Services;

public static class DataService
{
    private static readonly string DataFile = Path.Combine(
        AppDomain.CurrentDomain.BaseDirectory, "scripts_data.json");

    public static AppData Carregar()
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
        catch { }
        return new AppData();
    }

    public static void Salvar(AppData data)
    {
        try
        {
            var json = JsonSerializer.Serialize(data, new JsonSerializerOptions
            {
                WriteIndented = true
            });
            File.WriteAllText(DataFile, json);
        }
        catch { }
    }
}
