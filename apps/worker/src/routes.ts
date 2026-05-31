import { createReadStream } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
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

app.get('/health', (c) => c.json({ ok: true, service: 'clip-tools-worker' }));

app.post('/v1/probe', async (c) => {
  const form = await c.req.formData();
  const file = form.get('file') as File | null;
  if (!file) return c.json({ ok: false, error: 'file required' }, 400);
  const ctx = await createJobContext(file.name);
  try {
    await saveUpload(file, ctx.inputPath);
    const probe = await runFfprobe(ctx.inputPath);
    return c.json({ ok: true, data: probe, jobId: ctx.jobId });
  } finally {
    await scheduleCleanup(ctx.dir);
  }
});

app.post('/v1/clip', async (c) => {
  const form = await c.req.formData();
  const file = form.get('file') as File | null;
  const body = JSON.parse((form.get('payload') as string) || '{}') as TrimRequest;
  if (!file || !body.segments?.length) return c.json({ ok: false, error: 'file and segments required' }, 400);
  const ctx = await createJobContext(file.name);
  try {
    await saveUpload(file, ctx.inputPath);
    const out = join(ctx.outputDir, 'trimmed.mp4');
    await trimVideo(ctx.inputPath, out, body);
    return c.json({
      ok: true,
      jobId: ctx.jobId,
      artifacts: [{ filename: 'trimmed.mp4', mimeType: 'video/mp4', url: artifactUrl(ctx.jobId, 'trimmed.mp4') }],
    });
  } catch (e) {
    return c.json({ ok: false, error: e instanceof Error ? e.message : 'trim failed' }, 500);
  } finally {
    await scheduleCleanup(ctx.dir, 3600000);
  }
});

app.post('/v1/concat', async (c) => {
  const form = await c.req.formData();
  const files = form.getAll('files') as File[];
  const body = JSON.parse((form.get('payload') as string) || '{}') as ConcatRequest;
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
      artifacts: [{ filename: 'concat.mp4', mimeType: 'video/mp4', url: artifactUrl(ctx.jobId, 'concat.mp4') }],
    });
  } catch (e) {
    return c.json({ ok: false, error: e instanceof Error ? e.message : 'concat failed' }, 500);
  } finally {
    await scheduleCleanup(ctx.dir, 3600000);
  }
});

app.post('/v1/remux', async (c) => {
  const form = await c.req.formData();
  const file = form.get('file') as File | null;
  const body = JSON.parse((form.get('payload') as string) || '{}') as RemuxRequest;
  if (!file || !body.format) return c.json({ ok: false, error: 'file and format required' }, 400);
  const ctx = await createJobContext(file.name);
  try {
    await saveUpload(file, ctx.inputPath);
    const out = join(ctx.outputDir, `remux.${body.format}`);
    await remuxVideo(ctx.inputPath, out, body);
    return c.json({
      ok: true,
      jobId: ctx.jobId,
      artifacts: [{ filename: `remux.${body.format}`, mimeType: 'video/mp4', url: artifactUrl(ctx.jobId, `remux.${body.format}`) }],
    });
  } catch (e) {
    return c.json({ ok: false, error: e instanceof Error ? e.message : 'remux failed' }, 500);
  } finally {
    await scheduleCleanup(ctx.dir, 3600000);
  }
});

app.post('/v1/thumbnails', async (c) => {
  const form = await c.req.formData();
  const file = form.get('file') as File | null;
  const body = JSON.parse((form.get('payload') as string) || '{}') as ThumbnailRequest;
  if (!file) return c.json({ ok: false, error: 'file required' }, 400);
  const ctx = await createJobContext(file.name);
  try {
    await saveUpload(file, ctx.inputPath);
    const paths = await generateThumbnails(ctx.inputPath, ctx.outputDir, body);
    const artifacts = paths.map((p) => {
      const name = p.split('/').pop()!;
      return { filename: name, mimeType: 'image/jpeg', url: artifactUrl(ctx.jobId, name) };
    });
    return c.json({ ok: true, jobId: ctx.jobId, artifacts });
  } catch (e) {
    return c.json({ ok: false, error: e instanceof Error ? e.message : 'thumbnails failed' }, 500);
  } finally {
    await scheduleCleanup(ctx.dir, 3600000);
  }
});

