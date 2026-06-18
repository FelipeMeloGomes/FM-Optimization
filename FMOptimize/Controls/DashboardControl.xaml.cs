using System.Globalization;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Media;

namespace FMOptimize.Controls;

public partial class DashboardControl : UserControl
{
    public DashboardControl()
    {
        InitializeComponent();
    }
}

public class PctToStarConverter : IValueConverter
{
    public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
    {
        if (value is double pct)
            return new GridLength(Math.Clamp(pct, 0, 100), GridUnitType.Star);
        return new GridLength(0);
    }

    public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        => throw new NotSupportedException();
}

public class PctToStarOppositeConverter : IValueConverter
{
    public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
    {
        if (value is double pct)
            return new GridLength(Math.Clamp(100 - pct, 0, 100), GridUnitType.Star);
        return new GridLength(100);
    }

    public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        => throw new NotSupportedException();
}

public class StorageColorConverter : IValueConverter
{
    public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
    {
        if (value is double pct)
        {
            if (pct > 90) return new SolidColorBrush(Color.FromRgb(0xff, 0x17, 0x44));
            if (pct > 75) return new SolidColorBrush(Color.FromRgb(0xff, 0xab, 0x00));
            return new SolidColorBrush(Color.FromRgb(0x00, 0xe6, 0x76));
        }
        return new SolidColorBrush(Color.FromRgb(0x00, 0xe6, 0x76));
    }

    public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        => throw new NotSupportedException();
}
