using System.IO;
using System.Management;
using FMOptimize.Models;
using Microsoft.Win32;

namespace FMOptimize.Services;

public class SystemInfoService : ISystemInfoService
{
    public Task<DashboardData> GetSystemInfoAsync()
    {
        var data = new DashboardData
        {
            Cpu = GetCpuInfo(),
            Gpu = GetGpuInfo(),
            Memory = GetMemoryInfo(),
            System = GetSystemInfoBasic(),
            Storage = GetStorageInfo(),
            Tweaks = GetTweakStatuses(),
            NomeUsuario = Environment.UserName,
        };
        return Task.FromResult(data);
    }

    private static CpuInfo? GetCpuInfo()
    {
        try
        {
            using var mos = new ManagementObjectSearcher("SELECT * FROM Win32_Processor");
            foreach (var mo in mos.Get().Cast<ManagementObject>())
            {
                var nome = mo["Name"]?.ToString()?.Trim() ?? "";
                var cores = Convert.ToInt32(mo["NumberOfCores"] ?? 0);
                var logicos = Convert.ToInt32(mo["NumberOfLogicalProcessors"] ?? 0);
                var freqMhz = Convert.ToInt32(mo["MaxClockSpeed"] ?? 0);
                var freq = freqMhz >= 1000 ? $"{freqMhz / 1000.0:F2} GHz" : $"{freqMhz} MHz";
                var socket = mo["SocketDesignation"]?.ToString() ?? "";
                var l2 = Convert.ToInt32(mo["L2CacheSize"] ?? 0);
                var l3 = Convert.ToInt32(mo["L3CacheSize"] ?? 0);
                var cache = $"L2 {l2} KB / L3 {l3} KB";
                return new CpuInfo(nome, cores, logicos, freq, socket, cache);
            }
        }
        catch { }
        return null;
    }

    private static GpuInfo? GetGpuInfo()
    {
        try
        {
            using var mos = new ManagementObjectSearcher("SELECT * FROM Win32_VideoController");
            foreach (var mo in mos.Get().Cast<ManagementObject>())
            {
                var nome = mo["Name"]?.ToString()?.Trim() ?? "";
                var ramBytes = Convert.ToInt64(mo["AdapterRAM"] ?? 0);
                var vram = ramBytes > 0
                    ? $"{ramBytes / (1024.0 * 1024 * 1024):F1} GB"
                    : "N/A";
                var driver = mo["DriverVersion"]?.ToString() ?? "";
                var resX = Convert.ToInt32(mo["CurrentHorizontalResolution"] ?? 0);
                var resY = Convert.ToInt32(mo["CurrentVerticalResolution"] ?? 0);
                var resolucao = resX > 0 && resY > 0 ? $"{resX}x{resY}" : "N/A";
                var hz = Convert.ToInt32(mo["CurrentRefreshRate"] ?? 0);
                var refresh = hz > 0 ? $"{hz} Hz" : "N/A";
                return new GpuInfo(nome, vram, driver, resolucao, refresh);
            }
        }
        catch { }
        return null;
    }

    private static MemoryInfo? GetMemoryInfo()
    {
        try
        {
            long totalFisico = 0;
            int slotsUsados = 0;
            int slotsTotais = 0;

            using var mos = new ManagementObjectSearcher("SELECT * FROM Win32_PhysicalMemory");
            foreach (var mo in mos.Get().Cast<ManagementObject>())
            {
                totalFisico += Convert.ToInt64(mo["Capacity"] ?? 0);
                slotsUsados++;
            }

            try
            {
                using var mos2 = new ManagementObjectSearcher("SELECT MemoryDevices FROM Win32_ComputerSystem");
                foreach (var mo in mos2.Get().Cast<ManagementObject>())
                    slotsTotais = Convert.ToInt32(mo["MemoryDevices"] ?? 0);
            }
            catch { slotsTotais = slotsUsados; }

            var totalGb = totalFisico / (1024.0 * 1024 * 1024);

            long livreBytes = 0;
            using var mos3 = new ManagementObjectSearcher("SELECT * FROM Win32_OperatingSystem");
            foreach (var mo in mos3.Get().Cast<ManagementObject>())
            {
                livreBytes = Convert.ToInt64(mo["FreePhysicalMemory"] ?? 0) * 1024;
            }

            var usadoBytes = totalFisico - livreBytes;
            var totalStr = totalGb >= 1000 ? $"{totalGb / 1024:F1} TB" : $"{totalGb:F0} GB";
            var usadoStr = usadoBytes / (1024.0 * 1024 * 1024) >= 1000
                ? $"{usadoBytes / (1024.0 * 1024 * 1024 * 1024):F1} TB"
                : $"{usadoBytes / (1024.0 * 1024 * 1024):F1} GB";
            var livreStr = livreBytes / (1024.0 * 1024 * 1024) >= 1000
                ? $"{livreBytes / (1024.0 * 1024 * 1024 * 1024):F1} TB"
                : $"{livreBytes / (1024.0 * 1024 * 1024):F1} GB";
            var pctUso = totalFisico > 0 ? (double)usadoBytes / totalFisico * 100 : 0;
            var slots = $"{slotsUsados}/{slotsTotais} slots";

            return new MemoryInfo(totalStr, usadoStr, livreStr, pctUso, slots);
        }
        catch { }
        return null;
    }

