using System.Globalization;
using System.Windows.Data;
using System.Windows.Media;

namespace FMOptimization.Converters;

/// <summary>Converts a file extension string to an accent <see cref="SolidColorBrush"/> for icon coloring.</summary>
public class IconToColorConverter : IValueConverter
{
    /// <summary>Returns a color brush based on the file extension (.bat/.cmd = green, .ps1 = cyan, .exe/.reg = orange, default = gray).</summary>
    /// <param name="value">The file extension string (e.g. ".bat", ".ps1").</param>
    /// <param name="targetType">The target type of the binding.</param>
    /// <param name="parameter">An optional converter parameter.</param>
    /// <param name="culture">The culture to use in the converter.</param>
    /// <returns>A <see cref="SolidColorBrush"/> matching the file type.</returns>
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

    /// <summary>Not supported; throws <see cref="NotImplementedException"/>.</summary>
    public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
        => throw new NotImplementedException();
}
