using System.IO;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Media;
using FMOptimization.Models;

namespace FMOptimization;

public partial class DialogDetalhes : Window
{
    public DialogDetalhes(ScriptModel script)
    {
        InitializeComponent();
        LoadScript(script);
    }

    private void LoadScript(ScriptModel script)
    {
        TxtTitle.Text = script.Nome;

        TxtDescricao.Text = !string.IsNullOrEmpty(script.Explicacao)
            ? script.Explicacao
            : script.Descricao;

        AddBadge(script.TipoLabel, GetBrushForType(script.Tipo));
        AddBadge(script.Categoria, new SolidColorBrush(Color.FromRgb(0x6b, 0x71, 0x94)), false);
        if (script.Admin)
            AddBadge("REQUER ADMIN", new SolidColorBrush(Color.FromRgb(0xff, 0x8c, 0x00)));

        LoadScriptContent(script.Caminho);
    }

    private void AddBadge(string text, Brush brush, bool filled = true)
    {
        var border = new Border
        {
            Padding = new Thickness(10, 3, 10, 3),
            Margin = new Thickness(0, 0, 6, 4),
            CornerRadius = new CornerRadius(4),
            BorderThickness = new Thickness(filled ? 0 : 1),
            Background = filled ? brush : Brushes.Transparent,
            BorderBrush = filled ? Brushes.Transparent : brush,
        };

        var textBlock = new TextBlock
        {
            Text = text,
            FontSize = 10,
            FontWeight = FontWeights.Bold,
            Foreground = filled ? new SolidColorBrush(Color.FromRgb(0x07, 0x07, 0x1a)) : brush,
        };

        border.Child = textBlock;
        BadgesPanel.Children.Add(border);
    }

    private static Brush GetBrushForType(string tipo)
    {
        return tipo switch
        {
            ".bat" or ".cmd" or "BAT" or "CMD" => new SolidColorBrush(Color.FromRgb(0, 230, 118)),
            ".ps1" or "PS1" => new SolidColorBrush(Color.FromRgb(0, 229, 255)),
            ".exe" or ".reg" or "EXE" or "REG" => new SolidColorBrush(Color.FromRgb(255, 140, 0)),
            _ => new SolidColorBrush(Color.FromRgb(138, 143, 163)),
        };
    }

    private void LoadScriptContent(string? caminho)
    {
        if (string.IsNullOrEmpty(caminho) || !File.Exists(caminho))
        {
            TxtCodigo.Text = "(arquivo não encontrado)";
            return;
        }

        try
        {
            var content = File.ReadAllText(caminho);
            var lines = content.Split('\n');
            TxtCodigo.Text = string.Join("\n", lines);
            TxtCodigo.MaxLines = 50;
        }
        catch
        {
            TxtCodigo.Text = "(não foi possível ler o arquivo)";
        }
    }

    private void CloseClick(object? sender, RoutedEventArgs e)
    {
        DialogResult = true;
        Close();
    }

    private void Window_MouseDown(object? sender, MouseButtonEventArgs e)
    {
        if (e.ChangedButton == MouseButton.Left)
            DragMove();
    }
}
