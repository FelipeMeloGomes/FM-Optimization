using System.Globalization;
using System.Windows.Data;

namespace FMOptimization.Converters;

/// <summary>Converts a boolean value to an opacity value (true = 1.0, false = 0.4).</summary>
public class BoolToOpacityConverter : IValueConverter
{
    /// <summary>Returns 1.0 if <paramref name="value"/> is <see langword="true"/>; otherwise 0.4.</summary>
    /// <param name="value">The boolean value.</param>
    /// <param name="targetType">The target type of the binding.</param>
    /// <param name="parameter">An optional converter parameter.</param>
    /// <param name="culture">The culture to use in the converter.</param>
    /// <returns>1.0 for true; 0.4 for false.</returns>
    public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
        => value is true ? 1.0 : 0.4;

    /// <summary>Not supported; throws <see cref="NotImplementedException"/>.</summary>
    public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
        => throw new NotImplementedException();
}
