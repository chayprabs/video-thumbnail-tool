import { execFile } from 'node:child_process';
import { mkdir, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { detectShots, runFfprobe, trimVideo } from './ffmpeg.js';

const exec = promisify(execFile);
const FIXTURE_DIR = join(dirname(fileURLToPath(import.meta.url)), '../../../fixtures');

async function ensureSampleVideo(): Promise<string> {
  await mkdir(FIXTURE_DIR, { recursive: true });
  const samplePath = join(FIXTURE_DIR, 'sample.mp4');
  try {
    await exec('ffmpeg', [
      '-hide_banner',
      '-y',
      '-f',
      'lavfi',
      '-i',
      'testsrc=duration=5:size=320x240:rate=24',
      '-f',
      'lavfi',
      '-i',
      'sine=frequency=440:duration=5',
      '-c:v',
      'libx264',
      '-c:a',
      'aac',
      '-shortest',
      samplePath,
    ]);
  } catch {
    // sample may already exist
  }
  return samplePath;
}

describe('ffmpeg integration', () => {
  let samplePath: string;
  let outDir: string;

  beforeAll(async () => {
    samplePath = await ensureSampleVideo();
    outDir = join(FIXTURE_DIR, 'out');
    await mkdir(outDir, { recursive: true });
  });

  afterAll(async () => {
    await rm(outDir, { recursive: true, force: true }).catch(() => {});
  });

  it('probes video metadata', async () => {
    const probe = await runFfprobe(samplePath);
    expect(probe.duration).toBeGreaterThan(0);
    expect(probe.streams.some((s) => s.codec_type === 'video')).toBe(true);
  });

  it('trims with stream copy', async () => {
    const out = join(outDir, 'trim_copy.mp4');
    await trimVideo(samplePath, out, {
      segments: [{ in: '00:00:01', out: '00:00:03' }],
      copy: true,
    });
    const probe = await runFfprobe(out);
    expect(probe.duration).toBeGreaterThan(0);
    expect(probe.duration).toBeLessThan(3);
  });

  it('detects shots', async () => {
    const shots = await detectShots(samplePath);
    expect(shots.length).toBeGreaterThan(0);
  });
});
