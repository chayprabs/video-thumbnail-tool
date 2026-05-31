'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ProbeResult, ShotResult, TrimSegment } from '@clip-tools/shared-types';
import { apiPost, artifactDownloadUrl, probeVideo } from '@/lib/api';
import { importVideoFromUrl } from '@/lib/import-url';
import { SAMPLE_VIDEOS, fetchSampleFile } from '@/lib/samples';
import { ProbeDetails } from './ProbeDetails';
import { VideoScrubber } from './VideoScrubber';

export type Operation =
  | 'trim'
  | 'concat'
  | 'remux'
  | 'thumbnail'
  | 'contactsheet'
  | 'sprite'
  | 'shots'
  | 'editlist';

const TABS: { id: Operation; label: string }[] = [
  { id: 'trim', label: 'Trim' },
  { id: 'concat', label: 'Concat' },
  { id: 'remux', label: 'Remux' },
  { id: 'thumbnail', label: 'Thumbnail' },
  { id: 'contactsheet', label: 'Contact Sheet' },
  { id: 'sprite', label: 'Sprite' },
  { id: 'shots', label: 'Shots' },
  { id: 'editlist', label: 'JSON Edit' },
];

export function Playground({ defaultTab = 'trim' }: { defaultTab?: Operation }) {
  const [tab, setTab] = useState<Operation>(defaultTab);
  const [file, setFile] = useState<File | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [probe, setProbe] = useState<ProbeResult | null>(null);
  const [probing, setProbing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [results, setResults] = useState<Array<{ name: string; url: string; type: string }>>([]);
  const [jsonOut, setJsonOut] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  const [trimIn, setTrimIn] = useState('00:00:00');
  const [trimOut, setTrimOut] = useState('00:00:10');
  const [segments, setSegments] = useState<TrimSegment[]>([]);
  const [multiTrim, setMultiTrim] = useState(false);
  const [streamCopy, setStreamCopy] = useState(true);
  const [concatReencode, setConcatReencode] = useState(false);
  const [remuxFormat, setRemuxFormat] = useState<'mp4' | 'mkv' | 'webm' | 'mov'>('mp4');
  const [thumbAt, setThumbAt] = useState('00:00:01');
  const [thumbEveryMs, setThumbEveryMs] = useState(0);
  const [sceneAwareThumb, setSceneAwareThumb] = useState(false);
  const [contactRows, setContactRows] = useState(3);
  const [contactCols, setContactCols] = useState(4);
  const [contactScale, setContactScale] = useState(240);
  const [spriteRows, setSpriteRows] = useState(5);
  const [spriteCols, setSpriteCols] = useState(10);
  const [spriteInterval, setSpriteInterval] = useState(2);
  const [editJson, setEditJson] = useState(
    JSON.stringify(
      {
        timeline: {
          tracks: [{ clips: [{ asset: 'main', start: 0, length: 10 }] }],
        },
      },
      null,
      2,
    ),
  );

  useEffect(() => {
    setTab(defaultTab);
  }, [defaultTab]);

  useEffect(() => {
    if (!file || !videoRef.current) return;
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    videoRef.current.src = url;
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [file]);

  const onFile = useCallback(async (f: File) => {
    setFile(f);
    setError(null);
    setResults([]);
    setJsonOut(null);
    setProbing(true);
    try {
      const p = await probeVideo(f);
      setProbe(p);
      if (p.duration > 0) {
        const d = Math.min(10, p.duration);
        const h = Math.floor(d / 3600);
        const m = Math.floor((d % 3600) / 60);
        const s = Math.floor(d % 60);
        setTrimOut(
          `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`,
        );
      }
    } catch (e) {
      setProbe(null);
      setError(e instanceof Error ? e.message : 'Could not probe video');
    } finally {
      setProbing(false);
    }
  }, []);

  const switchTab = (next: Operation) => {
    setTab(next);
    setError(null);
    setResults([]);
    setJsonOut(null);
    if (next === 'concat') {
      setFile(null);
      setProbe(null);
    } else {
      setFiles([]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const list = e.dataTransfer.files;
    if (!list?.length) return;
    if (tab === 'concat') {
      setFiles(Array.from(list));
      setFile(null);
      setProbe(null);
    } else {
      void onFile(list[0]);
    }
  };

  const loadSample = async (path: string, name: string) => {
    setLoading(true);
    setError(null);
    try {
      const f = await fetchSampleFile(path, name);
      await onFile(f);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sample load failed');
    } finally {
      setLoading(false);
    }
  };

  const loadFromUrl = async () => {
    if (!urlInput.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const f = await importVideoFromUrl(urlInput.trim());
      await onFile(f);
      setUrlInput('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'URL import failed');
    } finally {
      setLoading(false);
    }
  };

  const addSegment = () => {
    setSegments((prev) => [...prev, { in: trimIn, out: trimOut }]);
  };

  const run = async () => {
    setLoading(true);
    setError(null);
    setResults([]);
    setJsonOut(null);
    try {
      if (tab === 'concat') {
        if (files.length < 2) throw new Error('Select at least 2 videos for concat');
        const res = await apiPost('/v1/concat', files, { reencode: concatReencode });
        if (!res.ok) throw new Error(res.error);
        setResults(
          (res.artifacts ?? []).map((a) => ({
            name: a.filename,
            url: artifactDownloadUrl(a.url),
            type: a.mimeType,
          })),
        );
        if (res.warned) setJsonOut('Warning: codec mismatch — output was re-encoded.');
        return;
      }

      if (!file) throw new Error('Upload a video first');

      switch (tab) {
        case 'trim': {
          if (multiTrim && segments.length === 0) {
            throw new Error('Add at least one segment or disable multi-segment mode');
          }
          const trimSegments: TrimSegment[] = multiTrim
            ? segments
            : [{ in: trimIn, out: trimOut }];
          const res = await apiPost('/v1/clip', file, {
            segments: trimSegments,
            copy: streamCopy,
          });
          if (!res.ok) throw new Error(res.error);
          setResults(
            (res.artifacts ?? []).map((a) => ({
              name: a.filename,
              url: artifactDownloadUrl(a.url),
              type: a.mimeType,
            })),
          );
          break;
        }
        case 'remux': {
          const res = await apiPost('/v1/remux', file, { format: remuxFormat });
          if (!res.ok) throw new Error(res.error);
          if (res.transcoded) setJsonOut('Note: output was transcoded for container compatibility.');
          setResults(
            (res.artifacts ?? []).map((a) => ({
              name: a.filename,
              url: artifactDownloadUrl(a.url),
              type: a.mimeType,
            })),
          );
          break;
        }
        case 'thumbnail': {
          const payload: Record<string, unknown> = {};
          if (thumbAt) payload.at = thumbAt;
          if (thumbEveryMs > 0) payload.everyMs = thumbEveryMs;
          if (sceneAwareThumb) payload.sceneAware = true;
          const res = await apiPost('/v1/thumbnails', file, payload);
          if (!res.ok) throw new Error(res.error);
          if (res.warned) {
            setJsonOut('Note: no scene cut found — used first-frame fallback for scene poster.');
          }
          setResults(
            (res.artifacts ?? []).map((a) => ({
              name: a.filename,
              url: artifactDownloadUrl(a.url),
              type: a.mimeType,
            })),
          );
          break;
        }
        case 'contactsheet': {
          const res = await apiPost('/v1/contactsheet', file, {
            rows: contactRows,
            cols: contactCols,
            scale: contactScale,
          });
          if (!res.ok) throw new Error(res.error);
          setResults(
            (res.artifacts ?? []).map((a) => ({
              name: a.filename,
              url: artifactDownloadUrl(a.url),
              type: a.mimeType,
            })),
          );
          break;
        }
        case 'sprite': {
          const res = await apiPost('/v1/sprites', file, {
            rows: spriteRows,
            cols: spriteCols,
            intervalSec: spriteInterval,
          });
          if (!res.ok) throw new Error(res.error);
          setResults(
            (res.artifacts ?? []).map((a) => ({
              name: a.filename,
              url: artifactDownloadUrl(a.url),
              type: a.mimeType,
            })),
          );
          break;
        }
        case 'shots': {
          const res = await apiPost<ShotResult[]>('/v1/shots', file);
          if (!res.ok) throw new Error(res.error);
          const data = res.data as ShotResult[] | undefined;
          const lines = JSON.stringify(data ?? [], null, 2);
          setJsonOut(
            !data?.length
              ? `${lines}\n\nNo scene cuts detected in this video.`
              : lines,
          );
          break;
        }
        case 'editlist': {
          let parsed: unknown;
          try {
            parsed = JSON.parse(editJson);
          } catch {
            throw new Error('Invalid JSON in edit-list editor');
          }
          const res = await apiPost('/v1/edit-list', file, parsed);
          if (!res.ok) throw new Error(res.error);
          setResults(
            (res.artifacts ?? []).map((a) => ({
              name: a.filename,
              url: artifactDownloadUrl(a.url),
              type: a.mimeType,
            })),
          );
          break;
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div
        className="mb-4 rounded-lg border-2 border-dashed border-[var(--border)] bg-white p-6 transition hover:border-[var(--accent)]"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="video/*"
          className="hidden"
          id="file-input"
          multiple={tab === 'concat'}
          onChange={(e) => {
            const list = e.target.files;
            if (!list?.length) return;
            if (tab === 'concat') {
              setFiles(Array.from(list));
              setFile(null);
              setProbe(null);
            } else {
              void onFile(list[0]);
            }
          }}
        />
        <label htmlFor="file-input" className="block cursor-pointer text-center">
          <p className="text-[var(--foreground)]">
            {tab === 'concat'
              ? files.length
                ? `${files.length} files: ${files.map((f) => f.name).join(', ')}`
                : 'Drop multiple videos or click to browse'
              : file
                ? file.name
                : 'Drop a video or click to browse'}
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">MP4, MKV, WebM, MOV · max 200MB</p>
        </label>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-center">
          <input
            type="url"
            placeholder="Paste video URL (https://…)"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="flex-1 rounded border px-3 py-2 text-sm"
          />
          <button
            type="button"
            disabled={!urlInput.trim() || loading}
            onClick={() => void loadFromUrl()}
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
          >
            Import URL
          </button>
        </div>

        <div className="mt-4 border-t border-[var(--border)] pt-4">
          <p className="mb-2 text-center text-xs font-medium text-[var(--muted)]">Sample videos</p>
          <div className="flex flex-wrap justify-center gap-2">
            {SAMPLE_VIDEOS.map((s) => (
              <button
                key={s.id}
                type="button"
                title={s.description}
                disabled={loading}
                onClick={() => void loadSample(s.path, `${s.id}.mp4`)}
                className="rounded-full border px-3 py-1 text-xs hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-50"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {probing && (
        <p className="mb-4 text-center text-sm text-[var(--muted)]">Analyzing video…</p>
      )}

      {file && tab !== 'concat' && (
        <div className="mb-4 overflow-hidden rounded-lg border border-[var(--border)] bg-black">
          <video ref={videoRef} controls className="max-h-64 w-full" />
          <VideoScrubber
            videoRef={videoRef}
            probe={probe}
            trimIn={trimIn}
            trimOut={trimOut}
            thumbAt={thumbAt}
            onTrimIn={setTrimIn}
            onTrimOut={setTrimOut}
            onThumbAt={setThumbAt}
          />
        </div>
      )}

      {probe && <ProbeDetails probe={probe} />}

      <div className="mb-4 flex flex-wrap gap-1 border-b border-[var(--border)]" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => switchTab(t.id)}
            className={`px-3 py-2 text-sm font-medium transition ${
              tab === t.id
                ? 'border-b-2 border-[var(--accent)] text-[var(--accent)]'
                : 'text-[var(--muted)] hover:text-[var(--foreground)]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mb-4 space-y-3 rounded-lg border border-[var(--border)] bg-white p-4">
        {tab === 'trim' && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-3">
              <label className="text-sm">
                In{' '}
                <input
                  value={trimIn}
                  onChange={(e) => setTrimIn(e.target.value)}
                  className="ml-1 rounded border px-2 py-1 font-mono text-xs"
                />
              </label>
              <label className="text-sm">
                Out{' '}
                <input
                  value={trimOut}
                  onChange={(e) => setTrimOut(e.target.value)}
                  className="ml-1 rounded border px-2 py-1 font-mono text-xs"
                />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={streamCopy}
                  onChange={(e) => setStreamCopy(e.target.checked)}
                />
                Stream copy
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={multiTrim}
                  onChange={(e) => setMultiTrim(e.target.checked)}
                />
                Multi-segment
              </label>
            </div>
            {multiTrim && (
              <div className="space-y-2 rounded border p-2 text-sm">
                <button
                  type="button"
                  onClick={addSegment}
                  className="rounded border px-2 py-1 text-xs hover:bg-gray-50"
                >
                  Add segment (current In/Out)
                </button>
                {segments.length > 0 && (
                  <ul className="space-y-1 font-mono text-xs">
                    {segments.map((s, i) => (
                      <li key={i} className="flex items-center justify-between gap-2">
                        <span>
                          {s.in} → {s.out}
                        </span>
                        <button
                          type="button"
                          className="text-red-600"
                          onClick={() => setSegments((prev) => prev.filter((_, j) => j !== i))}
                        >
                          remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        )}
        {tab === 'concat' && (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={concatReencode}
              onChange={(e) => setConcatReencode(e.target.checked)}
            />
            Force re-encode (when codecs differ)
          </label>
        )}
        {tab === 'remux' && (
          <label className="text-sm">
            Output format{' '}
            <select
              value={remuxFormat}
              onChange={(e) => setRemuxFormat(e.target.value as typeof remuxFormat)}
              className="ml-1 rounded border px-2 py-1"
            >
              <option value="mp4">MP4</option>
              <option value="mkv">MKV</option>
              <option value="webm">WebM</option>
              <option value="mov">MOV</option>
            </select>
          </label>
        )}
        {tab === 'thumbnail' && (
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <label>
              At timecode{' '}
              <input
                value={thumbAt}
                onChange={(e) => setThumbAt(e.target.value)}
                className="ml-1 rounded border px-2 py-1 font-mono text-xs"
              />
            </label>
            <label>
              Strip every (ms){' '}
              <input
                type="number"
                min={0}
                step={500}
                value={thumbEveryMs}
                onChange={(e) => setThumbEveryMs(Number(e.target.value))}
                className="ml-1 w-24 rounded border px-2 py-1"
                placeholder="0=off"
              />
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={sceneAwareThumb}
                onChange={(e) => setSceneAwareThumb(e.target.checked)}
              />
              Scene-aware poster
            </label>
          </div>
        )}
        {tab === 'contactsheet' && (
          <div className="flex flex-wrap gap-3 text-sm">
            <label>
              Rows{' '}
              <input
                type="number"
                min={1}
                max={10}
                value={contactRows}
                onChange={(e) => setContactRows(Number(e.target.value))}
                className="ml-1 w-16 rounded border px-2 py-1"
              />
            </label>
            <label>
              Cols{' '}
              <input
                type="number"
                min={1}
                max={10}
                value={contactCols}
                onChange={(e) => setContactCols(Number(e.target.value))}
                className="ml-1 w-16 rounded border px-2 py-1"
              />
            </label>
            <label>
              Scale{' '}
              <input
                type="number"
                min={80}
                max={640}
                value={contactScale}
                onChange={(e) => setContactScale(Number(e.target.value))}
                className="ml-1 w-20 rounded border px-2 py-1"
              />
            </label>
          </div>
        )}
        {tab === 'sprite' && (
          <div className="flex flex-wrap gap-3 text-sm">
            <label>
              Rows{' '}
              <input
                type="number"
                min={1}
                max={20}
                value={spriteRows}
                onChange={(e) => setSpriteRows(Number(e.target.value))}
                className="ml-1 w-16 rounded border px-2 py-1"
              />
            </label>
            <label>
              Cols{' '}
              <input
                type="number"
                min={1}
                max={20}
                value={spriteCols}
                onChange={(e) => setSpriteCols(Number(e.target.value))}
                className="ml-1 w-16 rounded border px-2 py-1"
              />
            </label>
            <label>
              Interval (sec){' '}
              <input
                type="number"
                min={0.5}
                step={0.5}
                value={spriteInterval}
                onChange={(e) => setSpriteInterval(Number(e.target.value))}
                className="ml-1 w-16 rounded border px-2 py-1"
              />
            </label>
          </div>
        )}
        {tab === 'editlist' && (
          <textarea
            value={editJson}
            onChange={(e) => setEditJson(e.target.value)}
            rows={8}
            className="w-full rounded border p-2 font-mono text-xs"
            spellCheck={false}
          />
        )}
        <button
          type="button"
          onClick={() => void run()}
          disabled={
            loading ||
            probing ||
            (tab !== 'concat' && !file) ||
            (tab === 'concat' && files.length < 2)
          }
          className="rounded-lg bg-[var(--accent)] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Processing…' : 'Run'}
        </button>
      </div>

      {error && (
        <div
          className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          role="alert"
        >
          {error}
        </div>
      )}

      {jsonOut && (
        <pre className="mb-4 overflow-auto rounded-lg border border-[var(--border)] bg-white p-3 text-xs">
          {jsonOut}
        </pre>
      )}

      {results.length > 0 && (
        <div className="rounded-lg border border-[var(--border)] bg-white p-4">
          <h3 className="mb-3 text-sm font-medium">Results</h3>
          <div className="flex flex-wrap gap-4">
            {results.map((r) => (
              <div key={r.name} className="text-center">
                {r.type.startsWith('image') && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.url} alt={r.name} className="mb-2 max-h-48 rounded border" />
                )}
                {r.type.startsWith('video') && (
                  <video src={r.url} controls className="mb-2 max-h-48 rounded border" />
                )}
                {r.type.startsWith('text/') && (
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mb-2 block max-w-xs truncate text-xs text-[var(--muted)]"
                  >
                    Open {r.name}
                  </a>
                )}
                <a
                  href={r.url}
                  download={r.name}
                  className="block text-sm text-[var(--accent)] hover:underline"
                >
                  Download {r.name}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
