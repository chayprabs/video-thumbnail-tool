import { describe, expect, it } from 'vitest';
import { validateTrimRequest } from './http-utils.js';

describe('validateTrimRequest', () => {
  it('rejects inverted timecodes', () => {
    expect(
      validateTrimRequest({ segments: [{ in: '00:00:05', out: '00:00:01' }] }),
    ).toBe('out time must be after in time');
  });

  it('accepts valid segment', () => {
    expect(
      validateTrimRequest({ segments: [{ in: '00:00:00', out: '00:00:05' }] }),
    ).toBeNull();
  });
});
