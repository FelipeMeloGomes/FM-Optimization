using System.Windows;
using FMOptimization.Services;
using Microsoft.Extensions.DependencyInjection;

namespace FMOptimization;

public partial class App : Application
{
    public static IServiceProvider Services { get; private set; } = null!;

    protected override void OnStartup(StartupEventArgs e)
    {
        var sc = new ServiceCollection();

        sc.AddSingleton<IDataService, DataService>();
        sc.AddTransient<IScriptExecutionService, ScriptExecutionService>();
        sc.AddTransient<ViewModels.MainViewModel>();
        sc.AddTransient<MainWindow>();

        Services = sc.BuildServiceProvider();

        var mainWindow = Services.GetRequiredService<MainWindow>();
        mainWindow.Show();
    }
}
