import { execFile } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';
import type {
  ContactSheetRequest,
  ProbeResult,
  RemuxRequest,
  ShotResult,
  SpriteSheetRequest,
  ThumbnailRequest,
  TrimRequest,
  VideoFormat,
} from '@clip-tools/shared-types';
import { fileExists } from './http-utils.js';

const exec = promisify(execFile);

export async function runFfmpeg(args: string[]): Promise<void> {
  await exec('ffmpeg', ['-hide_banner', '-y', ...args], {
    maxBuffer: 50 * 1024 * 1024,
    timeout: 9 * 60 * 1000,
  });
}

export async function runFfprobe(inputPath: string): Promise<ProbeResult> {
  const { stdout } = await exec(
    'ffprobe',
    [
      '-v',
      'quiet',
      '-print_format',
      'json',
      '-show_format',
      '-show_streams',
      '-show_chapters',
      inputPath,
    ],
    { maxBuffer: 10 * 1024 * 1024 },
  );
  const raw = JSON.parse(stdout) as {
    format?: { format_name?: string; duration?: string; size?: string; bit_rate?: string };
    streams?: Array<Record<string, unknown>>;
    chapters?: Array<{ id?: number; start_time?: string; end_time?: string; tags?: { title?: string } }>;
  };

  const streams = (raw.streams ?? []).map((s, index) => ({
    index,
    codec_type: String(s.codec_type ?? 'unknown'),
    codec_name: String(s.codec_name ?? 'unknown'),
    width: s.width as number | undefined,
    height: s.height as number | undefined,
    r_frame_rate: s.r_frame_rate as string | undefined,
    bit_rate: s.bit_rate as string | undefined,
    channels: s.channels as number | undefined,
    sample_rate: s.sample_rate as string | undefined,
  }));

  const chapters = (raw.chapters ?? []).map((c, id) => ({
    id: c.id ?? id,
    start: parseFloat(c.start_time ?? '0'),
    end: parseFloat(c.end_time ?? '0'),
    title: c.tags?.title,
  }));

  return {
    format: raw.format?.format_name ?? 'unknown',
    duration: parseFloat(raw.format?.duration ?? '0'),
    size: parseInt(raw.format?.size ?? '0', 10),
    bit_rate: raw.format?.bit_rate ? parseInt(raw.format.bit_rate, 10) : undefined,
    streams,
    chapters,
  };
}

function timeToSeconds(t: string): number {
  const parts = t.split(':').map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parseFloat(t);
}