    private static SystemInfoBasic GetSystemInfoBasic()
    {
        var osVer = Environment.OSVersion.Version;
        var build = osVer.Build.ToString();
        var versao = $"Windows {osVer.Major}.{osVer.Minor}";
        var edicao = "N/A";

        try
        {
            using var key = Registry.LocalMachine.OpenSubKey(@"SOFTWARE\Microsoft\Windows NT\CurrentVersion");
            if (key != null)
            {
                var prodName = key.GetValue("ProductName")?.ToString() ?? "";
                var displayVer = key.GetValue("DisplayVersion")?.ToString() ?? "";
                var curBuild = key.GetValue("CurrentBuild")?.ToString() ?? "";
                var ubr = key.GetValue("UBR")?.ToString() ?? "";
                if (!string.IsNullOrEmpty(prodName)) versao = prodName;
                if (!string.IsNullOrEmpty(displayVer)) versao += $" {displayVer}";
                if (!string.IsNullOrEmpty(curBuild)) build = curBuild;
                if (!string.IsNullOrEmpty(ubr)) build += $".{ubr}";

                edicao = key.GetValue("EditionID")?.ToString() ?? "N/A";
            }
        }
        catch { }

        var nomePC = Environment.MachineName;
        var nomeUsuario = Environment.UserName;

        var uptime = TimeSpan.FromMilliseconds(Environment.TickCount64);
        var uptimeStr = uptime.Days > 0
            ? $"{uptime.Days}d {uptime.Hours}h {uptime.Minutes}m"
            : $"{uptime.Hours}h {uptime.Minutes}m";

        return new SystemInfoBasic(versao, build, edicao, nomePC, nomeUsuario, uptimeStr);
    }

    private static List<StorageDrive> GetStorageInfo()
    {
        var drives = new List<StorageDrive>();
        var typeMap = GetDriveTypeMap();
        try
        {
            foreach (var di in DriveInfo.GetDrives())
            {
                if (!di.IsReady || di.Name == "A:\\" || di.Name == "B:\\") continue;

                var totalBytes = di.TotalSize;
                var freeBytes = di.AvailableFreeSpace;
                var usedBytes = totalBytes - freeBytes;
                var pctUso = totalBytes > 0 ? (double)usedBytes / totalBytes * 100 : 0;

                var totalStr = totalBytes / (1024.0 * 1024 * 1024 * 1024) >= 1
                    ? $"{totalBytes / (1024.0 * 1024 * 1024 * 1024):F1} TB"
                    : $"{totalBytes / (1024.0 * 1024 * 1024):F0} GB";
                var usadoStr = usedBytes / (1024.0 * 1024 * 1024 * 1024) >= 1
                    ? $"{usedBytes / (1024.0 * 1024 * 1024 * 1024):F1} TB"
                    : $"{usedBytes / (1024.0 * 1024 * 1024):F0} GB";
                var livreStr = freeBytes / (1024.0 * 1024 * 1024 * 1024) >= 1
                    ? $"{freeBytes / (1024.0 * 1024 * 1024 * 1024):F1} TB"
                    : $"{freeBytes / (1024.0 * 1024 * 1024):F0} GB";

                var key = di.Name.TrimEnd('\\').TrimEnd(':');
                var tipo = di.DriveType switch
                {
                    DriveType.Fixed => typeMap.TryGetValue(key, out var t) ? t : "HDD",
                    DriveType.Removable => "USB",
                    DriveType.CDRom => "CD/DVD",
                    DriveType.Network => "Rede",
                    DriveType.Ram => "RAM",
                    _ => "Outro",
                };

                drives.Add(new StorageDrive(
                    di.Name.TrimEnd('\\'),
                    di.VolumeLabel,
                    totalStr,
                    usadoStr,
                    livreStr,
                    pctUso,
                    di.DriveFormat,
                    tipo));
            }
        }
        catch { }
        return drives;
    }

