using System.Windows;
using FMOptimize.Services;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace FMOptimize;

public partial class App : Application
{
    public static IServiceProvider Services { get; private set; } = null!;

    protected override void OnStartup(StartupEventArgs e)
    {
        var sc = new ServiceCollection();

        sc.AddLogging(builder =>
        {
            builder.AddDebug();
            builder.SetMinimumLevel(LogLevel.Information);
        });

        sc.AddSingleton<IDataService, DataService>();
        sc.AddTransient<IScriptExecutionService, ScriptExecutionService>();
        sc.AddTransient<IScriptExtractionService, ScriptExtractionService>();
        sc.AddSingleton<IScriptFilterService, ScriptFilterService>();
        sc.AddTransient<ViewModels.MainViewModel>();
        sc.AddTransient<MainWindow>();

        Services = sc.BuildServiceProvider();

        var mainWindow = Services.GetRequiredService<MainWindow>();
        mainWindow.Show();
    }
}
