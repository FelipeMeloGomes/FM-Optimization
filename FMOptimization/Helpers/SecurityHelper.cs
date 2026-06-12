using System.Security.Principal;

namespace FMOptimization.Helpers;

/// <summary>Provides security-related helper methods for privilege checks.</summary>
public static class SecurityHelper
{
    /// <summary>Determines whether the current user is a member of the Administrators group.</summary>
    /// <returns><see langword="true"/> if the current user is an administrator; otherwise, <see langword="false"/>.</returns>
    public static bool IsAdministrator()
    {
        using var identity = WindowsIdentity.GetCurrent();
        var principal = new WindowsPrincipal(identity);
        return principal.IsInRole(WindowsBuiltInRole.Administrator);
    }
}
