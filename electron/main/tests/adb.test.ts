import { describe, expect, it } from 'vitest';
import {
  assertRestoreAllowed,
  buildInstallArgs,
  parsePackagePaths,
  parsePmResult,
  pmCommandSucceeded,
  resolveLabel,
  shouldBackupOnRemoval,
} from '../services/adb';
import type { RemovedAppRecord } from '../services/removed-apps';

function parseDevicesOutput(
  output: string
): Array<{ serial: string; state: string; model?: string }> {
  const lines = output
    .split('\n')
    .slice(1)
    .filter((l) => l.trim());
  const devices: Array<{ serial: string; state: string; model?: string }> = [];

  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    if (parts.length < 2) continue;

    const serial = parts[0];
    const state = parts[1];
    if (!['device', 'offline', 'unauthorized'].includes(state)) continue;

    const device: { serial: string; state: string; model?: string } = { serial, state };
    const modelMatch = line.match(/model:(\S+)/);
    if (modelMatch) device.model = modelMatch[1];

    devices.push(device);
  }

  return devices;
}

function parseAppsOutput(output: string): string[] {
  return output
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.startsWith('package:'))
    .map((pkg) => pkg.replace('package:', '').split('=').pop() || '');
}

describe('parseDevicesOutput', () => {
  it('parses connected devices', () => {
    const output =
      'List of devices attached\nemulator-5554\tdevice product:sdk_gphone model:sdk_gphone64_x86_64\n';
    const devices = parseDevicesOutput(output);
    expect(devices).toHaveLength(1);
    expect(devices[0].serial).toBe('emulator-5554');
    expect(devices[0].state).toBe('device');
    expect(devices[0].model).toBe('sdk_gphone64_x86_64');
  });

  it('handles offline devices', () => {
    const output = 'List of devices attached\nemulator-5554\toffline\n';
    const devices = parseDevicesOutput(output);
    expect(devices).toHaveLength(1);
    expect(devices[0].state).toBe('offline');
  });

  it('ignores unauthorized devices', () => {
    const output = 'List of devices attached\nemulator-5554\tunauthorized\n';
    const devices = parseDevicesOutput(output);
    expect(devices).toHaveLength(1);
    expect(devices[0].state).toBe('unauthorized');
  });

  it('handles empty output', () => {
    const output = 'List of devices attached\n';
    const devices = parseDevicesOutput(output);
    expect(devices).toHaveLength(0);
  });

  it('handles multiple devices', () => {
    const output =
      'List of devices attached\nemulator-5554\tdevice product:sdk_gphone model:Pixel_4\nemulator-5556\tdevice product:sdk_gphone model:Pixel_6\n';
    const devices = parseDevicesOutput(output);
    expect(devices).toHaveLength(2);
    expect(devices[0].serial).toBe('emulator-5554');
    expect(devices[1].serial).toBe('emulator-5556');
  });
});

describe('parseAppsOutput', () => {
  it('parses package list', () => {
    const output =
      'package:/system/app/Chrome/Chrome.apk=com.android.chrome\npackage:/data/app/Spotify/Spotify.apk=com.spotify.music\n';
    const packages = parseAppsOutput(output);
    expect(packages).toHaveLength(2);
    expect(packages[0]).toBe('com.android.chrome');
    expect(packages[1]).toBe('com.spotify.music');
  });

  it('filters non-package lines', () => {
    const output = 'package:/system/app/Chrome/Chrome.apk=com.android.chrome\n';
    const packages = parseAppsOutput(output);
    expect(packages).toHaveLength(1);
  });

  it('handles empty output', () => {
    const output = '';
    const packages = parseAppsOutput(output);
    expect(packages).toHaveLength(0);
  });
});

describe('parsePackagePaths', () => {
  it('parses single path', () => {
    expect(parsePackagePaths('package:/system/app/Foo/Foo.apk\n')).toEqual([
      '/system/app/Foo/Foo.apk',
    ]);
  });

  it('parses base + split parts', () => {
    const out =
      'package:/data/app/com.foo-1/base.apk\npackage:/data/app/com.foo-1/split_config.arm64_v8a.apk\n';
    const paths = parsePackagePaths(out);
    expect(paths).toHaveLength(2);
    expect(paths[1]).toBe('/data/app/com.foo-1/split_config.arm64_v8a.apk');
  });

  it('ignores non-package lines', () => {
    expect(parsePackagePaths('Warning: something\n')).toEqual([]);
  });
});

