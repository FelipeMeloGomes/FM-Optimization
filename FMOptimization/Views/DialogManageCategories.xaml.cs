using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using FMOptimization.Models;
using FMOptimization.Services;

namespace FMOptimization;

public partial class DialogManageCategories : Window
{
    private List<string> _categories;

    public DialogManageCategories(List<string> categories)
    {
        InitializeComponent();
        _categories = categories;
        RenderCategories();
    }

    private void RenderCategories()
    {
        CatStackPanel.Children.Clear();
        foreach (var cat in _categories)
        {
            var border = new Border
            {
                Background = new SolidColorBrush(Color.FromRgb(0x1a, 0x1a, 0x2e)),
                CornerRadius = new CornerRadius(8),
                Padding = new Thickness(14, 8, 8, 8),
                Margin = new Thickness(0, 0, 0, 4),
            };

            var grid = new Grid();
            grid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            grid.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });

            var redBrush = new SolidColorBrush(Color.FromRgb(0xff, 0x17, 0x44));
            var text = new TextBlock
            {
                Text = cat,
                Foreground = Brushes.White,
                VerticalAlignment = VerticalAlignment.Center
            };

            var removeBtn = new Button
            {
                Content = "Remover",
                Height = 24,
                Padding = new Thickness(8, 0, 8, 0),
                Background = Brushes.Transparent,
                Foreground = redBrush,
                BorderBrush = redBrush,
                BorderThickness = new Thickness(1),
                Cursor = System.Windows.Input.Cursors.Hand,
                Tag = cat,
            };
            removeBtn.Click += RemoveClick;

            Grid.SetColumn(text, 0);
            Grid.SetColumn(removeBtn, 1);
            grid.Children.Add(text);
            grid.Children.Add(removeBtn);
            border.Child = grid;
            CatStackPanel.Children.Add(border);
        }
    }

    private void AddClick(object? sender, RoutedEventArgs e)
    {
        var nome = TxtNovaCategoria.Text.Trim();
        if (!string.IsNullOrEmpty(nome) && !_categories.Contains(nome))
        {
            _categories.Add(nome);
            TxtNovaCategoria.Text = "";
            RenderCategories();
        }
    }

    private void RemoveClick(object? sender, RoutedEventArgs e)
    {
        if (sender is Button btn && btn.Tag is string cat && _categories.Contains(cat))
        {
            _categories.Remove(cat);
            RenderCategories();
        }
    }

    private void SaveClick(object? sender, RoutedEventArgs e)
    {
        var data = DataService.Carregar();
        data.Categorias = _categories;
        DataService.Salvar(data);
        DialogResult = true;
        Close();
    }

    private void CancelClick(object? sender, RoutedEventArgs e)
    {
        DialogResult = false;
        Close();
    }
}


