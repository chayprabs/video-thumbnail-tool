'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { ProbeResult } from '@clip-tools/shared-types';

function formatTime(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  const f = Math.floor((sec % 1) * 100);
  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(f).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(f).padStart(2, '0')}`;
}

function parseTimecode(t: string): number {
  const parts = t.split(':').map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parseFloat(t) || 0;
}

type Props = {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  probe: ProbeResult | null;
  trimIn: string;
  trimOut: string;
  thumbAt: string;
  onTrimIn: (v: string) => void;
  onTrimOut: (v: string) => void;
  onThumbAt: (v: string) => void;
};

export function VideoScrubber({
  videoRef,
  probe,
  trimIn,
  trimOut,
  thumbAt,
  onTrimIn,
  onTrimOut,
  onThumbAt,
}: Props) {
  const duration = probe?.duration ?? 0;
  const scrubRef = useRef<HTMLInputElement>(null);

  const seek = useCallback(
    (sec: number) => {
      const v = videoRef.current;
      if (v) v.currentTime = Math.min(Math.max(0, sec), duration || v.duration);
    },
    [videoRef, duration],
  );

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => {
      if (scrubRef.current && !scrubRef.current.matches(':active')) {
        scrubRef.current.value = String(v.currentTime);
      }
    };
    v.addEventListener('timeupdate', onTime);
    return () => v.removeEventListener('timeupdate', onTime);
  }, [videoRef]);

  if (!probe || duration <= 0) return null;

  const setInFromPlayhead = () => {
    const t = videoRef.current?.currentTime ?? 0;
    onTrimIn(formatTime(t).slice(0, 8));
  };

  const setOutFromPlayhead = () => {
    const t = videoRef.current?.currentTime ?? 0;
    onTrimOut(formatTime(t).slice(0, 8));
  };

  const setThumbFromPlayhead = () => {
    const t = videoRef.current?.currentTime ?? 0;
    onThumbAt(formatTime(t).slice(0, 8));
  };

  return (
    <div className="mt-2 space-y-2 rounded border border-[var(--border)] bg-white p-3">
      <label className="block text-xs text-[var(--muted)]">
        Scrub timeline
        <input
          ref={scrubRef}
          type="range"
          min={0}
          max={duration}
          step={0.01}
          defaultValue={0}
          className="mt-1 w-full"
          onChange={(e) => seek(parseFloat(e.target.value))}
        />
      </label>
      <div className="flex flex-wrap gap-2 text-xs">
        <button
          type="button"
          className="rounded border px-2 py-1 hover:bg-gray-50"
          onClick={setInFromPlayhead}
        >
          Set trim In
        </button>
        <button
          type="button"
          className="rounded border px-2 py-1 hover:bg-gray-50"
          onClick={setOutFromPlayhead}
        >
          Set trim Out
        </button>
        <button
          type="button"
          className="rounded border px-2 py-1 hover:bg-gray-50"
          onClick={setThumbFromPlayhead}
        >
          Set thumbnail time
        </button>
        <button
          type="button"
          className="rounded border px-2 py-1 hover:bg-gray-50"
          onClick={() => seek(parseTimecode(trimIn))}
        >
          Go to In
        </button>
        <button
          type="button"
          className="rounded border px-2 py-1 hover:bg-gray-50"
          onClick={() => seek(parseTimecode(trimOut))}
        >
          Go to Out
        </button>
      </div>
    </div>
  );
}
