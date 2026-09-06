import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
  createRemovedAppsStore,
  MAX_REMOVED_ENTRIES,
  type RemovedAppRecord,
} from '../services/removed-apps';

const tempDirs: string[] = [];

function makeStore() {
  const dir = mkdtempSync(resolve(tmpdir(), 'removed-apps-'));
  tempDirs.push(dir);
  return createRemovedAppsStore(dir);
}

function entry(packageName: string, overrides: Partial<RemovedAppRecord> = {}): RemovedAppRecord {
  return {
    packageName,
    label: 'App',
    instanceId: 'bs-64-bit',
    instanceName: 'BlueStacks 64-bit',
    arch: '64-bit',
    removedAt: '2026-09-06T00:00:00.000Z',
    mode: 'uninstalled',
    hasBackup: true,
    backupPath: resolve(tmpdir(), `fake-${packageName}.apk`),
    ...overrides,
  };
}

afterEach(() => {
  for (const dir of tempDirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe('createRemovedAppsStore', () => {
  it('starts empty', () => {
    expect(makeStore().listRemovedApps()).toEqual([]);
  });

  it('records and lists newest first', () => {
    const store = makeStore();
    store.recordRemovedApp(entry('com.a'));
    store.recordRemovedApp(entry('com.b', { removedAt: '2026-09-05T00:00:00.000Z' }));
    const all = store.listRemovedApps();
    expect(all.map((r) => r.packageName)).toEqual(['com.b', 'com.a']);
  });

  it('replaces an existing entry for the same package', () => {
    const store = makeStore();
    store.recordRemovedApp(entry('com.a', { instanceId: 'old' }));
    store.recordRemovedApp(entry('com.a', { instanceId: 'new' }));
    const all = store.listRemovedApps();
    expect(all).toHaveLength(1);
    expect(all[0].instanceId).toBe('new');
  });

  it('caps entries at MAX_REMOVED_ENTRIES', () => {
    const store = makeStore();
    for (let i = 0; i < MAX_REMOVED_ENTRIES + 10; i++) {
      store.recordRemovedApp(entry(`com.pkg${i}`));
    }
    expect(store.listRemovedApps()).toHaveLength(MAX_REMOVED_ENTRIES);
  });

  it('reconciles hasBackup with file existence', () => {
    const dir = mkdtempSync(resolve(tmpdir(), 'removed-apps-files-'));
    tempDirs.push(dir);
    const existing = resolve(dir, 'exists.apk');
    writeFileSync(existing, 'x', 'utf-8');
    const store = createRemovedAppsStore(dir);
    store.recordRemovedApp(entry('com.has', { backupPath: existing }));
    store.recordRemovedApp(entry('com.missing', { backupPath: resolve(dir, 'nope.apk') }));
    const listed = new Map(store.listRemovedApps().map((r) => [r.packageName, r.hasBackup]));
    expect(listed.get('com.has')).toBe(true);
    expect(listed.get('com.missing')).toBe(false);
  });

  it('removes an entry', () => {
    const store = makeStore();
    store.recordRemovedApp(entry('com.a'));
    store.removeRemovedAppEntry('com.a');
    expect(store.listRemovedApps()).toHaveLength(0);
  });

  it('clears history', () => {
    const store = makeStore();
    store.recordRemovedApp(entry('com.a'));
    store.clearRemovedHistory();
    expect(store.listRemovedApps()).toHaveLength(0);
  });

  it('handles a corrupt file as empty', () => {
    const store = makeStore();
    writeFileSync(store.getFilePath(), '{not json', 'utf-8');
    expect(store.listRemovedApps()).toEqual([]);
  });
});
