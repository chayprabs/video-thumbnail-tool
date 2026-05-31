export type VideoFormat = 'mp4' | 'mkv' | 'webm' | 'mov';

export interface ProbeStream {
  index: number;
  codec_type: string;
  codec_name: string;
  width?: number;
  height?: number;
  r_frame_rate?: string;
  bit_rate?: string;
  channels?: number;
  sample_rate?: string;
}

export interface ProbeChapter {
  id: number;
  start: number;
  end: number;
  title?: string;
}

export interface ProbeResult {
  format: string;
  duration: number;
  size: number;
  bit_rate?: number;
  streams: ProbeStream[];
  chapters: ProbeChapter[];
}

export interface TrimSegment {
  in: string;
  out: string;
}

export interface TrimRequest {
  segments: TrimSegment[];
  copy?: boolean;
}

export interface ConcatRequest {
  reencode?: boolean;
}

export interface RemuxRequest {
  format: VideoFormat;
}

export interface ThumbnailRequest {
  at?: string;
  everyMs?: number;
  sceneAware?: boolean;
}

export interface ContactSheetRequest {
  rows: number;
  cols: number;
  scale?: number;
}

export interface SpriteSheetRequest {
  rows: number;
  cols: number;
  intervalSec?: number;
}

export interface ShotResult {
  timestamp: number;
  confidence: number;
}

export interface EditListClip {
  asset: string;
  start?: number;
  length?: number;
  trim?: number;
}

export interface EditListRequest {
  timeline: {
    soundtrack?: { src: string; effect?: string };
    background?: string;
    tracks: Array<{
      clips: EditListClip[];
    }>;
  };
}

export interface JobProgress {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  message?: string;
  error?: string;
}

export interface ApiArtifact {
  filename: string;
  mimeType: string;
  url: string;
}

export interface ApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
  artifacts?: ApiArtifact[];
  error?: string;
}

export interface ClipJob {
  trim?: { in: string; out: string; copy?: boolean };
  remux?: { format: string };
  thumbnails?: { at?: string; everyMs?: number };
  spritesheet?: { rows: number; cols: number };
  shots?: boolean;
}
