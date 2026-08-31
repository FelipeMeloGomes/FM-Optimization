import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cwd } from 'node:process';
import { describe, expect, it } from 'vitest';
import { checkScriptContent } from '../deny-list';

const SCRIPTS_PATH = resolve(cwd(), 'resources/scripts.json');

interface ScriptEntry {
  id: string;
  name: string;
  content: string;
}

function decodeScript(id: string): string {
  const scripts: ScriptEntry[] = JSON.parse(readFileSync(SCRIPTS_PATH, 'utf-8'));
  const script = scripts.find((s) => s.id === id);
  if (!script) throw new Error(`Script ${id} not found`);
  return Buffer.from(script.content, 'base64').toString('utf-8');
}

const SPICETIFY_IDS = ['apps-6', 'apps-7'];

describe('spicetify scripts', () => {
  it.each(SPICETIFY_IDS)(
    '%s decodes to ASCII-only content (Windows PowerShell 5.1 reads ps1 without BOM)',
    (id) => {
      const nonAscii = [...decodeScript(id)].find((c) => c.charCodeAt(0) > 0x7f);
      expect(nonAscii).toBeUndefined();
    }
  );

  it.each(SPICETIFY_IDS)('%s is allowed by the deny-list', (id) => {
    const { allowed, violations } = checkScriptContent(decodeScript(id));
    expect({ allowed, violations }).toEqual({ allowed: true, violations: [] });
  });

  it.each(SPICETIFY_IDS)('%s relaunches de-elevated when run as administrator', (id) => {
    const content = decodeScript(id);
    expect(content).toContain('function Test-Admin');
    expect(content).toContain('function Restart-WithoutAdmin');
    expect(content).toContain('New-ScheduledTaskPrincipal');
    expect(content).toContain('-RunLevel Limited');
    expect(content).toContain('if (Test-Admin) {');
  });

  it.each(SPICETIFY_IDS)(
    "%s does not rely on Spicetify's --bypass-admin (causes blank Spotify window)",
    (id) => {
      expect(decodeScript(id)).not.toContain('--bypass-admin');
    }
  );
});
