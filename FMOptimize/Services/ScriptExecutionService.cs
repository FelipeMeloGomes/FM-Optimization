using System.Collections.Concurrent;
using System.ComponentModel;
using System.Diagnostics;
using System.IO;
using FMOptimize.Helpers;
using FMOptimize.Models;
using FMOptimize.Resources;
using Microsoft.Extensions.Logging;
using LogLevel = FMOptimize.Models.LogLevel;

namespace FMOptimize.Services;

public class ScriptExecutionService : IScriptExecutionService
{
    private readonly ConcurrentDictionary<string, Process> _runningProcesses = new(StringComparer.OrdinalIgnoreCase);
    private readonly ILogger<ScriptExecutionService> _logger;

    public ScriptExecutionService(ILogger<ScriptExecutionService> logger)
    {
        _logger = logger;
    }

    public event Action<string, LogLevel>? OnLog;

    public void Cancel(ScriptModel script)
    {
        if (_runningProcesses.TryRemove(script.Nome, out var process))
        {
            try
            {
                if (!process.HasExited)
                    process.Kill(entireProcessTree: true);
                Log(LogMessages.ScriptCancelled(script.Nome), LogLevel.Warn);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Erro ao cancelar script {ScriptName}", script.Nome);
            }
            finally
            {
                process.Dispose();
            }
        }
    }

    public async Task ExecuteAsync(ScriptModel script, CancellationToken cancellationToken = default)
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
            await RunProcess(caminho, nome, tipo, cancellationToken);
        }
        catch (Win32Exception ex) when (ex.NativeErrorCode == 5)
        {
            Log(LogMessages.ExecutionError(nome, "Acesso negado. Tente executar o programa como administrador."), LogLevel.Error);
            _logger.LogWarning(ex, "Script {ScriptName} falhou por acesso negado", nome);
        }
        catch (UnauthorizedAccessException ex)
        {
            Log(LogMessages.ExecutionError(nome, $"Permissão insuficiente: {ex.Message}"), LogLevel.Error);
            _logger.LogWarning(ex, "Script {ScriptName} falhou por permissao", nome);
        }
        catch (OperationCanceledException)
        {
            Log(LogMessages.ScriptCancelled(nome), LogLevel.Warn);
            _logger.LogInformation("Script {ScriptName} cancelado via CancellationToken", nome);
        }
        catch (Exception ex)
        {
            Log(LogMessages.ExecutionError(nome, ex.Message), LogLevel.Error);
            _logger.LogError(ex, "Erro ao executar script {ScriptName}", nome);
        }
    }

    private async Task RunProcess(string caminho, string nome, string tipo, CancellationToken ct)
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

        var process = new Process { StartInfo = psi };
        process.Start();
        _runningProcesses[nome] = process;

        using var registration = ct.Register(() =>
        {
            try
            {
                if (!process.HasExited)
                    process.Kill(entireProcessTree: true);
            }
            catch (Exception ex) when (ex is InvalidOperationException or Win32Exception)
            {
                _logger.LogWarning(ex, "Erro ao cancelar script {ScriptName} via CancellationToken (processo já finalizou?)", nome);
            }
        });

        try
        {
            var outputTask = ReadStreamAsync(process.StandardOutput, ct);
            var errorTask = ReadStreamAsync(process.StandardError, ct);

            await Task.WhenAll(outputTask, errorTask);
            await process.WaitForExitAsync(ct);

            Log(LogMessages.ScriptFinished(nome, process.ExitCode), LogLevel.End);
        }
        finally
        {
            _runningProcesses.TryRemove(nome, out _);
            process.Dispose();
        }
    }

    private async Task ReadStreamAsync(StreamReader reader, CancellationToken ct)
    {
        string? line;
        while ((line = await reader.ReadLineAsync(ct)) != null)
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
