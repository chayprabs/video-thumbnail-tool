import { execFile } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { beforeAll, describe, expect, it } from 'vitest';

const exec = promisify(execFile);
const BASE = process.env.WORKER_URL ?? 'http://localhost:8787';
const FIXTURE = join(import.meta.dirname, '../../../fixtures/sample.mp4');

async function postFile(
  endpoint: string,
  fields: Record<string, string>,
  fileField = 'file',
): Promise<Response> {
  const form = new FormData();
  const buf = await import('node:fs/promises').then((fs) => fs.readFile(FIXTURE));
  form.append(fileField, new Blob([buf]), 'sample.mp4');
  for (const [k, v] of Object.entries(fields)) form.append(k, v);
  return fetch(`${BASE}${endpoint}`, { method: 'POST', body: form });
}

describe('API integration (live worker)', () => {
  beforeAll(async () => {
    const health = await fetch(`${BASE}/health`);
    if (!health.ok) {
      throw new Error(`Worker not reachable at ${BASE}. Start with: pnpm --filter @clip-tools/worker start`);
    }
    await mkdir(join(import.meta.dirname, '../../../fixtures'), { recursive: true }).catch(() => {});
    try {
      await exec('ffmpeg', [
        '-hide_banner',
        '-y',
        '-f',
        'lavfi',
        '-i',
        'testsrc=duration=5:size=320x240:rate=24',
        '-c:v',
        'libx264',
        '-pix_fmt',
        'yuv420p',
        FIXTURE,
      ]);
    } catch {
      /* fixture may exist */
    }
  });

  it('health', async () => {
    const r = await fetch(`${BASE}/health`);
    expect(r.status).toBe(200);
  });

  it('probe', async () => {
    const r = await postFile('/v1/probe', {});
    const j = (await r.json()) as { ok: boolean; data: { duration: number } };
    expect(r.status).toBe(200);
    expect(j.ok).toBe(true);
    expect(j.data.duration).toBeGreaterThan(0);
  });

  it('clip', async () => {
    const r = await postFile('/v1/clip', {
      payload: JSON.stringify({ segments: [{ in: '00:00:00', out: '00:00:02' }], copy: true }),
    });
    const j = (await r.json()) as { ok: boolean };
    expect(j.ok).toBe(true);
  });

  it('thumbnails sceneAware', async () => {
    const r = await postFile('/v1/thumbnails', { payload: JSON.stringify({ sceneAware: true }) });
    const j = (await r.json()) as { ok: boolean; artifacts: unknown[] };
    expect(j.ok).toBe(true);
    expect(j.artifacts.length).toBeGreaterThan(0);
  });

  it('shots', async () => {
    const r = await postFile('/v1/shots', {});
    const j = (await r.json()) as { ok: boolean; data: unknown[] };
    expect(j.ok).toBe(true);
    expect(Array.isArray(j.data)).toBe(true);
  });

  it('invalid json returns 400', async () => {
    const form = new FormData();
    const buf = await import('node:fs/promises').then((fs) => fs.readFile(FIXTURE));
    form.append('file', new Blob([buf]), 'sample.mp4');
    form.append('payload', 'not-json');
    const r = await fetch(`${BASE}/v1/clip`, { method: 'POST', body: form });
    expect(r.status).toBe(400);
  });
});
