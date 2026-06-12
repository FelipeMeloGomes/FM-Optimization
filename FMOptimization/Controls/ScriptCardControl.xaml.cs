using System.Windows;
using System.Windows.Input;
using FMOptimization.Models;

namespace FMOptimization.Controls;

public partial class ScriptCardControl
{
    public static readonly DependencyProperty ScriptProperty =
        DependencyProperty.Register(nameof(Script), typeof(ScriptModel), typeof(ScriptCardControl),
            new PropertyMetadata(null));

    public static readonly DependencyProperty ToggleFavoritoCommandProperty =
        DependencyProperty.Register(nameof(ToggleFavoritoCommand), typeof(ICommand), typeof(ScriptCardControl),
            new PropertyMetadata(null));

    public static readonly DependencyProperty ShowDetailsCommandProperty =
        DependencyProperty.Register(nameof(ShowDetailsCommand), typeof(ICommand), typeof(ScriptCardControl),
            new PropertyMetadata(null));

    public static readonly DependencyProperty ExecuteScriptCommandProperty =
        DependencyProperty.Register(nameof(ExecuteScriptCommand), typeof(ICommand), typeof(ScriptCardControl),
            new PropertyMetadata(null));

    public ScriptModel? Script
    {
        get => (ScriptModel?)GetValue(ScriptProperty);
        set => SetValue(ScriptProperty, value);
    }

    public ICommand? ToggleFavoritoCommand
    {
        get => (ICommand?)GetValue(ToggleFavoritoCommandProperty);
        set => SetValue(ToggleFavoritoCommandProperty, value);
    }

    public ICommand? ShowDetailsCommand
    {
        get => (ICommand?)GetValue(ShowDetailsCommandProperty);
        set => SetValue(ShowDetailsCommandProperty, value);
    }

    public ICommand? ExecuteScriptCommand
    {
        get => (ICommand?)GetValue(ExecuteScriptCommandProperty);
        set => SetValue(ExecuteScriptCommandProperty, value);
    }

    public ScriptCardControl()
    {
        InitializeComponent();
    }
}
