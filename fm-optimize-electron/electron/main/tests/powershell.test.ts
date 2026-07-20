import { describe, expect, it } from 'vitest';
import { buildPsCommand, psEscape } from '../services/powershell';

describe('psEscape', () => {
  it('escapes double quotes', () => {
    expect(psEscape('say "hi"')).toBe('say `"hi`"');
  });

  it('escapes backticks', () => {
    expect(psEscape('a`b')).toBe('a``b');
  });

  it('escapes dollar signs', () => {
    expect(psEscape('price $5')).toBe('price `$5');
  });

  it('escapes single quotes', () => {
    expect(psEscape("it's")).toBe("it`'s");
  });

  it('blocks command injection via statement separator', () => {
    const malicious = 'harmless; Remove-Item C:\\*';
    const escaped = psEscape(malicious);
    // The ';' must be escaped with a backtick, not passed raw
    expect(escaped).toContain('`;');
    expect(escaped.startsWith('harmless`;')).toBe(true);
  });

  it('blocks command injection via ampersand', () => {
    const malicious = 'harmless & calc';
    const escaped = psEscape(malicious);
    expect(escaped).toContain('`&');
    expect(escaped).not.toBe(malicious);
  });
});

describe('buildPsCommand', () => {
  it('escapes all arguments', () => {
    const cmd = buildPsCommand('Test-Path', 'C:\\Users\\"Admin"');
    expect(cmd[0]).toBe('Test-Path');
    expect(cmd[1]).toBe('C:\\Users\\`"Admin`"');
  });

  it('returns command unchanged as first element', () => {
    const cmd = buildPsCommand('Get-Process', 'notepad');
    expect(cmd).toEqual(['Get-Process', 'notepad']);
  });
});
