using FMOptimization.Models;

namespace FMOptimization.Services;

/// <summary>Defines a service for executing scripts and logging execution output.</summary>
public interface IScriptExecutionService
{
    /// <summary>Raised when a log message is produced during script execution.</summary>
    event Action<string, LogLevel>? OnLog;

    /// <summary>Executes the specified script asynchronously.</summary>
    /// <param name="script">The <see cref="ScriptModel"/> containing script metadata and path.</param>
    /// <returns>A task that represents the asynchronous execution.</returns>
    Task ExecuteAsync(ScriptModel script);
}
