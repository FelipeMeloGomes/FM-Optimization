import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const ICONS = { success: CheckCircle, error: XCircle, info: Info, warning: AlertTriangle };
const DURATIONS = { short: 2000, medium: 4000, long: 8000 };

export function showEnhancedToast({
  type,
  title,
  description,
  action,
  duration = 'medium',
}: {
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  duration?: 'short' | 'medium' | 'long';
}) {
  const Icon = ICONS[type];
  toast[type](title, {
    description,
    duration: DURATIONS[duration],
    action: action ? { label: action.label, onClick: action.onClick } : undefined,
    icon: Icon ? <Icon className="h-4 w-4" /> : undefined,
  });
}