    private static Dictionary<string, string> GetDriveTypeMap()
    {
        var map = new Dictionary<string, string>();
        var letters = DriveInfo.GetDrives()
            .Where(d => d.IsReady && d.Name is not "A:\\" and not "B:\\")
            .Select(d => d.Name.TrimEnd('\\').TrimEnd(':'))
            .ToList();

        if (TryMapViaStorageNamespace(letters, map)) return map;
        if (TryMapViaDiskDriveGetRelated(letters, map)) return map;
        TryMapViaDiskDriveAssociation(letters, map);

        return map;
    }

    private static bool TryMapViaStorageNamespace(List<string> letters, Dictionary<string, string> map)
    {
        try
        {
            var ns = @"\\.\root\microsoft\windows\storage";
            foreach (var letter in letters)
            {
                uint? diskNum = null;
                using (var ps = new ManagementObjectSearcher(
                    ns, $"SELECT DiskNumber FROM MSFT_Partition WHERE DriveLetter='{letter}'"))
                {
                    foreach (var p in ps.Get().Cast<ManagementObject>())
                    {
                        diskNum = Convert.ToUInt32(p["DiskNumber"]);
                        break;
                    }
                }
                if (diskNum == null) continue;

                using (var ds = new ManagementObjectSearcher(
                    ns, $"SELECT MediaType, BusType FROM MSFT_PhysicalDisk WHERE DeviceID={diskNum}"))
                {
                    foreach (var pd in ds.Get().Cast<ManagementObject>())
                    {
                        var mt = Convert.ToUInt32(pd["MediaType"]);
                        var bt = Convert.ToUInt32(pd["BusType"]);
                        map[letter] = mt == 4
                            ? (bt is 14 or 17 ? "NVMe" : "SSD")
                            : "HDD";
                        break;
                    }
                }
            }
            return map.Count > 0;
        }
        catch { return false; }
    }

    private static bool TryMapViaDiskDriveGetRelated(List<string> letters, Dictionary<string, string> map)
    {
        try
        {
            var diskModels = new Dictionary<uint, string>();
            using (var mos = new ManagementObjectSearcher(
                "SELECT Index, Model, PNPDeviceID FROM Win32_DiskDrive"))
            {
                foreach (var mo in mos.Get().Cast<ManagementObject>())
                {
                    var index = Convert.ToUInt32(mo["Index"]);
                    var model = mo["Model"]?.ToString() ?? "";
                    var pnp = mo["PNPDeviceID"]?.ToString() ?? "";
                    diskModels[index] = ClassifyDisk(model, pnp);
                }
            }

            foreach (var key in letters)
            {
                var letter = key + ":";
                try
                {
                    using var ld = new ManagementObject($"Win32_LogicalDisk.DeviceID='{letter}'");
                    foreach (var rel in ld.GetRelated("Win32_DiskDrive"))
                    {
                        var idx = Convert.ToUInt32(rel["Index"]);
                        map.TryAdd(key, diskModels.TryGetValue(idx, out var t) ? t : "HDD");
                        break;
                    }
                }
                catch { }
            }
            return map.Count > 0;
        }
        catch { return false; }
    }

