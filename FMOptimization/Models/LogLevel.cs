namespace FMOptimization.Models;

/// <summary>Defines the severity levels for log messages.</summary>
public enum LogLevel
{
    /// <summary>Informational message.</summary>
    Info,

    /// <summary>Indicates the start of a script execution.</summary>
    Start,

    /// <summary>Indicates the end of a script execution.</summary>
    End,

    /// <summary>An error occurred during execution.</summary>
    Error,

    /// <summary>A warning or non-critical issue.</summary>
    Warn
}
