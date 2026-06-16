using System.IO;
using System.Text;
using FMOptimization.Models;
using Microsoft.Extensions.Logging;

namespace FMOptimization.Services;

public class ScriptExtractionService : IScriptExtractionService
{
    private readonly ILogger<ScriptExtractionService> _logger;

    public ScriptExtractionService(ILogger<ScriptExtractionService> logger)
    {
        _logger = logger;
    }

    public void ExtrairScripts(IEnumerable<ScriptModel> scripts)
    {
        foreach (var script in scripts.Where(s => s.IsEmbedded))
        {
            try
            {
                var entry = ScriptRegistry.Entries.FirstOrDefault(e => e.Nome == script.Nome);
                if (entry == null) continue;

                var dst = script.Caminho;
                var dir = Path.GetDirectoryName(dst);
                if (dir != null) Directory.CreateDirectory(dir);

                var data = Convert.FromBase64String(entry.ConteudoB64);
                data = SanitizeScript(data);
                File.WriteAllBytes(dst, data);
                File.SetAttributes(dst, FileAttributes.Normal);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Erro ao extrair script '{ScriptName}'", script.Nome);
            }
        }
    }

    private static byte[] SanitizeScript(byte[] content)
    {
        var text = Encoding.UTF8.GetString(content);
        var lines = text.Split('\n')
            .Where(line =>
            {
                var trimmed = line.Trim().ToLowerInvariant();
                return trimmed != "pause" && trimmed != "pause >nul";
            });
        return Encoding.UTF8.GetBytes(string.Join("\n", lines));
    }

    public void ExtrairScriptUsuario(ScriptData sd)
    {
        if (string.IsNullOrEmpty(sd.Conteudo)) return;
        try
        {
            var dst = sd.Caminho;
            var dir = Path.GetDirectoryName(dst);
            if (dir != null) Directory.CreateDirectory(dir);
            if (!File.Exists(dst))
                File.WriteAllText(dst, sd.Conteudo);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Erro ao extrair script de usuario '{ScriptName}'", sd.Nome);
        }
    }
}
