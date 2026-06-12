using System.Diagnostics;
using System.IO;
using FMOptimization.Helpers;
using FMOptimization.Models;
using FMOptimization.Resources;

namespace FMOptimization.Services;

/// <summary>Executes scripts (bat, cmd, ps1, reg, or txt) by launching the appropriate process.</summary>
public class ScriptExecutionService : IScriptExecutionService
{
    /// <summary>Raised when a log message is produced during script execution.</summary>
    public event Action<string, LogLevel>? OnLog;

    /// <summary>Executes the specified script asynchronously, capturing output and handling admin elevation checks.</summary>
    /// <param name="script">The <see cref="ScriptModel"/> to execute.</param>
    /// <returns>A task that represents the asynchronous execution.</returns>
    public async Task ExecuteAsync(ScriptModel script)
    {
        var caminho = script.Caminho;
        var nome = script.Nome;
        var tipo = script.Tipo;

        if (!File.Exists(caminho))
        {
            Log(LogMessages.FileNotFound(caminho), LogLevel.Error);
            return;
        }

        if (tipo == ".txt")
        {
            try
            {
                Process.Start(new ProcessStartInfo
                {
                    FileName = caminho,
                    UseShellExecute = true
                });
            }
            catch (Exception ex)
            {
                Log(LogMessages.OpenError(nome, ex.Message), LogLevel.Error);
            }
            return;
        }

        if (script.Admin && !IsAdministrator())
        {
            Log(LogMessages.ExecutionCanceledAdmin(nome), LogLevel.Warn);
            return;
        }

        Log(LogMessages.ScriptRunning(nome), LogLevel.Start);

        try
        {
            var psi = tipo switch
            {
                ".bat" or ".cmd" => new ProcessStartInfo("cmd.exe", $"/c \"{caminho}\""),
                ".ps1" => new ProcessStartInfo("powershell.exe",
                    $"-ExecutionPolicy Bypass -File \"{caminho}\""),
                ".reg" => new ProcessStartInfo("regedit.exe", $"/s \"{caminho}\""),
                _ => new ProcessStartInfo(caminho),
            };

            psi.RedirectStandardOutput = true;
            psi.RedirectStandardError = true;
            psi.UseShellExecute = false;
            psi.CreateNoWindow = true;
            psi.WorkingDirectory = Path.GetDirectoryName(caminho) ?? "";

            using var process = new Process { StartInfo = psi };
            process.Start();

            var outputTask = ReadStreamAsync(process.StandardOutput);
            var errorTask = ReadStreamAsync(process.StandardError);

            await Task.WhenAll(outputTask, errorTask);
            process.WaitForExit();

            Log(LogMessages.ScriptFinished(nome, process.ExitCode), LogLevel.End);
        }
        catch (Exception ex)
        {
            Log(LogMessages.ExecutionError(nome, ex.Message), LogLevel.Error);
        }
    }

    private async Task ReadStreamAsync(StreamReader reader)
    {
        string? line;
        while ((line = await reader.ReadLineAsync()) != null)
        {
            if (!string.IsNullOrWhiteSpace(line))
                Log(line, LogLevel.Info);
        }
    }

    private void Log(string msg, LogLevel level)
    {
        OnLog?.Invoke(msg, level);
    }

    private static bool IsAdministrator() => SecurityHelper.IsAdministrator();
}
