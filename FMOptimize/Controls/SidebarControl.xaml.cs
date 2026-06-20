using System.Windows;
using System.Windows.Input;
using System.Windows.Media;
using FMOptimize.Assets;

namespace FMOptimize.Controls;

public partial class SidebarControl
{
    public static readonly DependencyProperty DashboardIconProperty =
        DependencyProperty.Register(nameof(DashboardIcon), typeof(Geometry), typeof(SidebarControl),
            new PropertyMetadata(Geometry.Parse(Icons.CategoryPaths["Dashboard"])));
    public static readonly DependencyProperty TweaksIconProperty =
        DependencyProperty.Register(nameof(TweaksIcon), typeof(Geometry), typeof(SidebarControl),
            new PropertyMetadata(Geometry.Parse(Icons.CategoryPaths["Tweaks"])));
    public static readonly DependencyProperty UtilitiesIconProperty =
        DependencyProperty.Register(nameof(UtilitiesIcon), typeof(Geometry), typeof(SidebarControl),
            new PropertyMetadata(Geometry.Parse(Icons.CategoryPaths["Utilities"])));
    public static readonly DependencyProperty CleanerIconProperty =
        DependencyProperty.Register(nameof(CleanerIcon), typeof(Geometry), typeof(SidebarControl),
            new PropertyMetadata(Geometry.Parse(Icons.CategoryPaths["Cleaner"])));
    public static readonly DependencyProperty RestorePointsIconProperty =
        DependencyProperty.Register(nameof(RestorePointsIcon), typeof(Geometry), typeof(SidebarControl),
            new PropertyMetadata(Geometry.Parse(Icons.CategoryPaths["Restore Points"])));
    public static readonly DependencyProperty DnsManagerIconProperty =
        DependencyProperty.Register(nameof(DnsManagerIcon), typeof(Geometry), typeof(SidebarControl),
            new PropertyMetadata(Geometry.Parse(Icons.CategoryPaths["DNS Manager"])));
    public static readonly DependencyProperty AppsIconProperty =
        DependencyProperty.Register(nameof(AppsIcon), typeof(Geometry), typeof(SidebarControl),
            new PropertyMetadata(Geometry.Parse(Icons.CategoryPaths["Apps"])));
    public static readonly DependencyProperty SettingsIconProperty =
        DependencyProperty.Register(nameof(SettingsIcon), typeof(Geometry), typeof(SidebarControl),
            new PropertyMetadata(Geometry.Parse(Icons.CategoryPaths["Settings"])));

    public static readonly DependencyProperty IsDashboardProperty =
        DependencyProperty.Register(nameof(IsDashboard), typeof(bool), typeof(SidebarControl),
            new PropertyMetadata(true));
    public static readonly DependencyProperty IsTweaksProperty =
        DependencyProperty.Register(nameof(IsTweaks), typeof(bool), typeof(SidebarControl),
            new PropertyMetadata(false));
    public static readonly DependencyProperty IsUtilitiesProperty =
        DependencyProperty.Register(nameof(IsUtilities), typeof(bool), typeof(SidebarControl),
            new PropertyMetadata(false));
    public static readonly DependencyProperty IsCleanerProperty =
        DependencyProperty.Register(nameof(IsCleaner), typeof(bool), typeof(SidebarControl),
            new PropertyMetadata(false));
    public static readonly DependencyProperty IsRestorePointsProperty =
        DependencyProperty.Register(nameof(IsRestorePoints), typeof(bool), typeof(SidebarControl),
            new PropertyMetadata(false));
    public static readonly DependencyProperty IsDnsManagerProperty =
        DependencyProperty.Register(nameof(IsDnsManager), typeof(bool), typeof(SidebarControl),
            new PropertyMetadata(false));
    public static readonly DependencyProperty IsAppsProperty =
        DependencyProperty.Register(nameof(IsApps), typeof(bool), typeof(SidebarControl),
            new PropertyMetadata(false));
    public static readonly DependencyProperty IsSettingsProperty =
        DependencyProperty.Register(nameof(IsSettings), typeof(bool), typeof(SidebarControl),
            new PropertyMetadata(false));

