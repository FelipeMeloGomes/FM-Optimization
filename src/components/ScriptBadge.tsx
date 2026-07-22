import { RotateCcw, Shield } from 'lucide-react';
import type { ScriptEntry } from '../../electron/shared/ipc-types';
import { RISK_STYLES } from './ScriptCard';
import { Badge } from './ui';
import { cn } from '../lib/utils';

interface ScriptBadgeProps {
  script: ScriptEntry;
}

export function ScriptBadge({ script }: ScriptBadgeProps) {
  return (
    <>
      {script.requiresAdmin && (
        <Badge
          variant="destructive"
          className="gap-1 font-mono text-[10px] px-1.5 py-0 shrink-0"
        >
          <Shield className="size-3" />
          Admin
        </Badge>
      )}
      {script.requiresRestart && (
        <Badge
          variant="outline"
          className="gap-1 font-mono text-[10px] px-1.5 py-0 shrink-0 border-amber-500/50 text-amber-400"
        >
          <RotateCcw className="size-3" />
          Reiniciar
        </Badge>
      )}
      {script.riskLevel && (
        <Badge
          variant="outline"
          className={cn(
            'gap-1 font-mono text-[10px] px-1.5 py-0 shrink-0',
            RISK_STYLES[script.riskLevel].className
          )}
        >
          {RISK_STYLES[script.riskLevel].label}
        </Badge>
      )}
    </>
  );
}
