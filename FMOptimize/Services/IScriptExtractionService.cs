using FMOptimize.Models;

namespace FMOptimize.Services;

public interface IScriptExtractionService
{
    void ExtrairScripts(IEnumerable<ScriptModel> scripts);
    void ExtrairScriptUsuario(ScriptData scriptData);
}
