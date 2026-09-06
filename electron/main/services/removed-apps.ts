import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { RemoveMode } from '../../shared/ipc-types';

export interface RemovedAppRecord {
  packageName: string;
  label: string;
  instanceId: string;
  instanceName: string;
  arch: string;
  removedAt: string;
  mode: RemoveMode;
  hasBackup: boolean;
  backupPath?: string;
}

export const MAX_REMOVED_ENTRIES = 100;

export interface RemovedAppsStore {
  getFilePath(): string;
  listRemovedApps(): RemovedAppRecord[];
  recordRemovedApp(entry: Omit<RemovedAppRecord, 'removedAt'> & { removedAt?: string }): void;
  removeRemovedAppEntry(packageName: string): void;
  clearRemovedHistory(): void;
}

export function createRemovedAppsStore(dataDir: string): RemovedAppsStore {
  const filePath = resolve(dataDir, 'removed-apps.json');

  function ensureDir(): void {
    if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
  }

  function load(): RemovedAppRecord[] {
    if (!existsSync(filePath)) return [];
    try {
      const parsed = JSON.parse(readFileSync(filePath, 'utf-8'));
      if (!Array.isArray(parsed)) return [];
      return (parsed as Array<Partial<RemovedAppRecord>>).map((rec) => ({
        mode: 'uninstalled',
        ...rec,
      })) as RemovedAppRecord[];
    } catch {
      return [];
    }
  }

  function save(records: RemovedAppRecord[]): void {
    ensureDir();
    const tmpPath = `${filePath}.tmp`;
    writeFileSync(tmpPath, JSON.stringify(records, null, 2), 'utf-8');
    renameSync(tmpPath, filePath);
  }

  return {
    getFilePath: () => filePath,
    listRemovedApps() {
      const records = load();
      return records.map((rec) => {
        if (!rec.hasBackup) return rec;
        return {
          ...rec,
          hasBackup: rec.backupPath ? existsSync(rec.backupPath) : false,
        };
      });
    },
    recordRemovedApp(entry) {
      const records = load();
      const next: RemovedAppRecord = {
        ...entry,
        removedAt: entry.removedAt ?? new Date().toISOString(),
      };
      const idx = records.findIndex((r) => r.packageName === entry.packageName);
      if (idx >= 0) records[idx] = next;
      else records.unshift(next);
      if (records.length > MAX_REMOVED_ENTRIES) records.length = MAX_REMOVED_ENTRIES;
      save(records);
    },
    removeRemovedAppEntry(packageName) {
      save(load().filter((r) => r.packageName !== packageName));
    },
    clearRemovedHistory() {
      save([]);
    },
  };
}
