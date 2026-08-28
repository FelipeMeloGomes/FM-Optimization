import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

export function generateSalt(): string {
  return randomBytes(16).toString('hex');
}

export function hashPassword(password: string, salt: string): string {
  return scryptSync(password, salt, 32).toString('hex');
}

export function verifyPassword(password: string, salt: string, expectedHash: string): boolean {
  const expected = Buffer.from(expectedHash, 'hex');
  const actual = scryptSync(password, salt, 32);
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}