    public static readonly DependencyProperty NavigateToDashboardCommandProperty =
        DependencyProperty.Register(nameof(NavigateToDashboardCommand), typeof(ICommand), typeof(SidebarControl),
            new PropertyMetadata(null));
    public static readonly DependencyProperty NavigateToTweaksCommandProperty =
        DependencyProperty.Register(nameof(NavigateToTweaksCommand), typeof(ICommand), typeof(SidebarControl),
            new PropertyMetadata(null));
    public static readonly DependencyProperty NavigateToUtilitiesCommandProperty =
        DependencyProperty.Register(nameof(NavigateToUtilitiesCommand), typeof(ICommand), typeof(SidebarControl),
            new PropertyMetadata(null));
    public static readonly DependencyProperty NavigateToCleanerCommandProperty =
        DependencyProperty.Register(nameof(NavigateToCleanerCommand), typeof(ICommand), typeof(SidebarControl),
            new PropertyMetadata(null));
    public static readonly DependencyProperty NavigateToRestorePointsCommandProperty =
        DependencyProperty.Register(nameof(NavigateToRestorePointsCommand), typeof(ICommand), typeof(SidebarControl),
            new PropertyMetadata(null));
    public static readonly DependencyProperty NavigateToDnsManagerCommandProperty =
        DependencyProperty.Register(nameof(NavigateToDnsManagerCommand), typeof(ICommand), typeof(SidebarControl),
            new PropertyMetadata(null));
    public static readonly DependencyProperty NavigateToAppsCommandProperty =
        DependencyProperty.Register(nameof(NavigateToAppsCommand), typeof(ICommand), typeof(SidebarControl),
            new PropertyMetadata(null));
    public static readonly DependencyProperty NavigateToSettingsCommandProperty =
        DependencyProperty.Register(nameof(NavigateToSettingsCommand), typeof(ICommand), typeof(SidebarControl),
            new PropertyMetadata(null));

    public Geometry DashboardIcon { get => (Geometry)GetValue(DashboardIconProperty); set => SetValue(DashboardIconProperty, value); }
    public Geometry TweaksIcon { get => (Geometry)GetValue(TweaksIconProperty); set => SetValue(TweaksIconProperty, value); }
    public Geometry UtilitiesIcon { get => (Geometry)GetValue(UtilitiesIconProperty); set => SetValue(UtilitiesIconProperty, value); }
    public Geometry CleanerIcon { get => (Geometry)GetValue(CleanerIconProperty); set => SetValue(CleanerIconProperty, value); }
    public Geometry RestorePointsIcon { get => (Geometry)GetValue(RestorePointsIconProperty); set => SetValue(RestorePointsIconProperty, value); }
    public Geometry DnsManagerIcon { get => (Geometry)GetValue(DnsManagerIconProperty); set => SetValue(DnsManagerIconProperty, value); }
    public Geometry AppsIcon { get => (Geometry)GetValue(AppsIconProperty); set => SetValue(AppsIconProperty, value); }
    public Geometry SettingsIcon { get => (Geometry)GetValue(SettingsIconProperty); set => SetValue(SettingsIconProperty, value); }

    public bool IsDashboard { get => (bool)GetValue(IsDashboardProperty); set => SetValue(IsDashboardProperty, value); }
    public bool IsTweaks { get => (bool)GetValue(IsTweaksProperty); set => SetValue(IsTweaksProperty, value); }
    public bool IsUtilities { get => (bool)GetValue(IsUtilitiesProperty); set => SetValue(IsUtilitiesProperty, value); }
    public bool IsCleaner { get => (bool)GetValue(IsCleanerProperty); set => SetValue(IsCleanerProperty, value); }
    public bool IsRestorePoints { get => (bool)GetValue(IsRestorePointsProperty); set => SetValue(IsRestorePointsProperty, value); }
    public bool IsDnsManager { get => (bool)GetValue(IsDnsManagerProperty); set => SetValue(IsDnsManagerProperty, value); }
    public bool IsApps { get => (bool)GetValue(IsAppsProperty); set => SetValue(IsAppsProperty, value); }
    public bool IsSettings { get => (bool)GetValue(IsSettingsProperty); set => SetValue(IsSettingsProperty, value); }

    public ICommand? NavigateToDashboardCommand { get => (ICommand?)GetValue(NavigateToDashboardCommandProperty); set => SetValue(NavigateToDashboardCommandProperty, value); }
    public ICommand? NavigateToTweaksCommand { get => (ICommand?)GetValue(NavigateToTweaksCommandProperty); set => SetValue(NavigateToTweaksCommandProperty, value); }
    public ICommand? NavigateToUtilitiesCommand { get => (ICommand?)GetValue(NavigateToUtilitiesCommandProperty); set => SetValue(NavigateToUtilitiesCommandProperty, value); }
    public ICommand? NavigateToCleanerCommand { get => (ICommand?)GetValue(NavigateToCleanerCommandProperty); set => SetValue(NavigateToCleanerCommandProperty, value); }
    public ICommand? NavigateToRestorePointsCommand { get => (ICommand?)GetValue(NavigateToRestorePointsCommandProperty); set => SetValue(NavigateToRestorePointsCommandProperty, value); }
    public ICommand? NavigateToDnsManagerCommand { get => (ICommand?)GetValue(NavigateToDnsManagerCommandProperty); set => SetValue(NavigateToDnsManagerCommandProperty, value); }
    public ICommand? NavigateToAppsCommand { get => (ICommand?)GetValue(NavigateToAppsCommandProperty); set => SetValue(NavigateToAppsCommandProperty, value); }
    public ICommand? NavigateToSettingsCommand { get => (ICommand?)GetValue(NavigateToSettingsCommandProperty); set => SetValue(NavigateToSettingsCommandProperty, value); }

    public SidebarControl()
    {
        InitializeComponent();
    }
}
