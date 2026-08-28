import type { AppSettings } from '../../electron/shared/ipc-types';

export const ALWAYS_VISIBLE_ROUTES = ['/', '/settings'];

export function isPageLocked(route: string, settings: AppSettings): boolean {
  const pl = settings.pageLock;
  if (!pl.enabled) return false;
  if (ALWAYS_VISIBLE_ROUTES.includes(route)) return false;
  if (!pl.lockedPages.includes(route)) return false;
  return !pl.unlocked;
}

export function isLockedPageShown(route: string, settings: AppSettings): boolean {
  return !isPageLocked(route, settings);
}
