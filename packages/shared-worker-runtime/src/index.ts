import { randomUUID } from 'node:crypto';
import { mkdir, rm, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const DEFAULT_TTL_MS = 60 * 60 * 1000;
const MAX_FILE_BYTES = 500 * 1024 * 1024;
const MAX_WALL_MS = 10 * 60 * 1000;

export interface JobContext {
  jobId: string;
  dir: string;
  inputPath: string;
  outputDir: string;
}

export async function createJobContext(filename: string): Promise<JobContext> {
  const jobId = randomUUID();
  const dir = join(tmpdir(), 'clip-tools', jobId);
  const outputDir = join(dir, 'out');
  await mkdir(outputDir, { recursive: true });
  const inputPath = join(dir, sanitizeFilename(filename));
  return { jobId, dir, inputPath, outputDir };
}

export function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 200) || 'input.bin';
}

export async function cleanupJob(dir: string): Promise<void> {
  await rm(dir, { recursive: true, force: true });
}

export async function scheduleCleanup(dir: string, ttlMs = DEFAULT_TTL_MS): Promise<void> {
  setTimeout(() => {
    void cleanupJob(dir);
  }, ttlMs);
}

export async function assertFileSize(path: string): Promise<void> {
  const s = await stat(path);
  if (s.size > MAX_FILE_BYTES) {
    throw new Error(`File exceeds maximum size of ${MAX_FILE_BYTES} bytes`);
  }
}

export function getMaxWallMs(): number {
  return MAX_WALL_MS;
}

export function redactForLog(value: string): string {
  if (value.length <= 8) return '[redacted]';
  return `${value.slice(0, 4)}…${value.slice(-4)}`;
}
