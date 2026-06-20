using FMOptimize.Models;
using FMOptimize.Resources;

namespace FMOptimize.Services;

public class ScriptFilterService : IScriptFilterService
{
    public IEnumerable<ScriptModel> ApplyFilter(
        IEnumerable<ScriptModel> source, string searchText, string selectedCategory)
    {
        if (selectedCategory == Strings.CategoryFavorites)
            source = source.Where(s => s.IsFavorito);
        else if (selectedCategory != Strings.CategoryAll)
            source = source.Where(s => s.Categoria == selectedCategory);

        var busca = searchText?.Trim().ToLower() ?? "";
        if (!string.IsNullOrEmpty(busca))
            source = source.Where(s =>
                s.Nome.ToLower().Contains(busca) ||
                s.Descricao.ToLower().Contains(busca));

        return source.OrderByDescending(s => s.IsFavorito);
    }
}
