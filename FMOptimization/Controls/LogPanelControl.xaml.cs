using System.Collections;
using System.Windows;
using System.Windows.Input;

namespace FMOptimization.Controls;

public partial class LogPanelControl
{
    public static readonly DependencyProperty LogEntriesProperty =
        DependencyProperty.Register(nameof(LogEntries), typeof(IEnumerable), typeof(LogPanelControl),
            new PropertyMetadata(Array.Empty<object>()));

    public static readonly DependencyProperty LogExpandedProperty =
        DependencyProperty.Register(nameof(LogExpanded), typeof(bool), typeof(LogPanelControl),
            new PropertyMetadata(true, OnLogExpandedChanged));

    public static readonly DependencyProperty CopyLogCommandProperty =
        DependencyProperty.Register(nameof(CopyLogCommand), typeof(ICommand), typeof(LogPanelControl),
            new PropertyMetadata(null));

    public static readonly DependencyProperty ClearLogCommandProperty =
        DependencyProperty.Register(nameof(ClearLogCommand), typeof(ICommand), typeof(LogPanelControl),
            new PropertyMetadata(null));

    public static readonly DependencyProperty ToggleLogCommandProperty =
        DependencyProperty.Register(nameof(ToggleLogCommand), typeof(ICommand), typeof(LogPanelControl),
            new PropertyMetadata(null));

    public IEnumerable LogEntries
    {
        get => (IEnumerable)GetValue(LogEntriesProperty);
        set => SetValue(LogEntriesProperty, value);
    }

    public bool LogExpanded
    {
        get => (bool)GetValue(LogExpandedProperty);
        set => SetValue(LogExpandedProperty, value);
    }

    public ICommand? CopyLogCommand
    {
        get => (ICommand?)GetValue(CopyLogCommandProperty);
        set => SetValue(CopyLogCommandProperty, value);
    }

    public ICommand? ClearLogCommand
    {
        get => (ICommand?)GetValue(ClearLogCommandProperty);
        set => SetValue(ClearLogCommandProperty, value);
    }

    public ICommand? ToggleLogCommand
    {
        get => (ICommand?)GetValue(ToggleLogCommandProperty);
        set => SetValue(ToggleLogCommandProperty, value);
    }

    public LogPanelControl()
    {
        InitializeComponent();
    }

    private static void OnLogExpandedChanged(DependencyObject d, DependencyPropertyChangedEventArgs e)
    {
        if (d is LogPanelControl control)
            control.AnimateLogPanel();
    }

    private void AnimateLogPanel()
    {
        if (LogExpanded)
        {
            LogScrollView.MaxHeight = 160;
            LogToggleBtn.Content = "▲";
        }
        else
        {
            LogScrollView.MaxHeight = 0;
            LogToggleBtn.Content = "▼";
        }
    }
}
