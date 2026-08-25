import { describe, expect, it } from 'vitest';
import {
  formatVramGb,
  matchRegistryVram,
  parseVideoControllers,
  pickDedicatedGpu,
} from '../services/gpu-info';

const RX_7600 = {
  name: 'AMD Radeon RX 7600',
  driverVersion: '32.0.31035.1003',
  pnpDeviceId: 'PCI\\VEN_1002&DEV_7480&SUBSYS_53131849&REV_CF\\6&30169D4F&0&00000019',
};

describe('parseVideoControllers', () => {
  it('parses single controller object from ConvertTo-Json', () => {
    const json = `{
      "Name": "AMD Radeon RX 7600",
      "DriverVersion": "32.0.31035.1003",
      "PNPDeviceID": "PCI\\\\VEN_1002&DEV_7480"
    }`;
    const result = parseVideoControllers(json);
    expect(result).toEqual([
      {
        name: 'AMD Radeon RX 7600',
        driverVersion: '32.0.31035.1003',
        pnpDeviceId: 'PCI\\VEN_1002&DEV_7480',
      },
    ]);
  });

  it('parses array of controllers', () => {
    const json = `[
      { "Name": "Intel(R) UHD Graphics 770", "DriverVersion": "31.0.101.1", "PNPDeviceID": "PCI\\\\VEN_8086&DEV_4680" },
      { "Name": "NVIDIA GeForce RTX 4070", "DriverVersion": "560.70", "PNPDeviceID": "PCI\\\\VEN_10DE&DEV_2786" }
    ]`;
    const result = parseVideoControllers(json);
    expect(result).toHaveLength(2);
    expect(result[0]?.name).toBe('Intel(R) UHD Graphics 770');
    expect(result[1]?.name).toBe('NVIDIA GeForce RTX 4070');
  });

  it('returns empty array for invalid JSON', () => {
    expect(parseVideoControllers('not json')).toEqual([]);
  });

  it('returns empty array for empty string', () => {
    expect(parseVideoControllers('')).toEqual([]);
  });

  it('filters controllers without name', () => {
    const json = `[
      { "Name": null, "DriverVersion": "1.0", "PNPDeviceID": "PCI\\\\VEN_A" },
      { "Name": "AMD Radeon RX 7600", "DriverVersion": "1.0", "PNPDeviceID": "PCI\\\\VEN_B" }
    ]`;
    const result = parseVideoControllers(json);
    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe('AMD Radeon RX 7600');
  });

  it('keeps controller without PNPDeviceID using empty string', () => {
    const json = `{ "Name": "Basic Display Adapter", "DriverVersion": "1.0" }`;
    const result = parseVideoControllers(json);
    expect(result[0]?.pnpDeviceId).toBe('');
  });
});

describe('pickDedicatedGpu', () => {
  it('prefers NVIDIA GeForce over Intel iGPU regardless of order', () => {
    const picked = pickDedicatedGpu([
      { name: 'NVIDIA GeForce RTX 4070', driverVersion: '', pnpDeviceId: 'A' },
      { name: 'Intel(R) UHD Graphics 770', driverVersion: '', pnpDeviceId: 'B' },
    ]);
    expect(picked?.name).toBe('NVIDIA GeForce RTX 4070');
  });

  it('prefers Radeon RX over AMD APU graphics', () => {
    const picked = pickDedicatedGpu([
      { name: 'AMD Radeon(TM) Graphics', driverVersion: '', pnpDeviceId: 'A' },
      { name: 'AMD Radeon RX 7600', driverVersion: '', pnpDeviceId: 'B' },
    ]);
    expect(picked?.name).toBe('AMD Radeon RX 7600');
  });

  it('detects Radeon RX when listed before iGPU', () => {
    const picked = pickDedicatedGpu([
      RX_7600,
      { name: 'Intel(R) UHD Graphics 730', driverVersion: '', pnpDeviceId: 'B' },
    ]);
    expect(picked?.name).toBe('AMD Radeon RX 7600');
  });

  it('falls back to first controller when only iGPUs present', () => {
    const picked = pickDedicatedGpu([
      { name: 'Intel(R) UHD Graphics 770', driverVersion: '', pnpDeviceId: 'A' },
      { name: 'Intel(R) HD Graphics', driverVersion: '', pnpDeviceId: 'B' },
    ]);
    expect(picked?.name).toBe('Intel(R) UHD Graphics 770');
  });

  it('falls back to first when no known pattern matches', () => {
    const picked = pickDedicatedGpu([
      { name: 'Generic VGA Adapter', driverVersion: '', pnpDeviceId: 'A' },
    ]);
    expect(picked?.name).toBe('Generic VGA Adapter');
  });

  it('returns null for empty list', () => {
    expect(pickDedicatedGpu([])).toBeNull();
  });

  it('recognizes Intel Arc discrete GPU as dedicated', () => {
    const picked = pickDedicatedGpu([
      { name: 'Intel(R) Arc(TM) A770 Graphics', driverVersion: '', pnpDeviceId: 'A' },
      { name: 'Intel(R) UHD Graphics 770', driverVersion: '', pnpDeviceId: 'B' },
    ]);
    expect(picked?.name).toBe('Intel(R) Arc(TM) A770 Graphics');
  });
});

describe('matchRegistryVram', () => {
  const ENTRIES = [
    'PCI\\VEN_1002&DEV_7480&SUBSYS_53131849&REV_CF|8573157376',
    'PCI\\VEN_8086&DEV_4680&SUBSYS_00108086&REV_0C|268435456',
  ];

  it('matches registry entry whose device id prefixes the PNPDeviceID', () => {
    const vram = matchRegistryVram(ENTRIES, RX_7600.pnpDeviceId);
    expect(vram).toBe(8573157376);
  });

  it('matches case-insensitively', () => {
    const vram = matchRegistryVram(
      ['pci\\ven_1002&dev_7480&subsys_53131849&rev_cf|8573157376'],
      RX_7600.pnpDeviceId
    );
    expect(vram).toBe(8573157376);
  });

  it('returns null when no entry matches', () => {
    expect(matchRegistryVram(ENTRIES, 'PCI\\VEN_DEAD&DEV_BEEF')).toBeNull();
  });

  it('ignores malformed lines', () => {
    const vram = matchRegistryVram(['garbage-line', ...ENTRIES], RX_7600.pnpDeviceId);
    expect(vram).toBe(8573157376);
  });

  it('rejects zero or negative values', () => {
    const vram = matchRegistryVram(
      ['PCI\\VEN_1002&DEV_7480&SUBSYS_53131849&REV_CF|0'],
      RX_7600.pnpDeviceId
    );
    expect(vram).toBeNull();
  });

  it('returns null for empty PNPDeviceID', () => {
    expect(matchRegistryVram(ENTRIES, '')).toBeNull();
  });
});

describe('formatVramGb', () => {
  it('formats 8 GB card from QWord bytes', () => {
    expect(formatVramGb(8573157376)).toBe('8 GB');
  });

  it('formats saturated AdapterRAM value', () => {
    expect(formatVramGb(4293918720)).toBe('4 GB');
  });

  it('rounds fractional GiB', () => {
    expect(formatVramGb(8053063680)).toBe('8 GB');
    expect(formatVramGb(7516192768)).toBe('7 GB');
  });
});
