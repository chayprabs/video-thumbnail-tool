import { createReadStream } from 'node:fs';
import { readFile, stat, writeFile } from 'node:fs/promises';
import { basename, join, extname } from 'node:path';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { stream } from 'hono/streaming';
import type {
  ConcatRequest,
  ContactSheetRequest,
  EditListRequest,
  RemuxRequest,
  SpriteSheetRequest,
  ThumbnailRequest,
  TrimRequest,
} from '@clip-tools/shared-types';
import {
  assertFileSize,
  createJobContext,
  scheduleCleanup,
} from '@clip-tools/shared-worker-runtime';
import {
  concatVideos,
  detectShots,
  generateContactSheet,
  generateSpriteSheet,
  generateThumbnails,
  remuxVideo,
  renderEditList,
  runFfprobe,
  trimVideo,
} from './ffmpeg.js';
import {
  isResponse,
  mimeForFilename,
  parsePayload,
  parseRemuxFormat,
  readMultipart,
  resolveArtifactPath,
  sanitizeError,
  validateTrimRequest,
} from './http-utils.js';

const app = new Hono();

app.use('*', cors({ origin: '*', allowMethods: ['GET', 'POST', 'OPTIONS'] }));

async function saveUpload(file: File, dest: string): Promise<void> {
  const buf = Buffer.from(await file.arrayBuffer());
  await writeFile(dest, buf);
  await assertFileSize(dest);
}

function artifactUrl(jobId: string, name: string): string {
  return `/v1/artifacts/${jobId}/${encodeURIComponent(name)}`;
}

function toArtifacts(jobId: string, filenames: string[]) {
  return filenames.map((filename) => ({
    filename,
    mimeType: mimeForFilename(filename),
    url: artifactUrl(jobId, filename),
  }));
}

app.get('/health', (c) => c.json({ ok: true, service: 'clip-tools-worker' }));
app.get('/v1/health', (c) => c.json({ ok: true, service: 'clip-tools-worker' }));

app.post('/v1/probe', async (c) => {
  const form = await readMultipart(c);
  if (isResponse(form)) return form;
  const file = form.get('file') as File | null;
  if (!file || file.size === 0) return c.json({ ok: false, error: 'file required' }, 400);
  const ctx = await createJobContext(file.name);
  try {
    await saveUpload(file, ctx.inputPath);
    const probe = await runFfprobe(ctx.inputPath);
    return c.json({ ok: true, data: probe, jobId: ctx.jobId });
  } catch (e) {
    return c.json({ ok: false, error: sanitizeError(e) }, 500);
  } finally {
    await scheduleCleanup(ctx.dir);
  }
});

app.post('/v1/clip', async (c) => {
  const form = await readMultipart(c);
  if (isResponse(form)) return form;
  const file = form.get('file') as File | null;
  const body = parsePayload<TrimRequest>(form.get('payload'));
  if (isResponse(body)) return body;
  const trimErr = validateTrimRequest(body);
  if (trimErr) return c.json({ ok: false, error: trimErr }, 400);
  if (!file || file.size === 0) return c.json({ ok: false, error: 'file and segments required' }, 400);
  const ctx = await createJobContext(file.name);
  try {
    await saveUpload(file, ctx.inputPath);
    const out = join(ctx.outputDir, 'trimmed.mp4');
    await trimVideo(ctx.inputPath, out, body);
    return c.json({
      ok: true,
      jobId: ctx.jobId,
      artifacts: toArtifacts(ctx.jobId, ['trimmed.mp4']),
    });
  } catch (e) {
    return c.json({ ok: false, error: sanitizeError(e) }, 500);
  } finally {
    await scheduleCleanup(ctx.dir, 3600000);
  }
});

