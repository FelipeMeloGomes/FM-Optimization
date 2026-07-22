import { resolve } from 'node:path';
import { app } from 'electron';
import { ALLOWED_EXTENSIONS } from './deny-list';

const ALLOWED_TEMP_DIR = resolve(app.getPath('userData'), 'scripts');

export interface PathValidationResult {
  valid: boolean;
  error?: string;
}

export function validateScriptPath(filePath: string): PathValidationResult {
  const resolved = resolve(filePath);

  if (!resolved.startsWith(ALLOWED_TEMP_DIR)) {
    return { valid: false, error: `Path must be within ${ALLOWED_TEMP_DIR}` };
  }

  const ext = getExtension(resolved);
  if (!ALLOWED_EXTENSIONS.includes(ext as (typeof ALLOWED_EXTENSIONS)[number])) {
    return { valid: false, error: `Extension ${ext} not allowed` };
  }

  return { valid: true };
}

export function getScriptTempDir(): string {
  return ALLOWED_TEMP_DIR;
}

function getExtension(filePath: string): string {
  const lastDot = filePath.lastIndexOf('.');
  if (lastDot === -1) return '';
  return filePath.substring(lastDot).toLowerCase();
}
