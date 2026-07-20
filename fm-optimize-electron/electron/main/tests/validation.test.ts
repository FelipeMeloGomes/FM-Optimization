import { describe, expect, it } from 'vitest';
import { IpcSchemas, validateIpcInput } from '../validation';

describe('IpcSchemas', () => {
  it('validates execute-script with valid id', () => {
    const schema = IpcSchemas['execute-script'];
    expect(schema.safeParse('intel-30').success).toBe(true);
  });

  it('rejects execute-script with invalid id', () => {
    const schema = IpcSchemas['execute-script'];
    expect(schema.safeParse('bad id').success).toBe(false);
  });

  it('validates apply-dns with valid IPv4', () => {
    const schema = IpcSchemas['apply-dns'];
    const result = schema.safeParse({ interfaceIndex: 12, addresses: ['8.8.8.8'] });
    expect(result.success).toBe(true);
  });

  it('rejects apply-dns with invalid IPv4', () => {
    const schema = IpcSchemas['apply-dns'];
    const result = schema.safeParse({ interfaceIndex: 12, addresses: ['999.1.1.1'] });
    expect(result.success).toBe(false);
  });

  it('validates elevate-app with scriptId', () => {
    const schema = IpcSchemas['elevate-app'];
    expect(schema.safeParse({ scriptId: 'amd-31' }).success).toBe(true);
  });

  it('validates get-system-info as undefined', () => {
    const schema = IpcSchemas['get-system-info'];
    expect(schema.safeParse(undefined).success).toBe(true);
  });
});

describe('validateIpcInput', () => {
  it('returns success for known channel with valid input', () => {
    const result = validateIpcInput('execute-script', 'intel-30');
    expect(result.success).toBe(true);
  });

  it('returns error for known channel with invalid input', () => {
    const result = validateIpcInput('execute-script', 'bad id');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain('execute-script');
    }
  });

  it('passes through unknown channel', () => {
    const result = validateIpcInput('unknown-channel', { foo: 'bar' });
    expect(result.success).toBe(true);
  });
});
