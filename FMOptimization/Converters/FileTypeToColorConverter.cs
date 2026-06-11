using System.Globalization;
using System.Windows;
using System.Windows.Data;
using System.Windows.Media;
using FMOptimization.Services;

namespace FMOptimization.Converters;

public class FileTypeToColorConverter : IValueConverter
{
    public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        var tipo = value as string ?? "";
        return tipo switch
        {
            ".bat" or ".cmd" => new SolidColorBrush(Color.FromRgb(0, 230, 118)),
            ".ps1" => new SolidColorBrush(Color.FromRgb(0, 229, 255)),
            ".exe" or ".reg" => new SolidColorBrush(Color.FromRgb(255, 140, 0)),
            _ => new SolidColorBrush(Color.FromRgb(138, 143, 163)),
        };
    }

    public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
        => throw new NotImplementedException();
}

public class BoolToOpacityConverter : IValueConverter
{
    public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
        => value is true ? 1.0 : 0.4;

    public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
        => throw new NotImplementedException();
}

public class BoolToStarConverter : IValueConverter
{
    public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
        => value is true ? "★" : "☆";

    public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
        => throw new NotImplementedException();
}

public class AdminToVisibilityConverter : IValueConverter
{
    public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
        => value is true ? Visibility.Visible : Visibility.Collapsed;

    public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
        => throw new NotImplementedException();
}

public class LogLevelToColorConverter : IValueConverter
{
    public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        return value switch
        {
            LogLevel.Start => new SolidColorBrush(Color.FromRgb(0, 230, 118)),
            LogLevel.End => new SolidColorBrush(Color.FromRgb(0, 229, 255)),
            LogLevel.Error => new SolidColorBrush(Color.FromRgb(255, 23, 68)),
            LogLevel.Warn => new SolidColorBrush(Color.FromRgb(255, 140, 0)),
            _ => new SolidColorBrush(Color.FromRgb(192, 192, 192)),
        };
    }

    public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
        => throw new NotImplementedException();
}
