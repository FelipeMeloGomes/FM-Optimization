import { useSettingsContext } from '../contexts/SettingsContext';
import { THEMES } from '../lib/theme-config';

// Custom bat SVG icon for Gotham Noir theme
function BatIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 20c1.111-3.048 3-5 5-4 .74-2.286 2.778-3.762 5-3-.173-2.595.13-5.314-2-7.5-1.708 2.648-3.358 2.557-5 2.5-3-6 6-7-3-2-9-5 0-4-3 2-1.5 0-3.292.148-5-2.5-2.13 2.186-1.827 4.905-2 7.5 2.222-.762 4.26.714 5 3 2-1 3.889.952 5 4" />
      <path d="M9 8a3 3 0 0 0 6 0" />
    </svg>
  );
}

// Map theme IDs to their icons
const THEME_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  batman: BatIcon,
};

export function ThemeSelector() {
  const { settings, update } = useSettingsContext();

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {THEMES.map((theme) => {
        const isActive = settings.theme === theme.id;
        const Icon = THEME_ICONS[theme.id];
        return (
          <button
            key={theme.id}
            type="button"
            aria-label={`Tema ${theme.name}${isActive ? ' (ativo)' : ''}`}
            onClick={() => update({ theme: theme.id })}
            className={`relative rounded-xl border-2 p-3 transition-[border-color,box-shadow,transform] duration-200 ${
              isActive
                ? 'border-primary shadow-lg shadow-primary/20'
                : 'border-border hover:border-muted-foreground/50 hover:bg-muted/20 hover:shadow-md'
            } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background`}
          >
            {/* Preview mockup */}
            <div
              className="mb-2 space-y-1.5 rounded-lg p-2"
              style={{ backgroundColor: theme.preview.bg }}
            >
              {/* Mini header */}
              <div className="flex items-center gap-1">
                <div
                  className="size-1.5 rounded-full"
                  style={{ backgroundColor: theme.preview.accent }}
                />
                <div
                  className="h-1 flex-1 rounded"
                  style={{ backgroundColor: theme.preview.text, opacity: 0.3 }}
                />
              </div>
              {/* Mini card */}
              <div
                className="space-y-1 rounded p-1.5"
                style={{ backgroundColor: theme.preview.card }}
              >
                <div
                  className="h-1 w-3/4 rounded"
                  style={{ backgroundColor: theme.preview.text, opacity: 0.5 }}
                />
                <div
                  className="h-1 w-1/2 rounded"
                  style={{ backgroundColor: theme.preview.text, opacity: 0.3 }}
                />
                {/* Mini button */}
                <div
                  className="mt-1 h-1.5 w-1/3 rounded"
                  style={{ backgroundColor: theme.preview.accent }}
                />
              </div>
            </div>
            {/* Label */}
            <div className="flex items-center justify-center gap-1.5">
              {Icon && (
                <span style={{ color: theme.preview.accent }}>
                  <Icon className="size-3" />
                </span>
              )}
              <span className="text-xs font-medium text-foreground">{theme.name}</span>
            </div>
            <p className="mt-0.5 text-center text-[10px] text-muted-foreground">
              {theme.description}
            </p>
            {/* Active indicator */}
            {isActive && (
              <div className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary">
                <svg
                  className="size-2.5 text-primary-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
