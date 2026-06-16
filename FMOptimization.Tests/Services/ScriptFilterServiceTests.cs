using FMOptimization.Models;
using FMOptimization.Services;
using FluentAssertions;

namespace FMOptimization.Tests.Services;

[TestClass]
public class ScriptFilterServiceTests
{
    private readonly ScriptFilterService _sut = new();
    private readonly List<ScriptModel> _scripts;

    public ScriptFilterServiceTests()
    {
        _scripts =
        [
            new() { Nome = "Limpeza Temp", Descricao = "Remove temporarios", Categoria = "Limpeza", IsFavorito = false },
            new() { Nome = "Otimizar SSD", Descricao = "TRIM no SSD", Categoria = "Desempenho", IsFavorito = true },
            new() { Nome = "Desabilitar Telemetria", Descricao = "Bloqueia rastreamento", Categoria = "Privacidade", IsFavorito = false },
        ];
    }

    [TestMethod]
    public void ApplyFilter_CategoriaAll_RetornaTodos()
    {
        var result = _sut.ApplyFilter(_scripts, "", "Todas");
        result.Should().HaveCount(3);
    }

    [TestMethod]
    public void ApplyFilter_PorCategoria_RetornaCorrespondentes()
    {
        var result = _sut.ApplyFilter(_scripts, "", "Limpeza");
        result.Should().ContainSingle().Which.Nome.Should().Be("Limpeza Temp");
    }

    [TestMethod]
    public void ApplyFilter_Favoritos_RetornaApenasFavoritos()
    {
        var result = _sut.ApplyFilter(_scripts, "", "Favoritos");
        result.Should().ContainSingle().Which.Nome.Should().Be("Otimizar SSD");
    }

    [TestMethod]
    public void ApplyFilter_BuscaPorNome_RetornaCorrespondente()
    {
        var result = _sut.ApplyFilter(_scripts, "ssd", "Todas");
        result.Should().ContainSingle().Which.Nome.Should().Be("Otimizar SSD");
    }

    [TestMethod]
    public void ApplyFilter_BuscaPorDescricao_RetornaCorrespondente()
    {
        var result = _sut.ApplyFilter(_scripts, "rastreamento", "Todas");
        result.Should().ContainSingle().Which.Nome.Should().Be("Desabilitar Telemetria");
    }

    [TestMethod]
    public void ApplyFilter_SemResultado_RetornaVazio()
    {
        var result = _sut.ApplyFilter(_scripts, "zzzzzz", "Todas");
        result.Should().BeEmpty();
    }
}
