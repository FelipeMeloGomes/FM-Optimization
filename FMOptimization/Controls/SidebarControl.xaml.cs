using System.Collections;
using System.Windows;
using System.Windows.Input;
using FMOptimization.Resources;

namespace FMOptimization.Controls;

public partial class SidebarControl
{
    public static readonly DependencyProperty CategoriesProperty =
        DependencyProperty.Register(nameof(Categories), typeof(IEnumerable), typeof(SidebarControl),
            new PropertyMetadata(Array.Empty<object>()));

    public static readonly DependencyProperty SelectedCategoryProperty =
        DependencyProperty.Register(nameof(SelectedCategory), typeof(string), typeof(SidebarControl),
            new PropertyMetadata(Strings.CategoryAll));

    public static readonly DependencyProperty SelectCategoryCommandProperty =
        DependencyProperty.Register(nameof(SelectCategoryCommand), typeof(ICommand), typeof(SidebarControl),
            new PropertyMetadata(null));

    public static readonly DependencyProperty ManageCategoriesCommandProperty =
        DependencyProperty.Register(nameof(ManageCategoriesCommand), typeof(ICommand), typeof(SidebarControl),
            new PropertyMetadata(null));

    public IEnumerable Categories
    {
        get => (IEnumerable)GetValue(CategoriesProperty);
        set => SetValue(CategoriesProperty, value);
    }

    public string SelectedCategory
    {
        get => (string)GetValue(SelectedCategoryProperty);
        set => SetValue(SelectedCategoryProperty, value);
    }

    public ICommand? SelectCategoryCommand
    {
        get => (ICommand?)GetValue(SelectCategoryCommandProperty);
        set => SetValue(SelectCategoryCommandProperty, value);
    }

    public ICommand? ManageCategoriesCommand
    {
        get => (ICommand?)GetValue(ManageCategoriesCommandProperty);
        set => SetValue(ManageCategoriesCommandProperty, value);
    }

    public SidebarControl()
    {
        InitializeComponent();
    }
}
