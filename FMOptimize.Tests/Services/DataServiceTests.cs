using FMOptimize.Models;
using FMOptimize.Services;
using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;

namespace FMOptimize.Tests.Services;

[TestClass]
public class DataServiceTests
{
    private readonly Mock<ILogger<DataService>> _loggerMock = new();
    private readonly string _dataFilePath;

    public DataServiceTests()
    {
        _dataFilePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "scripts_data.json");
    }

    [TestCleanup]
    public void Cleanup()
    {
        if (File.Exists(_dataFilePath))
            File.Delete(_dataFilePath);
    }

    [TestMethod]
    public void Carregar_ArquivoInexistente_RetornaNovoAppData()
    {
        // Ensure file doesn't exist
        if (File.Exists(_dataFilePath))
            File.Delete(_dataFilePath);

        var service = new DataService(_loggerMock.Object);
        var result = service.Carregar();
        
        result.Should().NotBeNull();
        result.Categorias.Should().BeEmpty();
        result.Favoritos.Should().BeEmpty();
        result.Scripts.Should().BeEmpty();
    }

    [TestMethod]
    public void Salvar_NaoLancaExcecao()
    {
        var service = new DataService(_loggerMock.Object);
        var data = new AppData { Categorias = ["Teste"] };
        Action act = () => service.Salvar(data);
        act.Should().NotThrow();
    }

    [TestMethod]
    public void Salvar_Carregar_RoundTrip_MantemDados()
    {
        var service = new DataService(_loggerMock.Object);
        var original = new AppData
        {
            Categorias = ["Limpeza", "Desempenho"],
            Favoritos = ["Script1"],
            Scripts =
            [
                new ScriptData { Nome = "Meu Script", Descricao = "Teste", Categoria = "Limpeza", Caminho = "C:\\test.bat", Tipo = ".bat" }
            ]
        };

        // Save
        Action save = () => service.Salvar(original);
        save.Should().NotThrow();

        // Load and verify
        var loaded = service.Carregar();
        loaded.Should().NotBeNull();
        loaded.Categorias.Should().BeEquivalentTo(original.Categorias);
        loaded.Favoritos.Should().BeEquivalentTo(original.Favoritos);
        loaded.Scripts.Should().ContainSingle().Which.Nome.Should().Be("Meu Script");
    }
}
