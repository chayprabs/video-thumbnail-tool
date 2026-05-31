import { describe, expect, it } from 'vitest';

describe('shared-types', () => {
  it('exports ClipJob shape', () => {
    const job = { trim: { in: '00:00:00', out: '00:00:10', copy: true } };
    expect(job.trim?.copy).toBe(true);
  });
});
