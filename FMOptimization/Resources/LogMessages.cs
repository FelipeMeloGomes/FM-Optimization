using System.Resources;

namespace FMOptimization.Resources;

public static class LogMessages
{
    private static readonly ResourceManager _rm = new("FMOptimization.Resources.LogMessages", typeof(LogMessages).Assembly);

    public static string FileNotFound(string path) => string.Format(_rm.GetString("FileNotFound") ?? "", path);
    public static string OpenError(string name, string message) => string.Format(_rm.GetString("OpenError") ?? "", name, message);
    public static string ExecutionCanceledAdmin(string name) => string.Format(_rm.GetString("ExecutionCanceledAdmin") ?? "", name);
    public static string ScriptRunning(string name) => string.Format(_rm.GetString("ScriptRunning") ?? "", name);
    public static string ScriptFinished(string name, int exitCode) => string.Format(_rm.GetString("ScriptFinished") ?? "", name, exitCode);
    public static string ExecutionError(string name, string message) => string.Format(_rm.GetString("ExecutionError") ?? "", name, message);
    public static string AdminWarning(string name) => string.Format(_rm.GetString("AdminWarning") ?? "", name);
    public static string ExtractError(string name, string message) => string.Format(_rm.GetString("ExtractError") ?? "", name, message);
    public static string LoadError(string message) => string.Format(_rm.GetString("LoadError") ?? "", message);
    public static string SaveError(string message) => string.Format(_rm.GetString("SaveError") ?? "", message);
}
