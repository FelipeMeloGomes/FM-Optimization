using FMOptimization.Models;

namespace FMOptimization.Services;

public interface IScriptExtractionService
{
    void ExtrairScripts(IEnumerable<ScriptModel> scripts);
    void ExtrairScriptUsuario(ScriptData scriptData);
}
