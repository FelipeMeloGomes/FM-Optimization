using System.Collections.Generic;
using System.Windows.Media;

namespace FMOptimization.Assets;

public static class Icons
{
    public static readonly Dictionary<string, string> CategoryPaths = new()
    {
        ["Todas"] = "M3,3 L17,3 L17,17 L3,17 Z M5,5 L15,5 L15,15 L5,15 Z M19,3 L21,3 L21,17 L19,17 Z M3,19 L17,19 L17,21 L3,21 Z",
        ["Favoritos"] = "M10,2 L12.5,8 L19,8 L13.5,12 L15.5,18 L10,14 L4.5,18 L6.5,12 L1,8 L7.5,8 Z",
        ["Limpeza"] = "M7,3 L7,2 L13,2 L13,3 L17,3 L17,5 L15,5 L14,20 L6,20 L5,5 L3,5 L3,3 Z M8,5 L8,18 L12,18 L12,5 Z M13,5 L13,18 L13.5,5 Z",
        ["Desempenho"] = "M12,2 A10,10 0 1,1 2,12 A10,10 0 0,1 12,2 Z M12,4 A8,8 0 1,0 20,12 A8,8 0 0,0 12,4 Z M12,6 L12,12 L17,12",
        ["Energia"] = "M8,2 L16,2 L14,10 L18,10 L10,22 L11,12 L7,12 Z",
        ["Privacidade"] = "M12,2 L20,6 L20,12 Q20,18 12,22 Q4,18 4,12 L4,6 Z M12,8 A2,2 0 1,1 12,12 A2,2 0 0,1 12,8 Z",
        ["Rede"] = "M4,14 Q12,6 20,14 M8,18 Q12,14 16,18 M11,21 Q12,20 13,21",
        ["Sistema"] = "M12,2 A4,4 0 1,1 12,10 A4,4 0 0,1 12,2 Z M5,18 L19,18 L20,22 L4,22 Z M8,14 L16,14 L16,16 L8,16 Z",
        ["GPU - AMD"] = "M4,4 L20,4 L20,16 L4,16 Z M6,6 L18,6 L18,14 L6,14 Z M8,8 L16,8 L16,12 L8,12 Z M14,18 L18,20 L14,22 Z",
        ["GPU - NVIDIA"] = "M4,4 L20,4 L20,16 L4,16 Z M6,6 L18,6 L18,14 L6,14 Z M8,8 L16,8 L16,12 L8,12 Z M10,18 L14,18 L14,22 L10,22 Z",
        ["Windows 11"] = "M3,2 L11,2 L11,11 L3,11 Z M13,2 L21,2 L21,11 L13,11 Z M3,13 L11,13 L11,22 L3,22 Z M13,13 L21,13 L21,22 L13,22 Z",
    };

    public static Geometry GetPath(string category)
    {
        if (CategoryPaths.TryGetValue(category, out var data))
        {
            return Geometry.Parse(data);
        }
        return Geometry.Parse(CategoryPaths["Todas"]);
    }
}