function escapeConcatPath(p: string): string {
  return p.replace(/'/g, "'\\''");
}

async function pushIfExists(outputs: string[], path: string): Promise<void> {
  if (await fileExists(path)) outputs.push(path);
}

export async function trimVideo(
  inputPath: string,
  outputPath: string,
  req: TrimRequest,
): Promise<void> {
  const useCopy = req.copy !== false;

  if (req.segments.length === 1) {
    const seg = req.segments[0];
    const duration = timeToSeconds(seg.out) - timeToSeconds(seg.in);
    if (useCopy) {
      await runFfmpeg(['-ss', seg.in, '-i', inputPath, '-t', String(duration), '-c', 'copy', outputPath]);
    } else {
      await runFfmpeg(['-ss', seg.in, '-i', inputPath, '-t', String(duration), outputPath]);
    }
    return;
  }

  const parts: string[] = [];
  for (let i = 0; i < req.segments.length; i++) {
    const seg = req.segments[i];
    const part = outputPath.replace(/\.[^.]+$/, `_part${i}.mp4`);
    const duration = timeToSeconds(seg.out) - timeToSeconds(seg.in);
    const args = ['-ss', seg.in, '-i', inputPath, '-t', String(duration)];
    if (useCopy) args.push('-c', 'copy');
    args.push(part);
    await runFfmpeg(args);
    parts.push(part);
  }

  const listPath = outputPath + '.txt';
  const listContent = parts.map((p) => `file '${escapeConcatPath(p)}'`).join('\n');
  await writeFile(listPath, listContent);
  if (useCopy) {
    await runFfmpeg(['-f', 'concat', '-safe', '0', '-i', listPath, '-c', 'copy', outputPath]);
  } else {
    await runFfmpeg(['-f', 'concat', '-safe', '0', '-i', listPath, '-c:v', 'libx264', '-c:a', 'aac', outputPath]);
  }
}

export async function concatVideos(
  inputPaths: string[],
  outputPath: string,
  reencode: boolean,
): Promise<{ warned: boolean }> {
  const probes = await Promise.all(inputPaths.map(runFfprobe));
  const videoCodecs = probes.map((p) => p.streams.find((s) => s.codec_type === 'video')?.codec_name);
  const mismatch = new Set(videoCodecs.filter(Boolean)).size > 1;
  const listPath = outputPath + '.txt';
  const listContent = inputPaths.map((p) => `file '${escapeConcatPath(p)}'`).join('\n');
  await writeFile(listPath, listContent);

  if (mismatch && !reencode) {
    await runFfmpeg([
      '-f',
      'concat',
      '-safe',
      '0',
      '-i',
      listPath,
      '-c:v',
      'libx264',
      '-c:a',
      'aac',
      outputPath,
    ]);
    return { warned: true };
  }
  if (reencode || mismatch) {
    await runFfmpeg(['-f', 'concat', '-safe', '0', '-i', listPath, '-c:v', 'libx264', '-c:a', 'aac', outputPath]);
    return { warned: mismatch };
  }
  await runFfmpeg(['-f', 'concat', '-safe', '0', '-i', listPath, '-c', 'copy', outputPath]);
  return { warned: false };
}

const FORMAT_MAP: Record<VideoFormat, string> = {
  mp4: 'mp4',
  mkv: 'matroska',
  webm: 'webm',
  mov: 'mov',
};

export async function remuxVideo(
  inputPath: string,
  outputPath: string,
  req: RemuxRequest,
): Promise<{ transcoded: boolean }> {
  const fmt = FORMAT_MAP[req.format];

  if (req.format === 'webm') {
    await runFfmpeg([
      '-i',
      inputPath,
      '-c:v',
      'libvpx-vp9',
      '-crf',
      '30',
      '-b:v',
      '0',
      '-c:a',
      'libopus',
      '-f',
      'webm',
      outputPath,
    ]);
    return { transcoded: true };
  }

  try {
    await runFfmpeg(['-i', inputPath, '-c', 'copy', '-f', fmt, outputPath]);
    return { transcoded: false };
  } catch {
    await runFfmpeg(['-i', inputPath, '-c:v', 'libx264', '-c:a', 'aac', '-f', fmt, outputPath]);
    return { transcoded: true };
  }
}

export async function generateThumbnails(
  inputPath: string,
  outputDir: string,
  req: ThumbnailRequest,
): Promise<{ paths: string[]; warned?: boolean }> {
  const outputs: string[] = [];
  let warned = false;
  const probe = await runFfprobe(inputPath);

  if (req.at) {
    const out = join(outputDir, 'thumb_at.jpg');
    await runFfmpeg(['-ss', req.at, '-i', inputPath, '-frames:v', '1', '-q:v', '2', out]);
    await pushIfExists(outputs, out);
  }

  if (req.everyMs) {
    const outPattern = join(outputDir, 'thumb_strip_%03d.jpg');
    const fps = 1000 / req.everyMs;
    const maxFrames = Math.min(60, Math.max(1, Math.ceil(probe.duration * fps)));
    await runFfmpeg([
      '-i',
      inputPath,
      '-vf',
      `fps=${fps}`,
      '-frames:v',
      String(maxFrames),
      '-q:v',
      '2',
      outPattern,
    ]);
    for (let i = 1; i <= maxFrames; i++) {
      const p = join(outputDir, `thumb_strip_${String(i).padStart(3, '0')}.jpg`);
      if (await fileExists(p)) outputs.push(p);
      else break;
    }
  }

  if (req.sceneAware) {
    const out = join(outputDir, 'thumb_scene.jpg');
    let sceneOk = false;
    try {
      await runFfmpeg([
        '-i',
        inputPath,
        '-vf',
        "select='gt(scene,0.25)',scale=iw:ih",
        '-frames:v',
        '1',
        '-q:v',
        '2',
        out,
      ]);
      sceneOk = await fileExists(out);
    } catch {
      sceneOk = false;
    }
    if (!sceneOk) {
      await runFfmpeg(['-ss', '0', '-i', inputPath, '-frames:v', '1', '-q:v', '2', out]);
      warned = true;
    }
    await pushIfExists(outputs, out);
  }

  if (!req.at && !req.everyMs && !req.sceneAware) {
    const out = join(outputDir, 'thumb_default.jpg');
    await runFfmpeg(['-ss', '0', '-i', inputPath, '-frames:v', '1', '-q:v', '2', out]);
    await pushIfExists(outputs, out);
  }

  return { paths: outputs, warned: warned || undefined };
}

export async function generateContactSheet(
  inputPath: string,
  outputPath: string,
  req: ContactSheetRequest,
): Promise<void> {
  const total = req.rows * req.cols;
  const scale = req.scale ?? 320;
  const probe = await runFfprobe(inputPath);
  const interval = Math.max(0.5, probe.duration / total);
  await runFfmpeg([
    '-i',
    inputPath,
    '-vf',
    `fps=1/${interval},scale=${scale}:-1,tile=${req.cols}x${req.rows}:padding=4:color=white,drawtext=fontsize=14:fontcolor=black:x=4:y=4:text='%{pts\\:hms}'`,
    '-frames:v',
    '1',
    outputPath,
  ]);
}

export async function generateSpriteSheet(
  inputPath: string,
  outputDir: string,
  req: SpriteSheetRequest,
): Promise<{ image: string; vtt: string }> {
  const interval = Math.max(0.5, req.intervalSec ?? 2);
  const probe = await runFfprobe(inputPath);
  const duration = probe.duration || interval;
  const maxCells = Math.max(1, Math.min(req.rows * req.cols, Math.ceil(duration / interval)));
  const cols = Math.min(req.cols, maxCells);
  const rows = Math.min(req.rows, Math.ceil(maxCells / cols));
  const frameCount = Math.min(maxCells, rows * cols);

  const videoStream = probe.streams.find((s) => s.codec_type === 'video');
  const w = videoStream?.width ?? 320;
  const h = videoStream?.height ?? 180;
  const thumbW = Math.max(1, Math.floor(w / cols));
  const thumbH = Math.max(1, Math.floor(h * (thumbW / w)));
  const image = join(outputDir, 'sprite.jpg');
  const vtt = join(outputDir, 'sprite.vtt');

  const sampleInterval = Math.max(0.25, duration / frameCount);
  await runFfmpeg([
    '-i',
    inputPath,
    '-vf',
    `fps=1/${sampleInterval},scale=${thumbW}:-1,tile=${cols}x${rows}`,
    '-frames:v',
    '1',
    image,
  ]);

  let vttContent = 'WEBVTT\n\n';
  for (let i = 0; i < frameCount; i++) {
    const start = i * interval;
    const end = Math.min(start + interval, duration);
    if (start >= duration) break;
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = col * thumbW;
    const y = row * thumbH;
    vttContent += `${formatVttTime(start)} --> ${formatVttTime(end)}\n`;
    vttContent += `sprite.jpg#xywh=${x},${y},${thumbW},${thumbH}\n\n`;
  }
  await writeFile(vtt, vttContent);
  return { image, vtt };
}

function formatVttTime(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = (sec % 60).toFixed(3);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${s.padStart(6, '0')}`;
}

export async function detectShots(inputPath: string): Promise<ShotResult[]> {
  const { stderr } = await exec(
    'ffmpeg',
    [
      '-i',
      inputPath,
      '-filter:v',
      'select=gt(scene\\,0.35),showinfo',
      '-f',
      'null',
      '-',
    ],
    { maxBuffer: 50 * 1024 * 1024 },
  ).catch((e: { stderr?: string }) => ({ stderr: e.stderr ?? '' }));

  const output = stderr ?? '';
  const results: ShotResult[] = [];
  const regex = /pts_time:([0-9.]+)/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(output)) !== null) {
    results.push({
      timestamp: parseFloat(match[1]),
      confidence: 0.85,
    });
  }
  return results;
}

export async function renderEditList(
  inputPath: string,
  outputPath: string,
  clips: Array<{ start?: number; length?: number; trim?: number }>,
): Promise<void> {
  if (clips.length === 1) {
    const c = clips[0];
    const start = c.trim ?? c.start ?? 0;
    const duration = c.length ?? 10;
    await runFfmpeg(['-ss', String(start), '-i', inputPath, '-t', String(duration), '-c', 'copy', outputPath]);
    return;
  }
  const parts: string[] = [];
  for (let i = 0; i < clips.length; i++) {
    const c = clips[i];
    const part = outputPath.replace(/\.[^.]+$/, `_edit${i}.mp4`);
    const start = c.trim ?? c.start ?? 0;
    const duration = c.length ?? 5;
    await runFfmpeg(['-ss', String(start), '-i', inputPath, '-t', String(duration), '-c', 'copy', part]);
    parts.push(part);
  }
  const listPath = outputPath + '.txt';
  await writeFile(listPath, parts.map((p) => `file '${escapeConcatPath(p)}'`).join('\n'));
  await runFfmpeg(['-f', 'concat', '-safe', '0', '-i', listPath, '-c', 'copy', outputPath]);
}
