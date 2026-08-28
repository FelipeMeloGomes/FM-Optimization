import { describe, expect, it } from 'vitest';
import { generateSalt, hashPassword, verifyPassword } from '../services/page-lock';

describe('page-lock password hashing', () => {
  it('generates a non-empty salt', () => {
    expect(generateSalt()).toBeTruthy();
  });

  it('produces different salts each call', () => {
    expect(generateSalt()).not.toBe(generateSalt());
  });

  it('hashes same password+salt to same value', () => {
    const salt = generateSalt();
    expect(hashPassword('senha123', salt)).toBe(hashPassword('senha123', salt));
  });

  it('hashes differently for different passwords', () => {
    const salt = generateSalt();
    expect(hashPassword('senha123', salt)).not.toBe(hashPassword('senha456', salt));
  });

  it('verifies correct password', () => {
    const salt = generateSalt();
    expect(verifyPassword('minhasenha', salt, hashPassword('minhasenha', salt))).toBe(true);
  });

  it('rejects wrong password', () => {
    const salt = generateSalt();
    expect(verifyPassword('errada', salt, hashPassword('minhasenha', salt))).toBe(false);
  });
});
