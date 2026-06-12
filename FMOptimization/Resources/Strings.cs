using System.Resources;

namespace FMOptimization.Resources;

public static class Strings
{
    private static readonly ResourceManager _rm = new("FMOptimization.Resources.Strings", typeof(Strings).Assembly);

    public static string CategoryAll => _rm.GetString("CategoryAll") ?? "";
    public static string CategoryFavorites => _rm.GetString("CategoryFavorites") ?? "";
    public static string CategoryLimpeza => _rm.GetString("CategoryLimpeza") ?? "";
    public static string CategoryDesempenho => _rm.GetString("CategoryDesempenho") ?? "";
    public static string CategoryEnergia => _rm.GetString("CategoryEnergia") ?? "";
    public static string CategoryPrivacidade => _rm.GetString("CategoryPrivacidade") ?? "";
    public static string CategoryRede => _rm.GetString("CategoryRede") ?? "";
    public static string CategorySistema => _rm.GetString("CategorySistema") ?? "";
    public static string CategoryGpuAmd => _rm.GetString("CategoryGpuAmd") ?? "";
    public static string CategoryGpuNvidia => _rm.GetString("CategoryGpuNvidia") ?? "";
    public static string CategoryWindows11 => _rm.GetString("CategoryWindows11") ?? "";
    public static string EditScriptTitle => _rm.GetString("EditScriptTitle") ?? "";
    public static string AddScriptTitle => _rm.GetString("AddScriptTitle") ?? "";
    public static string RequiredFieldsMessage => _rm.GetString("RequiredFieldsMessage") ?? "";
    public static string RequiredFieldsTitle => _rm.GetString("RequiredFieldsTitle") ?? "";
    public static string FileNotFoundMessage(string path) => string.Format(_rm.GetString("FileNotFoundMessage") ?? "", "\n", path);
    public static string FileNotFoundTitle => _rm.GetString("FileNotFoundTitle") ?? "";
    public static string InvalidTypeMessage => _rm.GetString("InvalidTypeMessage") ?? "";
    public static string InvalidTypeTitle => _rm.GetString("InvalidTypeTitle") ?? "";
    public static string SelectScriptDialogTitle => _rm.GetString("SelectScriptDialogTitle") ?? "";
    public static string ScriptFilter => _rm.GetString("ScriptFilter") ?? "";
    public static string RemoveButton => _rm.GetString("RemoveButton") ?? "";
    public static string RequiresAdminBadge => _rm.GetString("RequiresAdminBadge") ?? "";
    public static string FileNotFoundPlaceholder => _rm.GetString("FileNotFoundPlaceholder") ?? "";
    public static string FileReadErrorPlaceholder => _rm.GetString("FileReadErrorPlaceholder") ?? "";
    public static string IconAll => _rm.GetString("IconAll") ?? "";
    public static string IconLimpeza => _rm.GetString("IconLimpeza") ?? "";
    public static string IconDesempenho => _rm.GetString("IconDesempenho") ?? "";
    public static string IconEnergia => _rm.GetString("IconEnergia") ?? "";
    public static string IconPrivacidade => _rm.GetString("IconPrivacidade") ?? "";
    public static string IconRede => _rm.GetString("IconRede") ?? "";
    public static string IconSistema => _rm.GetString("IconSistema") ?? "";
    public static string IconGpu => _rm.GetString("IconGpu") ?? "";
    public static string IconWindows11 => _rm.GetString("IconWindows11") ?? "";
    public static string IconFavorites => _rm.GetString("IconFavorites") ?? "";
    public static string IconDefault => _rm.GetString("IconDefault") ?? "";
    public static string LogToggleCollapse => _rm.GetString("LogToggleCollapse") ?? "";
    public static string LogToggleExpand => _rm.GetString("LogToggleExpand") ?? "";
    public static string TimestampFormat => _rm.GetString("TimestampFormat") ?? "";
    public static string StarFilled => _rm.GetString("StarFilled") ?? "";
    public static string StarEmpty => _rm.GetString("StarEmpty") ?? "";
}
