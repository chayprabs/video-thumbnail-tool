import type { ApiResponse, ProbeResult, ShotResult } from '@clip-tools/shared-types';

const API_BASE = '/api';

export async function apiPost<T>(
  endpoint: string,
  file: File | File[],
  payload?: unknown,
): Promise<ApiResponse<T> & { jobId?: string; artifacts?: Array<{ filename: string; mimeType: string; url: string }>; warned?: boolean }> {
  const form = new FormData();
  if (Array.isArray(file)) {
    file.forEach((f) => form.append('files', f));
  } else {
    form.append('file', file);
  }
  if (payload) form.append('payload', JSON.stringify(payload));

  const res = await fetch(`${API_BASE}${endpoint}`, { method: 'POST', body: form });
  return res.json();
}

export async function probeVideo(file: File): Promise<ProbeResult> {
  const res = await apiPost<ProbeResult>('/v1/probe', file);
  if (!res.ok || !res.data) throw new Error(res.error ?? 'Probe failed');
  return res.data as ProbeResult;
}

export async function detectShots(file: File): Promise<ShotResult[]> {
  const res = await apiPost<ShotResult[]>('/v1/shots', file);
  if (!res.ok || !res.data) throw new Error(res.error ?? 'Shot detection failed');
  return res.data as ShotResult[];
}

export function artifactDownloadUrl(url: string): string {
  if (url.startsWith('http')) return url;
  return `${API_BASE}${url.replace('/v1', '/v1')}`;
}
