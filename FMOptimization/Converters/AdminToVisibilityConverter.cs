using System.Globalization;
using System.Windows;
using System.Windows.Data;

namespace FMOptimization.Converters;

/// <summary>Converts a boolean admin flag to <see cref="Visibility.Visible"/> or <see cref="Visibility.Collapsed"/>.</summary>
public class AdminToVisibilityConverter : IValueConverter
{
    /// <summary>Returns <see cref="Visibility.Visible"/> if <paramref name="value"/> is <see langword="true"/>; otherwise, <see cref="Visibility.Collapsed"/>.</summary>
    /// <param name="value">The boolean value indicating admin status.</param>
    /// <param name="targetType">The target type of the binding.</param>
    /// <param name="parameter">An optional converter parameter.</param>
    /// <param name="culture">The culture to use in the converter.</param>
    /// <returns><see cref="Visibility.Visible"/> if admin; otherwise <see cref="Visibility.Collapsed"/>.</returns>
    public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
        => value is true ? Visibility.Visible : Visibility.Collapsed;

    /// <summary>Not supported; throws <see cref="NotImplementedException"/>.</summary>
    public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
        => throw new NotImplementedException();
}
