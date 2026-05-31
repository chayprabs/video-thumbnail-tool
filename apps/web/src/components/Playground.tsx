'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ProbeResult, ShotResult } from '@clip-tools/shared-types';
import { apiPost, artifactDownloadUrl, probeVideo } from '@/lib/api';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Array<{ name: string; url: string; type: string }>>([]);
  const [jsonOut, setJsonOut] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  const [trimIn, setTrimIn] = useState('00:00:00');
  const [trimOut, setTrimOut] = useState('00:00:10');
  const [streamCopy, setStreamCopy] = useState(true);
  const [remuxFormat, setRemuxFormat] = useState<'mp4' | 'mkv' | 'webm' | 'mov'>('mp4');
  const [thumbAt, setThumbAt] = useState('00:00:01');
  const [contactRows, setContactRows] = useState(3);
  const [contactCols, setContactCols] = useState(4);
  const [spriteRows, setSpriteRows] = useState(5);
  const [spriteCols, setSpriteCols] = useState(10);
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
    }
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) void onFile(f);
  };

  const run = async () => {
    setLoading(true);
    setError(null);
    setResults([]);
    setJsonOut(null);
    try {
      if (tab === 'concat') {
        if (files.length < 2) throw new Error('Select at least 2 videos for concat');
        const res = await apiPost('/v1/concat', files, { reencode: false });
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
          const res = await apiPost('/v1/clip', file, {
            segments: [{ in: trimIn, out: trimOut }],
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
          const res = await apiPost('/v1/thumbnails', file, { at: thumbAt, sceneAware: true });
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
        case 'contactsheet': {
          const res = await apiPost('/v1/contactsheet', file, {
            rows: contactRows,
            cols: contactCols,
            scale: 240,
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
            intervalSec: 2,
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
          setJsonOut(JSON.stringify(res.data, null, 2));
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
        className="mb-4 rounded-lg border-2 border-dashed border-[var(--border)] bg-white p-8 text-center transition hover:border-[var(--accent)]"
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
            } else {
              void onFile(list[0]);
            }
          }}
        />
        <label htmlFor="file-input" className="cursor-pointer">
          <p className="text-[var(--foreground)]">
            {tab === 'concat'
              ? files.length
                ? `${files.length} files selected`
                : 'Drop multiple videos or click to browse'
              : file
                ? file.name
                : 'Drop a video or click to browse'}
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">MP4, MKV, WebM, MOV supported</p>
        </label>
      </div>

      {file && tab !== 'concat' && (
        <div className="mb-4 overflow-hidden rounded-lg border border-[var(--border)] bg-black">
          <video ref={videoRef} controls className="max-h-64 w-full" />
        </div>
      )}

      {probe && (
        <div className="mb-4 rounded-lg border border-[var(--border)] bg-white p-3 text-xs text-[var(--muted)]">
          Duration: {probe.duration.toFixed(1)}s · Format: {probe.format} · Streams:{' '}
          {probe.streams.length}
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-1 border-b border-[var(--border)]">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
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
          <>
            <div className="flex flex-wrap gap-3">
              <label className="text-sm">
                In{' '}
                <input
                  value={trimIn}
                  onChange={(e) => setTrimIn(e.target.value)}
                  className="ml-1 rounded border px-2 py-1"
                />
              </label>
              <label className="text-sm">
                Out{' '}
                <input
                  value={trimOut}
                  onChange={(e) => setTrimOut(e.target.value)}
                  className="ml-1 rounded border px-2 py-1"
                />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={streamCopy}
                  onChange={(e) => setStreamCopy(e.target.checked)}
                />
                Stream copy (no re-encode)
              </label>
            </div>
          </>
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
          <label className="text-sm">
            At timecode{' '}
            <input
              value={thumbAt}
              onChange={(e) => setThumbAt(e.target.value)}
              className="ml-1 rounded border px-2 py-1"
            />
          </label>
        )}
        {tab === 'contactsheet' && (
          <div className="flex gap-3 text-sm">
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
          </div>
        )}
        {tab === 'sprite' && (
          <div className="flex gap-3 text-sm">
            <label>
              Rows{' '}
              <input
                type="number"
                value={spriteRows}
                onChange={(e) => setSpriteRows(Number(e.target.value))}
                className="ml-1 w-16 rounded border px-2 py-1"
              />
            </label>
            <label>
              Cols{' '}
              <input
                type="number"
                value={spriteCols}
                onChange={(e) => setSpriteCols(Number(e.target.value))}
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
          />
        )}
        <button
          type="button"
          onClick={() => void run()}
          disabled={loading || (tab !== 'concat' && !file) || (tab === 'concat' && files.length < 2)}
          className="rounded-lg bg-[var(--accent)] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          {loading ? 'Processing…' : 'Run'}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
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
