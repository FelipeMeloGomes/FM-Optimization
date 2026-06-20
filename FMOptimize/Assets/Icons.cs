using System.Collections.Generic;
using System.Windows.Media;

namespace FMOptimize.Assets;

public static class Icons
{
    public static readonly Dictionary<string, string> CategoryPaths = new()
    {
        ["Todas"] = "M3,3 L17,3 L17,17 L3,17 Z M5,5 L15,5 L15,15 L5,15 Z M19,3 L21,3 L21,17 L19,17 Z M3,19 L17,19 L17,21 L3,21 Z",
        ["Favoritos"] = "M10,2 L12.5,8 L19,8 L13.5,12 L15.5,18 L10,14 L4.5,18 L6.5,12 L1,8 L7.5,8 Z",
        ["Dashboard"] = "M2,2 L7,2 L7,7 L2,7 Z M9,2 L14,2 L14,7 L9,7 Z M2,9 L7,9 L7,14 L2,14 Z M9,9 L14,9 L14,14 L9,14 Z",
        ["Tweaks"] = "M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.3-1.4L9.7 6.6 6.6 9.7 3.7 6.8C2.7 9.1 3.1 12.1 5.1 14.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.1-2.1c.5-.5.5-1.1.1-1.5z",
        ["Utilities"] = "M6,2 L18,2 L18,3 L6,3 Z M5,3 L5,8 C5,10 7,12 8,12 L8,14 L6,20 L6,21 L18,21 L18,20 L16,14 L16,12 C17,12 19,10 19,8 L19,3 Z M9,12 L15,12 L15,14 L9,14 Z",
        ["Cleaner"] = "M6,4 L6,3 L18,3 L18,4 L22,4 L22,6 L20,6 L18,21 L6,21 L4,6 L2,6 L2,4 Z M8,6 L8,19 L16,19 L16,6 Z M10,8 L10,17 L11,17 L11,8 Z M13,8 L13,17 L14,17 L14,8 Z",
        ["Restore Points"] = "M12,2 C6.48,2 2,6.48 2,12 C2,17.52 6.48,22 12,22 C17.52,22 22,17.52 22,12 C22,6.48 17.52,2 12,2 Z M12,4 C16.42,4 20,7.58 20,12 C20,16.42 16.42,20 12,20 C7.58,20 4,16.42 4,12 C4,7.58 7.58,4 12,4 Z M11,6 L11,13 L16,13",
        ["DNS Manager"] = "M4,2 L20,2 L20,8 L4,8 Z M6,4 L6,6 L18,6 L18,4 Z M4,10 L20,10 L20,16 L4,16 Z M6,12 L6,14 L18,14 L18,12 Z M4,18 L20,18 L20,22 L4,22 Z M6,20 L6,22 L18,22 L18,20 Z",
        ["Apps"] = "M3,2 L11,2 L11,11 L3,11 Z M13,2 L21,2 L21,11 L13,11 Z M3,13 L11,13 L11,22 L3,22 Z M13,13 L21,13 L21,22 L13,22 Z",
        ["Settings"] = "M11,2 L13,2 L13,5 L15.5,6 L18,4 L20,6 L18,8.5 L19,11 L22,11 L22,13 L19,13 L18,15.5 L20,18 L18,20 L15.5,18 L13,19 L13,22 L11,22 L11,19 L8.5,18 L6,20 L4,18 L6,15.5 L5,13 L2,13 L2,11 L5,11 L6,8.5 L4,6 L6,4 L8.5,6 L11,5 Z M12,8 A4,4 0 1,1 12,16 A4,4 0 0,1 12,8 Z",
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
