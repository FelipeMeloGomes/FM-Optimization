import { beforeEach, describe, expect, it } from 'vitest';
import { checkRateLimit, resetRateLimit } from '../services/rate-limit';

describe('checkRateLimit', () => {
  beforeEach(() => {
    resetRateLimit();
  });

  it('allows requests within limit', () => {
    const channel = 'test-channel';
    for (let i = 0; i < 20; i++) {
      expect(checkRateLimit(channel).allowed).toBe(true);
    }
  });

  it('blocks requests exceeding default limit (20/1s)', () => {
    const channel = 'test-channel-2';
    for (let i = 0; i < 20; i++) {
      checkRateLimit(channel);
    }
    const result = checkRateLimit(channel);
    expect(result.allowed).toBe(false);
    expect(result.retryAfterMs).toBeGreaterThan(0);
  });

  it('applies stricter limit for elevate-app (2/10s)', () => {
    for (let i = 0; i < 2; i++) {
      expect(checkRateLimit('elevate-app').allowed).toBe(true);
    }
    expect(checkRateLimit('elevate-app').allowed).toBe(false);
  });

  it('isolates limits per channel', () => {
    for (let i = 0; i < 20; i++) {
      checkRateLimit('channel-a');
    }
    expect(checkRateLimit('channel-a').allowed).toBe(false);
    expect(checkRateLimit('channel-b').allowed).toBe(true);
  });
});
