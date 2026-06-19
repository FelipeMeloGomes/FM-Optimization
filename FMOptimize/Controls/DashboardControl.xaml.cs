using System.Globalization;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Input;
using System.Windows.Media;

namespace FMOptimize.Controls;

public partial class DashboardControl : UserControl
{
    public DashboardControl()
    {
        InitializeComponent();
    }

    public ICommand? CreateBackupCommand
    {
        get => (ICommand?)GetValue(CreateBackupCommandProperty);
        set => SetValue(CreateBackupCommandProperty, value);
    }

    public static readonly DependencyProperty CreateBackupCommandProperty =
        DependencyProperty.Register(nameof(CreateBackupCommand), typeof(ICommand), typeof(DashboardControl), new PropertyMetadata(null));

    public bool IsBackingUp
    {
        get => (bool)GetValue(IsBackingUpProperty);
        set => SetValue(IsBackingUpProperty, value);
    }

    public static readonly DependencyProperty IsBackingUpProperty =
        DependencyProperty.Register(nameof(IsBackingUp), typeof(bool), typeof(DashboardControl), new PropertyMetadata(false));

    public ICommand? ViewRestoresCommand
    {
        get => (ICommand?)GetValue(ViewRestoresCommandProperty);
        set => SetValue(ViewRestoresCommandProperty, value);
    }

    public static readonly DependencyProperty ViewRestoresCommandProperty =
        DependencyProperty.Register(nameof(ViewRestoresCommand), typeof(ICommand), typeof(DashboardControl), new PropertyMetadata(null));
}

public class PctToStarConverter : IValueConverter
{
    public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
    {
        if (value is double pct)
            return new GridLength(Math.Clamp(pct, 0, 100), GridUnitType.Star);
        return new GridLength(0);
    }

    public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        => throw new NotSupportedException();
}

public class PctToStarOppositeConverter : IValueConverter
{
    public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
    {
        if (value is double pct)
            return new GridLength(Math.Clamp(100 - pct, 0, 100), GridUnitType.Star);
        return new GridLength(100);
    }

    public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        => throw new NotSupportedException();
}

public class StorageColorConverter : IValueConverter
{
    public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
    {
        if (value is double pct)
        {
            if (pct > 90) return new SolidColorBrush(Color.FromRgb(0xff, 0x17, 0x44));
            if (pct > 75) return new SolidColorBrush(Color.FromRgb(0xff, 0xab, 0x00));
            return new SolidColorBrush(Color.FromRgb(0x00, 0xe6, 0x76));
        }
        return new SolidColorBrush(Color.FromRgb(0x00, 0xe6, 0x76));
    }

    public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        => throw new NotSupportedException();
}
