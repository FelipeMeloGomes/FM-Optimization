using FMOptimize.Models;

namespace FMOptimize.Services;

public interface IScriptFilterService
{
    IEnumerable<ScriptModel> ApplyFilter(IEnumerable<ScriptModel> source, string searchText, string selectedCategory);
}
