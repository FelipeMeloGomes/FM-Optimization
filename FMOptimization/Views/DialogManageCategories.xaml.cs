using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Animation;
using FMOptimization.Models;
using FMOptimization.Services;
using System.Windows.Controls.Primitives;

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
            if (cat is "Todas" or "Favoritos") continue;

            var border = new Border
            {
                Background = new SolidColorBrush(Color.FromRgb(0x11, 0x11, 0x2a)),
                CornerRadius = new CornerRadius(8),
                Padding = new Thickness(14, 8, 8, 8),
                Margin = new Thickness(0, 0, 0, 4),
                BorderBrush = new SolidColorBrush(Color.FromRgb(0x1e, 0x1e, 0x4a)),
                BorderThickness = new Thickness(1),
            };

            var grid = new Grid();
            grid.ColumnDefinitions.Add(new ColumnDefinition { Width = new GridLength(1, GridUnitType.Star) });
            grid.ColumnDefinitions.Add(new ColumnDefinition { Width = GridLength.Auto });

            var text = new TextBlock
            {
                Text = cat,
                Foreground = new SolidColorBrush(Color.FromRgb(0xe8, 0xea, 0xf0)),
                FontSize = 12,
                VerticalAlignment = VerticalAlignment.Center
            };

            var removeBtn = new Button
            {
                Content = "Remover",
                Height = 26,
                Padding = new Thickness(10, 0, 10, 0),
                Background = Brushes.Transparent,
                Foreground = new SolidColorBrush(Color.FromRgb(0xff, 0x17, 0x44)),
                BorderBrush = new SolidColorBrush(Color.FromRgb(0xff, 0x17, 0x44)),
                BorderThickness = new Thickness(1),
                Cursor = Cursors.Hand,
                FontSize = 10,
                Tag = cat,
            };
            removeBtn.SetValue(Button.TemplateProperty, CreateRoundedButtonTemplate(removeBtn));
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

    private void Field_GotFocus(object? sender, RoutedEventArgs e)
    {
        if (sender is TextBox tb)
        {
            var parent = tb.Parent as Border;
            if (parent != null)
            {
                parent.BorderBrush = new SolidColorBrush(Color.FromRgb(0x1e, 0x1e, 0x4a));
                var anim = new ColorAnimation
                {
                    To = Color.FromRgb(0, 229, 255),
                    Duration = new Duration(TimeSpan.FromSeconds(0.15)),
                };
                parent.BorderBrush.BeginAnimation(SolidColorBrush.ColorProperty, anim);
            }
        }
    }

    private void Field_LostFocus(object? sender, RoutedEventArgs e)
    {
        if (sender is TextBox tb)
        {
            var parent = tb.Parent as Border;
            if (parent != null)
            {
                var anim = new ColorAnimation
                {
                    To = Color.FromRgb(0x1e, 0x1e, 0x4a),
                    Duration = new Duration(TimeSpan.FromSeconds(0.15)),
                };
                parent.BorderBrush.BeginAnimation(SolidColorBrush.ColorProperty, anim);
            }
        }
    }

    private static ControlTemplate CreateRoundedButtonTemplate(Button button)
    {
        var factory = new FrameworkElementFactory(typeof(Border));
        factory.SetValue(Border.BackgroundProperty, new TemplateBindingExtension(Button.BackgroundProperty));
        factory.SetValue(Border.BorderBrushProperty, new TemplateBindingExtension(Button.BorderBrushProperty));
        factory.SetValue(Border.BorderThicknessProperty, new TemplateBindingExtension(Button.BorderThicknessProperty));
        factory.SetValue(Border.CornerRadiusProperty, new CornerRadius(4));
        factory.SetValue(Border.SnapsToDevicePixelsProperty, true);
        var presenter = new FrameworkElementFactory(typeof(ContentPresenter));
        presenter.SetValue(ContentPresenter.HorizontalAlignmentProperty, HorizontalAlignment.Center);
        presenter.SetValue(ContentPresenter.VerticalAlignmentProperty, VerticalAlignment.Center);
        presenter.SetValue(ContentPresenter.MarginProperty, new TemplateBindingExtension(Button.PaddingProperty));
        factory.AppendChild(presenter);

        return new ControlTemplate(typeof(Button)) { VisualTree = factory };
    }

    private void Window_MouseDown(object? sender, MouseButtonEventArgs e)
    {
        if (e.ChangedButton == MouseButton.Left)
            DragMove();
    }
}
