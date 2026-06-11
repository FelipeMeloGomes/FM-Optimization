using System.Diagnostics;
using System.IO;
using FMOptimization.Models;

namespace FMOptimization.Services;

public class ScriptExecutionService
{
    public event Action<string, LogLevel>? OnLog;

    public async Task ExecuteAsync(ScriptModel script)
    {
        var caminho = script.Caminho;
        var nome = script.Nome;
        var tipo = script.Tipo;

        if (!File.Exists(caminho))
        {
            Log($"Erro: Arquivo não encontrado: {caminho}", LogLevel.Error);
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
                Log($"Erro ao abrir {nome}: {ex.Message}", LogLevel.Error);
            }
            return;
        }

        if (script.Admin && !IsAdministrator())
        {
            Log($"Execução cancelada: {nome} (requer admin)", LogLevel.Warn);
            return;
        }

        Log($"Executando: {nome}", LogLevel.Start);

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

            var process = new Process { StartInfo = psi };
            process.Start();

            var outputTask = ReadStreamAsync(process.StandardOutput);
            var errorTask = ReadStreamAsync(process.StandardError);

            await Task.WhenAll(outputTask, errorTask);
            process.WaitForExit();

            Log($"Finalizado: {nome} (código: {process.ExitCode})", LogLevel.End);
        }
        catch (Exception ex)
        {
            Log($"Erro ao executar {nome}: {ex.Message}", LogLevel.Error);
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

    private static bool IsAdministrator()
    {
        using var identity = System.Security.Principal.WindowsIdentity.GetCurrent();
        var principal = new System.Security.Principal.WindowsPrincipal(identity);
        return principal.IsInRole(System.Security.Principal.WindowsBuiltInRole.Administrator);
    }
}

public enum LogLevel
{
    Info,
    Start,
    End,
    Error,
    Warn
}
