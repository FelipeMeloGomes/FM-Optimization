namespace FMOptimization.Models;

/// <summary>Represents a single log entry with a message, severity level, and timestamp.</summary>
public class LogEntry
{
    /// <summary>Gets or sets the log message text.</summary>
    public string Message { get; set; } = "";

    /// <summary>Gets or sets the severity level of the log entry.</summary>
    public LogLevel Level { get; set; }

    /// <summary>Gets or sets the formatted timestamp of when the entry was created.</summary>
    public string Timestamp { get; set; } = "";
}
