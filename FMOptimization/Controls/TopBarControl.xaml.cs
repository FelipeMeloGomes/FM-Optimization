using System.Windows;
using System.Windows.Controls;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Animation;
using FMOptimization.Models;
using FMOptimization.Resources;

namespace FMOptimization.Controls;

public partial class TopBarControl
{
    public static readonly DependencyProperty SelectedCategoryProperty =
        DependencyProperty.Register(nameof(SelectedCategory), typeof(string), typeof(TopBarControl),
            new PropertyMetadata(Strings.CategoryAll));

    public static readonly DependencyProperty ScriptCountProperty =
        DependencyProperty.Register(nameof(ScriptCount), typeof(int), typeof(TopBarControl),
            new PropertyMetadata(0));

    public static readonly DependencyProperty SearchTextProperty =
        DependencyProperty.Register(nameof(SearchText), typeof(string), typeof(TopBarControl),
            new FrameworkPropertyMetadata(string.Empty, FrameworkPropertyMetadataOptions.BindsTwoWayByDefault));

    public static readonly DependencyProperty ProfileProperty =
        DependencyProperty.Register(nameof(Profile), typeof(UserProfile), typeof(TopBarControl),
            new PropertyMetadata(null));

    public static readonly DependencyProperty SaveProfileNameCommandProperty =
        DependencyProperty.Register(nameof(SaveProfileNameCommand), typeof(ICommand), typeof(TopBarControl),
            new PropertyMetadata(null));

    public string SelectedCategory
    {
        get => (string)GetValue(SelectedCategoryProperty);
        set => SetValue(SelectedCategoryProperty, value);
    }

    public int ScriptCount
    {
        get => (int)GetValue(ScriptCountProperty);
        set => SetValue(ScriptCountProperty, value);
    }

    public string SearchText
    {
        get => (string)GetValue(SearchTextProperty);
        set => SetValue(SearchTextProperty, value);
    }

    public UserProfile? Profile
    {
        get => (UserProfile?)GetValue(ProfileProperty);
        set => SetValue(ProfileProperty, value);
    }

    public ICommand? SaveProfileNameCommand
    {
        get => (ICommand?)GetValue(SaveProfileNameCommandProperty);
        set => SetValue(SaveProfileNameCommandProperty, value);
    }

    public TopBarControl()
    {
        InitializeComponent();
    }

    public void FocusSearch()
    {
        SearchBox.Focus();
    }

    public void ClearSearch()
    {
        SearchBox.Text = "";
    }

    private void SearchBox_GotFocus(object? sender, RoutedEventArgs e)
    {
        var colorAnim = new ColorAnimation
        {
            To = Color.FromRgb(0x00, 0x44, 0xff),
            Duration = new Duration(TimeSpan.FromSeconds(0.15)),
        };
        SearchBorder.BorderBrush = new SolidColorBrush(Color.FromRgb(0x1e, 0x1e, 0x4a));
        SearchBorder.BorderBrush.BeginAnimation(SolidColorBrush.ColorProperty, colorAnim);
    }

    private void SearchBox_LostFocus(object? sender, RoutedEventArgs e)
    {
        var colorAnim = new ColorAnimation
        {
            To = Color.FromRgb(0x1e, 0x1e, 0x4a),
            Duration = new Duration(TimeSpan.FromSeconds(0.15)),
        };
        SearchBorder.BorderBrush.BeginAnimation(SolidColorBrush.ColorProperty, colorAnim);
    }

    private void SearchBorder_MouseDown(object? sender, MouseButtonEventArgs e)
    {
        SearchBox.Focus();
    }

    private void ProfileBtn_Click(object? sender, RoutedEventArgs e)
    {
        ProfilePopup.IsOpen = true;
    }

    private void ProfilePopup_Closed(object? sender, EventArgs e)
    {
        if (SaveProfileNameCommand?.CanExecute(Profile?.NomeExibicao) == true)
            SaveProfileNameCommand.Execute(Profile?.NomeExibicao);
    }
}
