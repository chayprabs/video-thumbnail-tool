import { NextResponse } from 'next/server';

const MAX_BYTES = 200 * 1024 * 1024;
const ALLOWED_PREFIXES = ['video/', 'application/octet-stream', 'application/mp4'];

export async function POST(request: Request) {
  let url: string;
  try {
    const body = (await request.json()) as { url?: string };
    url = body.url?.trim() ?? '';
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid JSON body' }, { status: 400 });
  }

  if (!url) {
    return NextResponse.json({ ok: false, error: 'url required' }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid URL' }, { status: 400 });
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return NextResponse.json({ ok: false, error: 'only http(s) URLs supported' }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(120_000),
      headers: { 'User-Agent': 'ClipTools/1.0' },
      redirect: 'follow',
    });

    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: `failed to fetch URL (${res.status})` },
        { status: 400 },
      );
    }

    const contentType = res.headers.get('content-type')?.split(';')[0]?.trim() ?? '';
    if (
      contentType &&
      !ALLOWED_PREFIXES.some((p) => contentType.startsWith(p.replace('*', ''))) &&
      !contentType.includes('video')
    ) {
      return NextResponse.json(
        { ok: false, error: 'URL does not appear to be a video file' },
        { status: 400 },
      );
    }

    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length > MAX_BYTES) {
      return NextResponse.json(
        { ok: false, error: `file exceeds ${MAX_BYTES / (1024 * 1024)}MB limit` },
        { status: 413 },
      );
    }

    const name = decodeURIComponent(parsed.pathname.split('/').pop() || 'imported.mp4');
    const safeName = name.match(/\.(mp4|mkv|webm|mov)$/i) ? name : `${name}.mp4`;

    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': contentType || 'video/mp4',
        'X-Filename': safeName,
        'Cache-Control': 'no-store',
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'fetch failed';
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }
}
