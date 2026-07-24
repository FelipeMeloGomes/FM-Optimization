import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { playNotificationSound } from '../lib/notification-sound';

const ICONS = { success: CheckCircle, error: XCircle, info: Info, warning: AlertTriangle };
const DURATIONS = { short: 2000, medium: 4000, long: 8000 };

export function showEnhancedToast({
  type,
  title,
  description,
  action,
  duration = 'medium',
  sound = false,
}: {
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  duration?: 'short' | 'medium' | 'long';
  sound?: boolean;
}) {
  playNotificationSound(sound);
  const Icon = ICONS[type];
  toast[type](title, {
    description,
    duration: DURATIONS[duration],
    action: action ? { label: action.label, onClick: action.onClick } : undefined,
    icon: Icon ? <Icon className="h-4 w-4" /> : undefined,
  });
}
