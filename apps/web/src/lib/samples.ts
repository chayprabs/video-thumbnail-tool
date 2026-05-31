export const SAMPLE_VIDEOS = [
  {
    id: 'scene-cuts',
    label: 'Scene cuts (short)',
    path: '/samples/scene-cuts.mp4',
    description: 'Clip with visible scene changes for shot detection.',
  },
  {
    id: 'talking-head',
    label: 'Talking head',
    path: '/samples/talking-head.mp4',
    description: 'Short talking-head style sample for trim and thumbnails.',
  },
  {
    id: 'slideshow',
    label: 'Slideshow',
    path: '/samples/slideshow.mp4',
    description: 'Cross-fade slideshow for sprite and contact sheet demos.',
  },
] as const;

export async function fetchSampleFile(path: string, filename: string): Promise<File> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Could not load sample (${res.status})`);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type || 'video/mp4' });
}
