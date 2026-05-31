import { describe, expect, it } from 'vitest';
import { resolveArtifactPath } from './http-utils.js';

describe('resolveArtifactPath', () => {
  it('rejects path traversal in filename', async () => {
    const jobId = '00000000-0000-4000-8000-000000000001';
    const result = await resolveArtifactPath(jobId, '..%2F..%2F..%2Fetc%2Fpasswd');
    expect(result).toBeNull();
  });

  it('rejects invalid job id', async () => {
    const result = await resolveArtifactPath('not-a-uuid', 'file.mp4');
    expect(result).toBeNull();
  });
});
