using System.Globalization;
using System.Windows.Data;
using System.Windows.Media;
using FMOptimization.Models;

namespace FMOptimization.Converters;

/// <summary>Converts a <see cref="Models.LogLevel"/> value to an appropriate <see cref="SolidColorBrush"/> for UI display.</summary>
public class LogLevelToColorConverter : IValueConverter
{
    /// <summary>Returns a color brush based on the <see cref="Models.LogLevel"/> (Start = green, End = cyan, Error = red, Warn = orange, Info = gray).</summary>
    /// <param name="value">The <see cref="Models.LogLevel"/> value.</param>
    /// <param name="targetType">The target type of the binding.</param>
    /// <param name="parameter">An optional converter parameter.</param>
    /// <param name="culture">The culture to use in the converter.</param>
    /// <returns>A <see cref="SolidColorBrush"/> matching the log level.</returns>
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

    /// <summary>Not supported; throws <see cref="NotImplementedException"/>.</summary>
    public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
        => throw new NotImplementedException();
}
