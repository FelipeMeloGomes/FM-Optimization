using System.Globalization;
using System.Windows.Data;
using System.Windows.Media;
using FMOptimization.Services;

namespace FMOptimization.Converters;

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