describe('shouldBackupOnRemoval', () => {
  it('backs up system paths', () => {
    expect(shouldBackupOnRemoval('/system/app/Foo/Foo.apk', 'com.foo')).toBe(true);
    expect(shouldBackupOnRemoval('/vendor/app/Bar/Bar.apk', 'com.bar')).toBe(true);
  });

  it('backs up critical packages even on user path', () => {
    expect(shouldBackupOnRemoval('/data/app/Foo/Foo.apk', 'com.android.systemui')).toBe(true);
  });

  it('skips regular user apps', () => {
    expect(shouldBackupOnRemoval('/data/app/Spotify/Spotify.apk', 'com.spotify.music')).toBe(false);
  });
});

describe('buildInstallArgs', () => {
  it('uses install for a single file', () => {
    expect(buildInstallArgs(['/a.apk'])).toEqual(['install', '-r', '/a.apk']);
  });

  it('uses install-multiple for several parts', () => {
    expect(buildInstallArgs(['/base.apk', '/split.apk'])).toEqual([
      'install-multiple',
      '-r',
      '/base.apk',
      '/split.apk',
    ]);
  });
});

describe('resolveLabel', () => {
  it('uses known label', () => {
    expect(resolveLabel('com.spotify.music')).toBe('Spotify');
  });

  it('falls back to capitalized last segment', () => {
    expect(resolveLabel('com.unknown.example')).toBe('Example');
  });
});

describe('assertRestoreAllowed', () => {
  const rec: RemovedAppRecord = {
    packageName: 'com.a',
    label: 'A',
    instanceId: 'bs-64-bit',
    instanceName: 'BlueStacks 64-bit',
    arch: '64-bit',
    removedAt: '2026-09-06T00:00:00.000Z',
    mode: 'uninstalled',
    hasBackup: true,
    backupPath: '/tmp/a.apk',
  };

  it('allows matching instance with backup', () => {
    expect(() => assertRestoreAllowed(rec, 'bs-64-bit')).not.toThrow();
  });

  it('blocks missing record', () => {
    expect(() => assertRestoreAllowed(undefined, 'bs-64-bit')).toThrow(/registro/);
  });

  it('blocks different instance', () => {
    expect(() => assertRestoreAllowed(rec, 'rog-phone')).toThrow(/instância/);
  });

  it('blocks missing backup', () => {
    expect(() => assertRestoreAllowed({ ...rec, hasBackup: false }, 'bs-64-bit')).toThrow(/backup/);
  });

  it('allows disabled app without backup', () => {
    expect(() =>
      assertRestoreAllowed({ ...rec, mode: 'disabled', hasBackup: false }, 'bs-64-bit')
    ).not.toThrow();
  });
});

describe('parsePmResult', () => {
  it('recognizes success', () => {
    expect(parsePmResult('Success')).toEqual({ ok: true });
  });

  it('recognizes empty output as ok', () => {
    expect(parsePmResult('')).toEqual({ ok: true });
  });

  it('parses failure with reason', () => {
    expect(parsePmResult('Failure [DELETE_FAILED_PROTECTED_PACKAGE]')).toEqual({
      ok: false,
      reason: 'DELETE_FAILED_PROTECTED_PACKAGE',
    });
  });

  it('parses failure without brackets', () => {
    expect(parsePmResult('Failure not installed for 0')).toEqual({
      ok: false,
      reason: 'not installed for 0',
    });
  });
});

describe('pmCommandSucceeded', () => {
  it('returns ok for exit 0 with Success output', () => {
    expect(pmCommandSucceeded({ code: 0, stdout: 'Success', stderr: '' })).toEqual({ ok: true });
  });

  it('fails on Failure in stdout even with exit 0', () => {
    expect(
      pmCommandSucceeded({
        code: 0,
        stdout: 'Failure [DELETE_FAILED_PROTECTED_PACKAGE]',
        stderr: '',
      })
    ).toEqual({ ok: false, reason: 'DELETE_FAILED_PROTECTED_PACKAGE' });
  });

  it('fails on non-zero exit with empty stdout', () => {
    expect(pmCommandSucceeded({ code: 1, stdout: '', stderr: '' })).toEqual({
      ok: false,
      reason: 'adb exited with code 1',
    });
  });

  it('prefers stderr as reason on non-zero exit', () => {
    expect(pmCommandSucceeded({ code: 1, stdout: 'Success', stderr: 'boom' })).toEqual({
      ok: false,
      reason: 'boom',
    });
  });
});
