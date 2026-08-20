import { Palette } from 'lucide-react';
import { AccentColorPicker } from '../AccentColorPicker';
import { ThemeSelector } from '../ThemeSelector';

export function ThemeSection() {
  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <div className="size-1.5 rounded-full bg-primary" />
        <h3 className="text-sm font-semibold text-foreground">Tema</h3>
      </div>
      <div className="divide-y divide-border rounded-xl border border-border bg-card">
        <div className="p-4 transition-colors duration-200 hover:bg-muted/30">
          <span className="mb-3 block text-sm font-medium text-foreground">Aparencia</span>
          <p className="mb-3 text-xs text-muted-foreground">Escolha o visual do FM Optimize</p>
          <ThemeSelector />
        </div>
        <div className="p-4 transition-colors duration-200 hover:bg-muted/30">
          <div className="mb-3 flex items-center gap-2">
            <Palette className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Cor de destaque</span>
          </div>
          <p className="mb-3 text-xs text-muted-foreground">
            Personalize a cor principal da interface
          </p>
          <AccentColorPicker />
        </div>
      </div>
    </div>
  );
}
