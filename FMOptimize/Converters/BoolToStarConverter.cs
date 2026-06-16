using System.Globalization;
using System.Windows.Data;
using FMOptimize.Resources;

namespace FMOptimize.Converters;

/// <summary>Converts a boolean favorite flag to a filled or empty star character.</summary>
public class BoolToStarConverter : IValueConverter
{
    /// <summary>Returns "★" if <paramref name="value"/> is <see langword="true"/>; otherwise "☆".</summary>
    /// <param name="value">The boolean favorite flag.</param>
    /// <param name="targetType">The target type of the binding.</param>
    /// <param name="parameter">An optional converter parameter.</param>
    /// <param name="culture">The culture to use in the converter.</param>
    /// <returns>"★" for favorite; "☆" for non-favorite.</returns>
    public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
        => value is true ? Strings.StarFilled : Strings.StarEmpty;

    /// <summary>Not supported; throws <see cref="NotImplementedException"/>.</summary>
    public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
        => throw new NotImplementedException();
}
