using FMOptimize.Models;

namespace FMOptimize.Services;

public interface ISystemInfoService
{
    Task<DashboardData> GetSystemInfoAsync();
    Task<(bool Success, string Message)> CreateRestorePointAsync(string description);
    Task<List<RestorePointEntry>> GetRestorePointsAsync();
    Task<(bool Success, string Message)> DeleteRestorePointAsync(int sequenceNumber);
    Task<(bool Success, string Message)> RestoreSystemAsync(int sequenceNumber);
}
