import type { ProbeResult } from '@clip-tools/shared-types';

export function ProbeDetails({ probe }: { probe: ProbeResult }) {
  const video = probe.streams.find((s) => s.codec_type === 'video');
  const audio = probe.streams.find((s) => s.codec_type === 'audio');

  return (
    <div className="mb-4 rounded-lg border border-[var(--border)] bg-white p-3 text-xs text-[var(--muted)]">
      <p className="font-medium text-[var(--foreground)]">Media probe</p>
      <dl className="mt-2 grid gap-1 sm:grid-cols-2">
        <div>
          <dt className="inline">Duration: </dt>
          <dd className="inline">{probe.duration.toFixed(2)}s</dd>
        </div>
        <div>
          <dt className="inline">Container: </dt>
          <dd className="inline">{probe.format}</dd>
        </div>
        <div>
          <dt className="inline">Size: </dt>
          <dd className="inline">{(probe.size / 1024).toFixed(1)} KB</dd>
        </div>
        {probe.bit_rate != null && (
          <div>
            <dt className="inline">Bitrate: </dt>
            <dd className="inline">{Math.round(probe.bit_rate / 1000)} kbps</dd>
          </div>
        )}
        {video && (
          <div className="sm:col-span-2">
            <dt className="inline">Video: </dt>
            <dd className="inline">
              {video.codec_name} {video.width}×{video.height}{' '}
              {video.r_frame_rate ? `@ ${video.r_frame_rate} fps` : ''}
            </dd>
          </div>
        )}
        {audio && (
          <div className="sm:col-span-2">
            <dt className="inline">Audio: </dt>
            <dd className="inline">
              {audio.codec_name}
              {audio.sample_rate ? ` @ ${audio.sample_rate} Hz` : ''}
              {audio.channels ? ` (${audio.channels} ch)` : ''}
            </dd>
          </div>
        )}
        {probe.chapters.length > 0 && (
          <div className="sm:col-span-2">
            <dt className="inline">Chapters: </dt>
            <dd className="inline">{probe.chapters.length}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}
