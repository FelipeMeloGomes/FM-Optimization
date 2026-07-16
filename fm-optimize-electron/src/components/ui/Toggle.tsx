import { cn } from '@/lib/utils';
import { Label } from './label';
import { Switch } from './switch';

interface ToggleProps {
  id?: string;
  label: string;
  description?: string;
  checked?: boolean;
  onChange?: (e: { target: { checked: boolean } }) => void;
  className?: string;
}

export function Toggle({ label, description, id, className, checked, onChange }: ToggleProps) {
  return (
    <div className={cn('flex items-center justify-between gap-4', className)}>
      <div className="flex flex-col gap-0.5">
        <Label htmlFor={id} className="cursor-pointer text-sm font-medium text-foreground">
          {label}
        </Label>
        {description && <span className="text-xs text-muted-foreground">{description}</span>}
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={(value) => {
          onChange?.({ target: { checked: value } });
        }}
      />
    </div>
  );
}
