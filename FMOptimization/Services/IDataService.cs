using FMOptimization.Models;

namespace FMOptimization.Services;

/// <summary>Provides data persistence operations for loading and saving application data.</summary>
public interface IDataService
{
    /// <summary>Loads application data from persistent storage.</summary>
    /// <returns>The deserialized <see cref="AppData"/> instance, or a new instance if no data exists.</returns>
    AppData Carregar();

    /// <summary>Saves the specified application data to persistent storage.</summary>
    /// <param name="data">The <see cref="AppData"/> to persist.</param>
    void Salvar(AppData data);
}