app.post('/v1/concat', async (c) => {
  const form = await readMultipart(c);
  if (isResponse(form)) return form;
  const files = form.getAll('files') as File[];
  const body = parsePayload<ConcatRequest>(form.get('payload'));
  if (isResponse(body)) return body;
  if (files.length < 2) return c.json({ ok: false, error: 'at least 2 files required' }, 400);
  const ctx = await createJobContext('concat.mp4');
  try {
    const paths: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const p = join(ctx.dir, `input_${i}${extname(files[i].name) || '.mp4'}`);
      await saveUpload(files[i], p);
      paths.push(p);
    }
    const out = join(ctx.outputDir, 'concat.mp4');
    const { warned } = await concatVideos(paths, out, !!body.reencode);
    return c.json({
      ok: true,
      warned,
      jobId: ctx.jobId,
      artifacts: toArtifacts(ctx.jobId, ['concat.mp4']),
    });
  } catch (e) {
    return c.json({ ok: false, error: sanitizeError(e) }, 500);
  } finally {
    await scheduleCleanup(ctx.dir, 3600000);
  }
});

app.post('/v1/remux', async (c) => {
  const form = await readMultipart(c);
  if (isResponse(form)) return form;
  const file = form.get('file') as File | null;
  const body = parsePayload<RemuxRequest>(form.get('payload'));
  if (isResponse(body)) return body;
  const format = parseRemuxFormat(body.format);
  if (!format) return c.json({ ok: false, error: 'format must be mp4, mkv, webm, or mov' }, 400);
  if (!file || file.size === 0) return c.json({ ok: false, error: 'file and format required' }, 400);
  const ctx = await createJobContext(file.name);
  try {
    await saveUpload(file, ctx.inputPath);
    const filename = `remux.${format}`;
    const out = join(ctx.outputDir, filename);
    const { transcoded } = await remuxVideo(ctx.inputPath, out, { format });
    return c.json({
      ok: true,
      transcoded,
      jobId: ctx.jobId,
      artifacts: toArtifacts(ctx.jobId, [filename]),
    });
  } catch (e) {
    return c.json({ ok: false, error: sanitizeError(e) }, 500);
  } finally {
    await scheduleCleanup(ctx.dir, 3600000);
  }
});

app.post('/v1/thumbnails', async (c) => {
  const form = await readMultipart(c);
  if (isResponse(form)) return form;
  const file = form.get('file') as File | null;
  const body = parsePayload<ThumbnailRequest>(form.get('payload'));
  if (isResponse(body)) return body;
  if (!file || file.size === 0) return c.json({ ok: false, error: 'file required' }, 400);
  const ctx = await createJobContext(file.name);
  try {
    await saveUpload(file, ctx.inputPath);
    const { paths, warned } = await generateThumbnails(ctx.inputPath, ctx.outputDir, body);
    if (paths.length === 0) {
      return c.json({ ok: false, error: 'no thumbnails generated' }, 422);
    }
    const artifacts = paths.map((p) => {
      const name = p.split('/').pop()!;
      return { filename: name, mimeType: mimeForFilename(name), url: artifactUrl(ctx.jobId, name) };
    });
    return c.json({ ok: true, jobId: ctx.jobId, warned, artifacts });
  } catch (e) {
    return c.json({ ok: false, error: sanitizeError(e) }, 500);
  } finally {
    await scheduleCleanup(ctx.dir, 3600000);
  }
});

app.post('/v1/contactsheet', async (c) => {
  const form = await readMultipart(c);
  if (isResponse(form)) return form;
  const file = form.get('file') as File | null;
  const body = parsePayload<ContactSheetRequest>(form.get('payload'));
  if (isResponse(body)) return body;
  const rows = body.rows ?? 3;
  const cols = body.cols ?? 4;
  if (!file || file.size === 0) return c.json({ ok: false, error: 'file required' }, 400);
  const ctx = await createJobContext(file.name);
  try {
    await saveUpload(file, ctx.inputPath);
    const out = join(ctx.outputDir, 'contact.jpg');
    await generateContactSheet(ctx.inputPath, out, { rows, cols, scale: body.scale });
    return c.json({
      ok: true,
      jobId: ctx.jobId,
      artifacts: toArtifacts(ctx.jobId, ['contact.jpg']),
    });
  } catch (e) {
    return c.json({ ok: false, error: sanitizeError(e) }, 500);
  } finally {
    await scheduleCleanup(ctx.dir, 3600000);
  }
});

