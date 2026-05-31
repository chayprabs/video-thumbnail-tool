export async function importVideoFromUrl(url: string): Promise<File> {
  const res = await fetch('/api/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error ?? 'Import failed');
  }

  const filename = res.headers.get('X-Filename') ?? 'imported.mp4';
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type || 'video/mp4' });
}
