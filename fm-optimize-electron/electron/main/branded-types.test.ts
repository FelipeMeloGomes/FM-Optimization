import { describe, expect, it } from 'vitest';
import {
  asInterfaceIndex,
  asRestorePointSeq,
  asScriptId,
  InterfaceIndexSchema,
  RestorePointSeqSchema,
  ScriptIdSchema,
} from './branded-types';

describe('ScriptIdSchema', () => {
  it('accepts valid script id', () => {
    const result = ScriptIdSchema.safeParse('intel-30');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(asScriptId('intel-30')).toBe('intel-30');
    }
  });

  it('rejects empty string', () => {
    expect(ScriptIdSchema.safeParse('').success).toBe(false);
  });

  it('rejects invalid characters', () => {
    expect(ScriptIdSchema.safeParse('bad id!').success).toBe(false);
  });

  it('rejects too long', () => {
    expect(ScriptIdSchema.safeParse('a'.repeat(101)).success).toBe(false);
  });

  it('produces branded type', () => {
    const result = ScriptIdSchema.safeParse('amd-31');
    expect(result.success).toBe(true);
    if (result.success) {
      // Branded type is structurally a string
      expect(typeof result.data).toBe('string');
    }
  });
});

describe('InterfaceIndexSchema', () => {
  it('accepts positive integer', () => {
    expect(InterfaceIndexSchema.safeParse(12).success).toBe(true);
    expect(asInterfaceIndex(12)).toBe(12);
  });

  it('rejects zero', () => {
    expect(InterfaceIndexSchema.safeParse(0).success).toBe(false);
  });

  it('rejects negative', () => {
    expect(InterfaceIndexSchema.safeParse(-1).success).toBe(false);
  });

  it('rejects float', () => {
    expect(InterfaceIndexSchema.safeParse(1.5).success).toBe(false);
  });
});

describe('RestorePointSeqSchema', () => {
  it('accepts positive integer', () => {
    expect(RestorePointSeqSchema.safeParse(5).success).toBe(true);
    expect(asRestorePointSeq(5)).toBe(5);
  });

  it('rejects zero', () => {
    expect(RestorePointSeqSchema.safeParse(0).success).toBe(false);
  });
});