    private static void TryMapViaDiskDriveAssociation(List<string> letters, Dictionary<string, string> map)
    {
        try
        {
            var diskModels = new Dictionary<uint, string>();
            using (var mos = new ManagementObjectSearcher("SELECT Index, Model, PNPDeviceID FROM Win32_DiskDrive"))
            {
                foreach (var mo in mos.Get().Cast<ManagementObject>())
                {
                    var index = Convert.ToUInt32(mo["Index"]);
                    var model = mo["Model"]?.ToString() ?? "";
                    var pnp = mo["PNPDeviceID"]?.ToString() ?? "";
                    diskModels[index] = ClassifyDisk(model, pnp);
                }
            }

            var driveToDisk = new Dictionary<string, uint>();
            using (var mos = new ManagementObjectSearcher("SELECT * FROM Win32_LogicalDiskToPartition"))
            {
                foreach (var mo in mos.Get().Cast<ManagementObject>())
                {
                    var dep = mo["Dependent"]?.ToString() ?? "";
                    var ant = mo["Antecedent"]?.ToString() ?? "";
                    var dIdx = dep.IndexOf("DeviceID=\"", StringComparison.OrdinalIgnoreCase);
                    var aIdx = ant.IndexOf("Disk #", StringComparison.OrdinalIgnoreCase);
                    if (dIdx < 0 || aIdx < 0) continue;

                    var dStart = dIdx + 10;
                    var dEnd = dep.IndexOf('"', dStart);
                    if (dEnd < 0) continue;
                    var driveLetter = dep[dStart..dEnd];

                    var aStart = aIdx + 6;
                    var aEnd = ant.IndexOf(',', aStart);
                    if (aEnd < 0) aEnd = ant.IndexOf('"', aStart);
                    if (aEnd < 0) continue;
                    if (uint.TryParse(ant[aStart..aEnd], out var diskNum))
                        driveToDisk[driveLetter] = diskNum;
                }
            }

            foreach (var key in letters)
            {
                var letter = key + ":";
                if (driveToDisk.TryGetValue(letter, out var diskIdx) &&
                    diskModels.TryGetValue(diskIdx, out var tipo))
                {
                    map.TryAdd(key, tipo);
                }
            }
        }
        catch { }
    }

    private static string ClassifyDisk(string model, string pnpDeviceId)
    {
        if (model.Contains("NVMe", StringComparison.OrdinalIgnoreCase) ||
            pnpDeviceId.Contains("NVME", StringComparison.OrdinalIgnoreCase))
            return "NVMe";

        if (model.Contains("SSD", StringComparison.OrdinalIgnoreCase) ||
            model.Contains("SOLID STATE", StringComparison.OrdinalIgnoreCase) ||
            model.Contains("M.2", StringComparison.OrdinalIgnoreCase))
            return "SSD";

        return "HDD";
    }

    private static List<TweakInfo> GetTweakStatuses()
    {
        var tweaks = new List<TweakInfo>();

        try
        {
            using var key = Registry.LocalMachine.OpenSubKey(
                @"SOFTWARE\Microsoft\GameBar");
            var gameMode = key?.GetValue("AllowAutoGameMode") is int gm && gm == 1;
            tweaks.Add(new("Game Mode", gameMode));
        }
        catch { tweaks.Add(new("Game Mode", false)); }

        try
        {
            using var key = Registry.LocalMachine.OpenSubKey(
                @"SYSTEM\CurrentControlSet\Services\SysMain");
            var sysMain = key?.GetValue("Start") is int sm && sm == 4;
            tweaks.Add(new("SysMain (Superfetch)", sysMain));
        }
        catch { tweaks.Add(new("SysMain (Superfetch)", false)); }

        try
        {
            using var key = Registry.LocalMachine.OpenSubKey(
                @"SOFTWARE\Microsoft\Windows\CurrentVersion\GameDVR");
            var gameDvr = key?.GetValue("AppCaptureEnabled") is int gd && gd == 0;
            tweaks.Add(new("GameDVR", gameDvr));
        }
        catch { tweaks.Add(new("GameDVR", false)); }

        try
        {
            using var key = Registry.LocalMachine.OpenSubKey(
                @"SYSTEM\CurrentControlSet\Services\Tcpip\Parameters");
            var nagle = key?.GetValue("TCPNoDelay") is int tn && tn == 1;
            tweaks.Add(new("Nagle (TCPNoDelay)", nagle));
        }
        catch { tweaks.Add(new("Nagle (TCPNoDelay)", false)); }

        try
        {
            using var key = Registry.LocalMachine.OpenSubKey(
                @"SYSTEM\CurrentControlSet\Control\Session Manager\Memory Management");
            var lc = key?.GetValue("LargeSystemCache") is int l && l == 1;
            tweaks.Add(new("Large System Cache", lc));
        }
        catch { tweaks.Add(new("Large System Cache", false)); }

        try
        {
            using var key = Registry.CurrentUser.OpenSubKey(
                @"Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced");
            var motion = key?.GetValue("DisallowShaking") is int ms && ms == 1;
            tweaks.Add(new("Aero Shake", motion));
        }
        catch { tweaks.Add(new("Aero Shake", false)); }

        return tweaks;
    }
}