app.post('/v1/sprites', async (c) => {
  const form = await readMultipart(c);
  if (isResponse(form)) return form;
  const file = form.get('file') as File | null;
  const body = parsePayload<SpriteSheetRequest>(form.get('payload'));
  if (isResponse(body)) return body;
  const rows = body.rows ?? 5;
  const cols = body.cols ?? 10;
  if (!file || file.size === 0) return c.json({ ok: false, error: 'file required' }, 400);
  const ctx = await createJobContext(file.name);
  try {
    await saveUpload(file, ctx.inputPath);
    await generateSpriteSheet(ctx.inputPath, ctx.outputDir, {
      rows,
      cols,
      intervalSec: body.intervalSec,
    });
    return c.json({
      ok: true,
      jobId: ctx.jobId,
      artifacts: toArtifacts(ctx.jobId, ['sprite.jpg', 'sprite.vtt']),
    });
  } catch (e) {
    return c.json({ ok: false, error: sanitizeError(e) }, 500);
  } finally {
    await scheduleCleanup(ctx.dir, 3600000);
  }
});

app.post('/v1/shots', async (c) => {
  const form = await readMultipart(c);
  if (isResponse(form)) return form;
  const file = form.get('file') as File | null;
  if (!file || file.size === 0) return c.json({ ok: false, error: 'file required' }, 400);
  const ctx = await createJobContext(file.name);
  try {
    await saveUpload(file, ctx.inputPath);
    const shots = await detectShots(ctx.inputPath);
    return c.json({ ok: true, data: shots, jobId: ctx.jobId });
  } catch (e) {
    return c.json({ ok: false, error: sanitizeError(e) }, 500);
  } finally {
    await scheduleCleanup(ctx.dir);
  }
});

app.post('/v1/edit-list', async (c) => {
  const form = await readMultipart(c);
  if (isResponse(form)) return form;
  const file = form.get('file') as File | null;
  const body = parsePayload<EditListRequest>(form.get('payload'));
  if (isResponse(body)) return body;
  if (!file || file.size === 0) return c.json({ ok: false, error: 'file and timeline required' }, 400);
  if (!body.timeline?.tracks?.length) {
    return c.json({ ok: false, error: 'file and timeline required' }, 400);
  }
  const ctx = await createJobContext(file.name);
  try {
    await saveUpload(file, ctx.inputPath);
    const clips = body.timeline.tracks.flatMap((t) => t.clips);
    const out = join(ctx.outputDir, 'edit-list.mp4');
    await renderEditList(ctx.inputPath, out, clips);
    return c.json({
      ok: true,
      jobId: ctx.jobId,
      artifacts: toArtifacts(ctx.jobId, ['edit-list.mp4']),
    });
  } catch (e) {
    return c.json({ ok: false, error: sanitizeError(e) }, 500);
  } finally {
    await scheduleCleanup(ctx.dir, 3600000);
  }
});

app.get('/v1/artifacts/:jobId/:filename', async (c) => {
  const { jobId, filename } = c.req.param();
  const safePath = await resolveArtifactPath(jobId, filename);
  if (!safePath) {
    return c.json({ ok: false, error: 'artifact not found' }, 404);
  }
  const safeName = basename(decodeURIComponent(filename));
  const mime = mimeForFilename(safeName);
  const fileStat = await stat(safePath);

  if (fileStat.size <= 200 * 1024 * 1024) {
    const buf = await readFile(safePath);
    c.header('Content-Type', mime);
    c.header('Content-Disposition', `attachment; filename="${safeName}"`);
    return c.body(buf);
  }

  c.header('Content-Type', mime);
  c.header('Content-Disposition', `attachment; filename="${safeName}"`);
  return stream(c, async (s) => {
    const rs = createReadStream(safePath);
    for await (const chunk of rs) {
      await s.write(chunk);
    }
  });
});

export { app };
