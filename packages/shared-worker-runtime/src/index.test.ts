import { describe, expect, it } from 'vitest';
import { sanitizeFilename, redactForLog } from './index.js';

describe('shared-worker-runtime', () => {
  it('sanitizes filenames', () => {
    expect(sanitizeFilename('my video (1).mp4')).toBe('my_video__1_.mp4');
  });

  it('redacts logs', () => {
    expect(redactForLog('secretpassword')).toBe('secr…word');
  });
});
