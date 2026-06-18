using FMOptimize.Models;

namespace FMOptimize.Services;

public interface ISystemInfoService
{
    Task<DashboardData> GetSystemInfoAsync();
}
