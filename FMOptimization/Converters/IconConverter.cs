using System.Globalization;
using System.Windows.Data;
using System.Windows.Media;
using FMOptimization.Assets;

namespace FMOptimization.Converters;

/// <summary>Converts a category name string to its corresponding icon path using <see cref="Assets.Icons.GetPath"/>.</summary>
public class IconConverter : IValueConverter
{
    /// <summary>Returns the icon path for the given category name.</summary>
    /// <param name="value">The category name.</param>
    /// <param name="targetType">The target type of the binding.</param>
    /// <param name="parameter">An optional converter parameter.</param>
    /// <param name="culture">The culture to use in the converter.</param>
    /// <returns>A <see cref="Geometry"/> representing the category icon.</returns>
    public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        var category = value as string ?? "";
        return Icons.GetPath(category);
    }

    /// <summary>Not supported; throws <see cref="NotImplementedException"/>.</summary>
    public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
        => throw new NotImplementedException();
}
