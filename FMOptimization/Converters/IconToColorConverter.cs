using System.Globalization;
using System.Windows.Data;
using System.Windows.Media;

namespace FMOptimization.Converters;

public class IconToColorConverter : IValueConverter
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
