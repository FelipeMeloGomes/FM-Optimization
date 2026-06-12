using CommunityToolkit.Mvvm.ComponentModel;
using FMOptimization.Resources;

namespace FMOptimization.Models;

/// <summary>Represents a selectable category with display name, icon, and active state.</summary>
public class CategoryItem : ObservableObject
{
    /// <summary>Gets or sets the display name of the category.</summary>
    public string Name { get; set; } = "";

    /// <summary>Gets or sets the icon character displayed for the category.</summary>
    public string Icon { get; set; } = Strings.IconDefault;

    private bool _isActive;

    /// <summary>Gets or sets whether this category is currently selected/active.</summary>
    public bool IsActive
    {
        get => _isActive;
        set => SetProperty(ref _isActive, value);
    }
}
