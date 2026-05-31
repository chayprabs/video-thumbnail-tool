import { access, stat } from 'node:fs/promises';
import { extname } from 'node:path';
import type { Context } from 'hono';
import type { VideoFormat } from '@clip-tools/shared-types';
import type { TrimRequest } from '@clip-tools/shared-types';

export async function readMultipart(c: Context): Promise<FormData | Response> {
  try {
    return await c.req.formData();
  } catch {
    return c.json({ ok: false, error: 'multipart form data required' }, 400);
  }
}

export function parsePayload<T>(raw: string | File | null): T | Response {
  const str = typeof raw === 'string' ? raw : raw ? String(raw) : '';
  if (!str.trim()) return {} as T;
  try {
    return JSON.parse(str) as T;
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'invalid JSON payload' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export function isResponse(v: unknown): v is Response {
  return v instanceof Response;
}

const VIDEO_FORMATS = new Set<VideoFormat>(['mp4', 'mkv', 'webm', 'mov']);

export function parseRemuxFormat(format: unknown): VideoFormat | null {
  if (typeof format === 'string' && VIDEO_FORMATS.has(format as VideoFormat)) {
    return format as VideoFormat;
  }
  return null;
}

export function mimeForFilename(filename: string): string {
  const ext = extname(filename).toLowerCase();
  const map: Record<string, string> = {
    '.mp4': 'video/mp4',
    '.mkv': 'video/x-matroska',
    '.webm': 'video/webm',
    '.mov': 'video/quicktime',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.vtt': 'text/vtt',
  };
  return map[ext] ?? 'application/octet-stream';
}

export function sanitizeError(e: unknown): string {
  if (!(e instanceof Error)) return 'operation failed';
  const msg = e.message;
  if (msg.includes('ffmpeg') || msg.includes('Command failed')) {
    const lines = msg.split('\n').filter((l) => !l.includes('libncurses'));
    const last = lines.filter((l) => l.startsWith('Error') || l.includes('Invalid')).pop();
    return last ?? 'FFmpeg processing failed';
  }
  return msg;
}

function timeToSeconds(t: string): number {
  const parts = t.split(':').map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parseFloat(t);
}

export function validateTrimRequest(body: TrimRequest): string | null {
  if (!body.segments?.length) return 'segments required';
  for (const seg of body.segments) {
    const start = timeToSeconds(seg.in);
    const end = timeToSeconds(seg.out);
    if (!Number.isFinite(start) || !Number.isFinite(end)) return 'invalid timecode';
    if (end <= start) return 'out time must be after in time';
  }
  return null;
}

export async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    const s = await stat(path);
    return s.size > 0;
  } catch {
    return false;
  }
}