app.post('/v1/contactsheet', async (c) => {
  const form = await c.req.formData();
  const file = form.get('file') as File | null;
  const body = JSON.parse((form.get('payload') as string) || '{"rows":3,"cols":4}') as ContactSheetRequest;
  if (!file) return c.json({ ok: false, error: 'file required' }, 400);
  const ctx = await createJobContext(file.name);
  try {
    await saveUpload(file, ctx.inputPath);
    const out = join(ctx.outputDir, 'contact.jpg');
    await generateContactSheet(ctx.inputPath, out, body);
    return c.json({
      ok: true,
      jobId: ctx.jobId,
      artifacts: [{ filename: 'contact.jpg', mimeType: 'image/jpeg', url: artifactUrl(ctx.jobId, 'contact.jpg') }],
    });
  } catch (e) {
    return c.json({ ok: false, error: e instanceof Error ? e.message : 'contactsheet failed' }, 500);
  } finally {
    await scheduleCleanup(ctx.dir, 3600000);
  }
});

app.post('/v1/sprites', async (c) => {
  const form = await c.req.formData();
  const file = form.get('file') as File | null;
  const body = JSON.parse((form.get('payload') as string) || '{"rows":5,"cols":10}') as SpriteSheetRequest;
  if (!file) return c.json({ ok: false, error: 'file required' }, 400);
  const ctx = await createJobContext(file.name);
  try {
    await saveUpload(file, ctx.inputPath);
    const { image, vtt } = await generateSpriteSheet(ctx.inputPath, ctx.outputDir, body);
    return c.json({
      ok: true,
      jobId: ctx.jobId,
      artifacts: [
        { filename: 'sprite.jpg', mimeType: 'image/jpeg', url: artifactUrl(ctx.jobId, 'sprite.jpg') },
        { filename: 'sprite.vtt', mimeType: 'text/vtt', url: artifactUrl(ctx.jobId, 'sprite.vtt') },
      ],
      paths: { image, vtt },
    });
  } catch (e) {
    return c.json({ ok: false, error: e instanceof Error ? e.message : 'sprites failed' }, 500);
  } finally {
    await scheduleCleanup(ctx.dir, 3600000);
  }
});

app.post('/v1/shots', async (c) => {
  const form = await c.req.formData();
  const file = form.get('file') as File | null;
  if (!file) return c.json({ ok: false, error: 'file required' }, 400);
  const ctx = await createJobContext(file.name);
  try {
    await saveUpload(file, ctx.inputPath);
    const shots = await detectShots(ctx.inputPath);
    return c.json({ ok: true, data: shots, jobId: ctx.jobId });
  } catch (e) {
    return c.json({ ok: false, error: e instanceof Error ? e.message : 'shots failed' }, 500);
  } finally {
    await scheduleCleanup(ctx.dir);
  }
});

app.post('/v1/edit-list', async (c) => {
  const form = await c.req.formData();
  const file = form.get('file') as File | null;
  const body = JSON.parse((form.get('payload') as string) || '{}') as EditListRequest;
  if (!file || !body.timeline?.tracks?.length) {
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
      artifacts: [{ filename: 'edit-list.mp4', mimeType: 'video/mp4', url: artifactUrl(ctx.jobId, 'edit-list.mp4') }],
    });
  } catch (e) {
    return c.json({ ok: false, error: e instanceof Error ? e.message : 'edit-list failed' }, 500);
  } finally {
    await scheduleCleanup(ctx.dir, 3600000);
  }
});

const artifactStore = new Map<string, string>();


// Store artifact paths in-memory keyed by job (simplified; production would use object storage)
export function registerArtifact(jobId: string, name: string, path: string): void {
  artifactStore.set(`${jobId}/${name}`, path);
}

app.get('/v1/artifacts/:jobId/:filename', async (c) => {
  const { jobId, filename } = c.req.param();
  const base = join('/tmp', 'clip-tools', jobId, 'out', decodeURIComponent(filename));
  try {
    return stream(c, async (s) => {
      const rs = createReadStream(base);
      for await (const chunk of rs) {
        await s.write(chunk);
      }
    });
  } catch {
    return c.json({ ok: false, error: 'artifact not found' }, 404);
  }
});

export { app, artifactStore };
