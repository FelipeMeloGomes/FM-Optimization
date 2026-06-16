using FMOptimization.Models;

namespace FMOptimization.Services;

public interface IScriptFilterService
{
    IEnumerable<ScriptModel> ApplyFilter(IEnumerable<ScriptModel> source, string searchText, string selectedCategory);
}
