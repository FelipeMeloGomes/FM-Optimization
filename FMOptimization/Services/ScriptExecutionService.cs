using System.ComponentModel;
using System.Diagnostics;
using System.IO;
using FMOptimization.Helpers;
using FMOptimization.Models;
using FMOptimization.Resources;

namespace FMOptimization.Services;

public class ScriptExecutionService : IScriptExecutionService
{
    public event Action<string, LogLevel>? OnLog;

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
            if (script.Admin)
            {
                await RunWithElevation(caminho, nome, tipo);
            }
            else
            {
                await RunNormal(caminho, nome, tipo);
            }
        }
        catch (Win32Exception ex) when (ex.NativeErrorCode == 5)
        {
            Log(LogMessages.ExecutionError(nome, "Acesso negado. Tente executar o programa como administrador."), LogLevel.Error);
        }
        catch (UnauthorizedAccessException ex)
        {
            Log(LogMessages.ExecutionError(nome, $"Permissão insuficiente: {ex.Message}"), LogLevel.Error);
        }
        catch (Exception ex)
        {
            Log(LogMessages.ExecutionError(nome, ex.Message), LogLevel.Error);
        }
    }

    private async Task RunWithElevation(string caminho, string nome, string tipo)
    {
        var psi = tipo switch
        {
            ".bat" or ".cmd" => new ProcessStartInfo("cmd.exe", $"/c \"{caminho}\""),
            ".ps1" => new ProcessStartInfo("powershell.exe",
                $"-ExecutionPolicy Bypass -File \"{caminho}\""),
            ".reg" => new ProcessStartInfo("regedit.exe", $"/s \"{caminho}\""),
            _ => new ProcessStartInfo(caminho),
        };

        psi.UseShellExecute = true;
        psi.Verb = "runas";
        psi.WindowStyle = ProcessWindowStyle.Hidden;
        psi.WorkingDirectory = Path.GetDirectoryName(caminho) ?? "";

        using var process = new Process { StartInfo = psi };
        process.Start();
        await process.WaitForExitAsync();

        Log(LogMessages.ScriptFinished(nome, process.ExitCode), LogLevel.End);
    }

    private async Task RunNormal(string caminho, string nome, string tipo)
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
        await process.WaitForExitAsync();

        Log(LogMessages.ScriptFinished(nome, process.ExitCode), LogLevel.End);
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
