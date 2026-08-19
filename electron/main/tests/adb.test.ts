import { describe, expect, it } from 'vitest';

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
