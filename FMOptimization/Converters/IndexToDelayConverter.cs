using System.Globalization;
using System.Windows.Data;

namespace FMOptimization.Converters;

/// <summary>Converts an integer index to a <see cref="TimeSpan"/> delay for staggered animations.</summary>
public class IndexToDelayConverter : IValueConverter
{
    /// <summary>Returns <see cref="TimeSpan.FromSeconds"/> of <paramref name="value"/> * 0.04 for staggered animations.</summary>
    /// <param name="value">The zero-based index as an <see cref="int"/>.</param>
    /// <param name="targetType">The target type of the binding.</param>
    /// <param name="parameter">An optional converter parameter.</param>
    /// <param name="culture">The culture to use in the converter.</param>
    /// <returns>A <see cref="TimeSpan"/> representing the animation delay.</returns>
    public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        if (value is int index)
            return TimeSpan.FromSeconds(index * 0.04);
        return TimeSpan.Zero;
    }

    /// <summary>Not supported; throws <see cref="NotImplementedException"/>.</summary>
    public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
        => throw new NotImplementedException();
}
